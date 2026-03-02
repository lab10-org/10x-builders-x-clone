import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

const authApi = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}));

vi.mock("../lib/supabase", () => ({
  getSupabaseClient: () => ({
    auth: authApi,
  }),
}));

describe("App", () => {
  it("renders project heading", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /x clone/i })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });
});
