import { useState, useEffect } from "react";
import {
  X,
  Zap,
  Heart,
  DollarSign,
  Loader2,
  ChevronDown,
  Check,
  AlertCircle,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { parseEther, parseUnits, encodeFunctionData, erc20Abi } from "viem";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  TIPCHAIN_ABI,
  getTipChainContractAddress,
  isNetworkSupported,
  getNetworkConfig,
  getSupportedTokens,
  type Token,
} from "../config/contracts";
import {
  appendReferralTag,
  submitDivviReferral,
  storeReferralData,
  isReferralEnabled,
} from "../lib/divvi";
import {
  CreatorSchema,
  TipFormSchema,
  type Creator,
  type TipFormData,
} from "../schemas/tipSchemas";
import { useGToken } from "../hooks/useGToken";

interface TipModalProps {
  creator: {
    address: string;
    basename: string;
    displayName: string;
    avatarUrl: string;
    isRegistered?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

export function TipModal({ creator, isOpen, onClose }: TipModalProps) {
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [currentContractAddress, setCurrentContractAddress] =
    useState<string>("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState<Token[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | null>(null);

  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const {
    balance: gTokenBalance,
    decimals: gTokenDecimals,
    isLoadingBalance,
  } = useGToken();

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<TipFormData>({
    resolver: zodResolver(TipFormSchema),
    mode: "onChange",
    defaultValues: {
      amount: "5",
      message: "",
      selectedToken: null,
      customAmount: false,
    },
  });

  const amount = watch("amount");
  const message = watch("message");
  const selectedToken = watch("selectedToken");
  const customAmount = watch("customAmount");

  useEffect(() => {
    if (chainId) {
      const isSupported = isNetworkSupported(chainId);
      setIsWrongNetwork(!isSupported);

      if (isSupported) {
        const contractAddress = getTipChainContractAddress(chainId);
        setCurrentContractAddress(contractAddress);

        const tokens = getSupportedTokens(chainId);
        setSupportedTokens(tokens);

        if (!selectedToken) {
          const defaultToken =
            tokens.find((t) => t.symbol === "G$") ||
            tokens.find((t) => t.symbol === "USDC") ||
            tokens.find((t) => t.isNative) ||
            tokens[0];
          setValue("selectedToken", defaultToken);
        }

        if (isReferralEnabled()) {
          console.log("✅ Divvi Referral tracking enabled");
        }
      } else {
        console.warn(`Network not supported: ${chainId}`);
        toast.error("Network not supported, change to Base or Celo");
      }
    }
  }, [chainId, chain, selectedToken, setValue]);

  useEffect(() => {
    if (isApprovalSuccess && approvalHash) {
      setIsApproving(false);
      setApprovalHash(null);
      toast.success("Token approved successfully!");
    }
  }, [isApprovalSuccess, approvalHash]);

  const handleApprove = async (
    token: Token,
    amountInUnits: bigint,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        writeContract(
          {
            address: token.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [currentContractAddress as `0x${string}`, amountInUnits],
          },
          {
            onSuccess: (hash) => {
              setApprovalHash(hash);
              toast.success("Approval transaction submitted");
              resolve(true);
            },
            onError: (error) => {
              console.error("Approval error:", error);
              setIsApproving(false);
              toast.error(`Approval failed: ${error.message}`);
              resolve(false);
            },
          },
        );
      } catch (error: any) {
        console.error("Approval error:", error);
        setIsApproving(false);
        toast.error(`Approval failed: ${error.message}`);
        resolve(false);
      }
    });
  };

  const handleTip = async (data: TipFormData) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (isWrongNetwork) {
      toast.error("Please switch to a supported network (Celo or Base)");
      return;
    }

    if (!currentContractAddress || !address || !data.selectedToken) {
      toast.error("Configuration error. Please try again.");
      return;
    }

