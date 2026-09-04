import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.email import enviar_email_recuperacion
from app.core.security import create_access_token, hash_password, verify_password
from app.models.empresa import Empresa
from app.models.password_reset_token import PasswordResetToken
from app.models.usuario import RolUsuario, Usuario
from app.schemas.usuario import UsuarioCreate


class EmailYaRegistradoError(Exception):
    pass


class EmpresaNoConfiguradaError(Exception):
    pass


class CredencialesInvalidasError(Exception):
    pass


class TokenInvalidoError(Exception):
    pass


async def registrar_usuario(db: AsyncSession, datos: UsuarioCreate) -> Usuario:
    existente = await db.scalar(select(Usuario).where(Usuario.email == datos.email))
    if existente:
        raise EmailYaRegistradoError()

    # La empresa se crea una sola vez con app/seed.py (nombre real, de forma explicita),
    # no aqui. Si no existe todavia, el sistema no esta listo para recibir registros.
    empresa = await db.scalar(select(Empresa).limit(1))
    if empresa is None:
        raise EmpresaNoConfiguradaError()

    hay_usuarios = await db.scalar(select(Usuario.id).limit(1))
    rol = RolUsuario.ADMIN_GENERAL if hay_usuarios is None else RolUsuario.USUARIO_SEDE

    usuario = Usuario(
        empresa_id=empresa.id,
        sede_id=datos.sede_id,
        nombre=datos.nombre,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol=rol,
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario


async def autenticar_usuario(db: AsyncSession, email: str, password: str) -> Usuario:
    usuario = await db.scalar(select(Usuario).where(Usuario.email == email))
    if not usuario or not usuario.activo or not verify_password(password, usuario.password_hash):
        raise CredencialesInvalidasError()
    return usuario


def generar_token_acceso(usuario: Usuario) -> str:
    return create_access_token({"sub": str(usuario.id), "rol": usuario.rol.value})


async def solicitar_recuperacion(db: AsyncSession, email: str) -> None:
    usuario = await db.scalar(select(Usuario).where(Usuario.email == email))
    if not usuario:
        # No revelamos si el correo existe o no -> evita enumeracion de usuarios
        return

    token_raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.reset_token_expire_minutes)

    db.add(PasswordResetToken(usuario_id=usuario.id, token_hash=token_hash, expires_at=expira))
    await db.commit()

    enlace = f"{settings.frontend_url}/reset-password?token={token_raw}"
    await enviar_email_recuperacion(usuario.email, usuario.nombre, enlace)


async def restablecer_password(db: AsyncSession, token_raw: str, nueva_password: str) -> None:
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    registro = await db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )

    ahora = datetime.now(timezone.utc)
    expira = registro.expires_at if registro else None
    if expira is not None and expira.tzinfo is None:
        # Algunos drivers (ej. sqlite) devuelven datetimes sin tz; se asume UTC
        expira = expira.replace(tzinfo=timezone.utc)

    if not registro or registro.used or expira < ahora:
        raise TokenInvalidoError()

    usuario = await db.get(Usuario, registro.usuario_id)
    usuario.password_hash = hash_password(nueva_password)
    registro.used = True
    await db.commit()
