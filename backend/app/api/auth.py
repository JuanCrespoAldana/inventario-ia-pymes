from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obtener_usuario_actual
from app.core.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UsuarioCreate,
    UsuarioLogin,
    UsuarioOut,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def registrar(datos: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    try:
        usuario = await auth_service.registrar_usuario(db, datos)
    except auth_service.EmailYaRegistradoError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese correo ya esta registrado")
    except auth_service.EmpresaNoConfiguradaError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El sistema todavia no esta configurado. Ejecuta 'python -m app.seed \"Nombre de tu empresa\"' antes de registrar usuarios.",
        )

    token = auth_service.generar_token_acceso(usuario)
    return Token(access_token=token, usuario=UsuarioOut.model_validate(usuario))


@router.post("/login", response_model=Token)
async def iniciar_sesion(datos: UsuarioLogin, db: AsyncSession = Depends(get_db)):
    try:
        usuario = await auth_service.autenticar_usuario(db, datos.email, datos.password)
    except auth_service.CredencialesInvalidasError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Correo o contraseña incorrectos")

    token = auth_service.generar_token_acceso(usuario)
    return Token(access_token=token, usuario=UsuarioOut.model_validate(usuario))


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def olvide_password(datos: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.solicitar_recuperacion(db, datos.email)
    return {"mensaje": "Si el correo existe, vas a recibir un enlace para restablecer tu contraseña"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def restablecer(datos: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        await auth_service.restablecer_password(db, datos.token, datos.nueva_password)
    except auth_service.TokenInvalidoError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El enlace no es valido o ya vencio")
    return {"mensaje": "Contraseña actualizada correctamente"}


@router.get("/me", response_model=UsuarioOut)
async def usuario_actual(usuario: Usuario = Depends(obtener_usuario_actual)):
    return usuario
