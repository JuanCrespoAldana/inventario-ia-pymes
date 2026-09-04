export type RolUsuario = "admin_general" | "usuario_sede"

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: RolUsuario
  sede_id: number | null
  activo: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
  usuario: Usuario
}
