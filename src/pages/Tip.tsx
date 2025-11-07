// pages/TipPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { useCreatorProfile } from "../hooks/useCreatorProfile";
import { TipModal } from "../components/TipModal";

export function TipPage() {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { creator, isLoading, error } = useCreatorProfile(identifier);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  useEffect(() => {
    // Se não tem identifier, volta para home
    if (!identifier) {
      navigate("/");
      return;
    }

    // Se ocorreu erro ao carregar o creator, mostra estado de erro
    if (error && !isLoading) {
      console.error("Error loading creator:", error);
    }
  }, [identifier, navigate, error, isLoading]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTipSuccess = () => {
    // Fechar modal e talvez mostrar confirmação
    setIsTipModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Creator Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || `The creator "${identifier}" was not found.`}
            </p>
          </div>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Support {creator.displayName}
          </h1>
          <p className="text-lg text-muted-foreground">
            Send a tip to show your appreciation for their work
          </p>
        </div>
      </div>

      {/* Creator Profile Card */}
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  className="h-20 w-20 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold border-4 border-background shadow-lg">
                  {creator.displayName[0].toUpperCase()}
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">{creator.displayName}</CardTitle>
            <CardDescription className="text-lg">
              @{creator.basename}
            </CardDescription>
            {creator.bio && (
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                {creator.bio}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {creator.tipCount}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Tips
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {creator.tippedByCount}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Supporters
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {parseFloat(creator.totalAmountReceived).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total
                </div>
              </div>
            </div>

            {/* Tip Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={() => setIsTipModalOpen(true)}
            >
              <Heart className="mr-2 h-5 w-5" />
              Send Tip
            </Button>

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ 100% goes to the creator</p>
              <p>✓ Gas fees sponsored</p>
              <p>✓ Instant payment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tip Modal */}
      <TipModal
        creator={{
          address: creator.address,
          basename: creator.basename,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl,
        }}
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
      />
    </div>
  );
}
