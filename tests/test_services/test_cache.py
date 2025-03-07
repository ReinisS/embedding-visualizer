"""Tests for the cache service."""

from unittest.mock import AsyncMock, patch

import pytest
from redis.exceptions import RedisError

from app.services.cache import CacheService


@pytest.fixture
def mock_redis():
    """Setup a mock Redis client."""
    with patch("app.services.cache.aioredis.Redis") as mock:
        redis_instance = AsyncMock()
        redis_instance.get.return_value = None
        redis_instance.setex.return_value = True
        redis_instance.incr.return_value = 1
        redis_instance.expire.return_value = True
        mock.return_value = redis_instance
        yield redis_instance


@pytest.fixture
def cache_service(mock_redis, test_settings):
    """Create a CacheService instance with cache enabled."""
    with patch("app.services.cache.get_settings", return_value=test_settings) as mock_settings:
        mock_settings.return_value.cache_enabled = True
        mock_settings.return_value.cache_ttl_seconds = 3600
        service = CacheService()
        yield service


@pytest.fixture
def disabled_cache_service(test_settings):
    """Create a CacheService instance with cache disabled."""
    with patch("app.services.cache.get_settings", return_value=test_settings) as mock_settings:
        mock_settings.return_value.cache_enabled = False
        service = CacheService()
        yield service


def test_cache_service_init_enabled(mock_redis, test_settings):
    """Test initialization with cache enabled."""
    with patch("app.services.cache.get_settings", return_value=test_settings) as mock_settings:
        mock_settings.return_value.cache_enabled = True

        service = CacheService()

        assert service.enabled is True
        assert service.ttl == test_settings.cache_ttl_seconds


def test_cache_service_init_disabled(mock_redis, test_settings):
    """Test initialization with cache disabled."""
    with patch("app.services.cache.get_settings", return_value=test_settings) as mock_settings:
        mock_settings.return_value.cache_enabled = False

        service = CacheService()
        assert service.enabled is False


@pytest.mark.asyncio
async def test_get_embedding_scenarios(cache_service, mock_redis):
    """Test various scenarios for getting an embedding."""
    # Success case
    mock_redis.get.return_value = b'{"embedding": [0.1, 0.2, 0.3]}'
    embedding = await cache_service.get_embedding("test text")
    assert embedding == {"embedding": [0.1, 0.2, 0.3]}
    mock_redis.get.assert_called_with("embedding:test text")

    # Not found case
    mock_redis.get.return_value = None
    embedding = await cache_service.get_embedding("test text")
    assert embedding is None


@pytest.mark.asyncio
async def test_store_embedding_scenarios(cache_service, mock_redis):
    """Test various scenarios for storing an embedding."""
    # Success case
    result = await cache_service.store_embedding("test text", [0.1, 0.2, 0.3])
    assert result is True
    mock_redis.setex.assert_called_once()
    args = mock_redis.setex.call_args[0]
    assert args[0] == "embedding:test text"
    assert args[1] == 3600
    assert "[0.1, 0.2, 0.3]" in args[2]

    # Redis error case
    mock_redis.setex.side_effect = RedisError("Test Redis error")
    result = await cache_service.store_embedding("test text", [0.1, 0.2, 0.3])
    assert result is False


@pytest.mark.asyncio
async def test_get_embeddings_success(cache_service, mock_redis):
    """Test getting multiple embeddings from cache."""

    # Set up mock to return different values based on key
    async def mock_get(key):
        if key == "embedding:test text 1":
            return b"[0.1, 0.2, 0.3]"
        elif key == "embedding:test text 2":
            return b"[0.4, 0.5, 0.6]"
        return None

    mock_redis.get = AsyncMock(side_effect=mock_get)

    embeddings = await cache_service.get_embeddings(["test text 1", "test text 2", "test text 3"])

    assert mock_redis.get.call_count == 3
    assert len(embeddings) == 2
    assert embeddings["test text 1"] == [0.1, 0.2, 0.3]
    assert embeddings["test text 2"] == [0.4, 0.5, 0.6]
    assert "test text 3" not in embeddings


@pytest.mark.asyncio
async def test_store_embeddings(cache_service):
    """Test storing multiple embeddings in cache."""
    # Test successful store
    with patch.object(CacheService, "store_embedding", AsyncMock(return_value=True)) as mock_store:
        embeddings = {
            "test text 1": [0.1, 0.2, 0.3],
            "test text 2": [0.4, 0.5, 0.6],
        }
        result = await cache_service.store_embeddings(embeddings)

        assert mock_store.call_count == 2
        assert result is True


@pytest.mark.asyncio
async def test_check_rate_limit(cache_service, mock_redis, test_settings):
    """Test rate limit checking functionality."""
    with patch("app.services.cache.get_settings", return_value=test_settings) as mock_settings:
        mock_settings.return_value.requests_per_minute_per_user = 5

        # Under limit case
        mock_redis.incr.return_value = 3
        is_allowed, count = await cache_service.check_rate_limit("test_user", "/api/test")
        assert is_allowed is True
        assert count == 3
        mock_redis.incr.assert_called_with("rate_limit:test_user:/api/test")

        # Reset mocks
        mock_redis.incr.reset_mock()

        # Over limit case
        mock_redis.incr.return_value = 6
        is_allowed, count = await cache_service.check_rate_limit("test_user", "/api/test")
        assert is_allowed is False
        assert count == 6

        # Redis error case
        mock_redis.incr.side_effect = RedisError("Test Redis error")
        is_allowed, count = await cache_service.check_rate_limit("test_user", "/api/test")
        assert is_allowed is True
        assert count == 0


@pytest.mark.asyncio
async def test_disabled_cache_operations(disabled_cache_service):
    """Test that operations return appropriate values when cache is disabled."""
    assert await disabled_cache_service.get_embedding("test text") is None
    assert await disabled_cache_service.store_embedding("test text", [0.1, 0.2, 0.3]) is False
    assert await disabled_cache_service.get_embeddings(["test text"]) == {}
    assert await disabled_cache_service.store_embeddings({"test text": [0.1, 0.2, 0.3]}) is False

    is_allowed, count = await disabled_cache_service.check_rate_limit("test_user", "/api/test")
    assert is_allowed is True
    assert count == 0
