interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ name, size = "md" }: AvatarProps) {
  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const initial = name?.[0]?.toUpperCase() || "?";

  return (
    <div className={`${sizes[size]} rounded-full bg-[#0052cc] flex items-center justify-center text-white font-semibold`}>
      {initial}
    </div>
  );
}
