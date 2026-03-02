import { AuthForm } from "./features/auth/AuthForm"

function App() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-50">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold">X Clone</h1>
        <p className="text-slate-300">
          Inicia sesion o crea tu cuenta para comenzar a usar el clon de X.
        </p>
        <AuthForm />
      </div>
    </main>
  )
}

export default App
