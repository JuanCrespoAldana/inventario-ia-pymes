import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/Button"
import { AlertBanner } from "@/components/AlertBanner"
import { olvidePassword } from "@/api/auth"
import { extraerMensajeError } from "@/api/errors"

const esquema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
})
type FormValues = z.infer<typeof esquema>

export function ForgotPasswordPage() {
  const [enviado, setEnviado] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState("")
  const [enviando, setEnviando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(esquema) })

  async function onSubmit(datos: FormValues) {
    setErrorGeneral("")
    setEnviando(true)
    try {
      await olvidePassword(datos.email)
      setEnviado(true)
    } catch (error) {
      setErrorGeneral(extraerMensajeError(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout title="Recupera tu contraseña" subtitle="Te enviamos un enlace a tu correo">
      {errorGeneral && <AlertBanner type="error" message={errorGeneral} />}

      {enviado ? (
        <AlertBanner
          type="success"
          message="Si el correo existe, vas a recibir un enlace para restablecer tu contraseña."
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="Correo electrónico"
            type="email"
            placeholder="correo@empresa.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" loading={enviando}>
            Enviar enlace
          </Button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-dim hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
