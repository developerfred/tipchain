import { useNetworkInfo } from "../hooks/useCreators";

interface NetworkBadgeProps {
  chainId: number;
  size?: "sm" | "md" | "lg";
  showFullName?: boolean;
}

export function NetworkBadge({
  chainId,
  size = "sm",
  showFullName = false,
}: NetworkBadgeProps) {
  const networkInfo = useNetworkInfo(chainId);

  if (!networkInfo) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${networkInfo.color} ${sizeClasses[size]}`}
      title={networkInfo.name}
    >
      {showFullName ? networkInfo.name : networkInfo.shortName}
    </span>
  );
}
