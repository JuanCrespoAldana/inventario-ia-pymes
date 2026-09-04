import re


def validar_password_segura(v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe tener al menos una letra mayúscula")
    if not re.search(r"[a-z]", v):
        raise ValueError("La contraseña debe tener al menos una letra minúscula")
    if not re.search(r"\d", v):
        raise ValueError("La contraseña debe tener al menos un número")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-]", v):
        raise ValueError("La contraseña debe tener al menos un carácter especial")
    return v