    try {
      if (data.selectedToken.isNative) {
        const amountInWei = parseEther(data.amount);

        let tipData = encodeFunctionData({
          abi: TIPCHAIN_ABI,
          functionName: "tipETH",
          args: [creator.address as `0x${string}`, data.message || ""],
        });

        if (isReferralEnabled()) {
          tipData = appendReferralTag(tipData, address);
        }

        writeContract({
          address: currentContractAddress as `0x${string}`,
          abi: TIPCHAIN_ABI,
          functionName: "tipETH",
          args: [creator.address as `0x${string}`, data.message || ""],
          value: amountInWei,
        });
      } else {
        const amountInUnits = parseUnits(
          data.amount,
          data.selectedToken.decimals,
        );

        setIsApproving(true);

        const approvalSuccess = await handleApprove(
          data.selectedToken,
          amountInUnits,
        );

        if (!approvalSuccess) {
          setIsApproving(false);
          return;
        }

        while (isApprovalConfirming) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        let tipData = encodeFunctionData({
          abi: TIPCHAIN_ABI,
          functionName: "tipToken",
          args: [
            creator.address as `0x${string}`,
            data.selectedToken.address as `0x${string}`,
            amountInUnits,
            data.message || "",
          ],
        });

        if (isReferralEnabled()) {
          tipData = appendReferralTag(tipData, address);
        }

        writeContract({
          address: currentContractAddress as `0x${string}`,
          abi: TIPCHAIN_ABI,
          functionName: "tipToken",
          args: [
            creator.address as `0x${string}`,
            data.selectedToken.address as `0x${string}`,
            amountInUnits,
            data.message || "",
          ],
        });
      }

      toast.success("Transaction submitted!");
    } catch (error: any) {
      console.error("Tip error:", error);
      setIsApproving(false);
      toast.error(error.message || "Failed to send tip");
    }
  };

  useEffect(() => {
    const handleSuccess = async () => {
      if (isSuccess && hash && chainId && address) {
        if (isReferralEnabled()) {
          await submitDivviReferral(hash, chainId);
          storeReferralData({
            txHash: hash,
            chainId,
            userAddress: address,
            timestamp: Date.now(),
            submitted: true,
          });
        }

        toast.success(
          `Successfully tipped ${amount} ${selectedToken?.symbol} to ${creator.displayName}!`,
        );

        onClose();
        reset();
        setIsApproving(false);
      }
    };

    handleSuccess();
  }, [
    isSuccess,
    hash,
    chainId,
    address,
    amount,
    selectedToken,
    creator.displayName,
    onClose,
    reset,
  ]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isProcessing =
    isPending || isConfirming || isApproving || isApprovalConfirming;
  const platformFeeAmount = (parseFloat(amount || "0") * 0.025).toFixed(4);
  const totalAmount = parseFloat(amount || "0").toFixed(4);

  const isGToken = selectedToken?.symbol === "G$";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative bg-background shadow-xl border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg -z-10" />
        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-lg"
                />
              ) : (
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-2xl font-bold flex-shrink-0 border-2 border-white shadow-lg">
                  {creator.displayName[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg sm:text-xl bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tip {creator.displayName}
                </CardTitle>
                <CardDescription className="truncate">
                  @{creator.basename}
                </CardDescription>
                {isConnected && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div
                      className={`text-xs px-2 py-1 rounded-full border ${
                        isWrongNetwork
                          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {isWrongNetwork
                        ? "Unsupported Network"
                        : getShortNetworkName(chainId)}
                    </div>
                    {isReferralEnabled() && !isWrongNetwork && (
                      <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Divvi Enabled
                      </div>
                    )}
                    {isGToken && (
                      <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        GoodDollar
                      </div>
                    )}
                    {!creator.isRegistered && (
                      <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Not Registered
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 opacity-70 hover:opacity-100 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 disabled:pointer-events-none ml-2"
              disabled={isProcessing}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 pb-6">
          {!creator.isRegistered && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                </div>
                <div className="flex-1">
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                    Direct Wallet Transfer
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                    This creator hasn't fully registered yet. The tip will go
                    directly to their wallet address. They'll need to claim
                    their profile to access advanced features and analytics.
                  </p>
                  <div className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Funds go directly to wallet</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Creator can claim profile later</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isWrongNetwork && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                    Unsupported Network
                  </p>
                  <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                    Connected to {getCurrentNetworkName(chainId)}. Please switch
                    to Celo or Base to send tips.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGToken && isConnected && !isWrongNetwork && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  G
                </div>
                <div className="flex-1">
                  <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                    GoodDollar Token
                  </p>
                  <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                    {isLoadingBalance
                      ? "Loading balance..."
                      : `Your balance: ${gTokenBalance ? (Number(gTokenBalance) / Math.pow(10, gTokenDecimals)).toFixed(2) : "0.00"} G$`}
                  </p>
                  <a
                    href="https://www.gooddollar.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 dark:text-green-400 text-xs mt-2 flex items-center gap-1 hover:underline"
                  >
                    Learn more about GoodDollar
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit(handleTip)}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Token
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTokenSelector(!showTokenSelector)}
                  disabled={isWrongNetwork || !isConnected || isProcessing}
                  className="flex items-center justify-between w-full h-12 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {selectedToken ? (
                      <>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            isGToken
                              ? "bg-green-500"
                              : "bg-gradient-to-br from-blue-500 to-purple-600"
                          }`}
                        >
                          {selectedToken.symbol[0]}
                        </div>
                        <span className="font-medium">
                          {selectedToken.symbol}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {selectedToken.name}
                        </span>
                        {selectedToken.isNative && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Native
                          </span>
                        )}
                        {isGToken && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Universal Basic Income
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Select a token
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showTokenSelector ? "rotate-180" : ""}`}
                  />
                </button>

                {showTokenSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {supportedTokens.map((token) => (
                      <button
                        key={token.address}
                        type="button"
                        onClick={() => {
                          setValue("selectedToken", token);
                          setShowTokenSelector(false);
                        }}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            token.symbol === "G$"
                              ? "bg-green-500"
                              : "bg-gradient-to-br from-blue-500 to-purple-600"
                          }`}
                        >
                          {token.symbol[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {token.name}
                          </div>
                        </div>
                        {token.isNative && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Native
                          </span>
                        )}
                        {token.symbol === "G$" && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            UBI
                          </span>
                        )}
                        {selectedToken?.address === token.address && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.selectedToken && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.selectedToken.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Amount ({selectedToken?.symbol})
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AMOUNTS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={
                      amount === preset.toString() && !customAmount
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      setValue("amount", preset.toString());
                      setValue("customAmount", false);
                    }}
                    className="w-full h-10 text-sm transition-all"
                    disabled={isWrongNetwork || !isConnected || isProcessing}
                  >
                    {preset}
                  </Button>
                ))}
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step={isGToken ? "0.01" : "0.001"}
                  min="0"
                  placeholder={`Custom amount in ${selectedToken?.symbol}`}
                  {...register("amount")}
                  onFocus={() => setValue("customAmount", true)}
                  className="flex h-12 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  disabled={isWrongNetwork || !isConnected || isProcessing}
                />
              </div>
              {errors.amount && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a Message (Optional)
              </label>
              <textarea
                placeholder="Say something nice..."
                {...register("message")}
                maxLength={200}
                rows={2}
                className="flex w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
                disabled={isWrongNetwork || !isConnected || isProcessing}
              />
              <div className="flex justify-between mt-1">
                {errors.message && (
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.message.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {message?.length || 0}/200 characters
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {amount || "0"} {selectedToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Platform Fee (2.5%)
                </span>
                <span className="font-medium">
                  {platformFeeAmount} {selectedToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gas Fee</span>
                <span className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  FREE (Sponsored)
                </span>
              </div>
              {isReferralEnabled() && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Referral Tracking
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Divvi Enabled
                  </span>
                </div>
              )}
              {isGToken && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Social Impact</span>
                  <span className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    UBI Powered
                  </span>
                </div>
              )}
              {!creator.isRegistered && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Direct to Wallet
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-center font-semibold">
                <span>Total</span>
                <span className="text-lg">
                  {totalAmount} {selectedToken?.symbol}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 transition-all"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 h-12 transition-all shadow-lg hover:shadow-xl ${
                  isGToken
                    ? "bg-gradient-to-br from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    : "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                }`}
                disabled={
                  !isConnected ||
                  isWrongNetwork ||
                  isProcessing ||
                  !isValid ||
                  !currentContractAddress
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isApproving || isApprovalConfirming
                      ? "Approving..."
                      : isPending
                        ? "Confirming..."
                        : "Processing..."}
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    {isGToken ? "Send G$ Tip" : "Send Tip"}
                  </>
                )}
              </Button>
            </div>
          </form>

          {!isConnected && (
            <p className="text-sm text-center text-muted-foreground">
              Connect your wallet to send a tip
            </p>
          )}

          {isConnected && isWrongNetwork && (
            <p className="text-sm text-center text-red-600 font-medium">
              Switch to Celo or Base network to send tips
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getCurrentNetworkName(chainId: number | undefined): string {
  if (!chainId) return "";
  const networkConfig = getNetworkConfig(chainId);
  return networkConfig?.name || "Unknown Network";
}

function getShortNetworkName(chainId: number | undefined): string {
  if (!chainId) return "";
  const networkConfig = getNetworkConfig(chainId);
  if (networkConfig?.name.includes("Celo")) return "Celo";
  if (networkConfig?.name.includes("Base")) return "Base";
  return networkConfig?.name || "Unknown";
}
