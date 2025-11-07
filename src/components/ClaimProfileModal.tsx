import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Zap,
  Users,
  MessageCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { CombinedCreator } from "../hooks/useSupabaseUsers";
import { generateAvatarUrl } from "../lib/utils";

interface ClaimProfileModalProps {
  creator: CombinedCreator;
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile: boolean;
}

export function ClaimProfileModal({
  creator,
  isOpen,
  onClose,
  isOwnProfile,
}: ClaimProfileModalProps) {
  const navigate = useNavigate();

  const handleClaim = () => {
    if (isOwnProfile) {
      const walletAddress = creator.primary_wallet_address || creator.address;
      navigate("/creators", {
        state: {
          prefillData: {
            basename: creator.basename,
            displayName: creator.displayName,
            bio: creator.bio,
            avatarUrl: creator.avatarUrl,
            walletAddress: walletAddress,
          },
        },
      });
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {isOwnProfile ? "Claim Your Profile" : "Profile Not Claimed"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={creator.avatarUrl || generateAvatarUrl(creator.address)}
              alt={creator.displayName}
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h3 className="font-semibold">{creator.displayName}</h3>
              <p className="text-sm text-gray-600">@{creator.basename}</p>
            </div>
          </div>

          <div className="space-y-3">
            {isOwnProfile ? (
              <>
                <p className="text-sm text-gray-600">
                  <strong>This profile is reserved for you!</strong> Complete
                  your registration to:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Start receiving tips from supporters</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Access your tip dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Share your profile with QR codes</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  <strong>This profile hasn't been claimed yet.</strong> The
                  creator needs to:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Wallet className="h-4 w-4" />
                    <span>Connect their wallet</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Users className="h-4 w-4" />
                    <span>Claim their profile</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <MessageCircle className="h-4 w-4" />
                    <span>Start receiving tips</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You can still send a tip, but the creator won't be able to
                  access it until they claim their profile.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {isOwnProfile ? (
              <Button
                onClick={handleClaim}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Claim Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onClose} variant="outline" className="flex-1">
                Understand
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
