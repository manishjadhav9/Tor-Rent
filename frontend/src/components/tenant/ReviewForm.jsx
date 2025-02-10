import React, { useState } from 'react';

const ReviewForm = ({ apartmentId }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/apartments/${apartmentId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating, comment })
            });

            if (!response.ok) throw new Error('Failed to submit review');

            alert('Review submitted successfully!');
            setRating(5);
            setComment('');
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <h3 className="text-lg font-bold mb-2">Leave a Review</h3>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
            </div>
            <textarea
                placeholder="Comment"
                className="border p-2 rounded w-full"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600 disabled:bg-gray-400"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm; 