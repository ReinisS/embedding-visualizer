# Embedding Visualizer

Interactive visualization of text embeddings with dimensionality reduction techniques.

This repository consists of two main components:
1. A FastAPI backend for processing and analyzing text embeddings
2. A Next.js frontend for interactive visualization

For information about the UI application, please check [ui/README.md](ui/README.md).

## Features

- Generate text embeddings using the `Xenova/all-MiniLM-L6-v2` model
- Apply multiple dimensionality reduction algorithms:
  - Principal Component Analysis (PCA)
  - t-Distributed Stochastic Neighbor Embedding (t-SNE)
  - Uniform Manifold Approximation and Projection (UMAP)
- Visualize embeddings in both 2D and 3D
- Redis-based caching for embeddings for improved performance
- Authentication using Clerk
- Rate limiting to prevent abuse
- Analytics tracking with PostHog

## Prerequisites

- uv (for dependency management)
- Python 3.11
- Redis server (can be run with Docker)
- Clerk account (for authentication)
- PostHog account (for analytics)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/reiniss/embedding-visualizer.git
cd embedding-visualizer
```

2. Install dependencies using `uv`:
```bash
uv sync
```

3. Create a `.env` file with your configuration. You can use the provided `.env.example` as a template.

## Running with Docker

1. Build and start the containers (both the FastAPI backend and Redis):
```bash
docker compose up --build
```

The API will be available at `http://127.0.0.1:8000`.

The OpenAPI documentation will be available at `http://127.0.0.1:8000/docs`.

## Running API Locally (useful for development/debugging)

1. Start Redis:
```bash
make run-redis
```

2. Start the FastAPI server:
```bash
make run-backend
```

## API Endpoints

### Health Check
```
GET /embedding-visualizer/api/health
```

### Generate Embeddings and Visualizations
```
POST /embedding-visualizer/api/visualize
Content-Type: application/json
Authorization: Bearer your_clerk_jwt_token

{
  "texts": [
    {
      "text": "Your first text here",
    },
    {
      "text": "Your second text here",
    }
  ]
}
```

## Development

### Running Tests

```bash
make run-tests
```

### Code Quality

The project uses Ruff for linting and formatting:

```bash
# Format code
ruff format .

# Lint code
ruff check .
```

You can also use pre-commit hooks to automatically run code checks before committing:

```bash
uv run pre-commit install
```

### Project Structure

```
embedding-visualizer/
├── app/
│   ├── api/            # API routes and dependencies
│   ├── models/         # Pydantic models
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── tests/              # Test suite
├── ui/                 # Next.js frontend application
│   ├── public/         # Static assets
│   ├── src/            # Frontend source code
│   ├── .env            # Environment variables
│   └── README.md       # UI-specific documentation
├── .env                # Environment variables
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Docker build file
├── pyproject.toml      # Project metadata
└── README.md           # Documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
