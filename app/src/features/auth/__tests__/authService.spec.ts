import { beforeEach, describe, expect, it, vi } from "vitest"

const { signInWithPassword, signUp } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}))

vi.mock("../../../lib/supabase", () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithPassword: signInWithPassword,
      signUp: signUp,
    },
  }),
}))

import { loginWithEmail, signupWithEmail } from "../authService"

describe("authService", () => {
  beforeEach(() => {
    signInWithPassword.mockReset()
    signUp.mockReset()
  })

  it("logs in with email and password", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null })

    await loginWithEmail("test@example.com", "secret123")

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "secret123",
    })
  })

  it("signs up with email and password", async () => {
    signUp.mockResolvedValue({ data: {}, error: null })

    await signupWithEmail("new@example.com", "secret123")

    expect(signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "secret123",
    })
  })

  it("throws readable error when login fails", async () => {
    signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    })

    await expect(loginWithEmail("bad@example.com", "wrongpass")).rejects.toThrow(
      "Invalid login credentials",
    )
  })
})
