from fastapi import FastAPI
from .database import init_db
from .api import router as api_router
import uvicorn


app = FastAPI(title='Starter FastAPI + SQLite')


app.include_router(api_router)


@app.on_event('startup')
def on_startup():
    init_db()


@app.get('/')
def root():
    return {'status': 'ok', 'message': 'API is running'}


# для локального запуска
if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)