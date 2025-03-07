"""Logging configuration for the embedding visualizer."""

import logging
import sys

from app.config import get_settings


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for the given name.

    Args:
        name: The name for the logger, usually __name__ of the module.

    Returns:
        Configured logger instance.
    """
    logger = logging.getLogger(name)

    # Only configure if handlers aren't already set up
    if not logger.handlers:
        settings = get_settings()
        log_level = logging.DEBUG if settings.debug else logging.INFO
        logger.setLevel(log_level)

        # Create console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)

        # Create formatter
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)

        # Add handler to logger
        logger.addHandler(handler)

    return logger
