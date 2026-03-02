import { getSupabaseClient } from "../../lib/supabase"

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message)
  }
}

export async function loginWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  assertNoError(error)
}

export async function signupWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signUp({ email, password })
  assertNoError(error)
}
