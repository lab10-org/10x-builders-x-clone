import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TweetComposer } from "./TweetComposer";

const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "user@test.com" },
  }),
}));

function renderComposer(onTweetCreated = vi.fn()) {
  return render(<TweetComposer onTweetCreated={onTweetCreated} />);
}

describe("TweetComposer", () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockFrom.mockReset();
    mockFrom.mockReturnValue({ insert: mockInsert });
  });

  it("renders textarea and publish button", () => {
    renderComposer();
    expect(
      screen.getByLabelText("Contenido del tweet")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publicar" })
    ).toBeInTheDocument();
  });

  it("publish button is disabled when content is empty", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
  });

  it("publish button is disabled when content is only whitespace", () => {
    renderComposer();
    fireEvent.change(screen.getByLabelText("Contenido del tweet"), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
  });

  it("publish button is disabled when content exceeds 280 characters", () => {
    renderComposer();
    fireEvent.change(screen.getByLabelText("Contenido del tweet"), {
      target: { value: "a".repeat(281) },
    });
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
  });

  it("does not call insert when content is invalid", async () => {
    mockInsert.mockResolvedValue({ error: null });
    renderComposer();

    fireEvent.change(screen.getByLabelText("Contenido del tweet"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  it("calls insert with trimmed content and author_id when valid", async () => {
    mockInsert.mockResolvedValue({ error: null });
    const onTweetCreated = vi.fn();
    renderComposer(onTweetCreated);

    fireEvent.change(screen.getByLabelText("Contenido del tweet"), {
      target: { value: "  Hola mundo  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("tweets");
      expect(mockInsert).toHaveBeenCalledWith({
        author_id: "user-1",
        content: "Hola mundo",
      });
      expect(onTweetCreated).toHaveBeenCalled();
    });
  });

  it("clears textarea after successful tweet creation", async () => {
    mockInsert.mockResolvedValue({ error: null });
    renderComposer();

    const textarea = screen.getByLabelText("Contenido del tweet");
    fireEvent.change(textarea, { target: { value: "Mi tweet" } });
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("shows error message when insert fails", async () => {
    mockInsert.mockResolvedValue({
      error: { message: "Error de base de datos" },
    });
    renderComposer();

    fireEvent.change(screen.getByLabelText("Contenido del tweet"), {
      target: { value: "Mi tweet" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error de base de datos"
      );
    });
  });

  it("accepts exactly 280 characters", async () => {
    mockInsert.mockResolvedValue({ error: null });
    renderComposer();

    const content = "a".repeat(280);
    fireEvent.change(screen.getByLabelText("Contenido del tweet"), {
      target: { value: content },
    });

    expect(screen.getByRole("button", { name: "Publicar" })).not.toBeDisabled();
  });
});
