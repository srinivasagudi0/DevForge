from __future__ import annotations

import json
from itertools import product
from pathlib import Path, PurePosixPath

import pytest
import yaml

from devforge.catalog import catalog, validate_options
from devforge.generators import generate_files
from devforge.models import GenerateRequest
from devforge.models import GeneratedFile
from devforge.validation import validate_generated_files

ROOT = Path(__file__).resolve().parents[2]


@pytest.mark.parametrize("framework", catalog()["frameworks"], ids=lambda item: item["id"])
def test_every_framework_generates_a_safe_curated_starter(framework):
    request = GenerateRequest(
        projectName="NovaStarter",
        description="A generated starter used to verify every supported framework.",
        frameworkId=framework["id"],
        features=["Health endpoint", "Deployment baseline"],
        database=framework["databases"][0],
        auth=framework["auth"][0],
        packageManager=framework["packageManagers"][0],
        styling=framework["styling"][0],
        testLevel="unit",
        docker=True,
        ci=True,
    )
    validate_options(request)
    files = generate_files(request)
    count, total = validate_generated_files(files)
    paths = {item.path for item in files}
    assert count >= 6
    assert total > 500
    assert "README.md" in paths
    assert ".env.example" in paths
    assert "Dockerfile" in paths
    assert ".github/workflows/ci.yml" in paths
    workflow = next(
        item.content for item in files if item.path == ".github/workflows/ci.yml"
    )
    assert yaml.compose(workflow) is not None
    for path in paths:
        parsed = PurePosixPath(path)
        assert not parsed.is_absolute()
        assert ".." not in parsed.parts


def test_catalog_is_valid_and_unique():
    raw = json.loads((ROOT / "contracts" / "frameworks.json").read_text())
    ids = [item["id"] for item in raw["frameworks"]]
    assert len(ids) == len(set(ids)) == 14


def test_every_declared_option_combination_is_generatable():
    for item in catalog()["frameworks"]:
        for package_manager, database, auth, styling in product(
            item["packageManagers"],
            item["databases"],
            item["auth"],
            item["styling"],
        ):
            request = GenerateRequest(
                projectName="OptionMatrix",
                description="A complete option matrix validation for curated starters.",
                frameworkId=item["id"],
                features=["Audit trail"],
                database=database,
                auth=auth,
                packageManager=package_manager,
                styling=styling,
                testLevel="unit-integration",
                docker=True,
                ci=True,
            )
            validate_options(request)
            files = generate_files(request)
            validate_generated_files(files)
            assert any(generated.path == "README.md" for generated in files)


@pytest.mark.parametrize(
    "path",
    ["/etc/passwd", "../secret", "safe/../../secret", "windows\\path.txt"],
)
def test_generated_file_validator_rejects_unsafe_paths(path):
    with pytest.raises(Exception):
        validate_generated_files([GeneratedFile(path=path, content="unsafe")])


def test_generated_file_validator_rejects_duplicates():
    with pytest.raises(Exception):
        validate_generated_files(
            [
                GeneratedFile(path="README.md", content="one"),
                GeneratedFile(path="README.md", content="two"),
            ]
        )
