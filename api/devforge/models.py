from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class GenerateRequest(BaseModel):
    project_name: str = Field(alias="projectName", min_length=2, max_length=50)
    description: str = Field(min_length=10, max_length=800)
    framework_id: str = Field(alias="frameworkId")
    features: list[str] = Field(default_factory=list, max_length=10)
    database: str = "none"
    auth: str = "none"
    package_manager: str = Field(default="npm", alias="packageManager")
    styling: str = "none"
    test_level: Literal["unit", "unit-integration"] = Field(
        default="unit", alias="testLevel"
    )
    docker: bool = True
    ci: bool = True

    model_config = {"populate_by_name": True}

    @field_validator("project_name")
    @classmethod
    def validate_project_name(cls, value: str) -> str:
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]{1,49}", value):
            raise ValueError(
                "Use 2-50 letters, numbers, hyphens, or underscores; start with a letter."
            )
        return value

    @field_validator("features")
    @classmethod
    def validate_features(cls, values: list[str]) -> list[str]:
        cleaned: list[str] = []
        for value in values:
            value = value.strip()
            if not value:
                continue
            if len(value) > 120:
                raise ValueError("Each feature must be 120 characters or fewer.")
            cleaned.append(value)
        return cleaned


class GeneratedFile(BaseModel):
    path: str
    content: str


class Blueprint(BaseModel):
    summary: str
    architecture: list[str]
    getting_started: list[str] = Field(alias="gettingStarted")
    decisions: list[str]
    next_steps: list[str] = Field(alias="nextSteps")

    model_config = {"populate_by_name": True}


class GenerationMeta(BaseModel):
    ai_status: Literal["generated", "fallback"] = Field(alias="aiStatus")
    model: str
    file_count: int = Field(alias="fileCount")
    total_bytes: int = Field(alias="totalBytes")

    model_config = {"populate_by_name": True}


class GenerateResponse(BaseModel):
    blueprint: Blueprint
    files: list[GeneratedFile]
    file_tree: list[str] = Field(alias="fileTree")
    warnings: list[str]
    generation: GenerationMeta

    model_config = {"populate_by_name": True}
