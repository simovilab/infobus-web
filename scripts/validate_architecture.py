"""Validate architecture.yaml, its JSON schema and the example bundles.

Checks:
1. architecture.yaml against architecture.schema.json (duplicate keys fail).
2. Every bundle (bundles/*.json and root templates such as [route_id].json)
   parses and has no duplicate keys.
3. Every bundle component matches the `structure` of its component in
   architecture.yaml: keys are the field name (without the table prefix) or
   the full data entity, nested arrays/objects are compared recursively,
   and null and [] are always accepted.

Usage: python scripts/validate_architecture.py
Requires: pyyaml>=6, jsonschema>=4.18
"""

import json
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]


# --- loading -----------------------------------------------------------------


def _no_duplicates_json(pairs):
    keys = [k for k, _ in pairs]
    duplicated = {k for k in keys if keys.count(k) > 1}
    if duplicated:
        raise ValueError(f"duplicate key(s): {', '.join(sorted(duplicated))}")
    return dict(pairs)


def load_json(path: Path):
    """Load a JSON file, failing on duplicate keys."""
    return json.loads(
        path.read_text(encoding="utf-8"), object_pairs_hook=_no_duplicates_json
    )


class UniqueKeyLoader(yaml.SafeLoader):
    """SafeLoader that fails on duplicate mapping keys."""

    def construct_mapping(self, node, deep=False):
        """Build a mapping, failing on duplicate keys."""
        seen = set()
        for key_node, _ in node.value:
            key = self.construct_object(key_node, deep=deep)
            if key in seen:
                raise ValueError(
                    f"duplicate key '{key}' "
                    f"(line {key_node.start_mark.line + 1})"
                )
            seen.add(key)
        return super().construct_mapping(node, deep=deep)


# --- bundle checks -----------------------------------------------------------


def snake(name: str) -> str:
    """Convert a PascalCase component name to snake_case."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def accepted_keys(entity: str) -> set[str]:
    """Return the keys a data entity may use: `field` or the full string."""
    keys = {entity}
    if "." in entity:
        keys.add(entity.split(".", 1)[1])
    return keys


def check_object(
    structure: dict, data, where: str, problems: list[str]
) -> None:
    """Compare `data` with `structure` (type object|array, values)."""
    if data is None:
        return
    values = structure["values"]
    if structure["type"] == "array":
        if not isinstance(data, list):
            problems.append(f"{where}: expected an array")
            return
        for i, item in enumerate(data):
            check_item(values, item, f"{where}[{i}]", problems)
    else:
        if not isinstance(data, dict):
            problems.append(f"{where}: expected an object")
            return
        check_item(values, data, where, problems)


def check_item(values: list, item, where: str, problems: list[str]) -> None:
    """Compare one object with the entries of a `structure` values list."""
    if not isinstance(item, dict):
        problems.append(f"{where}: expected an object")
        return
    expected: dict[str, object] = {}
    for value in values:
        if isinstance(value, str):
            expected[value] = None
        else:
            expected[value["name"]] = value
    used: set[str] = set()
    for key, child in item.items():
        owner = next((e for e in expected if key in accepted_keys(e)), None)
        if owner is None:
            problems.append(f"{where}: unexpected key '{key}'")
            continue
        if owner in used:
            problems.append(
                f"{where}: '{owner}' appears twice (prefixed and unprefixed)"
            )
        used.add(owner)
        nested = expected[owner]
        if nested is not None:
            check_object(nested, child, f"{where}.{key}", problems)
    for missing in expected:
        if missing not in used:
            problems.append(f"{where}: missing key '{missing}'")


def component_index(architecture: dict) -> dict[str, list[tuple[str, dict]]]:
    """Map each snake_case component name to (page name, component) pairs."""
    index: dict[str, list[tuple[str, dict]]] = {}
    for page in architecture["pages"]:
        for component in page["components"]:
            index.setdefault(snake(component["name"]), []).append(
                (page["name"], component)
            )
    return index


def find_component(index, key: str, pages: set[str] | None):
    """Return the components named `key`, limited to `pages` when given."""
    candidates = index.get(key, [])
    if pages is not None:
        candidates = [c for c in candidates if c[0] in pages]
    return candidates


def check_bundle(
    path: Path, index, problems: list[str], warnings: list[str]
) -> None:
    """Validate one bundle file against the components of architecture.yaml."""
    name = path.relative_to(ROOT).as_posix()
    try:
        data = load_json(path)
    except ValueError as exc:
        problems.append(f"{name}: invalid JSON: {exc}")
        return

    is_ws = path.name.endswith(".ws.json")
    if is_ws:
        entries = data
    else:
        entries = data.get("components")
        if not isinstance(entries, dict):
            problems.append(f"{name}: missing 'components' object")
            return

    # The page is inferred from the component keys the bundle carries.
    pages: set[str] | None = None
    for key in entries:
        page_names = {page for page, _ in index.get(key, [])}
        if not page_names:
            problems.append(
                f"{name}: '{key}' is not a component of architecture.yaml"
            )
            continue
        pages = page_names if pages is None else pages & page_names
    if not pages:
        problems.append(f"{name}: components do not belong to a single page")
        return

    for key, value in entries.items():
        candidates = find_component(index, key, pages)
        if not candidates:
            continue
        page, component = candidates[0]
        wanted = "WebSocket" if is_ws else "HTTP"
        endpoints = [
            e
            for e in component.get("endpoints", [])
            if e["protocol"] == wanted
        ]
        if not endpoints:
            problems.append(
                f"{name}: {page}.{component['name']} has no {wanted} endpoint"
            )
        elif not is_ws and not any(
            e.get("key") in (f"components.{key}", None) for e in endpoints
        ):
            problems.append(
                f"{name}: endpoint key of {component['name']} "
                f"is not components.{key}"
            )
        check_object(component["structure"], value, f"{name}:{key}", problems)

    if not is_ws:
        page_components = {
            snake(c["name"])
            for p in index.values()
            for pg, c in p
            if pg in pages and c["type"] == "feed"
        }
        absent = sorted(
            k
            for k in page_components
            if k not in entries and not k.endswith("_map")
        )
        if absent:
            warnings.append(f"{name}: no data for {', '.join(absent)}")


# --- main --------------------------------------------------------------------


def main() -> int:
    """Run every check and return the process exit code."""
    problems: list[str] = []
    warnings: list[str] = []

    schema = load_json(ROOT / "architecture.schema.json")
    Draft202012Validator.check_schema(schema)

    try:
        architecture = yaml.load(
            (ROOT / "architecture.yaml").read_text(encoding="utf-8"),
            Loader=UniqueKeyLoader,
        )
    except ValueError as exc:
        print(f"architecture.yaml: {exc}")
        return 1
    # YAML parses an unquoted date as a date object; the schema wants a string.
    instance = json.loads(json.dumps(architecture, default=str))
    for error in sorted(
        Draft202012Validator(schema).iter_errors(instance),
        key=lambda e: list(e.path),
    ):
        location = "/".join(str(part) for part in error.path) or "<root>"
        problems.append(f"architecture.yaml: {location}: {error.message}")

    index = component_index(instance)
    bundle_files = sorted((ROOT / "bundles").glob("*.json")) + sorted(
        ROOT.glob("[[]*[]].json")
    )
    for path in bundle_files:
        check_bundle(path, index, problems, warnings)

    for line in warnings:
        print(f"warning: {line}")
    for line in problems:
        print(line)
    print("OK" if not problems else f"{len(problems)} problem(s) found")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
