import { isAxiosError } from "axios"

export function extraerMensajeError(
  error: unknown,
  mensajePorDefecto = "Ocurrio un error, intenta de nuevo"
): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const primero = detail[0]
      if (typeof primero?.msg === "string") return primero.msg
    }
  }
  return mensajePorDefecto
}
