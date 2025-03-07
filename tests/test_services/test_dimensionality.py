"""Tests for the dimensionality reduction service."""

from unittest.mock import patch

import numpy as np
import pytest

from app.models.schemas import Coordinates2D, Coordinates3D, DimensionalityReductionResult
from app.services.dimensionality import DimensionalityReductionService


@pytest.fixture
def mock_pca():
    """Fixture for mocking PCA."""
    with patch("app.services.dimensionality.PCA") as mock:
        pca_instance = mock.return_value

        # Configure fit_transform to return sample coordinates
        pca_instance.fit_transform.side_effect = [
            # 2D PCA results
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            # 3D PCA results
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        ]

        yield mock


@pytest.fixture
def mock_tsne():
    """Fixture for mocking TSNE."""
    with patch("app.services.dimensionality.TSNE") as mock:
        tsne_instance = mock.return_value

        # Configure fit to return sample coordinates
        tsne_instance.fit.side_effect = [
            # 2D t-SNE results
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            # 3D t-SNE results
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        ]

        yield mock


@pytest.fixture
def mock_umap():
    """Fixture for mocking UMAP."""
    with patch("app.services.dimensionality.UMAP") as mock:
        umap_instance = mock.return_value

        # Configure fit_transform to return sample coordinates
        umap_instance.fit_transform.side_effect = [
            # 2D UMAP results
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            # 3D UMAP results
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        ]

        yield mock


@pytest.fixture
def dimensionality_service(mock_pca, mock_tsne, mock_umap):
    """Fixture for creating a dimensionality reduction service with mocked algorithms."""
    return DimensionalityReductionService()


def test_get_coordinates_2d(dimensionality_service):
    """Test getting 2D coordinates.

    Args:
        dimensionality_service: Dimensionality reduction service.
    """
    # Create sample data
    data = np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]])

    # Get coordinates for different indices
    coords_0 = dimensionality_service._get_coordinates_2d(data, 0)
    coords_1 = dimensionality_service._get_coordinates_2d(data, 1)
    coords_2 = dimensionality_service._get_coordinates_2d(data, 2)

    # Verify coordinates
    assert isinstance(coords_0, Coordinates2D)
    assert coords_0.x == 0.1
    assert coords_0.y == 0.2

    assert isinstance(coords_1, Coordinates2D)
    assert coords_1.x == 0.3
    assert coords_1.y == 0.4

    assert isinstance(coords_2, Coordinates2D)
    assert coords_2.x == 0.5
    assert coords_2.y == 0.6


def test_get_coordinates_3d(dimensionality_service):
    """Test getting 3D coordinates.

    Args:
        dimensionality_service: Dimensionality reduction service.
    """
    # Create sample data
    data = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]])

    # Get coordinates for different indices
    coords_0 = dimensionality_service._get_coordinates_3d(data, 0)
    coords_1 = dimensionality_service._get_coordinates_3d(data, 1)
    coords_2 = dimensionality_service._get_coordinates_3d(data, 2)

    # Verify coordinates
    assert isinstance(coords_0, Coordinates3D)
    assert coords_0.x == 0.1
    assert coords_0.y == 0.2
    assert coords_0.z == 0.3

    assert isinstance(coords_1, Coordinates3D)
    assert coords_1.x == 0.4
    assert coords_1.y == 0.5
    assert coords_1.z == 0.6

    assert isinstance(coords_2, Coordinates3D)
    assert coords_2.x == 0.7
    assert coords_2.y == 0.8
    assert coords_2.z == 0.9


def test_create_reduction_result(dimensionality_service):
    """Test creating reduction result.

    Args:
        dimensionality_service: Dimensionality reduction service.
    """
    # Create sample data
    coords_2d = np.array([[0.1, 0.2], [0.3, 0.4]])
    coords_3d = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])

    # Create result for PCA
    pca_result = dimensionality_service._create_reduction_result("pca", coords_2d, coords_3d, 0)

    # Verify result
    assert isinstance(pca_result, DimensionalityReductionResult)
    assert pca_result.algorithm == "pca"
    assert isinstance(pca_result.coordinates_2d, Coordinates2D)
    assert pca_result.coordinates_2d.x == 0.1
    assert pca_result.coordinates_2d.y == 0.2
    assert isinstance(pca_result.coordinates_3d, Coordinates3D)
    assert pca_result.coordinates_3d.x == 0.1
    assert pca_result.coordinates_3d.y == 0.2
    assert pca_result.coordinates_3d.z == 0.3

    # Create result for t-SNE
    tsne_result = dimensionality_service._create_reduction_result("tsne", coords_2d, coords_3d, 1)

    # Verify result
    assert isinstance(tsne_result, DimensionalityReductionResult)
    assert tsne_result.algorithm == "tsne"
    assert isinstance(tsne_result.coordinates_2d, Coordinates2D)
    assert tsne_result.coordinates_2d.x == 0.3
    assert tsne_result.coordinates_2d.y == 0.4
    assert isinstance(tsne_result.coordinates_3d, Coordinates3D)
    assert tsne_result.coordinates_3d.x == 0.4
    assert tsne_result.coordinates_3d.y == 0.5
    assert tsne_result.coordinates_3d.z == 0.6


