import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const DisputeResolution = ({ apartmentId, landlordAddress }) => {
    const { contracts } = useWeb3();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const raiseDispute = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tx = await contracts.DisputeResolution.raiseDispute(
                landlordAddress,
                reason
            );
            await tx.wait();
            alert('Dispute raised successfully');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to raise dispute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Raise Dispute</h2>
            <form onSubmit={raiseDispute}>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your dispute..."
                    className="w-full p-2 border rounded mb-4"
                    rows="4"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
                >
                    {loading ? 'Submitting...' : 'Submit Dispute'}
                </button>
            </form>
        </div>
    );
};

export default DisputeResolution; 