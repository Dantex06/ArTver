from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
import json

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

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tg_id: int = Field(index=True, unique=True)
    categories: str = Field(default="[]")  # Храним как JSON строку, по умолчанию пустой массив
    full_name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def get_categories_list(self) -> List[str]:
        """Получить категории как список"""
        try:
            return json.loads(self.categories)
        except:
            return []
    
    def set_categories_list(self, categories: List[str]):
        """Установить категории из списка"""
        self.categories = json.dumps(categories)

# models.py - ДОБАВИТЬ ЭТУ МОДЕЛЬ
class SupportRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)