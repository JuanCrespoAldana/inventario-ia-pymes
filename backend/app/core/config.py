from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    reset_token_expire_minutes: int = 30

    # Email (recuperacion de contraseña) - Gmail SMTP
    # Funciona para CUALQUIER destinatario sin necesitar dominio propio verificado.
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    email_from: str

    # URL del frontend: se usa como origen permitido en CORS
    frontend_url: str = "http://localhost:5173"


settings = Settings()