def test_reduce_pca(dimensionality_service, sample_embeddings):
    """Test PCA reduction.

    Args:
        dimensionality_service: Dimensionality reduction service.
        sample_embeddings: Sample embeddings dictionary.
    """
    # Perform PCA reduction
    coords_2d, coords_3d = dimensionality_service.reduce_pca(sample_embeddings)

    # Verify 2D coordinates
    assert coords_2d.shape == (3, 2)
    assert np.array_equal(coords_2d, np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]))

    # Verify 3D coordinates
    assert coords_3d.shape == (3, 3)
    assert np.array_equal(coords_3d, np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]))

    # Verify PCA was initialized correctly
    from app.services.dimensionality import PCA

    assert PCA.call_count == 2

    # Verify 2D PCA
    assert PCA.call_args_list[0][0] == ()
    assert PCA.call_args_list[0][1] == {"n_components": 2, "random_state": 42}

    # Verify 3D PCA
    assert PCA.call_args_list[1][0] == ()
    assert PCA.call_args_list[1][1] == {"n_components": 3, "random_state": 42}


def test_reduce_tsne(dimensionality_service, sample_embeddings):
    """Test t-SNE reduction.

    Args:
        dimensionality_service: Dimensionality reduction service.
        sample_embeddings: Sample embeddings dictionary.
    """
    # Perform t-SNE reduction
    coords_2d, coords_3d = dimensionality_service.reduce_tsne(sample_embeddings)

    # Verify 2D coordinates
    assert coords_2d.shape == (3, 2)
    assert np.array_equal(coords_2d, np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]))

    # Verify 3D coordinates
    assert coords_3d.shape == (3, 3)
    assert np.array_equal(coords_3d, np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]))

    # Verify t-SNE was initialized correctly
    from app.services.dimensionality import TSNE

    assert TSNE.call_count == 2

    # Get the expected t-SNE parameters
    expected_params = {
        "perplexity": 30.0,
        "n_iter": 1000,
        "random_state": 42,
    }

    # Verify 2D t-SNE
    assert TSNE.call_args_list[0][0] == ()
    assert TSNE.call_args_list[0][1]["n_components"] == 2
    for param, value in expected_params.items():
        assert TSNE.call_args_list[0][1][param] == value

    # Verify 3D t-SNE
    assert TSNE.call_args_list[1][0] == ()
    assert TSNE.call_args_list[1][1]["n_components"] == 3
    for param, value in expected_params.items():
        assert TSNE.call_args_list[1][1][param] == value


def test_reduce_umap(dimensionality_service, sample_embeddings):
    """Test UMAP reduction.

    Args:
        dimensionality_service: Dimensionality reduction service.
        sample_embeddings: Sample embeddings dictionary.
    """
    # Perform UMAP reduction
    coords_2d, coords_3d = dimensionality_service.reduce_umap(sample_embeddings)

    # Verify 2D coordinates
    assert coords_2d.shape == (3, 2)
    assert np.array_equal(coords_2d, np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]))

    # Verify 3D coordinates
    assert coords_3d.shape == (3, 3)
    assert np.array_equal(coords_3d, np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]))

    # Verify UMAP was initialized correctly
    from app.services.dimensionality import UMAP

    assert UMAP.call_count == 2

    # Get the expected UMAP parameters
    expected_params = {
        "n_neighbors": 15,
        "min_dist": 0.1,
        "random_state": 42,
        "init": "random",
    }

    # Verify 2D UMAP
    assert UMAP.call_args_list[0][0] == ()
    assert UMAP.call_args_list[0][1]["n_components"] == 2
    for param, value in expected_params.items():
        assert UMAP.call_args_list[0][1][param] == value

    # Verify 3D UMAP
    assert UMAP.call_args_list[1][0] == ()
    assert UMAP.call_args_list[1][1]["n_components"] == 3
    for param, value in expected_params.items():
        assert UMAP.call_args_list[1][1][param] == value


