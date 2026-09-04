from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Sede(Base):
    __tablename__ = "sedes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresas.id"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    ciudad: Mapped[str | None] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    empresa = relationship("Empresa", back_populates="sedes")
    usuarios = relationship("Usuario", back_populates="sede")
    inventario = relationship("InventarioSede", back_populates="sede", cascade="all, delete-orphan")
