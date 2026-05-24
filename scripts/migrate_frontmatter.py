#!/usr/bin/env python3
"""
Migrate cover / description / release_date into front matter.

Usage:
  python3 scripts/migrate_frontmatter.py            # dry-run, print markdown sample
  python3 scripts/migrate_frontmatter.py --apply    # write back to files
  python3 scripts/migrate_frontmatter.py --limit 10 # only first N files (dry-run)
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content" / "p"

FRONT_MATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.S)
# URL part allows one nested level of (..) to handle Wikipedia-style links
# like [label](https://.../Page(disambiguation)#anchor)
IMAGE_MD_RE = re.compile(r"!\[[^\]]*\]\((?:[^()]|\([^)]*\))*\)")
IMAGE_URL_RE = re.compile(r"!\[[^\]]*\]\(((?:[^()]|\([^)]*\))*)\)")
LINK_MD_RE = re.compile(r"\[([^\]]+)\]\((?:[^()]|\([^)]*\))*\)")
INLINE_FMT_RE = re.compile(r"\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`")
DESCRIPTION_MAX = 280
TAG_LINE_RE = re.compile(r"^\s+-\s+(.+)$", re.M)
YEAR_RE = re.compile(r"^(?:19|20)\d{2}$")


def parse_file(text: str) -> tuple[str, str] | tuple[None, None]:
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return None, None
    fm = m.group(1)
    body = text[m.end():]
    return fm, body


def extract_tags(fm: str) -> list[str]:
    block = re.search(r"^tags:\s*\n((?:\s+-\s+.+\n?)+)", fm, re.M)
    if not block:
        return []
    tags = []
    for line in block.group(1).splitlines():
        m = TAG_LINE_RE.match(line)
        if m:
            tags.append(m.group(1).strip().strip("\"'"))
    return tags


def extract_cover(body: str) -> str | None:
    m = IMAGE_URL_RE.search(body)
    return m.group(1).strip() if m else None


def extract_description(body: str) -> str | None:
    """Take everything before <!--more--> verbatim as the author-intended summary.
    Only the cover image (first ![]() ) is removed; all other markdown is kept
    and will be rendered via `markdownify` in the template."""
    more = re.search(r"<!--\s*more\s*-->", body)
    section = body[: more.start()] if more else body
    # Drop only the first image (used as cover)
    section = IMAGE_MD_RE.sub("", section, count=1)
    section = section.strip()
    return section or None


def extract_release_years(tags: list[str]) -> list[str]:
    """Return all 4-digit year tags, sorted ascending (earliest first)."""
    return sorted({t for t in tags if YEAR_RE.match(t)})


def has_field(fm: str, key: str) -> bool:
    return re.search(rf"^{re.escape(key)}\s*:", fm, re.M) is not None


def strip_year_tags(fm: str) -> tuple[str, list[str]]:
    """Remove 4-digit year items from the YAML tags block.
    Returns (new_fm, removed_years)."""
    block_re = re.compile(r"(^tags:\s*\n)((?:\s+-\s+.+\n?)+)", re.M)
    m = block_re.search(fm)
    if not m:
        return fm, []
    header = m.group(1)
    body = m.group(2)
    new_lines = []
    removed = []
    for line in body.splitlines(keepends=True):
        item = TAG_LINE_RE.match(line)
        if item and YEAR_RE.match(item.group(1).strip().strip("\"'")):
            removed.append(item.group(1).strip().strip("\"'"))
            continue
        new_lines.append(line)
    if not removed:
        return fm, []
    new_block = header + "".join(new_lines)
    return fm[: m.start()] + new_block + fm[m.end():], removed


def yaml_escape(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def yaml_block_scalar(text: str, indent: int = 2) -> str:
    """Render `text` as a YAML literal block scalar (|-), preserving newlines
    and not requiring any escaping of `[]()*` markdown characters."""
    pad = " " * indent
    lines = [ln.rstrip() for ln in text.replace("\r\n", "\n").split("\n")]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    body = "\n".join(pad + ln if ln else "" for ln in lines)
    return "|-\n" + body


def build_insertion(cover, description, release_years, fm) -> str:
    parts = []
    if cover and not has_field(fm, "cover"):
        parts.append(f"cover: {yaml_escape(cover)}")
    if description and not has_field(fm, "description"):
        parts.append(f"description: {yaml_block_scalar(description)}")
    if release_years and not has_field(fm, "years"):
        # Always emit YAML sequence for consistency, even with one value
        items = "\n".join(f"  - {yaml_escape(y)}" for y in release_years)
        parts.append("years:\n" + items)
    return "\n".join(parts)


def process_file(path: Path, apply: bool) -> dict:
    text = path.read_text(encoding="utf-8")
    fm, body = parse_file(text)
    if fm is None:
        return {"path": path.name, "skipped": "no front matter"}

    tags = extract_tags(fm)
    cover = extract_cover(body)
    description = extract_description(body)
    release_years = extract_release_years(tags)

    insertion = build_insertion(cover, description, release_years, fm)
    fm_stripped, removed_years = strip_year_tags(fm)

    if not insertion and not removed_years:
        return {
            "path": path.name,
            "cover": cover,
            "description": description,
            "release_years": release_years,
            "removed_years": [],
            "changed": False,
            "note": "nothing to do",
        }

    head = "---\n" + (insertion + "\n" if insertion else "")
    new_text = head + fm_stripped + "\n---\n" + body

    if apply:
        path.write_text(new_text, encoding="utf-8")

    return {
        "path": path.name,
        "cover": cover,
        "description": description,
        "release_years": release_years,
        "removed_years": removed_years,
        "changed": True,
    }


def strip_body_head(text: str) -> tuple[str, bool]:
    """Drop everything in the body from start up to and including <!--more-->.
    Returns (new_text, changed)."""
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return text, False
    fm_block = text[: m.end()]
    body = text[m.end():]
    more = re.search(r"<!--\s*more\s*-->\s*\n?", body)
    if not more:
        return text, False
    new_body = body[more.end():].lstrip("\n")
    return fm_block + new_body, True


def cmd_strip_body(args):
    files = sorted(CONTENT_DIR.glob("*.md"))
    if args.limit:
        files = files[: args.limit]
    n_changed = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        new_text, changed = strip_body_head(text)
        if not changed:
            continue
        n_changed += 1
        if args.apply:
            f.write_text(new_text, encoding="utf-8")
    print(f"strip-body: {n_changed}/{len(files)} would-change (apply={args.apply})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Write changes (default: dry-run)")
    ap.add_argument("--limit", type=int, default=None, help="Process only first N files (dry-run only)")
    ap.add_argument("--sample", type=int, default=10, help="In dry-run, how many to print verbosely")
    ap.add_argument("--strip-body", action="store_true",
                    help="Instead of inserting fields, strip body up to <!--more--> (inclusive)")
    args = ap.parse_args()

    if args.strip_body:
        cmd_strip_body(args)
        return

    files = sorted(CONTENT_DIR.glob("*.md"))
    if args.limit:
        files = files[: args.limit]

    results = [process_file(f, apply=args.apply) for f in files]

    n_total = len(results)
    n_changed = sum(1 for r in results if r.get("changed"))
    n_cover = sum(1 for r in results if r.get("cover"))
    n_desc = sum(1 for r in results if r.get("description"))
    n_year = sum(1 for r in results if r.get("release_years"))

    print(f"\nProcessed {n_total} files")
    print(f"  would-change : {n_changed}")
    print(f"  cover found  : {n_cover}/{n_total}")
    print(f"  desc found   : {n_desc}/{n_total}")
    print(f"  year found   : {n_year}/{n_total}")

    print("\n--- Sample (first {0}) ---".format(args.sample))
    for r in results[: args.sample]:
        print(f"\n● {r['path']}")
        print(f"  cover       : {r.get('cover') or '(none)'}")
        print(f"  release_years: {r.get('release_years') or '(none)'}")
        desc = r.get("description") or "(none)"
        print(f"  description : {desc}")
        if r.get("note"):
            print(f"  note        : {r['note']}")

    if not args.apply:
        print("\n[DRY-RUN] no files were written. Re-run with --apply to write.")
    else:
        print(f"\n[APPLIED] wrote {n_changed} files.")


if __name__ == "__main__":
    main()
