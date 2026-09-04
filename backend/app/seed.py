"""
Script de inicializacion -- se corre UNA SOLA VEZ antes del primer registro.

Uso:
    python -m app.seed "Nombre real de la empresa"

Si no se pasa nombre, usa "Mi empresa" como valor por defecto.
"""

import asyncio
import sys

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Empresa


async def sembrar_empresa(nombre: str) -> None:
    async with AsyncSessionLocal() as db:
        existente = await db.scalar(select(Empresa).limit(1))
        if existente:
            print(f"Ya existe una empresa configurada: '{existente.nombre}' (id={existente.id})")
            print("No se creo nada nuevo -- el sistema solo soporta una empresa por ahora.")
            return

        empresa = Empresa(nombre=nombre)
        db.add(empresa)
        await db.commit()
        await db.refresh(empresa)
        print(f"Empresa creada: '{empresa.nombre}' (id={empresa.id})")
        print("Ya puedes registrar el primer usuario -- va a quedar como admin_general.")


if __name__ == "__main__":
    nombre_empresa = sys.argv[1] if len(sys.argv) > 1 else "Mi empresa"
    asyncio.run(sembrar_empresa(nombre_empresa))
