const Rental = require("../models/Rental");
const Apartment = require("../models/Apartment");
const BlockchainService = require('../services/blockchainService');

exports.rentApartment = async (req, res) => {
    try {
        const { apartmentId, tenantId, rentPaid } = req.body;

        const apartment = await Apartment.findById(apartmentId);
        if (!apartment || !apartment.isAvailable) {
            return res.status(400).json({ message: "Apartment not available" });
        }

        const newRental = new Rental({
            apartment: apartmentId,
            tenant: tenantId,
            rentPaid
        });

        apartment.isAvailable = false;
        await apartment.save();
        await newRental.save();

        res.json({ message: "Apartment rented successfully", newRental });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRental = async (req, res) => {
    try {
        const { landlord, tenant, rentAmount, depositAmount, duration } = req.body;
        
        // Create rental agreement on blockchain
        const receipt = await BlockchainService.createRentalAgreement(
            landlord,
            tenant,
            rentAmount,
            depositAmount,
            duration
        );

        res.json({ 
            message: "Rental agreement created successfully",
            transactionHash: receipt.transactionHash 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
