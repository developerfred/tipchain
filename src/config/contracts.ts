export enum SupportedNetworks {
  CELO = "celo",
  CELO_ALFAJORES = "celo-alfajores",
  BASE = "base",
  BASE_SEPOLIA = "base-sepolia",
  MONAD_TESTNET = "monad-testnet",
  SCROLL_SEPOLIA= "scroll-sepolia",
  OPTIMISM = "optimism",
  UNICHAIN_SEPOLIA = "unichain-sepolia",
  BLAST_SEPOLIA = "blast-sepolia"
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  explorerUrl: string;
  rpcUrl?: string;
}

export const NETWORK_CONFIGS: Record<SupportedNetworks, NetworkConfig> = {
  [SupportedNetworks.CELO]: {
    chainId: 42220,
    name: "Celo Mainnet",
    explorerUrl: "https://celoscan.io",
  },
  [SupportedNetworks.CELO_ALFAJORES]: {
    chainId: 44787,
    name: "Celo Alfajores Testnet",
    explorerUrl: "https://alfajores.celoscan.io",
  },
  [SupportedNetworks.BASE]: {
    chainId: 8453,
    name: "Base Mainnet",
    explorerUrl: "https://basescan.org",
  },
  [SupportedNetworks.BASE_SEPOLIA]: {
    chainId: 84532,
    name: "Base Sepolia Testnet",
    explorerUrl: "https://sepolia.basescan.org",
  },
  [SupportedNetworks.MONAD_TESTNET]: {
    chainId: 10143,
    name: "Monad Testnet",
    explorerUrl: "https://testnet.monadscan.com/",
  },
  [SupportedNetworks.SCROLL_SEPOLIA]: {
    chainId: 10143,
    name: "Monad Testnet",
    explorerUrl: "https://testnet.monadscan.com/",
  },
  [SupportedNetworks.UNICHAIN_SEPOLIA]: {
    chainId: 10143,
    name: "Monad Testnet",
    explorerUrl: "https://testnet.monadscan.com/",
  },
  [SupportedNetworks.BLAST_SEPOLIA]: {
    chainId: 168587773,
    name: "Blast Sepolia Testnet",
    explorerUrl: "https://testnet.monadscan.com/",
  },
  [SupportedNetworks.OPTIMISM]: {
    chainId: 10,
    name: "OPt",
    explorerUrl: "https://testnet.monadscan.com/",
  },
};

export const TIPCHAIN_CONTRACT_ADDRESSES: Record<SupportedNetworks, string> = {
  [SupportedNetworks.CELO]: "0x1d4c400F9706a3b6fc9fe4246548954C556b7E2f",
  [SupportedNetworks.CELO_ALFAJORES]:
    "0x1d4c400F9706a3b6fc9fe4246548954C556b7E2f",
  [SupportedNetworks.BASE]: "0x059c8999544260E483D212147da9F082EF0714f9",
  [SupportedNetworks.BASE_SEPOLIA]:
    "0xA1558418153fbfb5799be94f6b238eEC583c8F84",
  [SupportedNetworks.MONAD_TESTNET]:
    "0xf5056B96ab242C566002852d0b98ce0BcDf1af51",
  [SupportedNetworks.SCROLL_SEPOLIA]:
    "0x7e70D2db47fa8d03F3a292d064bA1B35612F8b39",
  [SupportedNetworks.OPTIMISM]:
    "0xa617fd01A71B54FF9e12D1c31B29276570f0A514",
  [SupportedNetworks.UNICHAIN_SEPOLIA]:
    "0xf5056B96ab242C566002852d0b98ce0BcDf1af51",
  [SupportedNetworks.BLAST_SEPOLIA]:
    "0x097CEaB51539b04FF5E59FDf2Cd39869bC005ba1",
}; 

export const getTipChainContractAddress = (
  chainId: number | string,
): string => {
  const network = Object.values(SupportedNetworks).find(
    (networkKey) => NETWORK_CONFIGS[networkKey].chainId === Number(chainId),
  );

  if (network && TIPCHAIN_CONTRACT_ADDRESSES[network]) {
    return TIPCHAIN_CONTRACT_ADDRESSES[network];
  }

  console.warn(
    `Rede com chainId ${chainId} não suportada. Usando Celo Mainnet como fallback.`,
  );
  return TIPCHAIN_CONTRACT_ADDRESSES[SupportedNetworks.CELO];
};

export const DEFAULT_CHAIN_ID = 8453;

export const isNetworkSupported = (chainId: number | string): boolean => {
  return Object.values(NETWORK_CONFIGS).some(
    (config) => config.chainId === Number(chainId),
  );
};

export const getNetworkConfig = (
  chainId: number | string,
): NetworkConfig | null => {
  const network = Object.values(SupportedNetworks).find(
    (networkKey) => NETWORK_CONFIGS[networkKey].chainId === Number(chainId),
  );

  return network ? NETWORK_CONFIGS[network] : null;
};

