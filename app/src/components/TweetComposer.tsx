import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const MAX_LENGTH = 280;

interface TweetComposerProps {
  onTweetCreated: () => void;
}

export function TweetComposer({ onTweetCreated }: TweetComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmed = content.trim();
  const remaining = MAX_LENGTH - trimmed.length;
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_LENGTH;

  async function handlePublish() {
    if (!isValid || !user) return;

    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("tweets").insert({
      author_id: user.id,
      content: trimmed,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);
    onTweetCreated();
  }

  return (
    <div className="border-b border-gray-800 px-4 py-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            void handlePublish();
          }
        }}
        placeholder="¿Qué está pasando?"
        rows={3}
        className="w-full resize-none bg-transparent text-white placeholder-gray-500 text-lg focus:outline-none"
        aria-label="Contenido del tweet"
      />

      {error && (
        <p role="alert" className="mb-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <span
          className={`text-sm ${
            remaining < 0
              ? "text-red-500"
              : remaining <= 20
                ? "text-yellow-500"
                : "text-gray-500"
          }`}
        >
          {remaining}
        </span>

        <button
          type="button"
          disabled={!isValid || loading}
          onClick={() => void handlePublish()}
          className="rounded-full bg-sky-500 px-5 py-1.5 font-bold text-white text-sm transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
