
export enum SupportedNetworks {
  CELO = 'celo',
  CELO_ALFAJORES = 'celo-alfajores',
  BASE = 'base',
  BASE_SEPOLIA = 'base-sepolia'
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
    name: 'Celo Mainnet',
    explorerUrl: 'https://celoscan.io'
  },
  [SupportedNetworks.CELO_ALFAJORES]: {
    chainId: 44787,
    name: 'Celo Alfajores Testnet',
    explorerUrl: 'https://alfajores.celoscan.io'
  },
  [SupportedNetworks.BASE]: {
    chainId: 8453,
    name: 'Base Mainnet',
    explorerUrl: 'https://basescan.org'
  },
  [SupportedNetworks.BASE_SEPOLIA]: {
    chainId: 84532,
    name: 'Base Sepolia Testnet',
    explorerUrl: 'https://sepolia.basescan.org'
  }
};


export const TIPCHAIN_CONTRACT_ADDRESSES: Record<SupportedNetworks, string> = {
  [SupportedNetworks.CELO]: '0x1d4c400F9706a3b6fc9fe4246548954C556b7E2f',
  [SupportedNetworks.CELO_ALFAJORES]: '0x1d4c400F9706a3b6fc9fe4246548954C556b7E2f', 
  [SupportedNetworks.BASE]: '0xA1558418153fbfb5799be94f6b238eEC583c8F84', 
  [SupportedNetworks.BASE_SEPOLIA]: '0xA1558418153fbfb5799be94f6b238eEC583c8F84' 
};


export const getTipChainContractAddress = (chainId: number | string): string => {
  const network = Object.values(SupportedNetworks).find(
    networkKey => NETWORK_CONFIGS[networkKey].chainId === Number(chainId)
  );

  if (network && TIPCHAIN_CONTRACT_ADDRESSES[network]) {
    return TIPCHAIN_CONTRACT_ADDRESSES[network];
  }

  
  console.warn(`Rede com chainId ${chainId} não suportada. Usando Celo Mainnet como fallback.`);
  return TIPCHAIN_CONTRACT_ADDRESSES[SupportedNetworks.CELO];
};


export const isNetworkSupported = (chainId: number | string): boolean => {
  return Object.values(NETWORK_CONFIGS).some(
    config => config.chainId === Number(chainId)
  );
};


export const getNetworkConfig = (chainId: number | string): NetworkConfig | null => {
  const network = Object.values(SupportedNetworks).find(
    networkKey => NETWORK_CONFIGS[networkKey].chainId === Number(chainId)
  );

  return network ? NETWORK_CONFIGS[network] : null;
};


export const TIPCHAIN_CONTRACT_ADDRESS = TIPCHAIN_CONTRACT_ADDRESSES[SupportedNetworks.CELO];

export const TIPCHAIN_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "basename",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "displayName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "CreatorRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "TipSent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_basename",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_displayName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bio",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_avatarUrl",
        "type": "string"
      }
    ],
    "name": "registerCreator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "tipETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_basename",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "tipByBasename",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_creator",
        "type": "address"
      }
    ],
    "name": "getCreator",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "basename",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "displayName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "bio",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "avatarUrl",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "totalTipsReceived",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tipCount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct TipChain.Creator",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_basename",
        "type": "string"
      }
    ],
    "name": "getCreatorByBasename",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_creator",
        "type": "address"
      }
    ],
    "name": "getTipsReceived",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "message",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct TipChain.Tip[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCreatorCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      }
    ],
    "name": "getTopCreators",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const