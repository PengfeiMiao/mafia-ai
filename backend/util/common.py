from datetime import datetime, timezone

DEFAULT_FORMAT = "%Y-%m-%d %H:%M:%S"


def now_utc():
    return datetime.now(timezone.utc)


def now_str():
    return now_utc().strftime(DEFAULT_FORMAT)


def remove_blank_lines(text):
    non_empty_lines = [line for line in text.splitlines() if line.strip()]
    return '\n'.join(non_empty_lines)
