import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AuthLayout } from "@/components/AuthLayout"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/Button"
import { AlertBanner } from "@/components/AlertBanner"
import { PasswordStrength } from "@/components/PasswordStrength"
import { registrar } from "@/api/auth"
import { extraerMensajeError } from "@/api/errors"
import { useAuth } from "@/context/AuthContext"

const esquema = z
  .object({
    nombre: z.string().min(2, "Ingresa tu nombre completo"),
    email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
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

export function RegisterPage() {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()
  const [errorGeneral, setErrorGeneral] = useState("")
  const [enviando, setEnviando] = useState(false)

  const {
    register: registrarCampo,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(esquema), mode: "onChange" })

  const passwordActual = watch("password") ?? ""

  async function onSubmit(datos: FormValues) {
    setErrorGeneral("")
    setEnviando(true)
    try {
      const respuesta = await registrar({ nombre: datos.nombre, email: datos.email, password: datos.password })
      iniciarSesion(respuesta.access_token, respuesta.usuario)
      navigate("/dashboard")
    } catch (error) {
      setErrorGeneral(extraerMensajeError(error, "No pudimos crear tu cuenta"))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="El primer usuario queda como administrador">
      {errorGeneral && <AlertBanner type="error" message={errorGeneral} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Nombre completo"
          placeholder="Nombre y apellido"
          error={errors.nombre?.message}
          {...registrarCampo("nombre")}
        />
        <FormField
          label="Correo electrónico"
          type="email"
          placeholder="correo@empresa.com"
          error={errors.email?.message}
          {...registrarCampo("email")}
        />
        <FormField
          label="Contraseña"
          isPassword
          placeholder="********"
          error={errors.password?.message}
          {...registrarCampo("password")}
        />
        <PasswordStrength value={passwordActual} />
        <FormField
          label="Confirmar contraseña"
          isPassword
          placeholder="********"
          error={errors.confirmPassword?.message}
          {...registrarCampo("confirmPassword")}
        />

        <Button type="submit" loading={enviando} className="mt-2">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-dim">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold text-accent-light hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
