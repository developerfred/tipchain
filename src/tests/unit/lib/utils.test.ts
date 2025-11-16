import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cn,
  formatAmount,
  formatCurrency,
  parseAmount,
  shortenAddress,
  formatTimeAgo,
  formatDate,
  copyToClipboard,
  isValidAddress,
  truncateText,
  generateAvatarUrl,
  formatPercentage,
  safeJSONParse,
  formatEth,
  formatUSD,
  formatCompactNumber,
  isValidBasename,
  generateTipLink,
  debounce,
  sleep,
  generateIncentiveLore,
} from '@/lib/utils';
import { parseEther } from 'viem';

describe('Utils - Class merging', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'block')).toBe('base block');
  });

  it('should merge tailwind classes with conflicts', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2'); // twMerge should keep the last one
  });
});

describe('Utils - Amount formatting', () => {
  it('should format amount correctly', () => {
    const oneEth = parseEther('1');
    expect(formatAmount(oneEth)).toBe('1.0000');
  });

  it('should format small amounts', () => {
    const smallAmount = parseEther('0.0000001');
    expect(formatAmount(smallAmount)).toBe('< 0.0001');
  });

  it('should handle zero amount', () => {
    expect(formatAmount('0')).toBe('0');
  });

  it('should handle invalid amounts gracefully', () => {
    expect(formatAmount('invalid' as any)).toBe('0');
  });

  it('should format with custom decimals', () => {
    const amount = parseEther('1.23456789');
    expect(formatAmount(amount, 2)).toBe('1.23');
  });
});

describe('Utils - Currency formatting', () => {
  it('should format currency with symbol', () => {
    const amount = parseEther('1');
    expect(formatCurrency(amount, 'ETH')).toBe('1.0000 ETH');
  });

  it('should use default symbol', () => {
    const amount = parseEther('1');
    expect(formatCurrency(amount)).toBe('1.0000 CELO');
  });
});

describe('Utils - Amount parsing', () => {
  it('should parse amount to wei', () => {
    const result = parseAmount('1');
    expect(result).toBe(parseEther('1'));
  });

  it('should handle invalid input', () => {
    expect(parseAmount('invalid')).toBe(BigInt(0));
  });

  it('should parse decimal amounts', () => {
    const result = parseAmount('1.5');
    expect(result).toBe(parseEther('1.5'));
  });
});

describe('Utils - Address formatting', () => {
  it('should shorten address correctly', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenAddress(address)).toBe('0x1234...5678');
  });

  it('should handle empty address', () => {
    expect(shortenAddress('')).toBe('');
  });

  it('should return full address if too short', () => {
    const short = '0x1234';
    expect(shortenAddress(short)).toBe(short);
  });

  it('should use custom chars', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenAddress(address, 6)).toBe('0x123456...345678');
  });
});

describe('Utils - Time formatting', () => {
  it('should format recent time', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatTimeAgo(now)).toBe('Just now');
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should format hours ago', () => {
    const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
  });

  it('should format days ago', () => {
    const threeDaysAgo = Math.floor(Date.now() / 1000) - 259200;
    expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
  });

  it('should format months ago', () => {
    const twoMonthsAgo = Math.floor(Date.now() / 1000) - 5184000;
    expect(formatTimeAgo(twoMonthsAgo)).toBe('2mo ago');
  });

  it('should format years ago', () => {
    const oneYearAgo = Math.floor(Date.now() / 1000) - 31536000;
    expect(formatTimeAgo(oneYearAgo)).toBe('1y ago');
  });
});

describe('Utils - Date formatting', () => {
  it('should format date correctly', () => {
    const timestamp = 1609459200; // 2021-01-01 00:00:00 UTC
    const result = formatDate(timestamp);
    expect(result).toContain('Jan');
    expect(result).toContain('2021');
  });
});

describe('Utils - Clipboard', () => {
  it('should copy to clipboard successfully', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('test text');
  });
});

