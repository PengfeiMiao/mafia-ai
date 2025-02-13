from datetime import datetime, timezone

DEFAULT_FORMAT = "%Y-%m-%d %H:%M:%S"


def now_utc():
    return datetime.now(timezone.utc)


def now_str():
    return now_utc().strftime(DEFAULT_FORMAT)
