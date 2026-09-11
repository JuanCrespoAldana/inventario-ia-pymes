import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/Button"
import { AlertBanner } from "@/components/AlertBanner"
import { PasswordStrength } from "@/components/PasswordStrength"
import { CodeInput } from "@/components/CodeInput"
import { olvidePassword, verificarCodigo, restablecerPassword } from "@/api/auth"
import { extraerMensajeError } from "@/api/errors"

type Paso = "correo" | "codigo" | "nueva_password"

const esquemaCorreo = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
})
type FormCorreo = z.infer<typeof esquemaCorreo>

const esquemaPassword = z
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
type FormPassword = z.infer<typeof esquemaPassword>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState<Paso>("correo")
  const [email, setEmail] = useState("")
  const [sessionToken, setSessionToken] = useState("")

  const [codigo, setCodigo] = useState("")
  const [errorCodigo, setErrorCodigo] = useState("")
  const [verificando, setVerificando] = useState(false)

  const [errorGeneral, setErrorGeneral] = useState("")
  const [enviando, setEnviando] = useState(false)

  const formCorreo = useForm<FormCorreo>({ resolver: zodResolver(esquemaCorreo) })
  const formPassword = useForm<FormPassword>({ resolver: zodResolver(esquemaPassword) })
  const passwordActual = formPassword.watch("password") ?? ""

  async function onSolicitarCodigo(datos: FormCorreo) {
    setErrorGeneral("")
    setEnviando(true)
    try {
      await olvidePassword(datos.email)
      setEmail(datos.email)
      setPaso("codigo")
    } catch (error) {
      setErrorGeneral(extraerMensajeError(error))
    } finally {
      setEnviando(false)
    }
  }

  async function onVerificarCodigo() {
    setErrorCodigo("")
    setVerificando(true)
    try {
      const { session_token } = await verificarCodigo(email, codigo)
      setSessionToken(session_token)
      setPaso("nueva_password")
    } catch (error) {
      setErrorCodigo(extraerMensajeError(error, "Código incorrecto"))
      setCodigo("")
    } finally {
      setVerificando(false)
    }
  }

  async function onCrearNuevaPassword(datos: FormPassword) {
    setErrorGeneral("")
    setEnviando(true)
    try {
      await restablecerPassword(sessionToken, datos.password)
      navigate("/login", { state: { passwordRestablecida: true } })
    } catch (error) {
      setErrorGeneral(extraerMensajeError(error, "El código venció, solicita uno nuevo"))
    } finally {
      setEnviando(false)
    }
  }

  if (paso === "correo") {
    return (
      <AuthLayout title="Recupera tu contraseña" subtitle="Te enviamos un código a tu correo">
        {errorGeneral && <AlertBanner type="error" message={errorGeneral} />}
        <form onSubmit={formCorreo.handleSubmit(onSolicitarCodigo)} noValidate>
          <FormField
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo"
            error={formCorreo.formState.errors.email?.message}
            {...formCorreo.register("email")}
          />
          <Button type="submit" loading={enviando}>
            Enviar código
          </Button>
        </form>
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

  if (paso === "codigo") {
    return (
      <AuthLayout title="Ingresa el código" subtitle={`Lo enviamos a ${email}`}>
        <CodeInput value={codigo} onChange={setCodigo} error={errorCodigo} disabled={verificando} />

        <Button
          type="button"
          loading={verificando}
          disabled={codigo.length !== 6}
          onClick={onVerificarCodigo}
          className="mt-5"
        >
          Verificar código
        </Button>

        <button
          type="button"
          onClick={() => setPaso("correo")}
          className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-ink-dim hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Usar otro correo
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crea una nueva contraseña" subtitle="Ya casi terminas">
      {errorGeneral && <AlertBanner type="error" message={errorGeneral} />}
      <form onSubmit={formPassword.handleSubmit(onCrearNuevaPassword)} noValidate>
        <FormField
          label="Nueva contraseña"
          isPassword
          placeholder="********"
          error={formPassword.formState.errors.password?.message}
          {...formPassword.register("password")}
        />
        <PasswordStrength value={passwordActual} />
        <FormField
          label="Confirmar contraseña"
          isPassword
          placeholder="********"
          error={formPassword.formState.errors.confirmPassword?.message}
          {...formPassword.register("confirmPassword")}
        />
        <Button type="submit" loading={enviando} className="mt-2">
          Restablecer contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
