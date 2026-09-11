from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obtener_usuario_actual
from app.core.database import get_db
from app.core.limiter import limiter
from app.models.usuario import Usuario
from app.schemas.usuario import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UsuarioCreate,
    UsuarioLogin,
    UsuarioOut,
    VerifyResetCodeRequest,
    VerifyResetCodeResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


# Las excepciones de negocio (correo duplicado, credenciales invalidas, etc.)
# ya no se atrapan aqui -- las traduce app/core/exceptions.py de forma centralizada.


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def registrar(request: Request, datos: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    usuario = await auth_service.registrar_usuario(db, datos)
    token = auth_service.generar_token_acceso(usuario)
    return Token(access_token=token, usuario=UsuarioOut.model_validate(usuario))


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def iniciar_sesion(request: Request, datos: UsuarioLogin, db: AsyncSession = Depends(get_db)):
    usuario = await auth_service.autenticar_usuario(db, datos.email, datos.password)
    token = auth_service.generar_token_acceso(usuario)
    return Token(access_token=token, usuario=UsuarioOut.model_validate(usuario))


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("3/minute")
async def olvide_password(request: Request, datos: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.solicitar_recuperacion(db, datos.email)
    return {"mensaje": "Si el correo existe, vas a recibir un código para restablecer tu contraseña"}


@router.post("/verify-reset-code", response_model=VerifyResetCodeResponse)
@limiter.limit("10/minute")
async def verificar_codigo(request: Request, datos: VerifyResetCodeRequest, db: AsyncSession = Depends(get_db)):
    session_token = await auth_service.verificar_codigo(db, datos.email, datos.codigo)
    return VerifyResetCodeResponse(session_token=session_token)


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def restablecer(datos: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.restablecer_password(db, datos.session_token, datos.nueva_password)
    return {"mensaje": "Contraseña actualizada correctamente"}


@router.get("/me", response_model=UsuarioOut)
async def usuario_actual(usuario: Usuario = Depends(obtener_usuario_actual)):
    return usuario