describe('Utils - Validation', () => {
  it('should validate correct address', () => {
    expect(isValidAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(
      true,
    );
  });

  it('should reject invalid address', () => {
    expect(isValidAddress('invalid')).toBe(false);
    expect(isValidAddress('0x123')).toBe(false);
    expect(isValidAddress('0xZZZZ567890abcdef1234567890abcdef12345678')).toBe(
      false,
    );
  });

  it('should validate basename format', () => {
    expect(isValidBasename('alice')).toBe(true);
    expect(isValidBasename('bob-123')).toBe(true);
    expect(isValidBasename('user-name-123')).toBe(true);
  });

  it('should reject invalid basenames', () => {
    expect(isValidBasename('A')).toBe(false); // too short
    expect(isValidBasename('AB')).toBe(false); // too short
    expect(isValidBasename('alice_bob')).toBe(false); // underscore not allowed
    expect(isValidBasename('Alice')).toBe(false); // uppercase not allowed
    expect(isValidBasename('-alice')).toBe(false); // can't start with hyphen
    expect(isValidBasename('alice-')).toBe(false); // can't end with hyphen
  });
});

describe('Utils - Text manipulation', () => {
  it('should truncate long text', () => {
    const long = 'This is a very long text that needs truncation';
    expect(truncateText(long, 10)).toBe('This is a ...');
  });

  it('should not truncate short text', () => {
    const short = 'Short';
    expect(truncateText(short, 10)).toBe('Short');
  });
});

describe('Utils - Avatar generation', () => {
  it('should generate avatar URL', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const url = generateAvatarUrl(address);
    expect(url).toContain('dicebear.com');
    expect(url).toContain(address);
  });
});

describe('Utils - Number formatting', () => {
  it('should format percentage', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%');
    expect(formatPercentage(0.5)).toBe('50.00%');
    expect(formatPercentage(1)).toBe('100.00%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercentage(0.1234, 1)).toBe('12.3%');
  });

  it('should format ETH values', () => {
    expect(formatEth(BigInt(1000000000000000000))).toBe('1.0000');
    expect(formatEth(BigInt(500000000000000000))).toBe('0.5000');
  });

  it('should format USD values', () => {
    expect(formatUSD(1234.56)).toBe('$1,234.56');
    expect(formatUSD(1000000)).toBe('$1,000,000.00');
  });

  it('should format compact numbers', () => {
    expect(formatCompactNumber(1234)).toBe('1.2K');
    expect(formatCompactNumber(1234567)).toBe('1.2M');
    expect(formatCompactNumber(1234567890)).toBe('1.2B');
    expect(formatCompactNumber(999)).toBe('999');
  });
});

describe('Utils - JSON parsing', () => {
  it('should parse valid JSON', () => {
    const result = safeJSONParse('{"key":"value"}', {});
    expect(result).toEqual({ key: 'value' });
  });

  it('should return fallback on invalid JSON', () => {
    const fallback = { default: true };
    const result = safeJSONParse('invalid json', fallback);
    expect(result).toEqual(fallback);
  });
});

describe('Utils - Link generation', () => {
  it('should generate tip link', () => {
    const link = generateTipLink('alice');
    expect(link).toContain('/tip/alice');
  });
});

describe('Utils - Debounce', () => {
  it('should debounce function calls', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    await sleep(150);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('Utils - Sleep', () => {
  it('should wait for specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small margin
  });
});

describe('Utils - Incentive Lore', () => {
  it('should generate lore text', () => {
    const lore = generateIncentiveLore();
    expect(lore.length).toBeLessThanOrEqual(100);
    expect(lore).toContain('by tipchain.aipop.fun');
  });

  it('should generate different lore on multiple calls', () => {
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      results.add(generateIncentiveLore());
    }
    // Should have at least some variety
    expect(results.size).toBeGreaterThan(1);
  });
});
