import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProfileByUsername } from "../../lib/apiClient";
import { FollowButton } from "../social/FollowButton";
import type { Profile, Tweet } from "../social/types";

type Props = {
  currentUserId: string;
};

export function ProfilePage({ currentUserId }: Props) {
  const { username = "" } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      setIsLoading(true);
      try {
        const response = await getProfileByUsername(username);
        setProfile(response.profile);
        setTweets(response.tweets);
      } catch (loadError) {
        if (loadError instanceof Error) {
          setError(loadError.message);
        } else {
          setError("No se pudo cargar el perfil");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [username]);

  if (isLoading) {
    return <p className="text-slate-300">Cargando perfil...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-rose-400">{error}</p>
        <Link className="text-sky-300 underline" to="/home">
          Volver al Home
        </Link>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-slate-300">Perfil no encontrado.</p>;
  }

  return (
    <div className="space-y-4">
      <Link className="text-sm text-sky-300 underline" to="/home">
        ← Volver al Home
      </Link>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xl font-semibold text-slate-100">
          {profile.displayName ?? `@${profile.username}`}
        </p>
        <p className="text-sm text-slate-400">@{profile.username}</p>
        {profile.id !== currentUserId ? (
          <div className="mt-3">
            <FollowButton targetId={profile.id} initialFollowing={profile.isFollowing} />
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Tweets</h2>
        {tweets.length === 0 ? <p className="text-slate-300">Este usuario no ha publicado tweets.</p> : null}
        {tweets.map((tweet) => (
          <article key={tweet.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-500">{new Date(tweet.createdAt).toLocaleString()}</p>
            <p className="mt-2 whitespace-pre-wrap text-slate-100">{tweet.content}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
