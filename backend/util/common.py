import base64
import re
from datetime import datetime, timezone

from croniter import croniter

DEFAULT_FORMAT = "%Y-%m-%d %H:%M:%S"


def now_utc():
    return datetime.now(timezone.utc)


def now_str():
    return now_utc().strftime(DEFAULT_FORMAT)


def remove_blank_lines(text):
    non_empty_lines = [line for line in text.splitlines() if line.strip()]
    return '\n'.join(non_empty_lines)


def cron_match(cron_expr):
    time = datetime.now()
    match = re.search(r'\b\d{4}$', cron_expr)
    if match:
        year = match.group()
        if str(time.year) == year:
            cron_expr = re.sub(r'\b\d{4}$', '*', cron_expr)
        else:
            return False
    cron = croniter(cron_expr, time)
    curr_execution_time = cron.get_next(datetime)
    return curr_execution_time.replace(second=0, microsecond=0) == time.replace(second=0, microsecond=0)


def is_alphanumeric(string):
    pattern = r'^[A-Za-z0-9]+$'
    return bool(re.match(pattern, string))


def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def b64decode(string: str):
    return base64.b64decode(string).decode('utf-8')


def b64encode(string: str):
    return base64.b64encode(string.encode('utf-8'))
