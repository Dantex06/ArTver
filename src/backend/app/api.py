from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel import Session
from .models import Item
from .database import get_session
from .schemas import ItemCreate, ItemRead


router = APIRouter(prefix='/api')


@router.get('/items', response_model=list[ItemRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(Item)
    items = session.exec(statement).all()
    return items


@router.post('/items', response_model=ItemRead)
def create_item(item: ItemCreate, session: Session = Depends(get_session)):
    db_item = Item.from_orm(item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


@router.get('/items/{item_id}', response_model=ItemRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    return item


@router.delete('/items/{item_id}', status_code=204)
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    session.delete(item)
    session.commit()
    return None