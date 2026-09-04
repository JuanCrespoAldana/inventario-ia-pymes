import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-ink-dim">
        Cargando...
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
