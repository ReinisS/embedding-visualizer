"""Test fixtures for the embedding visualizer."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import Request
from fastapi.testclient import TestClient
from posthog import Client as PosthogClient

from app.config import Settings
from app.models.schemas import (
    Coordinates2D,
    Coordinates3D,
    DimensionalityReductionResult,
    TextInput,
)
from main import app


class MockRequestState:
    """Mock of clerk_backend_api.models.RequestState for testing."""

    def __init__(self, is_signed_in=False, message=None, payload=None):
        """Initialize the mock request state."""
        self.is_signed_in = is_signed_in
        self.message = message
        self.payload = payload or {}


@pytest.fixture
def sample_texts():
    """Return sample texts for testing."""
    return ["test text 1", "test text 2", "test text 3"]


@pytest.fixture
def sample_embeddings_values():
    """Return sample embedding vectors for testing."""
    return [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9],
    ]


@pytest.fixture
def test_settings():
    """Create test settings with test values."""
    test_config = MagicMock(spec=Settings)
    test_config.debug = True
    test_config.api_prefix = "/api"
    test_config.clerk_publishable_key = "test_publishable_key"
    test_config.clerk_secret_key = "test_secret_key"
    test_config.clerk_api_base = "https://api.clerk.com"
    test_config.posthog_api_key = "test_posthog_key"
    test_config.posthog_host = "https://app.posthog.com"
    test_config.cache_enabled = True
    test_config.cache_host = "localhost"
    test_config.cache_port = 6379
    test_config.cache_db = 0
    test_config.cache_password = ""
    test_config.cache_ttl_seconds = 3600
    test_config.requests_per_minute_per_user = 5
    test_config.model_name = "test-model"

    # Apply the test settings to all relevant modules
    modules = [
        "app.config",
        "app.api.router",
        "app.services.cache",
        "app.services.embedding",
    ]

    patchers = [patch(f"{module}.get_settings", return_value=test_config) for module in modules]

    for patcher in patchers:
        patcher.start()

    yield test_config

    # Stop all patches when the test ends
    for patcher in patchers:
        patcher.stop()


@pytest.fixture
def test_client(test_settings):
    """Create a FastAPI test client."""
    with TestClient(app) as client:
        yield client


@pytest.fixture
def sample_text_inputs(sample_texts):
    """Create sample text input models."""
    return [TextInput(text=text) for text in sample_texts]


@pytest.fixture
def sample_visualization_request(sample_texts):
    """Create a sample visualization request dictionary."""
    return {"texts": [{"text": text} for text in sample_texts]}


@pytest.fixture
def sample_embeddings(sample_texts, sample_embeddings_values):
    """Create a dictionary mapping texts to embeddings."""
    return dict(zip(sample_texts, sample_embeddings_values, strict=False))


@pytest.fixture
def sample_reduction_results():
    """Create sample dimensionality reduction results."""
    results = []
    for i in range(3):  # For 3 test texts
        item_results = [
            DimensionalityReductionResult(
                algorithm=algo,
                coordinates_2d=Coordinates2D(x=0.1 * i, y=0.2 * i),
                coordinates_3d=Coordinates3D(x=0.1 * i, y=0.2 * i, z=0.3 * i),
            )
            for algo in ["pca", "tsne", "umap"]
        ]
        results.append(item_results)
    return results


@pytest.fixture
def mock_embedding_service(sample_embeddings):
    """Mock the embedding service."""
    with patch("app.api.router.EmbeddingService") as mock:
        service_instance = mock.return_value
        service_instance.generate_embeddings.return_value = sample_embeddings
        yield service_instance


@pytest.fixture
def mock_dimensionality_service(sample_reduction_results):
    """Mock the dimensionality reduction service."""
    with patch("app.api.router.DimensionalityReductionService") as mock:
        service_instance = mock.return_value
        service_instance.reduce_all.return_value = sample_reduction_results
        yield service_instance


@pytest.fixture
def mock_cache_service():
    """Mock the cache service."""
    with patch("app.api.router.CacheService") as mock:
        service_instance = mock.return_value

        # Set up common async methods
        service_instance.get_embeddings = AsyncMock(return_value={})
        service_instance.store_embeddings = AsyncMock(return_value=True)
        service_instance.check_rate_limit = AsyncMock(return_value=(True, 1))

        yield service_instance


@pytest.fixture
def mock_auth_request_state():
    """Create an authenticated request state."""
    return MockRequestState(
        is_signed_in=True,
        payload={"sub": "test_user_id"},
    )


@pytest.fixture
def mock_posthog():
    """Mock the PostHog analytics client."""
    with patch("app.api.dependencies.get_posthog") as mock_get_posthog:
        posthog_instance = MagicMock(spec=PosthogClient)
        mock_get_posthog.return_value = posthog_instance
        yield posthog_instance


@pytest.fixture
def mock_fastapi_request():
    """Mock a FastAPI request."""
    mock_request = MagicMock(spec=Request)
    mock_request.method = "GET"
    mock_request.url.path = "/api/test"
    mock_request.headers = {"Authorization": "Bearer test_token"}
    return mock_request
