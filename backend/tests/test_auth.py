"""
Pruebas de los endpoints de autenticacion (/api/auth/...).

Cubren exactamente los flujos que se probaron a mano durante el desarrollo:
registro (con las reglas de negocio), login, y el ciclo completo de
"olvide mi contraseña" -> restablecer -> volver a iniciar sesion.
"""

from unittest.mock import AsyncMock, patch

USUARIO_VALIDO = {
    "nombre": "Ana Torres",
    "email": "ana@empresa.com",
    "password": "ClaveSegura123!",
}


class TestRegistro:
    async def test_falla_si_la_empresa_no_esta_configurada(self, client):
        respuesta = await client.post("/api/auth/register", json=USUARIO_VALIDO)
        assert respuesta.status_code == 503

    async def test_el_primer_usuario_queda_como_admin_general(self, client, empresa_configurada):
        respuesta = await client.post("/api/auth/register", json=USUARIO_VALIDO)
        assert respuesta.status_code == 201
        cuerpo = respuesta.json()
        assert cuerpo["usuario"]["rol"] == "admin_general"
        assert "access_token" in cuerpo

    async def test_el_segundo_usuario_queda_como_usuario_de_sede(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        segundo = {**USUARIO_VALIDO, "email": "luis@empresa.com"}
        respuesta = await client.post("/api/auth/register", json=segundo)
        assert respuesta.json()["usuario"]["rol"] == "usuario_sede"

    async def test_rechaza_contrasena_debil(self, client, empresa_configurada):
        datos = {**USUARIO_VALIDO, "password": "1234"}
        respuesta = await client.post("/api/auth/register", json=datos)
        assert respuesta.status_code == 422

    async def test_rechaza_correo_duplicado(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        respuesta = await client.post("/api/auth/register", json=USUARIO_VALIDO)
        assert respuesta.status_code == 409


class TestLogin:
    async def test_login_correcto(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        respuesta = await client.post(
            "/api/auth/login",
            json={"email": USUARIO_VALIDO["email"], "password": USUARIO_VALIDO["password"]},
        )
        assert respuesta.status_code == 200
        assert "access_token" in respuesta.json()

    async def test_rechaza_contrasena_incorrecta(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        respuesta = await client.post(
            "/api/auth/login", json={"email": USUARIO_VALIDO["email"], "password": "otraClave"}
        )
        assert respuesta.status_code == 401

    async def test_rechaza_correo_inexistente(self, client, empresa_configurada):
        respuesta = await client.post(
            "/api/auth/login", json={"email": "nadie@empresa.com", "password": "ClaveSegura123!"}
        )
        assert respuesta.status_code == 401

    async def test_bloquea_intentos_excesivos_de_login(self, client, empresa_configurada):
        datos_incorrectos = {"email": USUARIO_VALIDO["email"], "password": "claveIncorrecta"}
        for _ in range(10):
            await client.post("/api/auth/login", json=datos_incorrectos)

        respuesta = await client.post("/api/auth/login", json=datos_incorrectos)
        assert respuesta.status_code == 429


class TestRecuperarContrasena:
    async def test_no_revela_si_el_correo_existe(self, client, empresa_configurada):
        r1 = await client.post("/api/auth/forgot-password", json={"email": "nadie@empresa.com"})
        r2 = await client.post("/api/auth/forgot-password", json={"email": "nadie@empresa.com"})
        assert r1.status_code == 202
        assert r1.json() == r2.json()

    async def test_envia_correo_solo_si_el_usuario_existe(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)

        with patch("app.services.auth_service.enviar_codigo_recuperacion", new_callable=AsyncMock) as mock_enviar:
            await client.post("/api/auth/forgot-password", json={"email": USUARIO_VALIDO["email"]})
            mock_enviar.assert_awaited_once()

        with patch("app.services.auth_service.enviar_codigo_recuperacion", new_callable=AsyncMock) as mock_enviar:
            await client.post("/api/auth/forgot-password", json={"email": "nadie@empresa.com"})
            mock_enviar.assert_not_awaited()

    async def test_no_falla_si_el_proveedor_de_correo_rechaza_el_envio(self, client, empresa_configurada):
        # El envio puede fallar por cualquier razon (proveedor caido, limite excedido, etc.)
        # -- la peticion igual debe responder 202, no un 500.
        await client.post("/api/auth/register", json=USUARIO_VALIDO)

        with patch(
            "app.services.auth_service.enviar_codigo_recuperacion",
            new_callable=AsyncMock,
            side_effect=Exception("SMTP connection refused"),
        ):
            respuesta = await client.post("/api/auth/forgot-password", json={"email": USUARIO_VALIDO["email"]})

        assert respuesta.status_code == 202

    async def _obtener_codigo_enviado(self, client) -> str:
        with patch("app.services.auth_service.enviar_codigo_recuperacion", new_callable=AsyncMock) as mock_enviar:
            await client.post("/api/auth/forgot-password", json={"email": USUARIO_VALIDO["email"]})
            return mock_enviar.call_args.args[2]

    async def test_flujo_completo_de_restablecer_contrasena(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        codigo = await self._obtener_codigo_enviado(client)

        verificacion = await client.post(
            "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": codigo}
        )
        assert verificacion.status_code == 200
        session_token = verificacion.json()["session_token"]

        nueva_password = "NuevaClaveSegura456!"
        respuesta = await client.post(
            "/api/auth/reset-password",
            json={"session_token": session_token, "nueva_password": nueva_password},
        )
        assert respuesta.status_code == 200

        login = await client.post(
            "/api/auth/login", json={"email": USUARIO_VALIDO["email"], "password": nueva_password}
        )
        assert login.status_code == 200

    async def test_rechaza_codigo_incorrecto(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        await self._obtener_codigo_enviado(client)

        respuesta = await client.post(
            "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": "000000"}
        )
        assert respuesta.status_code == 400
        assert "intentos" in respuesta.json()["detail"].lower()

    async def test_bloquea_despues_de_varios_intentos_fallidos(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        await self._obtener_codigo_enviado(client)

        for _ in range(5):
            await client.post(
                "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": "000000"}
            )

        # El sexto intento, aunque ahora sea con un codigo real, ya debe estar bloqueado
        codigo_real = await self._obtener_codigo_enviado(client)
        respuesta = await client.post(
            "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": "000000"}
        )
        assert respuesta.status_code == 400

    async def test_no_se_puede_reutilizar_el_codigo_ya_verificado(self, client, empresa_configurada):
        await client.post("/api/auth/register", json=USUARIO_VALIDO)
        codigo = await self._obtener_codigo_enviado(client)

        primera = await client.post(
            "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": codigo}
        )
        assert primera.status_code == 200

        segunda = await client.post(
            "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": codigo}
        )
        assert segunda.status_code == 400

    async def test_rechaza_session_token_invalido(self, client, empresa_configurada):
        respuesta = await client.post(
            "/api/auth/reset-password",
            json={"session_token": "token-que-no-existe", "nueva_password": "NuevaClaveSegura456!"},
        )
        assert respuesta.status_code == 400

    async def test_rechaza_formato_de_codigo_invalido(self, client, empresa_configurada):
        respuesta = await client.post(
            "/api/auth/verify-reset-code", json={"email": USUARIO_VALIDO["email"], "codigo": "12"}
        )
        assert respuesta.status_code == 422



class TestUsuarioActual:
    async def test_requiere_token(self, client):
        respuesta = await client.get("/api/auth/me")
        assert respuesta.status_code == 401

    async def test_devuelve_el_usuario_con_token_valido(self, client, empresa_configurada):
        registro = await client.post("/api/auth/register", json=USUARIO_VALIDO)
        token = registro.json()["access_token"]

        respuesta = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert respuesta.status_code == 200
        assert respuesta.json()["email"] == USUARIO_VALIDO["email"]
