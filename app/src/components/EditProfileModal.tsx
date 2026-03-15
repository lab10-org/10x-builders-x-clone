import { useState, useEffect } from "react";
import type { Profile } from "../types/database";

interface EditProfileModalProps {
  profile: Profile;
  onSave: (displayName: string) => Promise<{ error: string | null }>;
  onClose: () => void;
}

export function EditProfileModal({
  profile,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(profile.display_name);
  }, [profile.display_name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length > 80) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await onSave(trimmed);
    setSaving(false);
    if (saveError) {
      setError(saveError);
    } else {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-black border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Editar perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="mb-5">
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Nombre
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition"
              placeholder="Tu nombre"
              autoFocus
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {displayName.trim().length}/80
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-700 px-5 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                !displayName.trim() ||
                displayName.trim().length > 80
              }
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
