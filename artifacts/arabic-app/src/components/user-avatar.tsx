import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    displayName: string;
    avatarBase64?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
  };

  if (!user) {
    return (
      <div className={cn("rounded-full bg-muted animate-pulse", sizes[size], className)} />
    );
  }

  if (user.avatarBase64) {
    return (
      <img
        src={`data:image/jpeg;base64,${user.avatarBase64}`}
        alt={user.displayName}
        className={cn("rounded-full object-cover shadow-sm border-2 border-white/50", sizes[size], className)}
      />
    );
  }

  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "?";

  // Generate a somewhat consistent color based on the name
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-green-100 text-green-600",
    "bg-orange-100 text-orange-600",
    "bg-indigo-100 text-indigo-600",
  ];
  
  const colorIndex = user.displayName 
    ? user.displayName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white/50",
        colors[colorIndex],
        sizes[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
