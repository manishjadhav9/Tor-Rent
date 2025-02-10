   // Stores rental agreements securely on IPFS or another decentralized storage network.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecentralizedStorage {
    mapping(uint256 => string) public agreementHashes;
    uint256 public agreementCounter;

    event AgreementStored(uint256 agreementId, string ipfsHash);

    function storeAgreement(string memory _ipfsHash) external {
        agreementCounter++;
        agreementHashes[agreementCounter] = _ipfsHash;
        emit AgreementStored(agreementCounter, _ipfsHash);
    }

    function getAgreement(uint256 _agreementId) external view returns (string memory) {
        return agreementHashes[_agreementId];
    }
}
