"""API dependencies for authentication and rate limiting."""

from collections.abc import AsyncGenerator
from typing import Annotated

import httpx
import posthog
from clerk_backend_api import Clerk, RequestState
from clerk_backend_api.jwks_helpers import AuthenticateRequestOptions
from fastapi import Depends, HTTPException, Request, status

from app.config import get_settings


async def get_clerk() -> AsyncGenerator[Clerk, None]:
    """Get Clerk client instance.

    Returns:
        Configured Clerk client.
    """
    async with Clerk(bearer_auth=get_settings().clerk_secret_key) as clerk:
        yield clerk


async def verify_auth_token(
    request: Request,
    clerk: Annotated[Clerk, Depends(get_clerk)],
) -> RequestState:
    """Verify JWT token from Clerk.

    Args:
        auth: Authorization credentials.
        clerk: Clerk client instance.

    Returns:
        Dictionary containing user claims.

    Raises:
        HTTPException: If token is invalid.
    """
    # Convert FastAPI request headers to httpx format
    httpx_request = httpx.Request(
        method=request.method, url=str(request.url), headers=dict(request.headers)
    )

    request_state = clerk.authenticate_request(
        httpx_request,
        AuthenticateRequestOptions(),
    )
    if request_state.is_signed_in:
        return request_state
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=request_state.message or "Invalid or missing authentication token",
    )


def get_posthog() -> posthog.Client:
    """Get PostHog client instance.

    Returns:
        Configured PostHog client.
    """
    return posthog.Client(
        api_key=get_settings().posthog_api_key,
        host=get_settings().posthog_host,
        enable_exception_autocapture=True,
    )


def track_event(
    request: Request,
    request_state: Annotated[RequestState, Depends(verify_auth_token)],
    posthog_client: Annotated[posthog.Client, Depends(get_posthog)],
) -> None:
    """Track API usage event in PostHog.

    Args:
        request: FastAPI request object.
        claims: User claims from JWT token.
        posthog_client: PostHog client instance.
    """
    if request_state.payload is None:
        return
    user_id: str | None = request_state.payload.get("sub")
    if user_id:
        posthog_client.capture(
            distinct_id=user_id,
            event="api_request",
            properties={
                "endpoint": request.url.path,
                "method": request.method,
            },
        )
