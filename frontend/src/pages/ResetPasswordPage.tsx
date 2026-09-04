import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AuthLayout } from "@/components/AuthLayout"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/Button"
import { AlertBanner } from "@/components/AlertBanner"
import { PasswordStrength } from "@/components/PasswordStrength"
import { restablecerPassword } from "@/api/auth"
import { extraerMensajeError } from "@/api/errors"

const esquema = z
  .object({
    password: z
      .string()
      .min(8, "Debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe tener una mayúscula")
      .regex(/[a-z]/, "Debe tener una minúscula")
      .regex(/\d/, "Debe tener un número")
      .regex(/[!@#$%^&*(),.?":{}|<>_-]/, "Debe tener un carácter especial"),
    confirmPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
type FormValues = z.infer<typeof esquema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const navigate = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState("")
  const [enviando, setEnviando] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(esquema) })
  const passwordActual = watch("password") ?? ""

  async function onSubmit(datos: FormValues) {
    setErrorGeneral("")
    setEnviando(true)
    try {
      await restablecerPassword(token, datos.password)
      navigate("/login", { state: { passwordRestablecida: true } })
    } catch (error) {
      setErrorGeneral(extraerMensajeError(error, "El enlace no es válido o ya venció"))
    } finally {
      setEnviando(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Enlace inválido" subtitle="Falta el token de recuperación">
        <AlertBanner type="error" message="Este enlace no es válido. Solicita uno nuevo." />
        <Link
          to="/forgot-password"
          className="mt-6 block text-center text-sm font-semibold text-accent-light hover:underline"
        >
          Solicitar enlace nuevo
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crea una nueva contraseña" subtitle="Tu enlace es válido por 30 minutos">
      {errorGeneral && <AlertBanner type="error" message={errorGeneral} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Nueva contraseña"
          isPassword
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength value={passwordActual} />
        <FormField
          label="Confirmar contraseña"
          isPassword
          placeholder="********"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={enviando} className="mt-2">
          Restablecer contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
