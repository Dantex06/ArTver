from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None

class News(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str  # first | history | tver | sport
    text: str
    link: str
    date: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Уникальный ключ чтобы не записывать одинаковые новости
    __table_args__ = (
        # уникальность внутри одного канала
        {"sqlite_autoincrement": True},
    )