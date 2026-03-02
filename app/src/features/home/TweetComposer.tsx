import { FormEvent, useState } from "react";

type Props = {
  onSubmitTweet: (content: string) => Promise<void>;
};

export function TweetComposer({ onSubmitTweet }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 255) {
      setError("El tweet debe tener entre 1 y 255 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitTweet(trimmed);
      setContent("");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("No se pudo publicar el tweet");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">Publicar tweet</h2>
      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          placeholder="¿Qué está pasando?"
          maxLength={255}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{content.length}/255</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Publicando..." : "Twittear"}
          </button>
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </section>
  );
}
