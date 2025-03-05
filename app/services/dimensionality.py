"""Service for dimensionality reduction of embeddings."""

from typing import Literal

import numpy as np
from openTSNE import TSNE
from sklearn.decomposition import PCA
from umap import UMAP

from app.models.schemas import (
    Coordinates2D,
    Coordinates3D,
    DimensionalityReductionResult,
)


class DimensionalityReductionService:
    """Service for reducing dimensionality of embeddings."""

    def __init__(self):
        """Initialize dimensionality reduction algorithms."""
        # PCA configuration
        self.pca_2d = PCA(n_components=2, random_state=42)
        self.pca_3d = PCA(n_components=3, random_state=42)

        # t-SNE configuration
        self.tsne_params = {
            "perplexity": 30.0,
            "n_iter": 1000,
            "random_state": 42,
        }

        # UMAP configuration
        self.umap_params = {
            "n_neighbors": 15,
            "min_dist": 0.1,
            "random_state": 42,
            "init": "random",
        }

    def _get_coordinates_2d(
        self,
        reduced_data: np.ndarray,
        idx: int,
    ) -> Coordinates2D:
        """Get 2D coordinates for a specific index.

        Args:
            reduced_data: Array of reduced 2D coordinates.
            idx: Index of the coordinates to retrieve.

        Returns:
            2D coordinates object.
        """
        coords = reduced_data[idx]
        return Coordinates2D(
            x=float(coords[0]),
            y=float(coords[1]),
        )

    def _get_coordinates_3d(
        self,
        reduced_data: np.ndarray,
        idx: int,
    ) -> Coordinates3D:
        """Get 3D coordinates for a specific index.

        Args:
            reduced_data: Array of reduced 3D coordinates.
            idx: Index of the coordinates to retrieve.

        Returns:
            3D coordinates object.
        """
        coords = reduced_data[idx]
        return Coordinates3D(
            x=float(coords[0]),
            y=float(coords[1]),
            z=float(coords[2]),
        )

    def _create_reduction_result(
        self,
        algorithm: Literal["pca", "tsne", "umap"],
        coords_2d: np.ndarray,
        coords_3d: np.ndarray,
        idx: int,
    ) -> DimensionalityReductionResult:
        """Create a dimensionality reduction result for a specific index.

        Args:
            algorithm: Name of the algorithm used.
            coords_2d: Array of 2D coordinates.
            coords_3d: Array of 3D coordinates.
            idx: Index of the item.

        Returns:
            Dimensionality reduction result.
        """
        return DimensionalityReductionResult(
            algorithm=algorithm,
            coordinates_2d=self._get_coordinates_2d(coords_2d, idx),
            coordinates_3d=self._get_coordinates_3d(coords_3d, idx),
        )

    def reduce_pca(
        self,
        embeddings: dict[str, list[float]],
    ) -> tuple[np.ndarray, np.ndarray]:
        """Reduce dimensionality using PCA.

        Args:
            embeddings: Dictionary mapping labels to embeddings.

        Returns:
            Tuple of (2D coordinates, 3D coordinates).
        """
        labels = list(embeddings.keys())
        data = np.array([embeddings[label] for label in labels])

        # Perform PCA
        coords_2d = self.pca_2d.fit_transform(data)
        coords_3d = self.pca_3d.fit_transform(data)

        return coords_2d, coords_3d

    def reduce_tsne(
        self,
        embeddings: dict[str, list[float]],
    ) -> tuple[np.ndarray, np.ndarray]:
        """Reduce dimensionality using t-SNE.

        Args:
            embeddings: Dictionary mapping labels to embeddings.

        Returns:
            Tuple of (2D coordinates, 3D coordinates).
        """
        labels = list(embeddings.keys())
        data = np.array([embeddings[label] for label in labels])

        # Perform t-SNE
        tsne_2d = TSNE(n_components=2, **self.tsne_params)
        tsne_3d = TSNE(n_components=3, **self.tsne_params)

        coords_2d = tsne_2d.fit(data)
        coords_3d = tsne_3d.fit(data)

        return coords_2d, coords_3d

    def reduce_umap(
        self,
        embeddings: dict[str, list[float]],
    ) -> tuple[np.ndarray, np.ndarray]:
        """Reduce dimensionality using UMAP.

        Args:
            embeddings: Dictionary mapping labels to embeddings.

        Returns:
            Tuple of (2D coordinates, 3D coordinates).
        """
        labels = list(embeddings.keys())
        data = np.array([embeddings[label] for label in labels])

        # Perform UMAP
        umap_2d = UMAP(n_components=2, **self.umap_params)
        umap_3d = UMAP(n_components=3, **self.umap_params)

        coords_2d = umap_2d.fit_transform(data)
        coords_3d = umap_3d.fit_transform(data)

        return coords_2d, coords_3d

    def get_reductions_for_item(
        self,
        embeddings: dict[str, list[float]],
        item_idx: int,
    ) -> list[DimensionalityReductionResult]:
        """Get dimensionality reduction results for a specific item.

        Args:
            embeddings: Dictionary mapping labels to embeddings.
            item_idx: Index of the item.

        Returns:
            List of dimensionality reduction results for the item.
        """
        # Perform all reductions
        pca_2d, pca_3d = self.reduce_pca(embeddings)
        tsne_2d, tsne_3d = self.reduce_tsne(embeddings)
        umap_2d, umap_3d = self.reduce_umap(embeddings)

        # Create results for the specific item
        return [
            self._create_reduction_result("pca", pca_2d, pca_3d, item_idx),
            self._create_reduction_result("tsne", tsne_2d, tsne_3d, item_idx),
            self._create_reduction_result("umap", umap_2d, umap_3d, item_idx),
        ]

    def reduce_all(
        self,
        embeddings: dict[str, list[float]],
    ) -> list[list[DimensionalityReductionResult]]:
        """Apply all dimensionality reduction algorithms for all items.

        Args:
            embeddings: Dictionary mapping labels to embeddings.

        Returns:
            List of reduction results for each item.
        """
        # Run each algorithm once on the entire dataset
        pca_2d, pca_3d = self.reduce_pca(embeddings)
        tsne_2d, tsne_3d = self.reduce_tsne(embeddings)
        umap_2d, umap_3d = self.reduce_umap(embeddings)

        # Create results for all items
        results = []
        for i in range(len(embeddings)):
            item_results = [
                self._create_reduction_result("pca", pca_2d, pca_3d, i),
                self._create_reduction_result("tsne", tsne_2d, tsne_3d, i),
                self._create_reduction_result("umap", umap_2d, umap_3d, i),
            ]
            results.append(item_results)

        return results
