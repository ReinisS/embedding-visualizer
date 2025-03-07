"""Service for generating text embeddings."""

from sentence_transformers import SentenceTransformer

from app.config import get_settings
from app.models.schemas import TextInput


class EmbeddingService:
    """Service for generating and managing text embeddings."""

    def __init__(self):
        """Initialize the embedding service."""
        self.settings = get_settings()
        self.model = SentenceTransformer(self.settings.model_name)

    def generate_embeddings(self, texts: list[TextInput]) -> dict[str, list[float]]:
        """Generate embeddings for a list of texts.

        Args:
            texts: List of text inputs.

        Returns:
            Dictionary mapping text content to embeddings
        """
        if not texts:
            return {}

        # Extract text content
        text_content = [text.text for text in texts]

        # Generate embeddings
        embeddings = self.model.encode(
            text_content,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )

        # Create text to embedding mapping
        embedding_dict = {
            text.text: embedding.tolist()
            for text, embedding in zip(texts, embeddings, strict=False)
        }

        return embedding_dict
