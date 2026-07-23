from __future__ import annotations

import argparse
from pathlib import Path

from devforge.catalog import framework
from devforge.generators import generate_files
from devforge.models import GenerateRequest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("framework_id")
    parser.add_argument("output")
    args = parser.parse_args()
    item = framework(args.framework_id)
    request = GenerateRequest(
        projectName="GeneratedSmoke",
        description="A generated starter used for continuous integration validation.",
        frameworkId=item["id"],
        features=["Health endpoint"],
        database=item["databases"][0],
        auth=item["auth"][0],
        packageManager=item["packageManagers"][0],
        styling=item["styling"][0],
        testLevel="unit",
        docker=False,
        ci=False,
    )
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    for generated in generate_files(request):
        target = output / generated.path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(generated.content, encoding="utf-8")


if __name__ == "__main__":
    main()
