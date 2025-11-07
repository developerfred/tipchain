import { useFarcaster } from "../providers/FarcasterProvider";

export function FarcasterBadge() {
  const { isMiniApp, user } = useFarcaster();

  if (!isMiniApp) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-full">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
        {user ? `Connected as ${user.displayName}` : "Farcaster Mini App"}
      </span>
    </div>
  );
}
