import sys 
from pathlib import Path
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
import httpx
from aiogram.filters import Command
from aiogram import Bot, Dispatcher, types
from sqlmodel import Session, select
import os
from dotenv import load_dotenv
from sqlmodel import create_engine
import asyncio
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

load_dotenv()

TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///../backend/app.db')

if TELEGRAM_TOKEN is None:
    raise RuntimeError('Please set TELEGRAM_TOKEN in environment')

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

from backend.app.models import Item, SupportRequest, User  # Добавим User модель

bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher()

# Список администраторов (добавьте сюда нужные ID)
ADMIN_IDS = [1103808453, 5048486748]  # Основной админ + новый админ

def is_admin(user_id: int) -> bool:
    """Проверяет является ли пользователь администратором"""
    return user_id in ADMIN_IDS

@dp.message(Command("update"))
async def update_cmd(message: types.Message):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ У тебя нет прав.")
    
    await message.answer("🔄 Обновляю данные, пожалуйста подожди...")
    async with httpx.AsyncClient() as client:
        # Исправляем URL - добавляем .ru и правильный путь
        resp = await client.post("https://rogachevegor.ru/api/actualize")
        if resp.status_code == 200:
            data = resp.json()
            await message.answer(f"✅ Готово!\nДобавлено новых новостей: {data['added']}")
        else:
            await message.answer(f"❌ Ошибка при обновлении данных! Статус: {resp.status_code}")

@dp.message(Command("help"))
async def help_cmd(message: types.Message):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ У тебя нет прав.")
    
    with Session(engine) as session:
        statement = select(SupportRequest).order_by(SupportRequest.created_at.desc())
        requests = session.exec(statement).all()
        
        if not requests:
            await message.answer("📭 Нет обращений в поддержку")
            return
        
        for req in requests[:10]:  # Показываем последние 10
            text = f"""
📨 Обращение в поддержку
👤 Пользователь: {req.user_name or 'Не указано'}
📧 Email: {req.user_email or 'Не указан'}
💬 Текст: {req.message}
📅 Дата: {req.created_at.strftime('%d.%m.%Y %H:%M')}
🔗 ID: {req.id}
            """
            await message.answer(text)


@dp.message(Command(commands=['start']))
async def cmd_start(message: types.Message):
    welcome_text = "Добро пожаловать в ArtVer! 🎭"
    
    if is_admin(message.from_user.id):
        welcome_text += "\n\n👑 Вы администратор. Доступны специальные команды."
    
    await message.answer(welcome_text)

@dp.message(Command(commands=['items']))
async def cmd_items(message: types.Message):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ У тебя нет прав.")
        
    with Session(engine) as session:
        statement = select(Item)
        items = session.exec(statement).all()
        if not items:
            await message.answer('📭 No items yet')
            return
        lines = [f"{it.id}: {it.title} - {it.description or ''}" for it in items]
        await message.answer("\n".join(lines))

async def main():
    print("🤖 Bot started")
    print(f"👑 Admins: {ADMIN_IDS}")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())