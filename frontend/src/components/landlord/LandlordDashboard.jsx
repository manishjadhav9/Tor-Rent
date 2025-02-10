import React, { useState, useEffect } from 'react';
import AddApartmentForm from './AddApartmentForm';
import { useWeb3 } from '../../contexts/Web3Context';

const LandlordDashboard = () => {
    const { account, balance } = useWeb3();
    const [apartments, setApartments] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const response = await fetch('/apartments');
                const data = await response.json();
                setApartments(data);
            } catch (error) {
                console.error('Error fetching apartments:', error);
            }
        };

        fetchApartments();
    }, []);

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Apartments</h2>
                <div className="flex items-center">
                    <span className="text-lg font-semibold mr-4">Wallet: {balance} ETH</span>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add Apartment
                    </button>
                </div>
            </div>
            {showForm && <AddApartmentForm onClose={() => setShowForm(false)} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apartments.map(apartment => (
                    <div key={apartment._id} className="border rounded-lg overflow-hidden shadow-lg">
                        <img 
                            src={`/apartments/image/${apartment.images[0]}`} 
                            alt={apartment.title} 
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{apartment.title}</h3>
                            <p className="text-gray-600 mb-2">{apartment.location.city}</p>
                            <p className="text-blue-500 font-bold">{apartment.price.amount} ETH</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LandlordDashboard; 