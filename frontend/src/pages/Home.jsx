import React from 'react';
import { FaEthereum, FaShieldAlt, FaHandshake } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Hero Section */}
      <div className="pt-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Decentralized Rental Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Secure, transparent, and efficient property rentals powered by blockchain technology
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaEthereum className="text-4xl text-blue-500" />}
              title="Crypto Payments"
              description="Pay rent seamlessly using cryptocurrency, with automatic payments and instant confirmations."
            />
            <FeatureCard
              icon={<FaShieldAlt className="text-4xl text-green-500" />}
              title="Secure Contracts"
              description="Smart contracts ensure transparent and tamper-proof rental agreements."
            />
            <FeatureCard
              icon={<FaHandshake className="text-4xl text-purple-500" />}
              title="Trust & Verification"
              description="Verified landlords and tenants with blockchain-based identity verification."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

export default Home;