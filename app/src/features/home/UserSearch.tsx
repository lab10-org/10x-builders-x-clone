import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { searchProfiles } from "../../lib/apiClient";
import type { Profile } from "../social/types";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const profiles = await searchProfiles(trimmed);
      setResults(profiles);
    } catch (searchError) {
      if (searchError instanceof Error) {
        setError(searchError.message);
      } else {
        setError("No se pudo buscar usuarios");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">Buscar usuarios</h2>
      <form className="mt-3 space-y-2" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="username"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}

      <ul className="mt-3 space-y-2">
        {results.map((profile) => (
          <li key={profile.id} className="rounded-lg border border-slate-800 p-3">
            <p className="font-medium text-slate-100">@{profile.username}</p>
            {profile.displayName ? <p className="text-sm text-slate-300">{profile.displayName}</p> : null}
            <Link className="mt-2 inline-block text-sm text-sky-300 underline" to={`/u/${profile.username}`}>
              Ver perfil
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
