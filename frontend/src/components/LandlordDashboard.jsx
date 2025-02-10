import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, MONITORED_ADDRESSES } from '../config/contracts';
import { getMaticPrice } from '../utils/price';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const LandlordDashboard = () => {
  const [activeTab, setActiveTab] = useState('apartments');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [maticPrice, setMaticPrice] = useState(null);
  const [usdBalance, setUsdBalance] = useState('0.00');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApartment, setNewApartment] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    rent: '',
    depositAmount: '',
    amenities: '',
    images: []
  });
  const [apartments, setApartments] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const tenants = [
    { address: "0x1234...5678", apartment: "Luxury Apartment", status: "Active" },
    { address: "0x8765...4321", apartment: "Cozy Studio", status: "Late Payment" },
  ];

  useEffect(() => {
    const fetchAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await fetchBalance(accounts[0]);
      }
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    if (account && activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [account, activeTab]);

  useEffect(() => {
    if (account) {
      fetchBalance(account);
      const interval = setInterval(() => {
        fetchBalance(account);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [account]);

  const fetchBalance = async (address) => {
    try {
      if (!window.ethereum) {
        console.error('MetaMask is not installed');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      const balanceMatic = parseFloat(balanceEth).toFixed(4);
      setBalance(balanceMatic);

      // Fetch MATIC price and calculate USD value
      const price = await getMaticPrice();
      if (price) {
        setMaticPrice(price);
        const usdValue = (parseFloat(balanceMatic) * price).toFixed(2);
        setUsdBalance(usdValue);
      }

      // Add listener for account changes to update balance
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const newBalance = await provider.getBalance(accounts[0]);
          const newBalanceMatic = parseFloat(ethers.utils.formatEther(newBalance)).toFixed(4);
          setBalance(newBalanceMatic);
          if (maticPrice) {
            const newUsdValue = (parseFloat(newBalanceMatic) * maticPrice).toFixed(2);
            setUsdBalance(newUsdValue);
          }
        }
      });

      // Add listener for chain changes to update balance
      window.ethereum.on('chainChanged', async () => {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const newBalance = await provider.getBalance(accounts[0]);
          const newBalanceMatic = parseFloat(ethers.utils.formatEther(newBalance)).toFixed(4);
          setBalance(newBalanceMatic);
          if (maticPrice) {
            const newUsdValue = (parseFloat(newBalanceMatic) * maticPrice).toFixed(2);
            setUsdBalance(newUsdValue);
          }
        }
      });

    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
      setUsdBalance('0');
    }
  };

  const fetchTransactions = async () => {
    if (!window.ethereum) {
      console.error('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const latestBlock = await provider.getBlockNumber();
      const startBlock = latestBlock - 10000; // Last 10000 blocks

      // Get all transactions for the account
      const [sentTx, receivedTx] = await Promise.all([
        // Get sent transactions
        provider.send('eth_getTransactionsByAddress', [
          account,
          '0x' + startBlock.toString(16),
          '0x' + latestBlock.toString(16)
        ]),
        // Get received transactions
        provider.send('eth_getTransactionsByAddress', [
          account,
          '0x' + startBlock.toString(16),
          '0x' + latestBlock.toString(16),
          true
        ])
      ]);

      const allTransactions = [...(sentTx || []), ...(receivedTx || [])];
      
      // Filter transactions involving our contracts
      const contractTransactions = allTransactions.filter(tx => 
        MONITORED_ADDRESSES.includes(tx.to?.toLowerCase()) || 
        MONITORED_ADDRESSES.includes(tx.from?.toLowerCase())
      );

      if (contractTransactions.length > 0) {
        const formattedTransactions = await Promise.all(
          contractTransactions.map(async (tx) => {
            const receipt = await provider.getTransactionReceipt(tx.hash);
            const block = await provider.getBlock(tx.blockNumber);

            // Determine contract name
            let contractName = 'Unknown Contract';
            for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
              if (tx.to?.toLowerCase() === address.toLowerCase()) {
                contractName = name;
                break;
              }
            }

            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: ethers.utils.formatEther(tx.value || '0'),
              status: receipt?.status === 1 ? 'Success' : 'Failed',
              timestamp: new Date(block.timestamp * 1000),
              contractName,
              gasUsed: receipt?.gasUsed?.toString() || '0'
            };
          })
        );

        // Sort transactions by timestamp (newest first)
        formattedTransactions.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const enforceContract = async (tenantAddress) => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ContractEnforcement,
        CONTRACT_ABIS.ContractEnforcement,
        signer
      );
      
      const tx = await contract.reportViolation(
        tenantAddress,
        "Rent payment overdue",
        ethers.utils.parseEther("0.1")
      );
      await tx.wait();
      alert("Contract enforcement initiated successfully!");
      fetchTransactions();
    } catch (error) {
      console.error('Error enforcing contract:', error);
      alert("Failed to enforce contract. See console for details.");
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setNewApartment(prev => ({
      ...prev,
      images: [...prev.images, ...acceptedFiles]
    }));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880 // 5MB
  });

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/apartments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch apartments');
      }
      
      const data = await response.json();
      setApartments(data);
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setFetchError('Failed to load apartments');
      setApartments([]); // Clear apartments on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleAddApartment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', newApartment.title);
      formData.append('description', newApartment.description);
      formData.append('location', newApartment.address);
      formData.append('price', newApartment.rent);
      formData.append('landlord', account);

      // Append only the first image if it exists
      if (newApartment.images && newApartment.images.length > 0) {
        formData.append('image', newApartment.images[0]);
      }

      console.log('Sending apartment data:', {
        title: newApartment.title,
        description: newApartment.description,
        location: newApartment.address,
        price: newApartment.rent,
        landlord: account
      });

      const response = await fetch('http://localhost:5000/api/apartments/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add apartment');
      }

      const data = await response.json();
      console.log('Apartment added successfully:', data);
      
      alert('Apartment added successfully!');
      setShowAddForm(false);
      
      // Clear form
      setNewApartment({
        title: '',
        description: '',
        address: '',
        rent: '',
        depositAmount: '',
        amenities: '',
        images: []
      });
      
      // Refresh apartments list
      fetchApartments();
    } catch (error) {
      console.error('Error adding apartment:', error);
      alert(error.message || 'Error adding apartment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Landlord Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Apartment
          </button>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {balance} MATIC
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ≈ ${usdBalance} USD
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('apartments')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'apartments' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          My Apartments
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'tenants' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Tenants
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'transactions' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'apartments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-4">
              <FaSpinner className="animate-spin inline-block mr-2" />
              Loading apartments...
            </div>
          ) : apartments.length === 0 ? (
            <div className="col-span-3 text-center py-4">
              No apartments found
            </div>
          ) : (
            apartments.map((apt) => (
              <div key={apt._id} className="border rounded-lg overflow-hidden shadow bg-white">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={apt.imageUrl}
                    alt={apt.title}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{apt.title}</h3>
                  <p className="text-blue-500 font-semibold">{apt.price} MATIC/month</p>
                  <p className="text-gray-500">{apt.location}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tenants' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Address</th>
                <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Apartment</th>
                <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{tenant.address}</td>
                  <td className="px-6 py-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{tenant.apartment}</td>
                  <td className="px-6 py-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{tenant.status}</td>
                  <td className="px-6 py-4 border-b dark:border-gray-600">
                    <button
                      onClick={() => enforceContract(tenant.address)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Enforce Contract
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-700 dark:text-gray-300">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4 text-gray-700 dark:text-gray-300">No transactions found</div>
          ) : (
            transactions.map((tx, index) => (
              <div key={index} className="border dark:border-gray-700 rounded p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Contract:</span> {tx.contractName}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Hash:</span> 
                    <a 
                      href={`https://mumbai.polygonscan.com/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                    >
                      {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                    </a>
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Amount:</span> {tx.value} MATIC
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Gas Used:</span> {tx.gasUsed}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">From:</span> {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">To:</span> {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Status:</span> 
                    <span className={`ml-1 ${
                      tx.status === 'Success' 
                        ? 'text-green-500 dark:text-green-400' 
                        : 'text-red-500 dark:text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Date:</span> {tx.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Add New Apartment</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddApartment} className="space-y-4">
              {/* Title */}
              <input
                type="text"
                placeholder="Title"
                value={newApartment.title}
                onChange={(e) => setNewApartment({...newApartment, title: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />

              {/* Single Address Field */}
              <input
                type="text"
                placeholder="Full Address"
                value={newApartment.address}
                onChange={(e) => setNewApartment({...newApartment, address: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />

              {/* Rent and Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monthly Rent (MATIC)"
                  value={newApartment.rent}
                  onChange={(e) => setNewApartment({...newApartment, rent: e.target.value})}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Security Deposit (MATIC)"
                  value={newApartment.depositAmount}
                  onChange={(e) => setNewApartment({...newApartment, depositAmount: e.target.value})}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Drag and drop images here, or click to select files
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                {newApartment.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {newApartment.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewApartment(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <textarea
                placeholder="Description"
                value={newApartment.description}
                onChange={(e) => setNewApartment({...newApartment, description: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                required
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Adding...
                  </span>
                ) : (
                  'Add Apartment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
