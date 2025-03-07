"""Tests for the embedding service."""

from unittest.mock import patch

import numpy as np
import pytest

from app.models.schemas import TextInput
from app.services.embedding import EmbeddingService


@pytest.fixture
def mock_sentence_transformer():
    """Fixture for mocking SentenceTransformer."""
    with patch("app.services.embedding.SentenceTransformer") as mock:
        # Configure the model's encode method to return a numpy array
        model_instance = mock.return_value
        model_instance.encode.return_value = np.array(
            [
                [0.1, 0.2, 0.3],
                [0.4, 0.5, 0.6],
                [0.7, 0.8, 0.9],
            ]
        )
        yield model_instance


@pytest.fixture
def embedding_service(mock_sentence_transformer, test_settings):
    """Fixture for creating an embedding service for tests."""
    return EmbeddingService()


def test_embedding_service_init(mock_sentence_transformer, test_settings):
    """Test embedding service initialization."""
    service = EmbeddingService()

    # Verify the model was initialized with the correct model name
    from app.services.embedding import SentenceTransformer

    SentenceTransformer.assert_called_once_with(test_settings.model_name)

    # Verify the settings were saved
    assert service.settings == test_settings


@pytest.mark.parametrize(
    "text_inputs, expected_encode_args, expected_results",
    [
        # Single text case
        (
            [TextInput(text="test text")],
            ["test text"],
            {"test text": [0.1, 0.2, 0.3]},
        ),
        # Multiple texts case
        (
            [
                TextInput(text="test text 1"),
                TextInput(text="test text 2"),
                TextInput(text="test text 3"),
            ],
            ["test text 1", "test text 2", "test text 3"],
            {
                "test text 1": [0.1, 0.2, 0.3],
                "test text 2": [0.4, 0.5, 0.6],
                "test text 3": [0.7, 0.8, 0.9],
            },
        ),
    ],
)
def test_generate_embeddings(
    embedding_service,
    mock_sentence_transformer,
    text_inputs,
    expected_encode_args,
    expected_results,
):
    """Test generating embeddings with different inputs."""
    # Generate embeddings
    embeddings = embedding_service.generate_embeddings(text_inputs)

    # Verify model call
    mock_sentence_transformer.encode.assert_called_once_with(
        expected_encode_args,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    # Verify results
    assert embeddings == expected_results


def test_generate_embeddings_empty_list(embedding_service, mock_sentence_transformer):
    """Test generating embeddings with an empty list of texts."""
    # Generate embeddings for empty list
    embeddings = embedding_service.generate_embeddings([])

    # Verify the model was not called
    mock_sentence_transformer.encode.assert_not_called()

    # Verify empty result
    assert embeddings == {}
