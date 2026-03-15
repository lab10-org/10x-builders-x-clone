import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { LoginPage } from "./LoginPage";

const mockSignIn = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockUseAuth.mockReturnValue({
      user: null,
      signIn: mockSignIn,
    });
  });

  it("renders email and password fields", () => {
    renderLoginPage();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" })
    ).toBeInTheDocument();
  });

  it("shows error message when login fails", async () => {
    mockSignIn.mockResolvedValue({ error: { message: "Credenciales inválidas" } });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Credenciales inválidas"
      );
    });
  });

  it("calls signIn with email and password on submit", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("user@test.com", "password123");
    });
  });

  it("redirects to home when user is already authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "user@test.com" },
      signIn: mockSignIn,
    });

    renderLoginPage();

    expect(screen.getByText("Home page")).toBeInTheDocument();
  });
});
