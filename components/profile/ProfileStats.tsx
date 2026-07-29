interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
}

export function ProfileStats({ posts, followers, following }: ProfileStatsProps) {
  const stats = [
    { label: "Posts",     value: posts },
    { label: "Followers", value: followers },
    { label: "Following", value: following },
  ];

  return (
    <div className="flex gap-6 text-sm">
      {stats.map(({ label, value }) => (
        <div key={label}>
          <span className="font-bold text-white">{value.toLocaleString()}</span>{" "}
          <span className="text-neutral-400">{label}</span>
        </div>
      ))}
    </div>
  );
}
