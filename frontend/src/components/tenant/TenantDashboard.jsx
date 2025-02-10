import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import ReviewForm from './ReviewForm';
import SetupPayment from './SetupPayment';

const TenantDashboard = () => {
    const { account } = useWeb3();
    const [apartments, setApartments] = useState([]);
    const [selectedApartment, setSelectedApartment] = useState(null);

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
            <h2 className="text-2xl font-bold mb-6">Available Apartments</h2>
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
                            <button
                                onClick={() => setSelectedApartment(apartment)}
                                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {selectedApartment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">{selectedApartment.title}</h2>
                        <p className="mb-4">{selectedApartment.description}</p>
                        <SetupPayment apartment={selectedApartment} />
                        <ReviewForm apartmentId={selectedApartment._id} />
                        <button onClick={() => setSelectedApartment(null)} className="mt-4 text-red-500">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantDashboard; 