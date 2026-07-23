from __future__ import annotations

import hashlib
import hmac
import os

from openai import OpenAI
from pydantic import BaseModel, Field

from .models import Blueprint, GenerateRequest, GeneratedFile


class AIBlueprint(BaseModel):
    summary: str = Field(max_length=900)
    architecture: list[str] = Field(min_length=3, max_length=7)
    getting_started: list[str] = Field(min_length=3, max_length=8)
    decisions: list[str] = Field(min_length=2, max_length=7)
    next_steps: list[str] = Field(min_length=2, max_length=6)


def safety_identifier(raw_identifier: str) -> str:
    secret = os.getenv("SAFETY_HASH_SECRET", "local-devforge-secret").encode()
    return hmac.new(secret, raw_identifier.encode(), hashlib.sha256).hexdigest()[:32]


def fallback_blueprint(
    request: GenerateRequest, framework_name: str, files: list[GeneratedFile]
) -> Blueprint:
    features = ", ".join(request.features) if request.features else "a health endpoint"
    return Blueprint(
        summary=(
            f"{request.project_name} is a {framework_name} starter built around "
            f"{features}. It includes {len(files)} curated files and is ready for "
            "dependency installation and local development."
        ),
        architecture=[
            f"Use {framework_name} as the application foundation.",
            f"Keep persistence on {request.database} and authentication on {request.auth}.",
            "Separate configuration from code through environment variables.",
            f"Ship {request.test_level.replace('-', ' and ')} coverage with the starter.",
        ],
        gettingStarted=[
            "Download and extract the generated ZIP.",
            "Copy .env.example to .env and replace development secrets.",
            f"Install dependencies with {request.package_manager}.",
            "Run the development command documented in README.md.",
            "Open the health endpoint before adding product features.",
        ],
        decisions=[
            "Generated source is deterministic and safe to inspect before execution.",
            "Infrastructure options are explicit so the starter remains easy to replace.",
            "Health checks and automated tests establish a deployable baseline.",
        ],
        nextSteps=[
            "Model the first domain entity and its validation rules.",
            "Replace sample secrets and configure the production database.",
            "Run the complete test and build pipeline before deployment.",
        ],
    )


def generate_blueprint(
    request: GenerateRequest,
    framework_name: str,
    files: list[GeneratedFile],
    raw_safety_identifier: str,
) -> tuple[Blueprint, str, str | None]:
    model = os.getenv("OPENAI_MODEL", "gpt-5.6-terra")
    api_key = os.getenv("OPENAI_API_KEY")
    fallback = fallback_blueprint(request, framework_name, files)
    if not api_key:
        return fallback, "fallback", "OpenAI is not configured; a local blueprint was used."

    tree = "\n".join(f"- {item.path}" for item in files)
    features = "\n".join(f"- {item}" for item in request.features) or "- Health check"
    prompt = f"""
    Create a concise, implementation-focused project blueprint for this curated starter.
    Do not invent files, services, or integrations that are not listed. Explain practical
    decisions, local setup, and the next product work. Avoid marketing language.

    Project: {request.project_name}
    Framework: {framework_name}
    Description: {request.description}
    Database: {request.database}
    Authentication: {request.auth}
    Test level: {request.test_level}
    Requested features:
    {features}

    Generated file tree:
    {tree}
    """
    try:
        client = OpenAI(api_key=api_key, timeout=45.0, max_retries=1)
        response = client.responses.parse(
            model=model,
            store=False,
            safety_identifier=safety_identifier(raw_safety_identifier),
            reasoning={"effort": "medium"},
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a staff software architect. Return only the requested "
                        "structured blueprint. Be concrete, accurate, and concise."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            text_format=AIBlueprint,
        )
        parsed = response.output_parsed
        if parsed is None:
            raise ValueError("The model did not return a parsed blueprint.")
        return (
            Blueprint(
                summary=parsed.summary,
                architecture=parsed.architecture,
                gettingStarted=parsed.getting_started,
                decisions=parsed.decisions,
                nextSteps=parsed.next_steps,
            ),
            "generated",
            None,
        )
    except Exception:
        return fallback, "fallback", "AI blueprint generation was unavailable; the starter is complete and a local blueprint was used."
