import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Link as LinkIcon,
  FileText,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  TIPCHAIN_ABI,
  getTipChainContractAddress,
  isNetworkSupported,
  DEFAULT_CHAIN_ID,
} from "../config/contracts";
import { isValidBasename } from "../lib/utils";
import toast from "react-hot-toast";
import { useFarcaster } from "../providers/FarcasterProvider";
import { SmartConnect } from "../components/SmartConnect";


function ModernInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  type = "text",
  maxLength,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  helperText?: string;
  icon?: any;
  type?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-200 ${
            error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          } focus:outline-none focus:shadow-lg`}
        />

        {maxLength && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span
              className={`text-xs ${
                value.length > maxLength * 0.8
                  ? "text-orange-500"
                  : "text-gray-400"
              }`}
            >
              {value.length}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-2 animate-pulse">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}


function ProfilePreview({
  creator,
  isFarcaster = false,
}: {
  creator: {
    basename: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
  };
  isFarcaster?: boolean;
}) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
      <div className="flex items-start gap-4">
        <div className="relative">
          {creator.avatarUrl ? (
            <img
              src={creator.avatarUrl}
              alt="Avatar"
              className="h-16 w-16 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {creator.displayName[0]?.toUpperCase() || "?"}
            </div>
          )}
          {isFarcaster && (
            <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1 border-2 border-white">
              <Users className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 truncate">
            {creator.displayName || "Your Name"}
          </h3>
          <p className="text-sm text-blue-600 font-mono truncate">
            @{creator.basename || "username"}.tipchain.eth
          </p>
          {creator.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {creator.bio}
            </p>
          )}
        </div>
      </div>

      {isFarcaster && (
        <div className="flex items-center gap-2 mt-3 text-sm text-purple-600">
          <CheckCircle className="h-4 w-4" />
          Connected to Farcaster
        </div>
      )}
    </div>
  );
}


function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
              index + 1 === currentStep
                ? "border-blue-500 bg-blue-500 text-white scale-110"
                : index + 1 < currentStep
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-gray-300 text-gray-400"
            }`}
          >
            {index + 1 < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`h-0.5 w-12 transition-all duration-300 ${
                index + 1 < currentStep ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function BecomeCreator() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const [formData, setFormData] = useState({
    basename: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
  });
  const [basenameError, setBasenameError] = useState("");

  const {
    isMiniApp,
    user,
    isLoading: farcasterLoading,
    isInitialized,
  } = useFarcaster();

  const effectiveChainId = chainId || DEFAULT_CHAIN_ID;
  const isSupportedNetwork = isNetworkSupported(effectiveChainId);
  const contractAddress = getTipChainContractAddress(effectiveChainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });


  useEffect(() => {
    const loadFarcasterUser = async () => {
      if (isMiniApp && user && !farcasterLoading && isInitialized) {
        setIsLoadingUser(true);
        try {
          const generatedBasename = user.username
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");

          setFormData({
            basename: generatedBasename,
            displayName: user.displayName || user.username,
            bio: user.bio || "",
            avatarUrl: user.pfpUrl || "",
          });

          validateBasename(generatedBasename);
          toast.success("Perfil do Farcaster carregado! 🎉");
        } catch (error) {
          console.error("Error loading Farcaster user:", error);
          toast.error("Could not load Farcaster profile");
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    loadFarcasterUser();
  }, [isMiniApp, user, farcasterLoading, isInitialized]);

  const validateBasename = (value: string) => {
    if (!value) {
      setBasenameError("Basename is required");
      return false;
    }
    if (value.length < 3) {
      setBasenameError("Basename must be at least 3 characters");
      return false;
    }
    if (value.length > 30) {
      setBasenameError("Basename must be less than 30 characters");
      return false;
    }
    if (!isValidBasename(value)) {
      setBasenameError("Only lowercase letters, numbers, and hyphens allowed");
      return false;
    }
    setBasenameError("");
    return true;
  };

  const handleBasenameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, basename: cleaned }));
    validateBasename(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isSupportedNetwork) {
      toast.error("Please switch to a supported network");
      return;
    }

    if (!validateBasename(formData.basename)) {
      return;
    }

    if (!formData.displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: TIPCHAIN_ABI,
        functionName: "registerCreator",
        args: [
          formData.basename,
          formData.displayName,
          formData.bio,
          formData.avatarUrl,
        ],
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register creator");
    }
  };

  // Redirecionar após sucesso
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        toast.success("Successfully registered as a creator! 🎉");
        navigate("/dashboard");
      }, 2000);
    }
  }, [isSuccess, navigate]);

  // Estados de conexão e rede
  if (!isConnected && !isMiniApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join TipChain
            </h1>
            <p className="text-lg text-gray-600">
              Connect your wallet to start receiving tips from your community
            </p>
          </div>
          <SmartConnect />
        </div>
      </div>
    );
  }

  if (!isSupportedNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isMiniApp ? "Switch to Base" : "Unsupported Network"}
          </h1>
          <p className="text-gray-600">
            {isMiniApp
              ? "Base network is required for Farcaster integration"
              : "Please switch to a supported network to register as a creator"}
          </p>
          {isMiniApp && (
            <Button
              onClick={() =>
                window.ethereum?.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: "0x2105" }],
                })
              }
              className="w-full"
            >
              Switch to Base
            </Button>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isMiniApp ? "Welcome Creator! 🎉" : "Become a Creator"}
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {isMiniApp
              ? "Your Farcaster profile has been loaded. Review and complete your setup."
              : "Set up your profile and start receiving tips in minutes"}
          </p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {isLoadingUser ? (
              <div className="flex items-center justify-center py-12 space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-gray-600">
                  Loading your Farcaster profile...
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Basic Information
                      </h2>
                      <p className="text-gray-600">
                        Let's start with your profile details
                      </p>
                    </div>

                    <ModernInput
                      label="Username"
                      value={formData.basename}
                      onChange={handleBasenameChange}
                      placeholder="yourname"
                      error={basenameError}
                      helperText="Your unique identifier on TipChain"
                      icon={User}
                      required
                    />

                    <ModernInput
                      label="Display Name"
                      value={formData.displayName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, displayName: value }))
                      }
                      placeholder="Your Public Name"
                      helperText="How supporters will see you"
                      icon={FileText}
                      maxLength={100}
                      required
                    />

                    {(formData.basename || formData.displayName) && (
                      <ProfilePreview
                        creator={formData}
                        isFarcaster={isMiniApp}
                      />
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 py-3"
                        onClick={() => navigate("/")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        onClick={() => {
                          if (
                            validateBasename(formData.basename) &&
                            formData.displayName.trim()
                          ) {
                            setCurrentStep(2);
                          } else {
                            toast.error("Please fill in all required fields");
                          }
                        }}
                        disabled={
                          !formData.basename ||
                          !formData.displayName ||
                          !!basenameError
                        }
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
               
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Additional Details
                      </h2>
                      <p className="text-gray-600">
                        Tell supporters more about yourself
                      </p>
                    </div>

                    <ModernInput
                      label="Bio"
                      value={formData.bio}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, bio: value }))
                      }
                      placeholder="Tell your story..."
                      helperText="What makes you unique?"
                      icon={FileText}
                      maxLength={500}
                    />

                    <ModernInput
                      label="Avatar URL"
                      value={formData.avatarUrl}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, avatarUrl: value }))
                      }
                      placeholder="https://example.com/avatar.jpg"
                      helperText="Link to your profile picture"
                      icon={LinkIcon}
                      type="url"
                    />

                    <ProfilePreview
                      creator={formData}
                      isFarcaster={isMiniApp}
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 py-3"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        onClick={() => setCurrentStep(3)}
                      >
                        Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Review & Create
                      </h2>
                      <p className="text-gray-600">
                        Almost there! Review your profile
                      </p>
                    </div>

                    <ProfilePreview
                      creator={formData}
                      isFarcaster={isMiniApp}
                    />

                    {/* Important Info */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Important Information
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Your username cannot be changed after registration
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          You can update other profile details anytime
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />A small gas
                          fee is required for registration
                        </li>
                        {isMiniApp && (
                          <li className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-500" />
                            Your Farcaster followers can easily find and tip you
                          </li>
                        )}
                      </ul>
                    </div>

                    {isSuccess && (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <h4 className="font-semibold text-green-600 flex items-center gap-2">
                          <Check className="h-5 w-5" />
                          Registration Successful!
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Redirecting to your dashboard...
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 py-3"
                        onClick={() => setCurrentStep(2)}
                        disabled={isPending || isConfirming || isSuccess}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                        disabled={isPending || isConfirming || isSuccess}
                      >
                        {isPending || isConfirming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isPending ? "Confirming..." : "Processing..."}
                          </>
                        ) : isSuccess ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Success!
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>


        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Instant Setup",
              description: "Get started in minutes with zero complexity",
              color: "from-yellow-500 to-orange-500",
            },
            {
              icon: Users,
              title: "Global Reach",
              description: "Accept tips from supporters worldwide",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Shield,
              title: "Secure & Safe",
              description: "Built on blockchain for maximum security",
              color: "from-green-500 to-emerald-500",
            },
          ].map((benefit, index) => (
            <Card
              key={index}
              className="border-0 bg-white/60 backdrop-blur-sm text-center"
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center`}
                >
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
