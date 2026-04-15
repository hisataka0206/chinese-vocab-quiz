"""Fetch Chinese vocabulary from a Notion database and write docs/local_vocab.json.

Usage:
    python scripts/fetch_vocab.py

Requires the following environment variables (can be set in a local .env file):
    NOTION_TOKEN             - Notion integration token
    NOTION_CHINESE_DICT_ID   - Notion database ID (raw UUID or full URL fragment)

The resulting JSON is consumed by docs/script.js (GitHub Pages static site).
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from notion_client import Client


REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = REPO_ROOT / "docs" / "local_vocab.json"


def _plain_text(rich_text_array: list[dict]) -> str:
    return "".join(chunk.get("plain_text", "") for chunk in rich_text_array or [])


def _extract(props: dict, field: str, kind: str) -> str:
    node = props.get(field)
    if not node or kind not in node:
        return ""
    return _plain_text(node[kind])


def fetch_vocabulary(notion: Client, database_id: str) -> list[dict]:
    vocab: list[dict] = []
    cursor: str | None = None
    while True:
        response = notion.databases.query(database_id=database_id, start_cursor=cursor)
        for page in response.get("results", []):
            props = page.get("properties", {})
            word = _extract(props, "Word", "title")
            meaning = _extract(props, "Meaning_ja", "rich_text")
            if not (word and meaning):
                continue
            vocab.append({
                "word": word,
                "meaning": meaning,
                "pinyin": _extract(props, "Pinyin", "rich_text"),
                "context_cn": _extract(props, "ContextCn", "rich_text"),
            })
        if not response.get("has_more"):
            break
        cursor = response.get("next_cursor")
    return vocab


def main() -> int:
    load_dotenv()
    token = os.getenv("NOTION_TOKEN")
    dict_id_raw = os.getenv("NOTION_CHINESE_DICT_ID")
    if not token or not dict_id_raw:
        sys.stderr.write(
            "ERROR: NOTION_TOKEN and NOTION_CHINESE_DICT_ID must be set "
            "(copy .env.example to .env and fill in values).\n"
        )
        return 1

    database_id = dict_id_raw.split("?")[0]
    notion = Client(auth=token)

    print(f"Fetching vocabulary from Notion database {database_id} ...")
    vocab = fetch_vocabulary(notion, database_id)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(vocab)} entries to {OUTPUT_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
