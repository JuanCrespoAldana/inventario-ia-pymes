import { api } from "./client"
import type { TokenResponse } from "@/types/auth"

export async function registrar(datos: { nombre: string; email: string; password: string }) {
  const { data } = await api.post<TokenResponse>("/api/auth/register", datos)
  return data
}

export async function iniciarSesion(datos: { email: string; password: string }) {
  const { data } = await api.post<TokenResponse>("/api/auth/login", datos)
  return data
}

export async function olvidePassword(email: string) {
  const { data } = await api.post<{ mensaje: string }>("/api/auth/forgot-password", { email })
  return data
}

export async function verificarCodigo(email: string, codigo: string) {
  const { data } = await api.post<{ session_token: string }>("/api/auth/verify-reset-code", {
    email,
    codigo,
  })
  return data
}

export async function restablecerPassword(session_token: string, nueva_password: string) {
  const { data } = await api.post<{ mensaje: string }>("/api/auth/reset-password", {
    session_token,
    nueva_password,
  })
  return data
}
