const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    role: { type: String, enum: ["tenant", "landlord"], required: true },
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    profileImage: { type: String },
    verificationStatus: { type: Boolean, default: false },
    ratings: [{ 
        from: { type: String }, // wallet address of rater
        rating: { type: Number },
        review: { type: String },
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
