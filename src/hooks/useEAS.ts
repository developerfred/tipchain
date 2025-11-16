/**
 * React hooks for Ethereum Attestation Service (EAS)
 */

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import {
  EASService,
  createEASService,
  type CreatorVerificationAttestation,
  type TipReceiptAttestation,
  type CreatorReputationAttestation,
} from '@/services/eas.service';
import toast from 'react-hot-toast';

/**
 * Main hook for EAS functionality
 */
export function useEAS() {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [easService, setEasService] = useState<EASService | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize EAS service when wallet is connected
  useEffect(() => {
    async function initializeEAS() {
      if (!walletClient || !chainId) {
        setEasService(null);
        return;
      }

      if (!EASService.isSupported(chainId)) {
        console.warn(`EAS not supported on chain ${chainId}`);
        setEasService(null);
        return;
      }

      setIsInitializing(true);
      try {
        const provider = new BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();

        const service = createEASService(chainId);
        await service.initialize(signer);
        setEasService(service);
      } catch (error) {
        console.error('Failed to initialize EAS:', error);
        toast.error('Failed to initialize attestation service');
      } finally {
        setIsInitializing(false);
      }
    }

    initializeEAS();
  }, [walletClient, chainId]);

  /**
   * Create creator verification attestation
   */
  const attestCreatorVerification = useCallback(
    async (
      data: CreatorVerificationAttestation,
      recipient: string,
    ): Promise<string | null> => {
      if (!easService) {
        toast.error('Attestation service not available');
        return null;
      }

      try {
        toast.loading('Creating verification attestation...');
        const uid = await easService.attestCreatorVerification(data, recipient);
        toast.dismiss();
        toast.success('Verification attestation created!');
        return uid;
      } catch (error) {
        toast.dismiss();
        console.error('Failed to create verification attestation:', error);
        toast.error('Failed to create attestation');
        return null;
      }
    },
    [easService],
  );

  /**
   * Create tip receipt attestation
   */
  const attestTipReceipt = useCallback(
    async (
      data: TipReceiptAttestation,
      recipient: string,
    ): Promise<string | null> => {
      if (!easService) {
        console.warn('Attestation service not available');
        return null;
      }

      try {
        const uid = await easService.attestTipReceipt(data, recipient);
        console.log('Tip receipt attestation created:', uid);
        return uid;
      } catch (error) {
        console.error('Failed to create tip receipt attestation:', error);
        // Don't show error toast for tip receipts to avoid disrupting UX
        return null;
      }
    },
    [easService],
  );

  /**
   * Create creator reputation attestation
   */
  const attestCreatorReputation = useCallback(
    async (
      data: CreatorReputationAttestation,
      recipient: string,
    ): Promise<string | null> => {
      if (!easService) {
        toast.error('Attestation service not available');
        return null;
      }

      try {
        toast.loading('Updating reputation attestation...');
        const uid = await easService.attestCreatorReputation(data, recipient);
        toast.dismiss();
        toast.success('Reputation updated!');
        return uid;
      } catch (error) {
        toast.dismiss();
        console.error('Failed to create reputation attestation:', error);
        toast.error('Failed to update reputation');
        return null;
      }
    },
    [easService],
  );

  /**
   * Get attestation by UID
   */
  const getAttestation = useCallback(
    async (uid: string) => {
      if (!easService) return null;

      try {
        return await easService.getAttestation(uid);
      } catch (error) {
        console.error('Failed to get attestation:', error);
        return null;
      }
    },
    [easService],
  );

  /**
   * Revoke an attestation
   */
  const revokeAttestation = useCallback(
    async (uid: string): Promise<boolean> => {
      if (!easService) {
        toast.error('Attestation service not available');
        return false;
      }

      try {
        toast.loading('Revoking attestation...');
        await easService.revokeAttestation(uid);
        toast.dismiss();
        toast.success('Attestation revoked!');
        return true;
      } catch (error) {
        toast.dismiss();
        console.error('Failed to revoke attestation:', error);
        toast.error('Failed to revoke attestation');
        return false;
      }
    },
    [easService],
  );

  const isSupported = chainId ? EASService.isSupported(chainId) : false;

  return {
    easService,
    isInitializing,
    isSupported,
    isReady: !!easService && !isInitializing,
    attestCreatorVerification,
    attestTipReceipt,
    attestCreatorReputation,
    getAttestation,
    revokeAttestation,
  };
}
