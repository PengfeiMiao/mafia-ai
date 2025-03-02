from datetime import datetime
import sched
import time

from backend.entity.connection import SessionLocal
from backend.repo.website_repo import get_websites, update_website
from backend.service.proxy import parse_get_proxy
from backend.util.common import cron_match

DEFAULT_USER = "unknown"
INTERVAL = 3600


async def task():
    db = SessionLocal()
    websites = get_websites(db, user_id=DEFAULT_USER, scheduled=True)
    for website in websites:
        cron_expr = website.cron
        if cron_match(cron_expr):
            website.preview = await parse_get_proxy(website.url, website.xpaths)
            update_website(db, website, ['preview'])

    db.close()
    print("task executed at: ", datetime.now())


def schedule():
    scheduler = sched.scheduler(time.time, time.sleep)

    async def check_and_run():
        await task()
        scheduler.enter(INTERVAL, 1, check_and_run)

    scheduler.enter(0, 1, check_and_run)
    scheduler.run()
