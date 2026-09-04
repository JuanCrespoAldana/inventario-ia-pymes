from sqlalchemy import ForeignKey, Index, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class InventarioSede(Base):
    __tablename__ = "inventario_sede"
    __table_args__ = (
        UniqueConstraint("sede_id", "producto_id", name="uq_sede_producto"),
        Index("ix_inventario_sede_producto", "sede_id", "producto_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sede_id: Mapped[int] = mapped_column(ForeignKey("sedes.id"), nullable=False)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    stock_minimo: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    sede = relationship("Sede", back_populates="inventario")
    producto = relationship("Producto", back_populates="inventario")
