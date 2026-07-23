from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException

from .models import GenerateRequest

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "contracts" / "frameworks.json"


@lru_cache
def catalog() -> dict:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def framework(framework_id: str) -> dict:
    match = next(
        (item for item in catalog()["frameworks"] if item["id"] == framework_id),
        None,
    )
    if not match:
        raise HTTPException(status_code=422, detail="Unsupported framework.")
    return match


def validate_options(request: GenerateRequest) -> dict:
    item = framework(request.framework_id)
    checks = {
        "package manager": (request.package_manager, item["packageManagers"]),
        "database": (request.database, item["databases"]),
        "authentication": (request.auth, item["auth"]),
        "styling": (request.styling, item["styling"]),
    }
    for label, (value, allowed) in checks.items():
        if value not in allowed:
            raise HTTPException(
                status_code=422,
                detail=f"{value!r} is not a supported {label} for {item['name']}.",
            )
    return item
