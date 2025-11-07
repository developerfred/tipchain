import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "./ui/Button";
import { useFarcaster } from "../providers/FarcasterProvider";
import toast from "react-hot-toast";

export function SmartConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isMiniApp, user, isLoading: farcasterLoading } = useFarcaster();

  const [isConnecting, setIsConnecting] = useState(false);

  if (isMiniApp && !farcasterLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-purple-600">
            Connected to Farcaster
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.pfpUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
              }}
            />
            <span className="text-sm font-medium">@{user.username}</span>
          </div>
        )}
      </div>
    );
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect({ connector: injected() });
      toast.success("Wallet connected!");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600">Connected</span>
        </div>
        <div className="text-sm font-medium">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="relative"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
}
