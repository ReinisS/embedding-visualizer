"""Service for caching embeddings using Redis."""

import json

import redis.asyncio as aioredis
from redis.exceptions import ConnectionError, RedisError

from app.config import get_settings


class CacheService:
    """Service for caching embeddings in Redis."""

    def __init__(self):
        """Initialize the cache service."""
        self.settings = get_settings()
        self.enabled = self.settings.cache_enabled

        if self.enabled:
            try:
                self.redis: aioredis.Redis = aioredis.Redis(
                    host=self.settings.cache_host,
                    port=self.settings.cache_port,
                    db=self.settings.cache_db,
                    password=self.settings.cache_password,
                )
                self.ttl = self.settings.cache_ttl_seconds
            except (ConnectionError, RedisError) as e:
                self.enabled = False
                print(f"Failed to initialize Redis cache: {e}")

    async def get_embedding(
        self,
        text: str,
    ) -> list[float] | None:
        """Retrieve embedding for a specific text from cache.

        Args:
            text: The text to retrieve embedding for.

        Returns:
            Embedding if found, None otherwise.
        """
        if not self.enabled:
            return None

        try:
            # Use the text itself as the cache key
            cache_key = f"embedding:{text}"
            cached_data = await self.redis.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except (RedisError, json.JSONDecodeError) as e:
            print(f"Error retrieving from cache: {e}")

        return None

    async def store_embedding(
        self,
        text: str,
        embedding: list[float],
    ) -> bool:
        """Store embedding for a specific text in cache.

        Args:
            text: The text to store embedding for.
            embedding: The embedding to store.

        Returns:
            True if storage was successful, False otherwise.
        """
        if not self.enabled:
            return False

        try:
            # Use the text itself as the cache key
            cache_key = f"embedding:{text}"
            await self.redis.setex(
                cache_key,
                self.ttl,
                json.dumps(embedding),
            )
            return True
        except (RedisError, TypeError) as e:
            print(f"Error storing in cache: {e}")
            return False

    async def get_embeddings(
        self,
        texts: list[str],
    ) -> dict[str, list[float]]:
        """Retrieve embeddings for multiple texts from cache.

        Args:
            texts: List of texts to retrieve embeddings for.

        Returns:
            Dictionary mapping texts to embeddings for those found in cache.
        """
        result: dict[str, list[float]] = {}
        if not self.enabled:
            return result

        for text in texts:
            embedding = await self.get_embedding(text)
            if embedding:
                result[text] = embedding

        return result

    async def store_embeddings(
        self,
        embeddings: dict[str, list[float]],
    ) -> bool:
        """Store multiple embeddings in cache.

        Args:
            embeddings: Dictionary mapping texts to embeddings.

        Returns:
            True if all embeddings were stored successfully, False otherwise.
        """
        if not self.enabled:
            return False

        success = True
        for text, embedding in embeddings.items():
            if not await self.store_embedding(text, embedding):
                success = False

        return success
