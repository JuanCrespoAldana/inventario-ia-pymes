"""
Manejadores de excepciones centralizados.

En vez de que cada endpoint atrape sus propias excepciones de negocio con
try/except, los servicios simplemente lanzan la excepcion y aqui se traduce
UNA sola vez a la respuesta HTTP correcta. Cuando se agreguen mas endpoints
(inventario, sedes, productos) no hay que repetir este patron en cada uno.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.services.auth_service import (
    CodigoInvalidoError,
    CredencialesInvalidasError,
    EmailYaRegistradoError,
    EmpresaNoConfiguradaError,
    TokenInvalidoError,
)


def registrar_manejadores_excepciones(app: FastAPI) -> None:
    @app.exception_handler(EmailYaRegistradoError)
    async def _email_duplicado(request: Request, exc: EmailYaRegistradoError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "Ese correo ya está registrado"},
        )

    @app.exception_handler(EmpresaNoConfiguradaError)
    async def _empresa_no_configurada(request: Request, exc: EmpresaNoConfiguradaError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "detail": (
                    "El sistema todavía no está configurado. Ejecuta "
                    '\'python -m app.seed "Nombre de tu empresa"\' antes de registrar usuarios.'
                )
            },
        )

    @app.exception_handler(CredencialesInvalidasError)
    async def _credenciales_invalidas(request: Request, exc: CredencialesInvalidasError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Correo o contraseña incorrectos"},
        )

    @app.exception_handler(CodigoInvalidoError)
    async def _codigo_invalido(request: Request, exc: CodigoInvalidoError) -> JSONResponse:
        if exc.intentos_restantes > 0:
            detalle = f"Código incorrecto. Te quedan {exc.intentos_restantes} intentos."
        else:
            detalle = "El código no es válido o ya venció. Solicita uno nuevo."
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": detalle})

    @app.exception_handler(TokenInvalidoError)
    async def _token_invalido(request: Request, exc: TokenInvalidoError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "La sesión de recuperación venció. Solicita un código nuevo."},
        )
