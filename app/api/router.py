"""FastAPI router for the embedding visualization API."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import track_event, verify_auth_token
from app.config import get_settings
from app.models.schemas import (
    ItemResult,
    VisualizationRequest,
    VisualizationResponse,
)
from app.services.cache import CacheService
from app.services.dimensionality import DimensionalityReductionService
from app.services.embedding import EmbeddingService

router = APIRouter(prefix=get_settings().api_prefix)


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        Dictionary with status message.
    """
    return {"status": "healthy"}


@router.post(
    "/visualize",
    response_model=VisualizationResponse,
    dependencies=[
        Depends(verify_auth_token),
        # Depends(check_rate_limit),
        Depends(track_event),
    ],
)
async def visualize_text(
    request: VisualizationRequest,
    embedding_service: Annotated[EmbeddingService, Depends()],
    dim_reduction_service: Annotated[DimensionalityReductionService, Depends()],
    cache_service: Annotated[CacheService, Depends()],
) -> VisualizationResponse:
    """Generate embeddings and low dimension representations of embeddings for input texts.

    Args:
        request: Visualization request containing input texts.
        embedding_service: Service for generating embeddings.
        dim_reduction_service: Service for dimensionality reduction.
        cache_service: Service for caching results.

    Returns:
        Visualization response with embeddings and reduced dimensions.

    Raises:
        HTTPException: If text processing fails.
    """
    try:
        # Extract text content from request
        text_contents = [text.text for text in request.texts]

        # Check cache first
        cached_embeddings = await cache_service.get_embeddings(text_contents)

        # Determine which texts need new embeddings
        missing_texts = []
        for text_input in request.texts:
            if text_input.text not in cached_embeddings:
                missing_texts.append(text_input)

        # Generate embeddings for missing texts
        if missing_texts:
            new_embeddings = embedding_service.generate_embeddings(missing_texts)
            # Store new embeddings in cache
            await cache_service.store_embeddings(new_embeddings)
            # Merge with cached embeddings
            embeddings = {**cached_embeddings, **new_embeddings}
        else:
            embeddings = cached_embeddings

        # Perform dimensionality reduction for all items
        all_reductions = dim_reduction_service.reduce_all(embeddings)

        # Create item results
        item_results = []
        for i, text in enumerate(request.texts):
            item_results.append(
                ItemResult(
                    label=text.text,
                    embedding=embeddings[text.text],
                    reductions=all_reductions[i],
                )
            )

        return VisualizationResponse(results=item_results)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process text: {str(e)}",
        ) from e
