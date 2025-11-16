/**
 * Self.xyz KYC Verification Component
 * Integrated identity verification using Self.xyz
 */

import { useState } from 'react';
import { SelfService, VerificationType } from '@/services/self.service';

const selfService = new SelfService();

interface SelfKYCVerificationProps {
  onVerificationComplete?: (verificationType: VerificationType, verified: boolean) => void;
}

export function SelfKYCVerification({ onVerificationComplete }: SelfKYCVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<Record<VerificationType, boolean | null>>({
    age: null,
    country: null,
    identity: null,
    accreditation: null,
  });

  const handleVerify = async (type: VerificationType) => {
    setLoading(true);

    try {
      const result = await selfService.initializeVerification(type);

      if (result.success && result.verificationId) {
        // In production, redirect to Self.xyz verification flow
        console.log('Verification initiated:', result.verificationId);

        // Simulate verification (in production, this would be a callback)
        setTimeout(async () => {
          const status = await selfService.getVerificationStatus(result.verificationId!);

          setVerificationStatus((prev) => ({
            ...prev,
            [type]: status?.verified || false,
          }));

          onVerificationComplete?.(type, status?.verified || false);
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Identity Verification</h3>
        <p className="mb-6 text-sm text-gray-600">
          Verify your identity using Self.xyz zero-knowledge proofs. Your data stays private.
        </p>

        <div className="space-y-3">
          <VerificationButton
            type="age"
            label="Age Verification"
            description="Verify you're 18+ without revealing your age"
            status={verificationStatus.age}
            onVerify={handleVerify}
            loading={loading}
          />

          <VerificationButton
            type="country"
            label="Country Verification"
            description="Verify your country of residence"
            status={verificationStatus.country}
            onVerify={handleVerify}
            loading={loading}
          />

          <VerificationButton
            type="identity"
            label="Full Identity Verification"
            description="Complete KYC verification"
            status={verificationStatus.identity}
            onVerify={handleVerify}
            loading={loading}
          />

          <VerificationButton
            type="accreditation"
            label="Accredited Investor"
            description="Verify accredited investor status"
            status={verificationStatus.accreditation}
            onVerify={handleVerify}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

interface VerificationButtonProps {
  type: VerificationType;
  label: string;
  description: string;
  status: boolean | null;
  onVerify: (type: VerificationType) => void;
  loading: boolean;
}

function VerificationButton({
  type,
  label,
  description,
  status,
  onVerify,
  loading,
}: VerificationButtonProps) {
  const getStatusColor = () => {
    if (status === null) return 'border-gray-200 bg-gray-50';
    if (status) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  const getButtonText = () => {
    if (loading) return 'Verifying...';
    if (status === null) return 'Verify';
    if (status) return 'Verified ✓';
    return 'Failed ✗';
  };

  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <button
        onClick={() => onVerify(type)}
        disabled={loading || status === true}
        className={`ml-4 rounded-lg px-4 py-2 font-medium transition-colors ${
          status === true
            ? 'bg-green-600 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
