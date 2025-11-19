from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from .database import get_session
from .models import News

router_news = APIRouter(prefix="/api")

@router_news.get("/news")
def get_news(type: str, session: Session = Depends(get_session)):
    stmt = select(News).where(News.type == type).order_by(News.id.desc()).limit(50)
    news = session.exec(stmt).all()

    return {
        "channel": type,
        "count": len(news),
        "items": [
            {
                "id": n.id,
                "text": n.text,
                "link": n.link,
                "date": n.date,
                "created_at": n.created_at
            }
            for n in news
        ]
    }
