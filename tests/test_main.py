"""Tests for the main application."""

from fastapi.testclient import TestClient

from main import app


def test_app_instance():
    """Test that the application instance is created correctly."""
    assert app is not None


def test_app_routes():
    """Test that the application has the expected routes."""
    routes = [route.path for route in app.routes]
    assert "/embedding-visualizer/api/health" in routes
    assert "/embedding-visualizer/api/visualize" in routes


def test_app_client():
    """Test that a test client can be created."""
    with TestClient(app) as client:
        assert client is not None
