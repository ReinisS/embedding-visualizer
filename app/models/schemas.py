"""Pydantic models for request and response schemas."""

from typing import Literal

from pydantic import BaseModel, Field


class TextInput(BaseModel):
    """Input text for embedding generation."""

    text: str = Field(..., min_length=1, max_length=100)


class Coordinates2D(BaseModel):
    """2D coordinates from dimensionality reduction."""

    x: float
    y: float


class Coordinates3D(BaseModel):
    """3D coordinates from dimensionality reduction."""

    x: float
    y: float
    z: float


class DimensionalityReductionResult(BaseModel):
    """Result of a single dimensionality reduction algorithm."""

    algorithm: Literal["pca", "tsne", "umap"]
    coordinates_2d: Coordinates2D
    coordinates_3d: Coordinates3D


class VisualizationRequest(BaseModel):
    """Request for text visualization."""

    texts: list[TextInput] = Field(..., min_length=3, max_length=100)


class ItemResult(BaseModel):
    """Result for a single item."""

    label: str
    embedding: list[float]
    reductions: list[DimensionalityReductionResult] = Field(..., min_length=3, max_length=3)


class VisualizationResponse(BaseModel):
    """Response containing embeddings and dimensionality reduction results for all items."""

    results: list[ItemResult]
