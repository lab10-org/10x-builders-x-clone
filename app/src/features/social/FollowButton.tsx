import { useState } from "react";
import { followUser, unfollowUser } from "../../lib/apiClient";

type Props = {
  targetId: string;
  initialFollowing: boolean;
  disabled?: boolean;
  onChange?: (nextValue: boolean) => void;
};

export function FollowButton({ targetId, initialFollowing, disabled = false, onChange }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function toggleFollow() {
    setError("");
    setIsPending(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetId);
        setIsFollowing(false);
        onChange?.(false);
      } else {
        await followUser(targetId);
        setIsFollowing(true);
        onChange?.(true);
      }
    } catch (toggleError) {
      if (toggleError instanceof Error) {
        setError(toggleError.message);
      } else {
        setError("No se pudo actualizar el follow");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={disabled || isPending}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Actualizando..." : isFollowing ? "Dejar de seguir" : "Seguir"}
      </button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