def test_get_reductions_for_item(dimensionality_service, sample_embeddings):
    """Test getting reductions for a specific item.

    Args:
        dimensionality_service: Dimensionality reduction service.
        sample_embeddings: Sample embeddings dictionary.
    """
    # Mock the individual reduction methods
    with (
        patch.object(dimensionality_service, "reduce_pca") as mock_reduce_pca,
        patch.object(dimensionality_service, "reduce_tsne") as mock_reduce_tsne,
        patch.object(dimensionality_service, "reduce_umap") as mock_reduce_umap,
    ):
        # Configure mocks to return sample data
        mock_reduce_pca.return_value = (
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        )
        mock_reduce_tsne.return_value = (
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        )
        mock_reduce_umap.return_value = (
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        )

        # Get reductions for item index 1
        results = dimensionality_service.get_reductions_for_item(sample_embeddings, 1)

        # Verify reduction methods were called
        mock_reduce_pca.assert_called_once_with(sample_embeddings)
        mock_reduce_tsne.assert_called_once_with(sample_embeddings)
        mock_reduce_umap.assert_called_once_with(sample_embeddings)

        # Verify results
        assert len(results) == 3
        assert results[0].algorithm == "pca"
        assert results[0].coordinates_2d.x == 0.3
        assert results[0].coordinates_2d.y == 0.4
        assert results[0].coordinates_3d.x == 0.4
        assert results[0].coordinates_3d.y == 0.5
        assert results[0].coordinates_3d.z == 0.6

        assert results[1].algorithm == "tsne"
        assert results[1].coordinates_2d.x == 0.3
        assert results[1].coordinates_2d.y == 0.4
        assert results[1].coordinates_3d.x == 0.4
        assert results[1].coordinates_3d.y == 0.5
        assert results[1].coordinates_3d.z == 0.6

        assert results[2].algorithm == "umap"
        assert results[2].coordinates_2d.x == 0.3
        assert results[2].coordinates_2d.y == 0.4
        assert results[2].coordinates_3d.x == 0.4
        assert results[2].coordinates_3d.y == 0.5
        assert results[2].coordinates_3d.z == 0.6


def test_reduce_all(dimensionality_service, sample_embeddings):
    """Test reducing all items.

    Args:
        dimensionality_service: Dimensionality reduction service.
        sample_embeddings: Sample embeddings dictionary.
    """
    # Mock the individual reduction methods
    with (
        patch.object(dimensionality_service, "reduce_pca") as mock_reduce_pca,
        patch.object(dimensionality_service, "reduce_tsne") as mock_reduce_tsne,
        patch.object(dimensionality_service, "reduce_umap") as mock_reduce_umap,
    ):
        # Configure mocks to return sample data
        mock_reduce_pca.return_value = (
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        )
        mock_reduce_tsne.return_value = (
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        )
        mock_reduce_umap.return_value = (
            np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]),
        )

        # Reduce all items
        results = dimensionality_service.reduce_all(sample_embeddings)

        # Verify reduction methods were called
        mock_reduce_pca.assert_called_once_with(sample_embeddings)
        mock_reduce_tsne.assert_called_once_with(sample_embeddings)
        mock_reduce_umap.assert_called_once_with(sample_embeddings)

        # Verify results
        assert len(results) == 3  # One for each input text

        # Check first item
        assert len(results[0]) == 3  # Three reduction algorithms
        assert results[0][0].algorithm == "pca"
        assert results[0][0].coordinates_2d.x == 0.1
        assert results[0][0].coordinates_2d.y == 0.2
        assert results[0][0].coordinates_3d.x == 0.1
        assert results[0][0].coordinates_3d.y == 0.2
        assert results[0][0].coordinates_3d.z == 0.3

        # Check second item
        assert len(results[1]) == 3
        assert results[1][1].algorithm == "tsne"
        assert results[1][1].coordinates_2d.x == 0.3
        assert results[1][1].coordinates_2d.y == 0.4
        assert results[1][1].coordinates_3d.x == 0.4
        assert results[1][1].coordinates_3d.y == 0.5
        assert results[1][1].coordinates_3d.z == 0.6

        # Check third item
        assert len(results[2]) == 3
        assert results[2][2].algorithm == "umap"
        assert results[2][2].coordinates_2d.x == 0.5
        assert results[2][2].coordinates_2d.y == 0.6
        assert results[2][2].coordinates_3d.x == 0.7
        assert results[2][2].coordinates_3d.y == 0.8
        assert results[2][2].coordinates_3d.z == 0.9
