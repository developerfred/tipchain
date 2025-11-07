# 🎁 TipChain - Support Creators. Zero Friction.

> Multi-chain tipping platform built with Reown AppKit and Base L2

**Built for:**

- 🏆 Base Batch 002 - Builder Track
- 🏆 Reown AppKit Competition

## 🌟 Overview

TipChain creator monetization by removing all friction from crypto tipping. Support your favorite creators across any blockchain with just a few clicks - no wallet setup, no gas fees, no complexity.

### Key Features

- **🔐 Social Login**: Login with Google, email, or social accounts (no seed phrases!)
- **⛽ Gas Sponsorship**: Zero gas fees for all users
- **🌐 Multi-Chain**: Support Base, Ethereum, Solana, Bitcoin, and more
- **💸 Easy Payments**: Pay with card, crypto, or any token
- **📱 Share Anywhere**: QR codes and shareable links
- **🆔 Basenames**: Get your own username.base.eth identity
- **🔄 Auto Swaps**: Automatic token conversion
- **💳 On-Ramp**: Buy crypto with fiat directly in-app

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- Metamask or any Web3 wallet (for deployment only)

### Installation

```bash
# Clone the repository
git clone https://github.com/developerfred/tipchain.git
cd tipchain

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Setup

Get your Reown Project ID from [cloud.reown.com](https://cloud.reown.com) and add to `.env.local`:

```env
VITE_REOWN_PROJECT_ID=your_project_id_here
VITE_BASE_MAINNET_RPC=https://mainnet.base.org
VITE_BASE_TESTNET_RPC=https://sepolia.base.org
VITE_APP_URL=http://localhost:5173
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!
