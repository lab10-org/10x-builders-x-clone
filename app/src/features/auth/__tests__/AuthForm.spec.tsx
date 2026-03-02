import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthForm } from "../AuthForm"
import * as authService from "../authService"

vi.mock("../authService", () => ({
  loginWithEmail: vi.fn(),
  signupWithEmail: vi.fn(),
}))

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders login mode by default", () => {
    render(<AuthForm />)

    expect(screen.getByRole("heading", { name: /inicia sesion/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    render(<AuthForm />)

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }))

    expect(await screen.findByText(/email y password son obligatorios/i)).toBeInTheDocument()
    expect(authService.loginWithEmail).not.toHaveBeenCalled()
  })

  it("submits login with email and password", async () => {
    vi.mocked(authService.loginWithEmail).mockResolvedValue()

    render(<AuthForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }))

    await waitFor(() => {
      expect(authService.loginWithEmail).toHaveBeenCalledWith("user@example.com", "password123")
    })

    expect(screen.getByText(/sesion iniciada correctamente/i)).toBeInTheDocument()
  })

  it("switches to signup and submits", async () => {
    vi.mocked(authService.signupWithEmail).mockResolvedValue()

    render(<AuthForm />)
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }))
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /registrarme/i }))

    await waitFor(() => {
      expect(authService.signupWithEmail).toHaveBeenCalledWith("new@example.com", "password123")
    })

    expect(screen.getByText(/cuenta creada correctamente/i)).toBeInTheDocument()
  })

  it("shows service errors", async () => {
    vi.mocked(authService.loginWithEmail).mockRejectedValue(new Error("Invalid login credentials"))

    render(<AuthForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } })
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }))

    expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument()
  })
})
