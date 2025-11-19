from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from .database import get_session
from .models import News
from .news_parser import parse_channel_html

router_actualize = APIRouter(prefix="/api")

CHANNEL_MAP = {
    "first": "mypervye69",
    "history": "myhistorytver",
    "tver": "tver_today",
    "sport": "tverorient",
}

@router_actualize.post("/actualize")
async def actualize_news(session: Session = Depends(get_session)):
    added_total = 0

    for type_name, channel in CHANNEL_MAP.items():
        items = await parse_channel_html(channel, limit=50)

        for item in items:
            # проверка на уникальность по ссылке
            exists = session.exec(
                select(News).where(News.link == item["link"])
            ).first()

            if exists:
                continue

            news = News(
                type=type_name,
                text=item["text"],
                link=item["link"],
                date=item["date"]
            )
            session.add(news)
            added_total += 1

        session.commit()

    return {"success": True, "added": added_total}
