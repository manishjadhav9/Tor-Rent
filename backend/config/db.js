const mongoose = require("mongoose");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        // Validate MongoDB URI
        if (!process.env.MONGO_URI || !process.env.MONGO_URI.startsWith('mongodb')) {
            throw new Error('Invalid MongoDB URI in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            w: 'majority'
        });

        // Wait for the connection to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!conn.connection.db) {
            throw new Error('Database connection not fully established');
        }

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        if (error.name === 'MongoParseError') {
            console.error('Please check your MongoDB connection string format');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
