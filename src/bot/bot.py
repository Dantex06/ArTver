import sys
from pathlib import Path
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from sqlmodel import Session, select
import os
from dotenv import load_dotenv
from sqlmodel import create_engine

load_dotenv()
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///../backend/app.db')

if TELEGRAM_TOKEN is None:
    raise RuntimeError('Please set TELEGRAM_TOKEN in environment')

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

from backend.app.models import Item

bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher()

@dp.message(Command(commands=['start']))
async def cmd_start(message: types.Message):
    kb = ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="Открыть приложение",
                    web_app=WebAppInfo(url="https://yourdomain.com")
                )
            ]
        ],
        resize_keyboard=True
    )

    await message.answer(
        "Добро пожаловать! Жми кнопку ниже:",
        reply_markup=kb
    )

@dp.message(Command(commands=['items']))
async def cmd_items(message: types.Message):
    with Session(engine) as session:
        statement = select(Item)
        items = session.exec(statement).all()
        if not items:
            await message.answer('No items yet')
            return
        lines = [f"{it.id}: {it.title} - {it.description or ''}" for it in items]
        await message.answer("\n".join(lines))

async def main():
    print("Bot started")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
