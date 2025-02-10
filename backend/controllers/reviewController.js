const Apartment = require('../models/Apartment');

exports.addReview = async (req, res) => {
    try {
        const { apartmentId } = req.params;
        const { rating, comment } = req.body;

        const apartment = await Apartment.findById(apartmentId);
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }

        apartment.reviews.push({
            tenant: req.user._id,
            rating,
            comment
        });

        await apartment.save();
        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 