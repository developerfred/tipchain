import React from 'react';
import { ShieldCheck, FileCheck, Award } from 'lucide-react';
import { Badge } from './ui/Badge';

export type AttestationType =
  | 'creator_verification'
  | 'tip_receipt'
  | 'reputation';

interface AttestationBadgeProps {
  type: AttestationType;
  uid?: string;
  onClick?: () => void;
  showUid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AttestationBadge({
  type,
  uid,
  onClick,
  showUid = false,
  size = 'md',
}: AttestationBadgeProps) {
  const config = {
    creator_verification: {
      icon: ShieldCheck,
      label: 'Verified',
      variant: 'success' as const,
      color: 'text-green-600',
    },
    tip_receipt: {
      icon: FileCheck,
      label: 'Attested',
      variant: 'default' as const,
      color: 'text-blue-600',
    },
    reputation: {
      icon: Award,
      label: 'Reputation',
      variant: 'secondary' as const,
      color: 'text-purple-600',
    },
  };

  const { icon: Icon, label, variant, color } = config[type];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (uid) {
      // Open EAS explorer
      window.open(`https://base.easscan.org/attestation/view/${uid}`, '_blank');
    }
  };

  return (
    <Badge
      variant={variant}
      className={`${sizeClasses[size]} inline-flex cursor-pointer items-center gap-1 transition-all hover:opacity-80`}
      onClick={handleClick}
      title={uid ? `View attestation: ${uid}` : 'Attestation'}
    >
      <Icon size={iconSizes[size]} className={color} />
      {label}
      {showUid && uid && (
        <span className="ml-1 font-mono text-xs opacity-70">
          {uid.slice(0, 6)}...{uid.slice(-4)}
        </span>
      )}
    </Badge>
  );
}

/**
 * Component to display when creator is verified via attestation
 */
export function VerifiedCreatorBadge({ uid }: { uid?: string }) {
  return <AttestationBadge type="creator_verification" uid={uid} />;
}

/**
 * Component to display tip receipt attestation
 */
export function TipReceiptBadge({ uid }: { uid?: string }) {
  return <AttestationBadge type="tip_receipt" uid={uid} size="sm" />;
}

/**
 * Component to display reputation attestation
 */
export function ReputationBadge({ uid }: { uid?: string }) {
  return <AttestationBadge type="reputation" uid={uid} />;
}
