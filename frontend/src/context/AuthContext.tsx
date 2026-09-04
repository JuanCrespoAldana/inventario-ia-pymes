import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Usuario } from "@/types/auth"

interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  iniciarSesion: (token: string, usuario: Usuario) => void
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const usuarioGuardado = localStorage.getItem("usuario")
    if (token && usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado))
      } catch {
        localStorage.removeItem("access_token")
        localStorage.removeItem("usuario")
      }
    }
    setCargando(false)
  }, [])

  function iniciarSesion(token: string, usuarioNuevo: Usuario) {
    localStorage.setItem("access_token", token)
    localStorage.setItem("usuario", JSON.stringify(usuarioNuevo))
    setUsuario(usuarioNuevo)
  }

  function cerrarSesion() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("usuario")
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
