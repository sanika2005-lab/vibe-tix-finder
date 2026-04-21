import type { Friend } from "@/data/mockData";

export const FriendsAvatars = ({
  friends,
  max = 3,
}: {
  friends: Friend[];
  max?: number;
}) => {
  const visible = friends.slice(0, max);
  const extra = friends.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((f) => (
          <img
            key={f.id}
            src={f.avatar}
            alt={f.name}
            loading="lazy"
            className="h-7 w-7 rounded-full border-2 border-background object-cover"
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {friends.length === 0
          ? "Be the first"
          : extra > 0
          ? `${visible.map((f) => f.name).join(", ")} +${extra} going`
          : `${visible.map((f) => f.name).join(", ")} going`}
      </span>
    </div>
  );
};
