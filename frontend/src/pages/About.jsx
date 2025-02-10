import React from 'react';
import { FaEthereum, FaShieldAlt, FaUserLock } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Tor-Rent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Revolutionizing the rental market with blockchain technology
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tor-Rent aims to create a transparent, secure, and efficient rental ecosystem 
            by leveraging blockchain technology. We're committed to solving traditional 
            rental market challenges through decentralized solutions.
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaEthereum className="text-4xl text-blue-500" />}
              title="Crypto Payments"
              description="Secure and instant rent payments using cryptocurrency, eliminating traditional banking delays and fees."
            />
            <FeatureCard
              icon={<FaShieldAlt className="text-4xl text-green-500" />}
              title="Smart Contracts"
              description="Automated and tamper-proof rental agreements ensuring trust between landlords and tenants."
            />
            <FeatureCard
              icon={<FaUserLock className="text-4xl text-purple-500" />}
              title="Identity Verification"
              description="Blockchain-based verification system for enhanced security and trust."
            />
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Technology Stack
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <ul className="list-disc list-inside space-y-3 text-gray-600 dark:text-gray-300">
              <li>Smart Contracts: Solidity on Polygon Network using MetaMask and Hardhat</li>
              <li>Frontend: React.js with Tailwind CSS</li>
              <li>Backend: Node.js with Express and MongoDB as database</li>
              <li>Web3 Integration: ethers.js</li>
            </ul>
          </div>
        </div>

        {/* Team Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Transparency
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We believe in complete transparency in all rental transactions and processes.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ensuring the highest level of security for all users through blockchain technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

export default About;