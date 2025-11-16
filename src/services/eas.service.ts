/**
 * Ethereum Attestation Service (EAS) Integration
 * Provides attestation functionality for TipChain
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { BrowserProvider, Signer } from 'ethers';
import {
  getEASAddress,
  TIPCHAIN_SCHEMAS,
  SCHEMA_DEFINITIONS,
  isEASSupported,
} from '@/config/eas.config';

export interface CreatorVerificationAttestation {
  creator: string;
  basename: string;
  isVerified: boolean;
  timestamp: number;
}

export interface TipReceiptAttestation {
  tipper: string;
  creator: string;
  amount: bigint;
  token: string;
  txHash: string;
  timestamp: number;
}

export interface CreatorReputationAttestation {
  creator: string;
  totalTips: number;
  totalAmount: bigint;
  supporterCount: number;
  score: number;
  timestamp: number;
}

export class EASService {
  private eas: EAS | null = null;
  private chainId: number;

  constructor(chainId: number) {
    this.chainId = chainId;
  }

  /**
   * Initialize EAS with signer
   */
  async initialize(signer: Signer): Promise<void> {
    const easAddress = getEASAddress(this.chainId);
    if (!easAddress) {
      throw new Error(`EAS not supported on chain ${this.chainId}`);
    }

    this.eas = new EAS(easAddress);
    this.eas.connect(signer);
  }

  /**
   * Create Creator Verification Attestation
   */
  async attestCreatorVerification(
    data: CreatorVerificationAttestation,
    recipient: string,
  ): Promise<string> {
    if (!this.eas) throw new Error('EAS not initialized');

    const schemaEncoder = new SchemaEncoder(
      SCHEMA_DEFINITIONS.CREATOR_VERIFICATION.schema,
    );

    const encodedData = schemaEncoder.encodeData([
      { name: 'creator', value: data.creator, type: 'address' },
      { name: 'basename', value: data.basename, type: 'string' },
      { name: 'isVerified', value: data.isVerified, type: 'bool' },
      { name: 'timestamp', value: data.timestamp, type: 'uint256' },
    ]);

    const tx = await this.eas.attest({
      schema: TIPCHAIN_SCHEMAS.CREATOR_VERIFICATION,
      data: {
        recipient,
        expirationTime: BigInt(0), // No expiration
        revocable: true,
        data: encodedData,
      },
    });

    const uid = await tx.wait();
    return uid;
  }

  /**
   * Create Tip Receipt Attestation
   */
  async attestTipReceipt(
    data: TipReceiptAttestation,
    recipient: string,
  ): Promise<string> {
    if (!this.eas) throw new Error('EAS not initialized');

    const schemaEncoder = new SchemaEncoder(
      SCHEMA_DEFINITIONS.TIP_RECEIPT.schema,
    );

    const encodedData = schemaEncoder.encodeData([
      { name: 'tipper', value: data.tipper, type: 'address' },
      { name: 'creator', value: data.creator, type: 'address' },
      { name: 'amount', value: data.amount, type: 'uint256' },
      { name: 'token', value: data.token, type: 'string' },
      { name: 'txHash', value: data.txHash, type: 'bytes32' },
      { name: 'timestamp', value: data.timestamp, type: 'uint256' },
    ]);

    const tx = await this.eas.attest({
      schema: TIPCHAIN_SCHEMAS.TIP_RECEIPT,
      data: {
        recipient,
        expirationTime: BigInt(0),
        revocable: false, // Tip receipts are permanent
        data: encodedData,
      },
    });

    const uid = await tx.wait();
    return uid;
  }

  /**
   * Create Creator Reputation Attestation
   */
  async attestCreatorReputation(
    data: CreatorReputationAttestation,
    recipient: string,
  ): Promise<string> {
    if (!this.eas) throw new Error('EAS not initialized');

    const schemaEncoder = new SchemaEncoder(
      SCHEMA_DEFINITIONS.CREATOR_REPUTATION.schema,
    );

    const encodedData = schemaEncoder.encodeData([
      { name: 'creator', value: data.creator, type: 'address' },
      { name: 'totalTips', value: data.totalTips, type: 'uint256' },
      { name: 'totalAmount', value: data.totalAmount, type: 'uint256' },
      { name: 'supporterCount', value: data.supporterCount, type: 'uint256' },
      { name: 'score', value: data.score, type: 'uint256' },
      { name: 'timestamp', value: data.timestamp, type: 'uint256' },
    ]);

    const tx = await this.eas.attest({
      schema: TIPCHAIN_SCHEMAS.CREATOR_REPUTATION,
      data: {
        recipient,
        expirationTime: BigInt(0),
        revocable: true, // Can be updated
        data: encodedData,
      },
    });

    const uid = await tx.wait();
    return uid;
  }

  /**
   * Get attestation by UID
   */
  async getAttestation(uid: string) {
    if (!this.eas) throw new Error('EAS not initialized');
    return await this.eas.getAttestation(uid);
  }

  /**
   * Revoke an attestation (if revocable)
   */
  async revokeAttestation(uid: string): Promise<void> {
    if (!this.eas) throw new Error('EAS not initialized');

    const tx = await this.eas.revoke({
      schema: TIPCHAIN_SCHEMAS.CREATOR_VERIFICATION, // Can be any schema
      data: {
        uid,
      },
    });

    await tx.wait();
  }

  /**
   * Check if chain supports EAS
   */
  static isSupported(chainId: number): boolean {
    return isEASSupported(chainId);
  }
}

/**
 * Create EAS service instance
 */
export function createEASService(chainId: number): EASService {
  return new EASService(chainId);
}
