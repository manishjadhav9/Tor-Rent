const { contracts } = require('../config/contracts');
const { ethers } = require('ethers');

class PaymentService {
    async processRentPayment(tenantAddress, apartmentId, amount) {
        try {
            const tx = await contracts.PaymentDeposit.payRent(apartmentId, {
                value: ethers.utils.parseEther(amount.toString())
            });
            return await tx.wait();
        } catch (error) {
            throw new Error(`Payment failed: ${error.message}`);
        }
    }

    async setupAutoDebit(tenantAddress, apartmentId, amount, dueDate) {
        // This would integrate with a payment gateway
        // For now, we'll just store the payment schedule
        const payment = new Payment({
            tenant: tenantAddress,
            apartment: apartmentId,
            amount,
            dueDate,
            isAutoDebit: true
        });
        await payment.save();
    }

    async handleMissedPayment(tenantAddress, apartmentId) {
        try {
            // Deduct from deposit
            const tx = await contracts.PaymentDeposit.deductFromDeposit(apartmentId);
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to handle missed payment: ${error.message}`);
        }
    }
}

module.exports = new PaymentService(); 