import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.email import enviar_codigo_recuperacion
from app.core.security import create_access_token, hash_password, verify_password
from app.models.empresa import Empresa
from app.models.password_reset_token import PasswordResetToken
from app.models.usuario import RolUsuario, Usuario
from app.schemas.usuario import UsuarioCreate

logger = logging.getLogger(__name__)

MAX_INTENTOS_CODIGO = 5


class EmailYaRegistradoError(Exception):
    pass


class EmpresaNoConfiguradaError(Exception):
    pass


class CredencialesInvalidasError(Exception):
    pass


class CodigoInvalidoError(Exception):
    def __init__(self, intentos_restantes: int = 0):
        self.intentos_restantes = intentos_restantes
        super().__init__()


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


def _asegurar_tz(momento: datetime) -> datetime:
    # Algunos drivers (ej. sqlite) devuelven datetimes sin tz; se asume UTC
    if momento.tzinfo is None:
        return momento.replace(tzinfo=timezone.utc)
    return momento


async def solicitar_recuperacion(db: AsyncSession, email: str) -> None:
    usuario = await db.scalar(select(Usuario).where(Usuario.email == email))
    if not usuario:
        # No revelamos si el correo existe o no -> evita enumeracion de usuarios
        return

    codigo = f"{secrets.randbelow(1_000_000):06d}"
    codigo_hash = hashlib.sha256(codigo.encode()).hexdigest()
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.reset_token_expire_minutes)

    db.add(PasswordResetToken(usuario_id=usuario.id, codigo_hash=codigo_hash, expires_at=expira))
    await db.commit()

    try:
        await enviar_codigo_recuperacion(usuario.email, usuario.nombre, codigo)
    except Exception:
        # Si el envio falla (proveedor caido, restriccion de remitente, etc.)
        # no debe tumbar la peticion ni revelar nada distinto al caso normal.
        # El codigo ya quedo guardado -- queda en el log del servidor para
        # que un administrador pueda revisarlo.
        logger.exception("No se pudo enviar el codigo de recuperacion a %s", usuario.email)


async def verificar_codigo(db: AsyncSession, email: str, codigo: str) -> str:
    """Valida el PIN de 6 digitos. Si es correcto, devuelve un token de sesion
    de un solo uso para el paso de crear la nueva contraseña."""
    usuario = await db.scalar(select(Usuario).where(Usuario.email == email))
    if not usuario:
        raise CodigoInvalidoError()

    registro = await db.scalar(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.usuario_id == usuario.id,
            PasswordResetToken.used.is_(False),
            PasswordResetToken.verificado.is_(False),
        )
        .order_by(PasswordResetToken.created_at.desc())
    )

    ahora = datetime.now(timezone.utc)
    if not registro or registro.intentos >= MAX_INTENTOS_CODIGO or _asegurar_tz(registro.expires_at) < ahora:
        raise CodigoInvalidoError()

    codigo_hash = hashlib.sha256(codigo.encode()).hexdigest()
    if not secrets.compare_digest(codigo_hash, registro.codigo_hash):
        registro.intentos += 1
        await db.commit()
        raise CodigoInvalidoError(intentos_restantes=MAX_INTENTOS_CODIGO - registro.intentos)

    session_token_raw = secrets.token_urlsafe(32)
    registro.session_token_hash = hashlib.sha256(session_token_raw.encode()).hexdigest()
    registro.verificado = True
    await db.commit()
    return session_token_raw


async def restablecer_password(db: AsyncSession, session_token: str, nueva_password: str) -> None:
    session_hash = hashlib.sha256(session_token.encode()).hexdigest()
    registro = await db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.session_token_hash == session_hash)
    )

    ahora = datetime.now(timezone.utc)
    if (
        not registro
        or not registro.verificado
        or registro.used
        or _asegurar_tz(registro.expires_at) < ahora
    ):
        raise TokenInvalidoError()

    usuario = await db.get(Usuario, registro.usuario_id)
    usuario.password_hash = hash_password(nueva_password)
    registro.used = True
    await db.commit()
