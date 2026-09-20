import re

# Editorial baseline for RSRE Academy lessons. These are quality gates, not timers.
CORE_MIN_CHARS = 1200
ACTIVITY_MIN_CHARS = 800
RECOMMENDED_CHARS = 1600

SECTION_HINTS = (
    "example",
    "practice",
    "activity",
    "key point",
    "check your understanding",
    "summary",
)


def lesson_content_quality(lesson):
    body = (lesson.body or "").strip()
    chars = len(body)
    words = len(re.findall(r"\b\w+[\w'-]*\b", body))
    kind = lesson.lesson_type
    minimum = ACTIVITY_MIN_CHARS if kind == "activity" else CORE_MIN_CHARS
    has_media = bool(lesson.video_url or lesson.resource_urls)
    section_hits = sum(1 for hint in SECTION_HINTS if hint in body.lower())

    if chars >= RECOMMENDED_CHARS and (kind != "text" or section_hits >= 2):
        level = "strong"
    elif chars >= minimum and (has_media or section_hits >= 1):
        level = "acceptable"
    else:
        level = "needs-development"

    return {
        "level": level,
        "characters": chars,
        "words": words,
        "minimum_characters": minimum,
        "recommended_characters": RECOMMENDED_CHARS,
        "has_media": has_media,
        "section_hints": section_hits,
    }
