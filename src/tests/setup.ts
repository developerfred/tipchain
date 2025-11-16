import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock Web3 providers
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: undefined, isConnected: false })),
  useConnect: vi.fn(() => ({ connect: vi.fn(), connectors: [] })),
  useDisconnect: vi.fn(() => ({ disconnect: vi.fn() })),
  useBalance: vi.fn(() => ({ data: undefined })),
  useContractRead: vi.fn(() => ({ data: undefined })),
  useContractWrite: vi.fn(() => ({ write: vi.fn() })),
}));

// Mock Reown AppKit
vi.mock('@reown/appkit/react', () => ({
  useAppKit: vi.fn(() => ({
    open: vi.fn(),
    close: vi.fn(),
  })),
  useAppKitAccount: vi.fn(() => ({
    address: undefined,
    isConnected: false,
  })),
}));
