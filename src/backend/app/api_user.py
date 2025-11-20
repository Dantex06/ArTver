from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from .models import User, SupportRequest
from .database import get_session
from pydantic import BaseModel
from typing import List, Optional
import json

router_user = APIRouter(prefix="/api/user")

class UserPayload(BaseModel):
    tg_id: int
    categories: List[str]
    full_name: Optional[str] = None
    email: Optional[str] = None

class UserUpdatePayload(BaseModel):
    categories: Optional[List[str]] = None
    full_name: Optional[str] = None
    email: Optional[str] = None

class SupportRequestPayload(BaseModel):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    message: str

@router_user.get("/info")
def get_user_info(tg_id: int, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.tg_id == tg_id)).first()
    if user:
        return {
            "exists": True, 
            "user": {
                "tg_id": user.tg_id,
                "categories": user.get_categories_list(),
                "full_name": user.full_name,
                "email": user.email,
                "created_at": user.created_at
            }
        }
    return {"exists": False}

@router_user.post("/save")
def save_user(data: UserPayload, session: Session = Depends(get_session)):
    stmt = select(User).where(User.tg_id == data.tg_id)
    user = session.exec(stmt).first()

    if user:
        # Обновляем существующего пользователя
        user.set_categories_list(data.categories)
        user.full_name = data.full_name
        user.email = data.email
        session.add(user)
    else:
        # Создаём нового пользователя
        user = User(
            tg_id=data.tg_id,
            categories=json.dumps(data.categories),
            full_name=data.full_name,
            email=data.email
        )
        session.add(user)

    session.commit()
    session.refresh(user)
    
    return {
        "success": True, 
        "categories_count": len(data.categories),
        "categories": user.get_categories_list(),
        "full_name": user.full_name,
        "email": user.email
    }

@router_user.post("/support")
def create_support_request(data: SupportRequestPayload, session: Session = Depends(get_session)):
    """Создание обращения в поддержку"""
    support_request = SupportRequest(
        user_name=data.user_name,
        user_email=data.user_email,
        message=data.message
    )
    session.add(support_request)
    session.commit()
    session.refresh(support_request)
    
    return {
        "success": True,
        "request_id": support_request.id,
        "message": "Обращение отправлено в поддержку"
    }

@router_user.put("/update")
def update_user(tg_id: int, data: UserUpdatePayload, session: Session = Depends(get_session)):
    """Обновление пользователя - можно менять категории, ФИО и почту"""
    user = session.exec(select(User).where(User.tg_id == tg_id)).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    # Обновляем только те поля, которые переданы
    if data.categories is not None:
        user.set_categories_list(data.categories)
    
    if data.full_name is not None:
        user.full_name = data.full_name
        
    if data.email is not None:
        user.email = data.email
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return {
        "success": True,
        "updated_fields": {
            "categories_updated": data.categories is not None,
            "full_name_updated": data.full_name is not None,
            "email_updated": data.email is not None
        },
        "user": {
            "categories": user.get_categories_list(),
            "full_name": user.full_name,
            "email": user.email
        }
    }