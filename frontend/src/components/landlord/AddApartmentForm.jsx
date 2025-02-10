import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';

const AddApartmentForm = ({ onClose }) => {
    const { account } = useWeb3();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        price: '',
        depositAmount: '',
        rentDueDate: '',
        propertyType: '',
        amenities: [],
        rules: [],
        images: [],
        isAvailable: true
    });
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: files
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formData.images.forEach(image => {
                formDataToSend.append('images', image);
            });

            // Add other form data
            Object.keys(formData).forEach(key => {
                if (key !== 'images') {
                    formDataToSend.append(key, 
                        Array.isArray(formData[key]) 
                            ? JSON.stringify(formData[key]) 
                            : formData[key]
                    );
                }
            });

            const response = await fetch('/apartments/create', {
                method: 'POST',
                body: formDataToSend
            });

            if (!response.ok) throw new Error('Failed to create apartment');

            const data = await response.json();
            alert('Apartment added successfully!');
            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding apartment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-4">Add New Apartment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title"
                        className="border p-2 rounded w-full"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                    <textarea
                        placeholder="Description"
                        className="border p-2 rounded w-full"
                        rows="3"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                    <input
                        type="text"
                        placeholder="Address"
                        className="border p-2 rounded w-full"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                    <input
                        type="text"
                        placeholder="City"
                        className="border p-2 rounded w-full"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                    <input
                        type="number"
                        placeholder="Price (ETH)"
                        className="border p-2 rounded w-full"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1 block w-full"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Adding...' : 'Add Apartment'}
                    </button>
                </form>
                <button onClick={onClose} className="mt-4 text-red-500">Cancel</button>
            </div>
        </div>
    );
};

export default AddApartmentForm; 