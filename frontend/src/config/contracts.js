import { ethers } from 'ethers';
import ContractEnforcementABI from '../contracts/ContractEnforcement.json';
import PaymentDepositABI from '../contracts/PaymentDeposit.json';
// Import other contract ABIs as needed

// Custom network configuration
export const NETWORK_CONFIG = {
    chainId: '0x13882', // Amoy testnet (80002 in hex)
    chainName: 'Amoy',
    nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
    },
    rpcUrls: ['https://polygon-amoy.public.blastapi.io'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

// Network configuration for ethers provider
export const NETWORK_DETAILS = {
    name: 'Amoy',
    chainId: 80002,
    ensAddress: null, // Explicitly set ENS to null
    _defaultProvider: null // Don't use default provider
};

// Create a custom provider function that bypasses ENS
export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
    }

    // Create a Web3Provider with network specification
    const provider = new ethers.providers.Web3Provider(window.ethereum, {
        chainId: 80002,
        name: 'Amoy'
    });

    return provider;
};

export const CONTRACT_ADDRESSES = {
    RentalContract: "0xB0aaac7908C9C54421C384C1a4a8d923ae8e0F23", // Using your RentalAgreement address
    PaymentDeposit: "0xe75FC2e06CD487d4A9f80b52609Ed889589bB670",
    RentalAgreement: "0xB0aaac7908C9C54421C384C1a4a8d923ae8e0F23",
    IdentityVerification: "0xb07BBf349ad324fd18556fEa64362628E752b43d",
    DisputeResolution: "0x6801AA5970ab61A12Aa577513709Bb99A334eC81",
    DecentralizedStorage: "0xB18A9c92C626a95EFb312fFc9612608B94D0EdF7",
    ContractEnforcement: "0x0Bf8E4990c9F5ea14D4C192C6a31cE734fd692Db"
};

// Simplified provider setup to avoid ENS
export const getContractInstance = (contractName, signer = null) => {
    const provider = getProvider();
    const address = CONTRACT_ADDRESSES[contractName];
    const abi = CONTRACT_ABIS[contractName];
    
    if (!address || !abi) {
        throw new Error(`Contract ${contractName} not configured`);
    }

    return new ethers.Contract(
        address,
        abi,
        signer || provider
    );
};

export const CONTRACT_ABIS = {
    RentalContract: [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_landlord",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_propertyId",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_duration",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_rentAmount",
                    "type": "uint256"
                }
            ],
            "name": "createRental",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ],
    ContractEnforcement: ContractEnforcementABI,
    PaymentDeposit: PaymentDepositABI,
    // ... other contract functions
};

// List of contract addresses to monitor for transactions
export const MONITORED_ADDRESSES = Object.values(CONTRACT_ADDRESSES); 