import asyncio
import aioschedule as schedule
from datetime import datetime

from backend.entity.connection import SessionLocal
from backend.repo.user_repo import get_online_users
from backend.repo.website_repo import get_websites, update_website
from backend.service.proxy import parse_get_proxy
from backend.util.common import cron_match
from backend.config.config import crawler_interval
from backend.mapper.mapper import website_to_model

DEFAULT_USER = "unknown"
INTERVAL = crawler_interval()


async def task():
    print("task started at: ", datetime.now())
    db = SessionLocal()
    for user_id in get_online_users():
        websites = [website_to_model(item) for item in get_websites(db, user_id=user_id, scheduled=True)]
        for website in websites:
            cron_expr = website.cron
            if cron_match(cron_expr):
                website.preview = await parse_get_proxy(website.uri, website.xpaths)
                update_website(db, website, ['preview'])
    db.close()
    print("task executed at: ", datetime.now())


async def run_pending_tasks():
    while True:
        await schedule.run_pending()
        await asyncio.sleep(1)


async def execute():
    asyncio.create_task(task())
    schedule.every(INTERVAL).seconds.do(task)
    await run_pending_tasks()
