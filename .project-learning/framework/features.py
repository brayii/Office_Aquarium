from __future__ import annotations

from common import tokenize


def bag_of_words(text: str) -> dict[str, int]:
    features: dict[str, int] = {}
    for token in tokenize(text):
        features[token] = features.get(token, 0) + 1
    return features


def task_features(task: dict) -> dict:
    return {
        "tokens": bag_of_words(task.get("request_text", "")),
        "task_type": task.get("task_type", "unknown"),
        "file_count": len(task.get("files", [])),
    }
