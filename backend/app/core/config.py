from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    reset_token_expire_minutes: int = 30

    # Email (recuperacion de contraseña) - Resend
    resend_api_key: str
    email_from: str

    # URL del frontend, para armar el link que se envia en el correo
    frontend_url: str = "http://localhost:5173"


settings = Settings()
