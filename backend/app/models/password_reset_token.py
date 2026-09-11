from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)

    # PIN de 6 digitos que se envia por correo (nunca se guarda en texto plano)
    codigo_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    intentos: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Una vez que el PIN se valida correctamente, se emite un token de sesion
    # de un solo uso para el paso de "crear nueva contraseña" -- asi el PIN
    # (solo 1 millon de combinaciones posibles) nunca viaja mas de una vez
    # y no se puede reutilizar.
    verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    session_token_hash: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("Usuario")
