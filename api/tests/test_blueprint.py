from __future__ import annotations

from types import SimpleNamespace

from devforge.blueprint import AIBlueprint, generate_blueprint, safety_identifier
from devforge.models import GenerateRequest, GeneratedFile


def request() -> GenerateRequest:
    return GenerateRequest(
        projectName="Orbit",
        description="A dependable starter for a small product team.",
        frameworkId="fastapi",
        features=["Health checks"],
        database="sqlite",
        auth="jwt",
        packageManager="pip",
        styling="none",
        testLevel="unit",
        docker=True,
        ci=True,
    )


def test_structured_openai_blueprint(monkeypatch):
    parsed = AIBlueprint(
        summary="A structured project summary.",
        architecture=["A", "B", "C"],
        getting_started=["One", "Two", "Three"],
        decisions=["D1", "D2"],
        next_steps=["N1", "N2"],
    )
    parse = lambda **_kwargs: SimpleNamespace(output_parsed=parsed)
    fake_client = SimpleNamespace(responses=SimpleNamespace(parse=parse))
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr("devforge.blueprint.OpenAI", lambda **_kwargs: fake_client)
    blueprint, status, warning = generate_blueprint(
        request(), "FastAPI", [GeneratedFile(path="README.md", content="# Orbit")], "127.0.0.1"
    )
    assert status == "generated"
    assert warning is None
    assert blueprint.summary == parsed.summary


def test_openai_failure_degrades_without_losing_the_starter(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(
        "devforge.blueprint.OpenAI",
        lambda **_kwargs: (_ for _ in ()).throw(RuntimeError("offline")),
    )
    blueprint, status, warning = generate_blueprint(
        request(), "FastAPI", [GeneratedFile(path="README.md", content="# Orbit")], "127.0.0.1"
    )
    assert status == "fallback"
    assert warning
    assert "Orbit" in blueprint.summary


def test_safety_identifier_is_stable_and_private(monkeypatch):
    monkeypatch.setenv("SAFETY_HASH_SECRET", "secret")
    first = safety_identifier("203.0.113.1")
    assert first == safety_identifier("203.0.113.1")
    assert first != safety_identifier("203.0.113.2")
    assert "203.0.113.1" not in first
