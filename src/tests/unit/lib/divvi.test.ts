import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateReferralTag,
  submitDivviReferral,
  isReferralEnabled,
  appendReferralTag,
  storeReferralData,
  getReferralData,
  DIVVI_CONSUMER_ADDRESS,
  type ReferralData,
} from '@/lib/divvi';

// Mock the Divvi SDK
vi.mock('@divvi/referral-sdk', () => ({
  getReferralTag: vi.fn((params) => {
    return `0x${params.user.slice(2, 10)}${params.consumer.slice(2, 10)}` as `0x${string}`;
  }),
  submitReferral: vi.fn(),
}));

describe('Divvi - Configuration', () => {
  it('should have consumer address configured', () => {
    expect(DIVVI_CONSUMER_ADDRESS).toBeDefined();
    expect(DIVVI_CONSUMER_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});

describe('Divvi - Referral Tag Generation', () => {
  it('should generate referral tag', () => {
    const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const tag = generateReferralTag(userAddress);
    expect(tag).toMatch(/^0x/);
  });

  it('should handle errors gracefully', async () => {
    const { getReferralTag } = await import('@divvi/referral-sdk');
    vi.mocked(getReferralTag).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const tag = generateReferralTag('0x123');
    expect(tag).toBe('0x');
  });
});

describe('Divvi - Referral Submission', () => {
  it('should submit referral successfully', async () => {
    const { submitReferral } = await import('@divvi/referral-sdk');
    vi.mocked(submitReferral).mockResolvedValueOnce(undefined);

    await expect(
      submitDivviReferral(
        '0xabc123',
        84532, // Base Sepolia
      ),
    ).resolves.not.toThrow();

    expect(submitReferral).toHaveBeenCalledWith({
      txHash: '0xabc123',
      chainId: 84532,
    });
  });

  it('should handle submission errors gracefully', async () => {
    const { submitReferral } = await import('@divvi/referral-sdk');
    vi.mocked(submitReferral).mockRejectedValueOnce(
      new Error('Network error'),
    );

    // Should not throw even on error
    await expect(
      submitDivviReferral('0xabc123', 84532),
    ).resolves.not.toThrow();
  });
});

describe('Divvi - Referral Enabled Check', () => {
  it('should return true when consumer address is valid', () => {
    expect(isReferralEnabled()).toBe(true);
  });
});

describe('Divvi - Referral Data Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should store referral data', () => {
    const data: ReferralData = {
      txHash: '0xabc123',
      chainId: 84532,
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: Date.now(),
      submitted: true,
    };

    storeReferralData(data);

    const stored = getReferralData();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(data);
  });

  it('should limit stored referrals to 100', () => {
    // Store 150 referrals
    for (let i = 0; i < 150; i++) {
      storeReferralData({
        txHash: `0x${i}`,
        chainId: 84532,
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: Date.now(),
        submitted: true,
      });
    }

    const stored = getReferralData();
    expect(stored).toHaveLength(100);
    // Should keep the last 100
    expect(stored[0].txHash).toBe('0x50');
  });

  it('should handle storage errors', () => {
    // Mock localStorage to throw error
    const setItemMock = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage full');
      });

    const data: ReferralData = {
      txHash: '0xabc123',
      chainId: 84532,
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: Date.now(),
      submitted: true,
    };

    // Should not throw
    expect(() => storeReferralData(data)).not.toThrow();

    setItemMock.mockRestore();
  });

  it('should return empty array on get errors', () => {
    const getItemMock = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Storage error');
      });

    const result = getReferralData();
    expect(result).toEqual([]);

    getItemMock.mockRestore();
  });

  it('should return empty array when no data stored', () => {
    const result = getReferralData();
    expect(result).toEqual([]);
  });
});
