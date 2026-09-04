from sqlalchemy import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# asyncpg no entiende el parametro "sslmode" que si acepta psycopg/libpq en la URL
# (por eso tira: "connect() got an unexpected keyword argument 'sslmode'").
# La forma correcta de forzar SSL con asyncpg es via connect_args, no en la URL.
_url = make_url(settings.database_url)
_connect_args = {"ssl": "require"} if _url.drivername == "postgresql+asyncpg" else {}

engine = create_async_engine(settings.database_url, echo=False, connect_args=_connect_args)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
