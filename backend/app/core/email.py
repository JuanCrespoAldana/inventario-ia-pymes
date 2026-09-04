import resend

from app.core.config import settings

resend.api_key = settings.resend_api_key


async def enviar_email_recuperacion(destinatario: str, nombre: str, enlace: str) -> None:
    html = f"""
    <div style="font-family: sans-serif; background:#0f0f0f; color:#f5f5f5; padding:32px;">
      <h2 style="color:#ffffff;">Recupera tu contraseña</h2>
      <p>Hola {nombre},</p>
      <p>Haz clic en el boton para crear una nueva contraseña. El enlace vence en
         {settings.reset_token_expire_minutes} minutos.</p>
      <a href="{enlace}" style="display:inline-block; margin-top:16px; padding:12px 24px;
         background:#6d28d9; color:#fff; text-decoration:none; border-radius:8px;">
         Restablecer contraseña</a>
      <p style="margin-top:24px; color:#999; font-size:12px;">Si no lo solicitaste, ignora este correo.</p>
    </div>
    """

    params: resend.Emails.SendParams = {
        "from": settings.email_from,
        "to": [destinatario],
        "subject": "Recupera tu contraseña",
        "html": html,
    }
    # El SDK de Resend soporta async de forma nativa (usa httpx por dentro),
    # asi que no bloquea el event loop de FastAPI -- no hace falta asyncio.to_thread aqui.
    await resend.Emails.send_async(params)
