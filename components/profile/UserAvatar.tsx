import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: number;
  className?: string;
}

/**
 * Displays a user's avatar. Falls back to an indigo circle with the
 * user's initial when no image URL is provided.
 */
export function UserAvatar({
  src,
  name,
  username,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const initial = (name ?? username ?? "U")[0].toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? username ?? "User avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-label={`${name ?? username ?? "User"} avatar`}
      className={`flex shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.floor(size * 0.4) }}
    >
      {initial}
    </div>
  );
}
