const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rentPaid: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rental", RentalSchema);
