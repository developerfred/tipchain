/**
 * Batch Attestations Service
 * Gas optimization for creating multiple attestations in a single transaction
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import type { Signer } from 'ethers';
import { EAS_CONTRACT_ADDRESSES, TIPCHAIN_SCHEMAS } from '@/config/eas.config';

export interface BatchAttestationInput {
  schema: string;
  data: {
    recipient: `0x${string}`;
    data: Record<string, unknown>;
    expirationTime?: bigint;
    revocable?: boolean;
  }[];
}

export class BatchAttestationsService {
  private eas: EAS | null = null;
  private chainId: number;

  constructor(chainId: number) {
    this.chainId = chainId;
  }

  async initialize(signer: Signer): Promise<void> {
    const easAddress = EAS_CONTRACT_ADDRESSES[this.chainId];
    if (!easAddress) {
      throw new Error(`EAS not supported on chain ${this.chainId}`);
    }

    this.eas = new EAS(easAddress);
    this.eas.connect(signer);
  }

  /**
   * Create multiple attestations in a single transaction
   * Saves ~60-70% gas compared to individual attestations
   */
  async batchAttest(inputs: BatchAttestationInput[]): Promise<string[]> {
    if (!this.eas) {
      throw new Error('EAS not initialized');
    }

    const attestationRequests = inputs.flatMap(({ schema, data }) => {
      return data.map((item) => {
        const schemaEncoder = new SchemaEncoder(schema);
        const encodedData = schemaEncoder.encodeData(
          Object.entries(item.data).map(([name, value]) => ({
            name,
            value,
            type: typeof value === 'string' ? 'string' : 'uint256',
          }))
        );

        return {
          schema,
          data: {
            recipient: item.recipient,
            expirationTime: item.expirationTime || 0n,
            revocable: item.revocable ?? true,
            data: encodedData,
          },
        };
      });
    });

    const tx = await this.eas.multiAttest(attestationRequests);
    const receipt = await tx.wait();

    // Extract attestation UIDs from receipt
    return receipt.logs.map((log: any) => log.uid || '');
  }

  /**
   * Batch attest tip receipts (optimized for bulk tipping)
   */
  async batchAttestTipReceipts(
    tips: Array<{
      recipient: `0x${string}`;
      sender: `0x${string}`;
      amount: string;
      token: string;
      network: string;
      txHash: string;
    }>
  ): Promise<string[]> {
    const schema = TIPCHAIN_SCHEMAS.TIP_RECEIPT;
    const schemaDefinition =
      'address sender, address recipient, string amount, string token, string network, string txHash, uint256 timestamp';

    const data = tips.map((tip) => ({
      recipient: tip.recipient,
      data: {
        sender: tip.sender,
        recipient: tip.recipient,
        amount: tip.amount,
        token: tip.token,
        network: tip.network,
        txHash: tip.txHash,
        timestamp: Math.floor(Date.now() / 1000),
      },
    }));

    return this.batchAttest([{ schema: schemaDefinition, data }]);
  }

  /**
   * Batch verify creator attestations
   */
  async batchVerifyCreators(
    creators: Array<{
      address: `0x${string}`;
      verifiedAt: number;
      verifiedBy: `0x${string}`;
    }>
  ): Promise<string[]> {
    const schema = TIPCHAIN_SCHEMAS.CREATOR_VERIFICATION;
    const schemaDefinition =
      'address creator, uint256 verifiedAt, address verifiedBy, bool isVerified';

    const data = creators.map((creator) => ({
      recipient: creator.address,
      data: {
        creator: creator.address,
        verifiedAt: creator.verifiedAt,
        verifiedBy: creator.verifiedBy,
        isVerified: true,
      },
    }));

    return this.batchAttest([{ schema: schemaDefinition, data }]);
  }

  /**
   * Estimate gas savings from batch vs individual attestations
   */
  estimateGasSavings(count: number): { individual: bigint; batch: bigint; savings: string } {
    // Rough estimates based on EAS gas usage
    const individualGas = BigInt(100000 * count); // ~100k gas per attestation
    const batchGas = BigInt(50000 + 35000 * count); // ~50k base + 35k per attestation

    const savings = ((1 - Number(batchGas) / Number(individualGas)) * 100).toFixed(1);

    return {
      individual: individualGas,
      batch: batchGas,
      savings: `${savings}%`,
    };
  }
}

/**
 * Create batch attestations service
 */
export function createBatchAttestationsService(chainId: number): BatchAttestationsService {
  return new BatchAttestationsService(chainId);
}
