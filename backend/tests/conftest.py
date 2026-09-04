"""
Fixtures compartidos para todas las pruebas.

Cada prueba corre contra una base de datos SQLite temporal y aislada (no
contra Neon) -- se crea desde cero antes de cada prueba y se borra despues,
asi ninguna prueba depende del resultado de otra.
"""

import os
import tempfile

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.limiter import limiter
from app.main import app
from app.models import Empresa


@pytest_asyncio.fixture(autouse=True)
async def limiter_limpio():
    # El limiter de slowapi guarda su estado en memoria y vive mientras dure
    # el proceso de pytest -- sin este reset, una prueba que haga varias
    # peticiones al mismo endpoint dispararia el limite de la SIGUIENTE prueba.
    limiter.reset()
    yield
    limiter.reset()


@pytest_asyncio.fixture
async def db_session():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    engine = create_async_engine(f"sqlite+aiosqlite:///{path}")
    TestSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    await engine.dispose()
    os.remove(path)


@pytest_asyncio.fixture
async def client(db_session):
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def empresa_configurada(db_session):
    empresa = Empresa(nombre="Empresa de prueba")
    db_session.add(empresa)
    await db_session.commit()
    await db_session.refresh(empresa)
    return empresa
