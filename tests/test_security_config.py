"""Reject origin configuration that would weaken production browser controls."""

import pytest
from pydantic import ValidationError

from app.config import Settings


@pytest.mark.parametrize(
    "origin", ["*", "https://*.example.com", "https://example.com/", "https://example.com/path"]
)
@pytest.mark.parametrize("setting", ["APP_CORS_ORIGINS", "APP_CLERK_AUTHORIZED_PARTIES"])
def test_origin_settings_require_exact_origins(origin, setting):
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            APP_CLERK_PUBLISHABLE_KEY="test",
            APP_CLERK_SECRET_KEY="test",
            APP_POSTHOG_API_KEY="test",
            **{setting: [origin]},
        )
