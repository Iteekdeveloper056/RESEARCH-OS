import os
import shutil
import tempfile

import pytest

from research_os.config import Settings


@pytest.fixture
def tmp_learning_dir():
    d = tempfile.mkdtemp(prefix="research_os_test_")
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def fake_settings(tmp_learning_dir):
    from pathlib import Path

    return Settings(
        openrouter_api_key="test-key-123",
        openrouter_base_url="https://openrouter.test/api/v1",
        default_model="openai/gpt-5.2",
        tavily_api_key=None,
        learning_log_dir=Path(tmp_learning_dir),
    )
