import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthForm } from "./features/auth/AuthForm";
import { HomePage } from "./features/home/HomePage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { getSupabaseClient } from "./lib/supabase";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoadingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  }

  if (isLoadingSession) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-50">
        <div className="mx-auto max-w-3xl">
          <p>Cargando sesion...</p>
        </div>
      </main>
    );
  }

  if (!session) {
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
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">X Clone</h1>
            <p className="text-slate-300">{session.user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Cerrar sesion
          </button>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/u/:username" element={<ProfilePage currentUserId={session.user.id} />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
