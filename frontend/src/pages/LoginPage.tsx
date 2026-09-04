import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AuthLayout } from "@/components/AuthLayout"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/Button"
import { AlertBanner } from "@/components/AlertBanner"
import { iniciarSesion as iniciarSesionApi } from "@/api/auth"
import { extraerMensajeError } from "@/api/errors"
import { useAuth } from "@/context/AuthContext"

const esquema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
})

type FormValues = z.infer<typeof esquema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { iniciarSesion } = useAuth()
  const [errorGeneral, setErrorGeneral] = useState("")
  const [enviando, setEnviando] = useState(false)

  const mensajeExito = (location.state as { passwordRestablecida?: boolean } | null)?.passwordRestablecida
    ? "Tu contraseña se actualizó. Ya puedes iniciar sesión."
    : null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(esquema) })

  async function onSubmit(datos: FormValues) {
    setErrorGeneral("")
    setEnviando(true)
    try {
      const respuesta = await iniciarSesionApi(datos)
      iniciarSesion(respuesta.access_token, respuesta.usuario)
      navigate("/dashboard")
    } catch (error) {
      setErrorGeneral(extraerMensajeError(error, "Correo o contraseña incorrectos"))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout title="Inicia sesión" subtitle="Entra a tu panel de inventario">
      {mensajeExito && <AlertBanner type="success" message={mensajeExito} />}
      {errorGeneral && <AlertBanner type="error" message={errorGeneral} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Correo electrónico"
          type="email"
          placeholder="Ingresa tu correo"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Contraseña"
          isPassword
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="mb-5 flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-accent-light hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" loading={enviando}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-dim">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="font-semibold text-accent-light hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  )
}
