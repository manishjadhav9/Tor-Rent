const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESSES = {
    RentalAgreement: "0xB0aaac7908C9C54421C384C1a4a8d923ae8e0F23",
    PaymentDeposit: "0xe75FC2e06CD487d4A9f80b52609Ed889589bB670",
    IdentityVerification: "0xb07BBf349ad324fd18556fEa64362628E752b43d",
    DisputeResolution: "0x6801AA5970ab61A12Aa577513709Bb99A334eC81",
    DecentralizedStorage: "0xB18A9c92C626a95EFb312fFc9612608B94D0EdF7",
    ContractEnforcement: "0x0Bf8E4990c9F5ea14D4C192C6a31cE734fd692Db"
};

// Initialize provider and contracts
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);

// Ensure private key has 0x prefix
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`;

const wallet = new ethers.Wallet(privateKey, provider);

const contracts = {
    RentalAgreement: new ethers.Contract(
        CONTRACT_ADDRESSES.RentalAgreement,
        require('../abis/RentalAgreement.json'),
        wallet
    ),
    PaymentDeposit: new ethers.Contract(
        CONTRACT_ADDRESSES.PaymentDeposit,
        require('../abis/PaymentDeposit.json'),
        wallet
    ),
    IdentityVerification: new ethers.Contract(
        CONTRACT_ADDRESSES.IdentityVerification,
        require('../abis/IdentityVerification.json'),
        wallet
    ),
    DisputeResolution: new ethers.Contract(
        CONTRACT_ADDRESSES.DisputeResolution,
        require('../abis/DisputeResolution.json'),
        wallet
    ),
    DecentralizedStorage: new ethers.Contract(
        CONTRACT_ADDRESSES.DecentralizedStorage,
        require('../abis/DecentralizedStorage.json'),
        wallet
    ),
    ContractEnforcement: new ethers.Contract(
        CONTRACT_ADDRESSES.ContractEnforcement,
        require('../abis/ContractEnforcement.json'),
        wallet
    )
};

module.exports = { contracts, CONTRACT_ADDRESSES }; 