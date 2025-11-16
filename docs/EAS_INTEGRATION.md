# Ethereum Attestation Service (EAS) Integration

TipChain integrates with the Ethereum Attestation Service to provide on-chain, verifiable attestations for creators and tips.

## Overview

EAS allows TipChain to create immutable, on-chain attestations for:

1. **Creator Verification** - Verify legitimate creators
2. **Tip Receipts** - Permanent on-chain receipts for all tips
3. **Creator Reputation** - On-chain reputation scores

## Supported Networks

- ✅ Base Mainnet (Chain ID: 8453)
- ✅ Base Sepolia (Chain ID: 84532)
- ✅ Optimism Mainnet (Chain ID: 10)

## Schema Definitions

### Creator Verification Schema

```solidity
schema: "address creator, string basename, bool isVerified, uint256 timestamp"
```

Used to attest that a creator profile is legitimate and verified.

### Tip Receipt Schema

```solidity
schema: "address tipper, address creator, uint256 amount, string token, bytes32 txHash, uint256 timestamp"
```

Creates a permanent, immutable record of every tip transaction.

### Creator Reputation Schema

```solidity
schema: "address creator, uint256 totalTips, uint256 totalAmount, uint256 supporterCount, uint256 score, uint256 timestamp"
```

Tracks and attests to a creator's on-chain reputation.

## Usage

### Using the EAS Hook

```typescript
import { useEAS } from '@/hooks/useEAS';

function MyComponent() {
  const {
    isSupported,
    isReady,
    attestCreatorVerification,
    attestTipReceipt,
    getAttestation,
  } = useEAS();

  // Check if EAS is supported on current chain
  if (!isSupported) {
    return <div>EAS not supported on this network</div>;
  }

  // Create a creator verification attestation
  const handleVerify = async () => {
    const uid = await attestCreatorVerification(
      {
        creator: '0x...',
        basename: 'alice',
        isVerified: true,
        timestamp: Date.now(),
      },
      '0x...', // recipient address
    );

    console.log('Attestation UID:', uid);
  };
}
```

### Using Attestation Badges

```typescript
import {
  VerifiedCreatorBadge,
  TipReceiptBadge,
  ReputationBadge,
} from '@/components/AttestationBadge';

function CreatorProfile() {
  return (
    <div>
      <h1>Alice</h1>
      <VerifiedCreatorBadge uid="0x..." />
      <ReputationBadge uid="0x..." />
    </div>
  );
}
```

## Integration Points

### 1. Creator Registration

When a creator registers, optionally create a verification attestation:

```typescript
// After successful creator registration
const uid = await attestCreatorVerification(
  {
    creator: creatorAddress,
    basename: creatorBasename,
    isVerified: true,
    timestamp: Math.floor(Date.now() / 1000),
  },
  creatorAddress,
);
```

### 2. Tip Transactions

After each successful tip, create a tip receipt attestation:

```typescript
// After tip transaction confirms
const uid = await attestTipReceipt(
  {
    tipper: tipperAddress,
    creator: creatorAddress,
    amount: tipAmount,
    token: 'ETH',
    txHash: transactionHash,
    timestamp: Math.floor(Date.now() / 1000),
  },
  creatorAddress,
);
```

### 3. Reputation Updates

Periodically update creator reputation attestations:

```typescript
// Calculate reputation score
const score = calculateReputationScore(creator);

const uid = await attestCreatorReputation(
  {
    creator: creatorAddress,
    totalTips: creator.tipCount,
    totalAmount: creator.totalAmountReceived,
    supporterCount: creator.supporterCount,
    score,
    timestamp: Math.floor(Date.now() / 1000),
  },
  creatorAddress,
);
```

## Configuration

Edit `/src/config/eas.config.ts` to update:

- Contract addresses for new chains
- Schema UIDs (after registering schemas)
- Schema definitions

## Schema Registration

To register TipChain schemas on a new network:

1. Visit [https://base.easscan.org/](https://base.easscan.org/)
2. Connect wallet on target network
3. Go to "Create Schema"
4. Register each schema using definitions from `SCHEMA_DEFINITIONS`
5. Update `TIPCHAIN_SCHEMAS` with the returned UIDs

## Viewing Attestations

All attestations can be viewed on EAS Explorer:

- **Base**: https://base.easscan.org/
- **Optimism**: https://optimism.easscan.org/

Click any attestation badge in the UI to view it on the explorer.

## Benefits

1. **Trust & Verification** - On-chain proof of creator authenticity
2. **Transparency** - Public, verifiable record of all tips
3. **Reputation** - Portable, on-chain reputation across platforms
4. **Permanence** - Immutable records that can't be manipulated
5. **Composability** - Other dApps can read and trust TipChain attestations

## Future Enhancements

- [ ] Batch attestations for gas optimization
- [ ] Delegated attestations for gasless UX
- [ ] Additional schema types (endorsements, milestones, etc.)
- [ ] Attestation-based rewards and achievements
- [ ] Cross-chain attestation verification
