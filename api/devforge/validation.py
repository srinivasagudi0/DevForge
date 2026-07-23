from __future__ import annotations

from pathlib import PurePosixPath

from fastapi import HTTPException

from .models import GeneratedFile

MAX_FILES = 100
MAX_FILE_BYTES = 100_000
MAX_TOTAL_BYTES = 1_500_000


def validate_generated_files(files: list[GeneratedFile]) -> tuple[int, int]:
    if not files or len(files) > MAX_FILES:
        raise HTTPException(
            status_code=500, detail=f"Generator must return 1-{MAX_FILES} files."
        )

    seen: set[str] = set()
    total = 0
    for file in files:
        path = PurePosixPath(file.path)
        if (
            path.is_absolute()
            or ".." in path.parts
            or not file.path
            or "\\" in file.path
            or file.path in seen
        ):
            raise HTTPException(status_code=500, detail="Generator emitted an unsafe path.")
        seen.add(file.path)
        size = len(file.content.encode("utf-8"))
        if size > MAX_FILE_BYTES:
            raise HTTPException(status_code=500, detail="Generated file is too large.")
        total += size
    if total > MAX_TOTAL_BYTES:
        raise HTTPException(status_code=500, detail="Generated project is too large.")
    return len(files), total
