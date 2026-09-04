from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth

app = FastAPI(title="Inventario IA PyMEs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
