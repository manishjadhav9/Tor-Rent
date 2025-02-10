const User = require("../models/User");

exports.login = async (req, res) => {
    const { walletAddress, role } = req.body;

    try {
        let user = await User.findOne({ walletAddress });

        if (!user) {
            user = new User({ walletAddress, role });
            await user.save();
        }

        res.json({ message: "Login successful", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
