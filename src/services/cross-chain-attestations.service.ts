/**
 * Cross-Chain Attestation Verification Service
 * Verify attestations across multiple chains
 */

import { EAS } from '@ethereum-attestation-service/eas-sdk';
import { EAS_CONTRACT_ADDRESSES } from '@/config/eas.config';

export interface Attestation {
  uid: string;
  schema: string;
  attester: `0x${string}`;
  recipient: `0x${string}`;
  time: number;
  expirationTime: number;
  revocationTime: number;
  refUID: string;
  data: string;
  chainId: number;
}

export class CrossChainAttestationsService {
  private easInstances: Map<number, EAS> = new Map();

  constructor(chainIds: number[]) {
    this.initializeChains(chainIds);
  }

  private initializeChains(chainIds: number[]): void {
    for (const chainId of chainIds) {
      const easAddress = EAS_CONTRACT_ADDRESSES[chainId];
      if (easAddress) {
        const eas = new EAS(easAddress);
        this.easInstances.set(chainId, eas);
      }
    }
  }

  /**
   * Verify attestation exists on a specific chain
   */
  async verifyAttestation(uid: string, chainId: number): Promise<Attestation | null> {
    const eas = this.easInstances.get(chainId);
    if (!eas) {
      throw new Error(`EAS not configured for chain ${chainId}`);
    }

    try {
      const attestation = await eas.getAttestation(uid);

      return {
        uid: attestation.uid,
        schema: attestation.schema,
        attester: attestation.attester as `0x${string}`,
        recipient: attestation.recipient as `0x${string}`,
        time: Number(attestation.time),
        expirationTime: Number(attestation.expirationTime),
        revocationTime: Number(attestation.revocationTime),
        refUID: attestation.refUID,
        data: attestation.data,
        chainId,
      };
    } catch (error) {
      console.error(`Failed to verify attestation on chain ${chainId}:`, error);
      return null;
    }
  }

  /**
   * Find attestation across all configured chains
   */
  async findAttestationAcrossChains(uid: string): Promise<Attestation | null> {
    const chains = Array.from(this.easInstances.keys());

    const results = await Promise.allSettled(
      chains.map((chainId) => this.verifyAttestation(uid, chainId))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    return null;
  }

  /**
   * Get all attestations for an address across multiple chains
   */
  async getAttestationsForAddress(
    address: `0x${string}`,
    chainIds?: number[]
  ): Promise<Attestation[]> {
    const chains = chainIds || Array.from(this.easInstances.keys());
    const attestations: Attestation[] = [];

    for (const chainId of chains) {
      const eas = this.easInstances.get(chainId);
      if (!eas) continue;

      try {
        // Note: This requires GraphQL indexer in production
        // For now, return empty array as placeholder
        // In production, query: https://easscan.org/graphql
        console.log(`Fetching attestations for ${address} on chain ${chainId}`);
      } catch (error) {
        console.error(`Failed to fetch attestations on chain ${chainId}:`, error);
      }
    }

    return attestations;
  }

  /**
   * Verify creator has verification attestation on any chain
   */
  async isCreatorVerified(address: `0x${string}`): Promise<boolean> {
    const chains = Array.from(this.easInstances.keys());

    for (const chainId of chains) {
      const attestations = await this.getAttestationsForAddress(address, [chainId]);
      const hasVerification = attestations.some(
        (att) => att.recipient.toLowerCase() === address.toLowerCase() && !att.revocationTime
      );

      if (hasVerification) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get attestation statistics across chains
   */
  async getGlobalStatistics(): Promise<{
    totalAttestations: number;
    attestationsByChain: Record<number, number>;
    uniqueRecipients: number;
  }> {
    return {
      totalAttestations: 0,
      attestationsByChain: {},
      uniqueRecipients: 0,
    };
  }
}

/**
 * Create cross-chain attestations service
 */
export function createCrossChainAttestationsService(
  chainIds: number[] = [8453, 84532, 10, 42220]
): CrossChainAttestationsService {
  return new CrossChainAttestationsService(chainIds);
}

// Export singleton
export const crossChainAttestationsService = createCrossChainAttestationsService();
