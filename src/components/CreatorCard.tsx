// components/CreatorCard.tsx (corrigido)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Users,
  CheckCircle,
  Star,
  Twitter,
  Github,
  Zap,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { TipModal } from "./TipModal";
import { ClaimProfileModal } from "./ClaimProfileModal";
import { formatEth, generateAvatarUrl } from "../lib/utils";
import type { CombinedCreator } from "../hooks/useExplore";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

interface CreatorCardProps {
  creator: CombinedCreator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const [showTipModal, setShowTipModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const avatarUrl = creator.avatarUrl || generateAvatarUrl(creator.address);

  const isRegistered = creator.tipchain_registered;
  const walletAddress = creator.primary_wallet_address || creator.address;
  const isOwnProfile =
    isConnected && walletAddress?.toLowerCase() === address?.toLowerCase();
  const hasBuilderScore =
    creator.builder_score_points && creator.builder_score_points > 0;
  const hasBaseScore =
    creator.base_builder_score_points && creator.base_builder_score_points > 0;

  const handleTipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTipModal(true);
  };

  const handleClaimClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConnected) {
      toast.error("Please connect your wallet to claim this profile");
      return;
    }

    if (isOwnProfile) {
      navigate("/creators", {
        state: {
          prefillData: {
            basename: creator.basename,
            displayName: creator.displayName,
            bio: creator.bio,
            avatarUrl: creator.avatarUrl,
          },
        },
      });
    } else {
      setShowClaimModal(true);
    }
  };

  const handleViewProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRegistered) {
      navigate(`/${creator.basename}`);
    } else {
      setShowClaimModal(true);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50">
        <CardContent className="p-0">
          {/* Header com badges */}
          <div className="relative h-24 bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={creator.displayName}
                  className="w-12 h-12 rounded-xl border-4 border-white bg-white group-hover:scale-110 transition-transform shadow-lg"
                />

                {/* Badge de status */}
                {!isRegistered && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-white">
                    <Zap className="h-2 w-2 text-white" />
                  </div>
                )}
                {creator.human_checkmark && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                    <CheckCircle className="h-2 w-2 text-white" />
                  </div>
                )}
                {isOwnProfile && !isRegistered && (
                  <div className="absolute -bottom-1 -left-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <Wallet className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Badges no topo */}
            <div className="absolute top-3 right-3 flex gap-1">
              {hasBuilderScore && (
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-2 w-2" />
                  {creator.builder_score_points}
                </div>
              )}
              {hasBaseScore && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Base #{creator.base_builder_score_rank}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="pt-8 px-4 pb-4">
            <div className="text-center mb-3">
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                {creator.displayName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">@{creator.basename}</p>

              {/* Social handles */}
              <div className="flex justify-center gap-2 mb-3">
                {creator.twitter_handle && (
                  <a
                    href={`https://twitter.com/${creator.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Twitter className="h-3 w-3" />
                  </a>
                )}
                {creator.github_handle && (
                  <a
                    href={`https://github.com/${creator.github_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {creator.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 text-center leading-relaxed">
                {creator.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between mb-4 text-sm px-2">
              <div className="flex items-center gap-1 text-gray-600">
                <Heart className="h-3 w-3" />
                <span className="font-semibold">
                  {formatEth(BigInt(creator.totalAmountReceived || "0"), 2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="h-3 w-3" />
                <span>{creator.tippedByCount || 0}</span>
              </div>
              <div className="text-xs text-gray-500">
                {creator.tipCount || 0} tips
              </div>
            </div>

            {/* Tags */}
            {creator.tags && creator.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4 justify-center">
                {creator.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
              <Button
                variant={isRegistered ? "outline" : "default"}
                className={`flex-1 text-xs ${
                  !isRegistered
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    : ""
                }`}
                size="sm"
                onClick={
                  isRegistered ? handleViewProfileClick : handleClaimClick
                }
              >
                {isRegistered ? (
                  "View Profile"
                ) : isOwnProfile ? (
                  <>
                    <Wallet className="h-3 w-3 mr-1" />
                    Claim
                  </>
                ) : (
                  "Claim Profile"
                )}
              </Button>
              <Button
                onClick={handleTipClick}
                className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="sm"
              >
                Send Tip
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {/* Status indicator */}
            {!isRegistered && (
              <div className="mt-2 text-center">
                <p className="text-xs px-2 py-1 rounded flex items-center justify-center gap-1">
                  {isOwnProfile ? (
                    <span className="text-green-600 bg-green-50">
                      <Wallet className="h-3 w-3 inline mr-1" />
                      This is your profile! Claim it to receive tips.
                    </span>
                  ) : (
                    <span className="text-yellow-600 bg-yellow-50">
                      <Zap className="h-3 w-3 inline mr-1" />
                      Profile needs claim to receive tips
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tip Modal - mostra para todos os creators */}
      <TipModal
        creator={{
          address: creator.primary_wallet_address || creator.address,
          basename: creator.basename,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
          isRegistered: isRegistered,
        }}
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
      />

      {/* Claim Modal - para perfis não registrados */}
      <ClaimProfileModal
        creator={creator}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        isOwnProfile={isOwnProfile}
      />
    </>
  );
}
