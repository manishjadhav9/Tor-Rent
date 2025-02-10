const { contracts } = require('../config/contracts');
const { ethers } = require('ethers');

class BlockchainService {
    // Rental Agreement Functions
    async createRentalAgreement(landlord, tenant, rentAmount, depositAmount, duration) {
        try {
            const tx = await contracts.RentalAgreement.createAgreement(
                tenant,
                ethers.utils.parseEther(rentAmount.toString()),
                ethers.utils.parseEther(depositAmount.toString()),
                duration
            );
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Error creating rental agreement: ${error.message}`);
        }
    }

    // Payment and Deposit Functions
    async processPayment(paymentId, amount) {
        try {
            const tx = await contracts.PaymentDeposit.payRent(paymentId, {
                value: ethers.utils.parseEther(amount.toString())
            });
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Error processing payment: ${error.message}`);
        }
    }

    // Identity Verification Functions
    async verifyUser(name, idHash) {
        try {
            const tx = await contracts.IdentityVerification.verifyUser(name, idHash);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Error verifying user: ${error.message}`);
        }
    }

    // Dispute Resolution Functions
    async raiseDispute(landlordAddress, reason) {
        try {
            const tx = await contracts.DisputeResolution.raiseDispute(landlordAddress, reason);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Error raising dispute: ${error.message}`);
        }
    }

    // Storage Functions
    async storeAgreement(ipfsHash) {
        try {
            const tx = await contracts.DecentralizedStorage.storeAgreement(ipfsHash);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Error storing agreement: ${error.message}`);
        }
    }

    // Contract Enforcement Functions
    async reportViolation(violator, reason, penalty) {
        try {
            const tx = await contracts.ContractEnforcement.reportViolation(
                violator,
                reason,
                ethers.utils.parseEther(penalty.toString())
            );
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Error reporting violation: ${error.message}`);
        }
    }
}

module.exports = new BlockchainService(); 