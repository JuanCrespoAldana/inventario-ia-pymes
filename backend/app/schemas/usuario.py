from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.usuario import RolUsuario
from app.schemas.validators import validar_password_segura


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    sede_id: int | None = None

    _validar_password = field_validator("password")(validar_password_segura)


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: RolUsuario
    sede_id: int | None
    activo: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str = Field(min_length=8, max_length=72)

    _validar_password = field_validator("nueva_password")(validar_password_segura)