export const TIPCHAIN_CONTRACT_ADDRESS =
  TIPCHAIN_CONTRACT_ADDRESSES[SupportedNetworks.CELO];

export const TIPCHAIN_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "basename",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "displayName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CreatorRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TipSent",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_basename",
        type: "string",
      },
      {
        internalType: "string",
        name: "_displayName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_bio",
        type: "string",
      },
      {
        internalType: "string",
        name: "_avatarUrl",
        type: "string",
      },
    ],
    name: "registerCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "string",
        name: "_message",
        type: "string",
      },
    ],
    name: "tipETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_basename",
        type: "string",
      },
      {
        internalType: "string",
        name: "_message",
        type: "string",
      },
    ],
    name: "tipByBasename",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address",
      },
    ],
    name: "getCreator",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "basename",
            type: "string",
          },
          {
            internalType: "string",
            name: "displayName",
            type: "string",
          },
          {
            internalType: "string",
            name: "bio",
            type: "string",
          },
          {
            internalType: "string",
            name: "avatarUrl",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "totalTipsReceived",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tipCount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
        ],
        internalType: "struct TipChain.Creator",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_basename",
        type: "string",
      },
    ],
    name: "getCreatorByBasename",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address",
      },
    ],
    name: "getTipsReceived",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "string",
            name: "message",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct TipChain.Tip[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCreatorCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_limit",
        type: "uint256",
      },
    ],
    name: "getTopCreators",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isNative: boolean;
  logoURI?: string;
}

export const SUPPORTED_TOKENS: Record<number, Token[]> = {
  // Base Mainnet
  8453: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      isNative: true,
    },
    {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      isNative: false,
    },
    {
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      name: "Dai Stablecoin",
      symbol: "DAI",
      decimals: 18,
      isNative: false,
    },
  ],
  // Base Testnet
  84531: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      isNative: true,
    },
    {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      isNative: false,
    },
  ],
  // Celo Mainnet
  42220: [
    {
      address: "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A",
      name: "GoodDollar",
      symbol: "G$",
      decimals: 2,
      isNative: false,
    },
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Celo Native",
      symbol: "CELO",
      decimals: 18,
      isNative: true,
    },
    {
      address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      name: "Celo Dollar",
      symbol: "cUSD",
      decimals: 18,
      isNative: false,
    },
    {
      address: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      isNative: false,
    },
  ],
  // Celo Testnet
  44787: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Celo Native",
      symbol: "CELO",
      decimals: 18,
      isNative: true,
    },
    {
      address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      name: "Celo Dollar",
      symbol: "cUSD",
      decimals: 18,
      isNative: false,
    },
  ],
  // Optimism Mainnet
  10: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      isNative: true,
    },
    {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      isNative: false,
    },
  ],
  // Scroll Sepolia
  534351: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      isNative: true,
    },
  ],
  // Blast Sepolia
  168587773: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      isNative: true,
    },
  ],  
  10143: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Monad",
      symbol: "MON",
      decimals: 18,
      isNative: true,
    },
    {
     
      "address": "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714",
      "name": "Molandak",
      "symbol": "DAK",
      "decimals": 18,
      isNative: false,
      
    },
    {
     
      "address": "0xE0590015A873bF326bd645c3E1266d4db41C4E6B",
      "name": "Chog",
      "symbol": "CHOG",
      "decimals": 18,
      isNative: false,
    },
    {
     
      "address": "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50",
      "name": "Moyaki",
      "symbol": "YAKI",
      "decimals": 18,
      isNative: false,
    },
    {
     
      "address": "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
      "name": "USD Coin",
      "symbol": "USDC",
      "decimals": 6,
      isNative: false,
    },
    {
     
      "address": "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
      "name": "Tether USD",
      "symbol": "USDT",
      "decimals": 6,
      isNative: false,
    },
    {
     
      "address": "0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d",
      "name": "Wrapped BTC",
      "symbol": "WBTC",
      "decimals": 8,
      isNative: false,
    },
    {
     
      "address": "0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37",
      "name": "Wrapped ETH",
      "symbol": "WETH",
      "decimals": 18,
      isNative: false,
    },
    {
     
      "address": "0x5387C85A4965769f6B0Df430638a1388493486F1",
      "name": "Wrapped SOL",
      "symbol": "SOL",
      "decimals": 9,
      isNative: false,
    },
    {      
      "address": "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
      "name": "Wrapped Monad",
      "symbol": "WMON",
      "decimals": 18,
      isNative: false,
    }
  ],  
  1301: [
    {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      isNative: true,
    },
  ],
};

export const getSupportedTokens = (chainId: number): Token[] => {
  return SUPPORTED_TOKENS[chainId] || [];
};
