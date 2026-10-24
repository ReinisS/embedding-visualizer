"""Tests for API dependencies."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.api.dependencies import (
    check_rate_limit,
    get_clerk,
    get_posthog,
    track_event,
    verify_auth_token,
)
from app.services.cache import RateLimitUnavailableError
from tests.conftest import MockRequestState


@pytest.fixture
def setup_cache_service(mock_cache_service):
    """Setup cache service patch for dependency tests."""
    with patch("app.api.dependencies.CacheService", return_value=mock_cache_service):
        yield mock_cache_service


@pytest.mark.asyncio
async def test_get_clerk():
    """Test get_clerk dependency."""
    async for clerk in get_clerk():
        assert clerk is not None


def test_get_posthog():
    """Test get_posthog dependency."""
    posthog_client = get_posthog()
    assert posthog_client is not None


@pytest.mark.asyncio
async def test_check_rate_limit_allowed(
    mock_fastapi_request, mock_auth_request_state, setup_cache_service
):
    """Test rate limit check when under limit."""
    setup_cache_service.check_rate_limit.return_value = (True, 1)
    await check_rate_limit(mock_fastapi_request, mock_auth_request_state)
    # Verify cache service was called
    setup_cache_service.check_rate_limit.assert_called_once()


@pytest.mark.asyncio
async def test_check_rate_limit_exceeded(
    mock_fastapi_request, mock_auth_request_state, setup_cache_service
):
    """Test rate limit check when exceeding limit."""
    setup_cache_service.check_rate_limit.return_value = (False, 6)
    with pytest.raises(HTTPException) as excinfo:
        await check_rate_limit(mock_fastapi_request, mock_auth_request_state)
    assert excinfo.value.status_code == 429
    assert "Rate limit exceeded" in str(excinfo.value.detail)
    assert excinfo.value.headers["Retry-After"] == "60"


@pytest.mark.asyncio
async def test_check_rate_limit_no_user_id(mock_fastapi_request, setup_cache_service):
    """Test rate limit check with no user ID."""
    request_state = MockRequestState(is_signed_in=True, payload={})
    with pytest.raises(HTTPException) as excinfo:
        await check_rate_limit(mock_fastapi_request, request_state)
    assert excinfo.value.status_code == 401
    # Verify cache service was not called
    setup_cache_service.check_rate_limit.assert_not_called()


@pytest.mark.asyncio
async def test_check_rate_limit_cache_disabled(mock_fastapi_request, mock_auth_request_state):
    """Test rate limit check with cache disabled."""
    with patch("app.api.dependencies.CacheService") as mock_cache_service_class:
        mock_cache_instance = MagicMock()
        mock_cache_instance.enabled = False
        mock_cache_instance.check_rate_limit = AsyncMock(
            side_effect=RateLimitUnavailableError("Redis is disabled")
        )
        mock_cache_service_class.return_value = mock_cache_instance
        with pytest.raises(HTTPException) as excinfo:
            await check_rate_limit(mock_fastapi_request, mock_auth_request_state)
        assert excinfo.value.status_code == 503
        assert excinfo.value.headers["Retry-After"] == "60"


@pytest.mark.asyncio
async def test_redis_failure_rejects_request(
    mock_fastapi_request, mock_auth_request_state, setup_cache_service
):
    setup_cache_service.check_rate_limit.side_effect = RateLimitUnavailableError("offline")
    with pytest.raises(HTTPException) as excinfo:
        await check_rate_limit(mock_fastapi_request, mock_auth_request_state)
    assert excinfo.value.status_code == 503
    setup_cache_service.redis.aclose.assert_awaited_once()


@pytest.mark.asyncio
async def test_authentication_restricts_token_origin(mock_fastapi_request, test_settings):
    clerk = MagicMock()
    clerk.authenticate_request.return_value = MockRequestState(
        is_signed_in=True, payload={"sub": "user_123"}
    )
    await verify_auth_token(mock_fastapi_request, clerk)
    options = clerk.authenticate_request.call_args.args[1]
    assert options.authorized_parties == ["https://embeddings.reiniss.com"]


@pytest.mark.asyncio
async def test_authentication_rejects_missing_subject(mock_fastapi_request, test_settings):
    clerk = MagicMock()
    clerk.authenticate_request.return_value = MockRequestState(is_signed_in=True)
    with pytest.raises(HTTPException) as excinfo:
        await verify_auth_token(mock_fastapi_request, clerk)
    assert excinfo.value.status_code == 401


def test_track_event(mock_fastapi_request, mock_auth_request_state, mock_posthog):
    """Test event tracking."""
    track_event(mock_fastapi_request, mock_auth_request_state, mock_posthog)
    # Verify that PostHog capture was called
    mock_posthog.capture.assert_called_once_with(
        distinct_id="test_user_id",
        event="api_request",
        properties={
            "endpoint": mock_fastapi_request.url.path,
            "method": mock_fastapi_request.method,
        },
    )


def test_track_event_no_user(mock_fastapi_request, mock_posthog):
    """Test event tracking with no user."""
    request_state = MockRequestState(is_signed_in=True, payload=None)
    track_event(mock_fastapi_request, request_state, mock_posthog)
    # Verify that PostHog capture was not called
    mock_posthog.capture.assert_not_called()
