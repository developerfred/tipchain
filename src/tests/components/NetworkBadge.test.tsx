import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkBadge } from '@/components/NetworkBadge';

// Mock the useNetworkInfo hook
vi.mock('@/hooks/useCreators', () => ({
  useNetworkInfo: vi.fn((chainId: number) => {
    const networks: Record<number, any> = {
      8453: {
        // Base Mainnet
        name: 'Base',
        shortName: 'Base',
        color: 'bg-blue-600',
      },
      84532: {
        // Base Sepolia
        name: 'Base Sepolia',
        shortName: 'Base',
        color: 'bg-blue-400',
      },
      42220: {
        // Celo Mainnet
        name: 'Celo',
        shortName: 'CELO',
        color: 'bg-green-500',
      },
      44787: {
        // Celo Alfajores
        name: 'Celo Alfajores',
        shortName: 'CELO',
        color: 'bg-green-300',
      },
      10: {
        // Optimism
        name: 'Optimism',
        shortName: 'OP',
        color: 'bg-red-500',
      },
    };
    return networks[chainId] || null;
  }),
}));

describe('NetworkBadge Component', () => {
  it('should render network badge for Base mainnet', () => {
    render(<NetworkBadge chainId={8453} />);
    expect(screen.getByText('Base')).toBeInTheDocument();
  });

  it('should render network badge for Celo mainnet', () => {
    render(<NetworkBadge chainId={42220} />);
    expect(screen.getByText('CELO')).toBeInTheDocument();
  });

  it('should render network badge for Optimism', () => {
    render(<NetworkBadge chainId={10} />);
    expect(screen.getByText('OP')).toBeInTheDocument();
  });

  it('should render short name by default', () => {
    render(<NetworkBadge chainId={84532} />);
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.queryByText('Base Sepolia')).not.toBeInTheDocument();
  });

  it('should render full name when showFullName is true', () => {
    render(<NetworkBadge chainId={84532} showFullName={true} />);
    expect(screen.getByText('Base Sepolia')).toBeInTheDocument();
  });

  it('should render with small size by default', () => {
    render(<NetworkBadge chainId={8453} />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('px-2');
  });

  it('should render with medium size', () => {
    render(<NetworkBadge chainId={8453} size="md" />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('text-sm');
    expect(badge).toHaveClass('px-2.5');
  });

  it('should render with large size', () => {
    render(<NetworkBadge chainId={8453} size="lg" />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('text-base');
    expect(badge).toHaveClass('px-3');
  });

  it('should have correct color classes', () => {
    render(<NetworkBadge chainId={8453} />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('bg-blue-600');
  });

  it('should have title attribute with network name', () => {
    render(<NetworkBadge chainId={8453} />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveAttribute('title', 'Base');
  });

  it('should return null for unknown chain ID', () => {
    const { container } = render(<NetworkBadge chainId={99999} />);
    expect(container.firstChild).toBeNull();
  });

  it('should have rounded-full class', () => {
    render(<NetworkBadge chainId={8453} />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('rounded-full');
  });

  it('should have text-white class', () => {
    render(<NetworkBadge chainId={8453} />);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('text-white');
  });
});
