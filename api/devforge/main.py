from __future__ import annotations

import hmac
import os

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .blueprint import generate_blueprint
from .catalog import catalog, validate_options
from .generators import generate_files
from .models import GenerateRequest, GenerateResponse, GenerationMeta
from .validation import validate_generated_files

app = FastAPI(
    title="DevForge Generator API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("APP_ENV", "development") != "production" else None,
)

if os.getenv("APP_ENV", "development") != "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )


def expected_token() -> str:
    token = os.getenv("INTERNAL_API_TOKEN")
    if token:
        return token
    if os.getenv("APP_ENV", "development") == "production":
        raise HTTPException(status_code=503, detail="Generation service is not configured.")
    return "dev-token"


def verify_internal_token(
    x_devforge_token: str | None = Header(default=None),
) -> None:
    if not x_devforge_token or not hmac.compare_digest(
        x_devforge_token, expected_token()
    ):
        raise HTTPException(status_code=401, detail="Invalid internal API token.")


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "devforge-generator",
        "frameworks": len(catalog()["frameworks"]),
    }


@app.post(
    "/v1/generate",
    response_model=GenerateResponse,
    response_model_by_alias=True,
    dependencies=[Depends(verify_internal_token)],
)
def generate(payload: GenerateRequest, request: Request) -> GenerateResponse:
    selected = validate_options(payload)
    files = generate_files(payload)
    count, total_bytes = validate_generated_files(files)
    forwarded = request.headers.get("x-forwarded-for", request.client.host if request.client else "anonymous")
    identifier = forwarded.split(",", 1)[0].strip()
    blueprint, ai_status, warning = generate_blueprint(
        payload, selected["name"], files, identifier
    )
    warnings = [warning] if warning else []
    if os.getenv("APP_ENV", "development") == "production" and not os.getenv(
        "SAFETY_HASH_SECRET"
    ):
        warnings.append("Safety identifier secret is using a temporary fallback.")
    return GenerateResponse(
        blueprint=blueprint,
        files=files,
        fileTree=sorted(item.path for item in files),
        warnings=warnings,
        generation=GenerationMeta(
            aiStatus=ai_status,
            model=os.getenv("OPENAI_MODEL", "gpt-5.6-terra"),
            fileCount=count,
            totalBytes=total_bytes,
        ),
    )
