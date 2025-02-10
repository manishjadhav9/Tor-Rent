import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';

const SetupPayment = ({ apartment }) => {
    const { account, contracts } = useWeb3();
    const [loading, setLoading] = useState(false);

    const setupAutoDebit = async () => {
        try {
            setLoading(true);
            
            // First approve the contract to spend tokens
            const amount = ethers.utils.parseEther(apartment.price.amount.toString());
            
            // Setup automatic payment
            const tx = await contracts.PaymentDeposit.setupAutoDebit(
                apartment._id,
                amount,
                apartment.rentDueDate
            );
            await tx.wait();

            alert('Auto-debit setup successful!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to setup auto-debit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Setup Auto Payment</h2>
            <div className="mb-4">
                <p>Monthly Rent: {apartment.price.amount} ETH</p>
                <p>Due Date: {apartment.rentDueDate}th of each month</p>
            </div>
            <button
                onClick={setupAutoDebit}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'Setting up...' : 'Setup Auto-Debit'}
            </button>
        </div>
    );
};

export default SetupPayment; 