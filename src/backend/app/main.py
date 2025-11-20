from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .api import router as api_router
from .api_news import router_news
from .api_actualize import router_actualize
from .api_user import router_user
import uvicorn

app = FastAPI(title='Starter FastAPI + SQLite')

# Настройка CORS - ДОБАВЬТЕ ЭТОТ БЛОК
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router)
app.include_router(router_news)
app.include_router(router_actualize)
app.include_router(router_user)

@app.on_event('startup')
def on_startup():
    init_db()

@app.get('/')
def root():
    return {'status': 'ok', 'message': 'API is running'}

# для локального запуска
if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)