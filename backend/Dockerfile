FROM python:3.13-slim

WORKDIR /app

# Dependencias del sistema necesarias para compilar paquetes con partes en C
# (ej. argon2-cffi) si no hay una rueda (wheel) precompilada para esta imagen
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
