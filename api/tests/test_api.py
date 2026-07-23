from __future__ import annotations

from fastapi.testclient import TestClient

from devforge.main import app

client = TestClient(app)


def payload(framework_id: str = "fastapi") -> dict:
    defaults = {
        "fastapi": ("pip", "sqlite", "jwt", "none"),
        "react": ("npm", "none", "none", "css"),
    }
    package, database, auth, styling = defaults[framework_id]
    return {
        "projectName": "OrbitAPI",
        "description": "A dependable starter for a small product team.",
        "frameworkId": framework_id,
        "features": ["Health checks", "Clear configuration"],
        "database": database,
        "auth": auth,
        "packageManager": package,
        "styling": styling,
        "testLevel": "unit",
        "docker": True,
        "ci": True,
    }


def test_health_lists_all_frameworks():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["frameworks"] == 14


def test_generation_requires_internal_token():
    assert client.post("/v1/generate", json=payload()).status_code == 401


def test_generation_returns_files_and_fallback(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.post(
        "/v1/generate",
        json=payload(),
        headers={"x-devforge-token": "dev-token"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["generation"]["aiStatus"] == "fallback"
    assert data["generation"]["fileCount"] == len(data["files"])
    assert any(item["path"] == "app/main.py" for item in data["files"])
    assert data["warnings"]


def test_rejects_incompatible_options():
    request = payload("react")
    request["database"] = "postgresql"
    response = client.post(
        "/v1/generate",
        json=request,
        headers={"x-devforge-token": "dev-token"},
    )
    assert response.status_code == 422
