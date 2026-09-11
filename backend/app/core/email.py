import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def _enviar_smtp(destinatario: str, nombre: str, codigo: str) -> None:
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Tu código para restablecer la contraseña"
    mensaje["From"] = settings.email_from
    mensaje["To"] = destinatario

    texto = (
        f"Hola {nombre},\n\n"
        f"Tu código para restablecer la contraseña es: {codigo}\n\n"
        f"Válido por {settings.reset_token_expire_minutes} minutos. "
        f"Si no lo solicitaste, ignora este correo."
    )
    html = f"""
    <div style="font-family: sans-serif; background:#0A0A0F; color:#F5F6FA; padding:32px; text-align:center;">
      <h2 style="color:#ffffff; margin-bottom: 8px;">Tu código de verificación</h2>
      <p style="color:#9497A6;">Hola {nombre}, usa este código en la aplicación para continuar.</p>
      <div style="margin:28px 0; font-size:36px; font-weight:700; letter-spacing:10px;
                  color:#8AA3FF; font-family: monospace;">
        {codigo}
      </div>
      <p style="color:#9497A6; font-size:13px;">
        Válido por {settings.reset_token_expire_minutes} minutos. Si no lo solicitaste, ignora este correo.
      </p>
    </div>
    """

    mensaje.attach(MIMEText(texto, "plain"))
    mensaje.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as servidor:
        servidor.starttls()
        servidor.login(settings.smtp_user, settings.smtp_password)
        servidor.send_message(mensaje)


async def enviar_codigo_recuperacion(destinatario: str, nombre: str, codigo: str) -> None:
    # smtplib es bloqueante -> lo corremos en un hilo aparte para no congelar el event loop de FastAPI
    await asyncio.to_thread(_enviar_smtp, destinatario, nombre, codigo)
