// Manages the creation, storage, and termination of rental agreements on the blockchain.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RentalAgreement {
    struct Agreement {
        address landlord;
        address tenant;
        uint256 rentAmount;
        uint256 depositAmount;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    mapping(uint256 => Agreement) public agreements;
    uint256 public agreementCounter;

    event AgreementCreated(uint256 agreementId, address landlord, address tenant, uint256 rentAmount, uint256 depositAmount);
    event AgreementTerminated(uint256 agreementId);

    function createAgreement(address _tenant, uint256 _rentAmount, uint256 _depositAmount, uint256 _duration) external {
        agreementCounter++;
        agreements[agreementCounter] = Agreement(msg.sender, _tenant, _rentAmount, _depositAmount, block.timestamp, block.timestamp + _duration, true);
        emit AgreementCreated(agreementCounter, msg.sender, _tenant, _rentAmount, _depositAmount);
    }

    function terminateAgreement(uint256 _agreementId) external {
        require(msg.sender == agreements[_agreementId].landlord || msg.sender == agreements[_agreementId].tenant, "Not authorized");
        agreements[_agreementId].isActive = false;
        emit AgreementTerminated(_agreementId);
    }
}