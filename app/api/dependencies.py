"""API dependencies for authentication and rate limiting."""

from collections.abc import AsyncGenerator
from typing import Annotated

import httpx
import posthog
from clerk_backend_api import Clerk, RequestState
from clerk_backend_api.jwks_helpers import AuthenticateRequestOptions
from fastapi import Depends, HTTPException, Request, status

from app.config import get_settings
from app.services.cache import CacheService, RateLimitUnavailableError


async def get_clerk() -> AsyncGenerator[Clerk, None]:
    """Get Clerk client instance.

    Returns:
        Configured Clerk client.
    """
    async with Clerk(bearer_auth=get_settings().clerk_secret_key) as clerk:
        yield clerk


async def verify_auth_token(
    request: Request,
    clerk: Annotated[Clerk, Depends(get_clerk)],
) -> RequestState:
    """Verify JWT token from Clerk.

    Args:
        auth: Authorization credentials.
        clerk: Clerk client instance.

    Returns:
        Dictionary containing user claims.

    Raises:
        HTTPException: If token is invalid.
    """
    # Convert FastAPI request headers to httpx format
    httpx_request = httpx.Request(
        method=request.method, url=str(request.url), headers=dict(request.headers)
    )

    request_state = clerk.authenticate_request(
        httpx_request,
        AuthenticateRequestOptions(authorized_parties=get_settings().clerk_authorized_parties),
    )
    if (
        request_state.is_signed_in
        and request_state.payload
        and isinstance(request_state.payload.get("sub"), str)
        and request_state.payload["sub"]
    ):
        return request_state
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=request_state.message or "Invalid or missing authentication token",
    )


async def check_rate_limit(
    request: Request,
    request_state: Annotated[RequestState, Depends(verify_auth_token)],
) -> None:
    """Check if user has exceeded rate limit.

    Args:
        request: FastAPI request object
        request_state: User authentication state from Clerk

    Raises:
        HTTPException: If rate limit is exceeded
    """
    if request_state.payload is None:
        raise HTTPException(status_code=401, detail="Missing authenticated user")

    user_id: str | None = request_state.payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(status_code=401, detail="Missing authenticated user")

    # Use cache service for rate limiting
    cache_service = CacheService()
    try:
        is_allowed, _ = await cache_service.check_rate_limit(user_id, request.url.path)
    except RateLimitUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail="Rate limiting is temporarily unavailable. Please try again shortly.",
            headers={"Retry-After": "60"},
        ) from exc
    finally:
        if cache_service.enabled:
            await cache_service.redis.aclose()

    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Rate limit exceeded. Maximum {get_settings().requests_per_minute_per_user} "
                "requests per minute allowed."
            ),
            headers={"Retry-After": "60"},
        )


def get_posthog() -> posthog.Client:
    """Get PostHog client instance.

    Returns:
        Configured PostHog client.
    """
    return posthog.Client(
        api_key=get_settings().posthog_api_key,
        host=get_settings().posthog_host,
        enable_exception_autocapture=True,
    )


def track_event(
    request: Request,
    request_state: Annotated[RequestState, Depends(verify_auth_token)],
    posthog_client: Annotated[posthog.Client, Depends(get_posthog)],
) -> None:
    """Track API usage event in PostHog.

    Args:
        request: FastAPI request object.
        claims: User claims from JWT token.
        posthog_client: PostHog client instance.
    """
    if request_state.payload is None:
        return
    user_id: str | None = request_state.payload.get("sub")
    if user_id:
        posthog_client.capture(
            distinct_id=user_id,
            event="api_request",
            properties={
                "endpoint": request.url.path,
                "method": request.method,
            },
        )
