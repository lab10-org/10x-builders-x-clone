import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatHandle } from "@10x/shared";
import { supabase } from "../lib/supabase";
import { TweetCard } from "../components/TweetCard";
import type { Profile, TweetWithAuthor } from "../types/database";

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<TweetWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username!)
        .single();

      if (profileError || !profileData) {
        setError("Usuario no encontrado");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: tweetsData, error: tweetsError } = await supabase
        .from("tweets")
        .select("*, profiles(*)")
        .eq("author_id", profileData.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (tweetsError) {
        setError("Error al cargar los tweets");
      } else {
        setTweets((tweetsData as TweetWithAuthor[]) ?? []);
      }

      setLoading(false);
    }

    void load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-white" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">{error ?? "Usuario no encontrado"}</p>
        <Link
          to="/"
          className="rounded-full border border-gray-700 px-5 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl border-x border-gray-800 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-800 bg-black/80 px-4 py-3 backdrop-blur-sm">
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">{profile.display_name}</h1>
            <p className="text-xs text-gray-500">{tweets.length} tweets</p>
          </div>
        </header>

        {/* Profile card */}
        <div className="border-b border-gray-800 px-4 py-5">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-700 text-2xl font-bold text-white">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-white">{profile.display_name}</p>
              <p className="text-sm text-gray-500">{formatHandle(profile.username)}</p>
            </div>
          </div>
          {profile.bio && (
            <p className="mt-4 text-sm text-gray-300 whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Tweets */}
        <section aria-label={`Tweets de ${profile.display_name}`}>
          {tweets.length === 0 && (
            <p className="px-4 py-12 text-center text-gray-500 text-sm">
              Este usuario aún no ha publicado tweets.
            </p>
          )}
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </section>
      </div>
    </div>
  );
}
