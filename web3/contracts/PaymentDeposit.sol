// Automates rent payments, security deposits, and refunds using smart contracts.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentDeposit {
    struct Payment {
        address tenant;
        address landlord;
        uint256 rentAmount;
        uint256 depositAmount;
        uint256 lastPaymentTime;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public paymentCounter;

    event RentPaid(uint256 paymentId, uint256 amount);
    event DepositPaid(uint256 paymentId, uint256 amount);
    event DepositRefunded(uint256 paymentId, uint256 amount);

    function createPayment(address _landlord, uint256 _rentAmount, uint256 _depositAmount) external payable {
        require(msg.value == _depositAmount, "Deposit required");
        paymentCounter++;
        payments[paymentCounter] = Payment(msg.sender, _landlord, _rentAmount, _depositAmount, block.timestamp);
        emit DepositPaid(paymentCounter, msg.value);
    }

    function payRent(uint256 _paymentId) external payable {
        Payment storage payment = payments[_paymentId];
        require(msg.sender == payment.tenant, "Only tenant can pay rent");
        require(msg.value == payment.rentAmount, "Incorrect rent amount");

        payable(payment.landlord).transfer(msg.value);
        payment.lastPaymentTime = block.timestamp;
        emit RentPaid(_paymentId, msg.value);
    }

    function refundDeposit(uint256 _paymentId) external {
        Payment storage payment = payments[_paymentId];
        require(msg.sender == payment.landlord, "Only landlord can refund");
        require(address(this).balance >= payment.depositAmount, "Insufficient contract balance");

        payable(payment.tenant).transfer(payment.depositAmount);
        emit DepositRefunded(_paymentId, payment.depositAmount);
    }
}
