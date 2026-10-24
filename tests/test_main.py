"""Tests for the main application module."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from main import app


class TestAppConfiguration:
    """Test suite for application configuration and setup."""

    def test_app_instance(self):
        """Verify the app is correctly instantiated as a FastAPI application."""
        assert isinstance(app, FastAPI)
        assert app.title == "Embedding Visualizer"

    def test_api_routes_exist(self):
        """Verify all required API routes are registered with the application."""
        routes = {route.path: route.methods for route in app.routes}

        # Check health endpoint
        assert "/embedding-visualizer/api/health" in routes
        assert "GET" in routes["/embedding-visualizer/api/health"]

        # Check visualization endpoint
        assert "/embedding-visualizer/api/visualize" in routes
        assert "POST" in routes["/embedding-visualizer/api/visualize"]


class TestAppHealthEndpoint:
    """Test suite for the health check endpoint."""

    def test_health_endpoint(self, test_client: TestClient):
        """Verify the health endpoint returns the expected response."""
        response = test_client.get("/embedding-visualizer/api/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_production_frontend_preflight(self, test_client):
        response = test_client.options(
            "/embedding-visualizer/api/visualize",
            headers={
                "Origin": "https://embeddings.reiniss.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == "https://embeddings.reiniss.com"

    def test_untrusted_origin_preflight(self, test_client):
        response = test_client.options(
            "/embedding-visualizer/api/visualize",
            headers={
                "Origin": "https://untrusted.example",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert response.status_code == 400
        assert "access-control-allow-origin" not in response.headers

    def test_visualization_requires_authentication(self, test_client):
        response = test_client.post(
            "/embedding-visualizer/api/visualize",
            json={"texts": [{"text": text} for text in ["one", "two", "three", "four"]]},
        )
        assert response.status_code == 401
