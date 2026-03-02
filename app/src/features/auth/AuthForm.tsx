import { FormEvent, useState } from "react"
import { loginWithEmail, signupWithEmail } from "./authService"

type Mode = "login" | "signup"

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email y password son obligatorios")
      return
    }

    setIsLoading(true)

    try {
      if (mode === "login") {
        await loginWithEmail(email, password)
        setSuccessMessage("Sesion iniciada correctamente")
      } else {
        await signupWithEmail(email, password)
        setSuccessMessage("Cuenta creada correctamente")
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("Ocurrio un error inesperado")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-semibold">{mode === "login" ? "Inicia sesion" : "Crea tu cuenta"}</h2>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Procesando..." : mode === "login" ? "Entrar" : "Registrarme"}
        </button>

        {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((currentMode) => (currentMode === "login" ? "signup" : "login"))
          setErrorMessage("")
          setSuccessMessage("")
        }}
        className="mt-4 text-sm text-sky-300 underline"
      >
        {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
      </button>
    </section>
  )
}
