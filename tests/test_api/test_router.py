"""Tests for API router endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.api.router import visualize_text
from app.models.schemas import ItemResult, VisualizationRequest, VisualizationResponse


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_check(self, test_client: TestClient):
        """Test health check endpoint returns healthy status."""
        response = test_client.get("/embedding-visualizer/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestVisualizeEndpoint:
    """Tests for the text visualization endpoint."""

    @pytest.fixture
    def visualization_request(self, sample_text_inputs):
        """Create a visualization request for tests."""
        return VisualizationRequest(texts=sample_text_inputs)

    @pytest.mark.asyncio
    async def test_visualize_text_function_all_cached(
        self,
        mock_embedding_service,
        mock_dimensionality_service,
        mock_cache_service,
        visualization_request,
        sample_embeddings,
    ):
        """Test visualization function with all embeddings in cache."""
        mock_cache_service.get_embeddings.return_value = sample_embeddings

        # Call function directly
        response = await visualize_text(
            request=visualization_request,
            embedding_service=mock_embedding_service,
            dim_reduction_service=mock_dimensionality_service,
            cache_service=mock_cache_service,
        )

        # Verify embedding service was not called (all embeddings were cached)
        mock_embedding_service.generate_embeddings.assert_not_called()

        # Verify cache service was used
        mock_cache_service.get_embeddings.assert_called_once()

        # Verify dimensionality reduction was performed
        mock_dimensionality_service.reduce_all.assert_called_once()

        # Verify response structure and content
        assert isinstance(response, VisualizationResponse)
        assert len(response.results) == 3

        for result in response.results:
            assert isinstance(result, ItemResult)
            assert result.label in sample_embeddings
            assert result.embedding == sample_embeddings[result.label]
            assert len(result.reductions) == 3

    @pytest.mark.asyncio
    async def test_visualize_text_function_partial_cache(
        self,
        mock_embedding_service,
        mock_dimensionality_service,
        mock_cache_service,
        visualization_request,
        sample_embeddings,
    ):
        """Test visualization function with partial cache hits."""
        # Configure cache to return only first embedding
        partial_embeddings = {"test text 1": sample_embeddings["test text 1"]}
        mock_cache_service.get_embeddings.return_value = partial_embeddings

        # Configure embedding service to return missing embeddings
        missing_embeddings = {
            "test text 2": sample_embeddings["test text 2"],
            "test text 3": sample_embeddings["test text 3"],
        }
        mock_embedding_service.generate_embeddings.return_value = missing_embeddings

        # Call function directly
        response = await visualize_text(
            request=visualization_request,
            embedding_service=mock_embedding_service,
            dim_reduction_service=mock_dimensionality_service,
            cache_service=mock_cache_service,
        )

        # Verify embedding service was called for missing embeddings
        mock_embedding_service.generate_embeddings.assert_called_once()

        # Verify cache service was used and new embeddings were stored
        mock_cache_service.get_embeddings.assert_called_once()
        mock_cache_service.store_embeddings.assert_called_once_with(missing_embeddings)

        # Verify response structure
        assert isinstance(response, VisualizationResponse)
        assert len(response.results) == 3

    @pytest.mark.asyncio
    async def test_visualize_text_function_no_cache(
        self,
        mock_embedding_service,
        mock_dimensionality_service,
        mock_cache_service,
        visualization_request,
        sample_embeddings,
    ):
        """Test visualization function with no cache hits."""
        # Configure cache to return empty dictionary (no cache hits)
        mock_cache_service.get_embeddings.return_value = {}

        # Configure embedding service to return all embeddings
        mock_embedding_service.generate_embeddings.return_value = sample_embeddings

        # Call function directly
        response = await visualize_text(
            request=visualization_request,
            embedding_service=mock_embedding_service,
            dim_reduction_service=mock_dimensionality_service,
            cache_service=mock_cache_service,
        )

        # Verify embedding service was called for all embeddings
        mock_embedding_service.generate_embeddings.assert_called_once()

        # Verify cache service was used and all embeddings were stored
        mock_cache_service.get_embeddings.assert_called_once()
        mock_cache_service.store_embeddings.assert_called_once_with(sample_embeddings)

        # Verify response structure
        assert isinstance(response, VisualizationResponse)
        assert len(response.results) == 3
