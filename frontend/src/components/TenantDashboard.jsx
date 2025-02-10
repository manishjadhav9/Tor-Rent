import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, MONITORED_ADDRESSES, NETWORK_CONFIG, getProvider, getContractInstance } from '../config/contracts';
import { getMaticPrice } from '../utils/price';
import { FaSpinner } from 'react-icons/fa';

const TenantDashboard = () => {
  const [apartments, setApartments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [maticPrice, setMaticPrice] = useState(null);
  const [usdBalance, setUsdBalance] = useState('0');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [fetchError, setFetchError] = useState(null);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalFormData, setRentalFormData] = useState({
    startDate: '',
    duration: '12', // months
    depositAmount: ''
  });

  const contractAddress = CONTRACT_ADDRESSES.PaymentDeposit;

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
    const interval = setInterval(async () => {
      if (account) {
        await fetchBalance(account);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [account]);

  const fetchTransactions = async () => {
    if (!window.ethereum) {
      console.error('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const latestBlock = await provider.getBlockNumber();
      const startBlock = latestBlock - 10000;

      const history = await Promise.all([
        provider.send('eth_getTransactionsByAddress', [
          account,
          '0x' + startBlock.toString(16),
          '0x' + latestBlock.toString(16)
        ]),
        provider.send('eth_getTransactionsByAddress', [
          account,
          '0x' + startBlock.toString(16),
          '0x' + latestBlock.toString(16),
          true
        ])
      ]);

      const allTransactions = [...(history[0] || []), ...(history[1] || [])];
      
      if (allTransactions.length > 0) {
        const formattedTransactions = await Promise.all(
          allTransactions.map(async (tx) => {
            const receipt = await provider.getTransactionReceipt(tx.hash);
            const block = await provider.getBlock(tx.blockNumber);
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: ethers.utils.formatEther(tx.value || '0'),
              status: receipt?.status === 1 ? 'Success' : 'Failed',
              timestamp: new Date(block.timestamp * 1000)
            };
          })
        );
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleRentPayment = async (apartment) => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      setLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.PaymentDeposit,
        CONTRACT_ABIS.PaymentDeposit,
        signer
      );
      
      const tx = await contract.payRent({
        value: ethers.utils.parseEther(apartment.price.toString())
      });
      await tx.wait();
      alert('Payment successful!');
      fetchTransactions();
      fetchApartments();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert("Payment failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const setupAutoDebit = async (apartment) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.PaymentDeposit,
        CONTRACT_ABIS.PaymentDeposit,
        signer
      );

      const tx = await contract.approveAutoDebit(
        apartment._id,
        ethers.utils.parseEther(apartment.price.toString())
      );
      await tx.wait();
      alert('Auto-debit setup successful!');
    } catch (error) {
      console.error('Error setting up auto-debit:', error);
      alert('Failed to setup auto-debit');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/apartments/${selectedApartment._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...review,
          tenantAddress: account
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      setShowReviewForm(false);
      fetchApartments();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const fetchBalance = async (address) => {
    try {
      const provider = getProvider();
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

      // Update listeners
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

  const handleRentClick = (apartment) => {
    setSelectedApartment(apartment);
    setShowRentalForm(true);
    setRentalFormData({
      ...rentalFormData,
      depositAmount: apartment.price * 2 // 2 months deposit
    });
  };

  const validateRentalForm = () => {
    if (!rentalFormData.startDate) {
        alert('Please select a start date');
        return false;
    }
    if (!rentalFormData.duration) {
        alert('Please select a lease duration');
        return false;
    }
    if (!selectedApartment.landlord) {
        alert('Invalid landlord address');
        return false;
    }
    return true;
  };

  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    if (!validateRentalForm()) return;
    setLoading(true);

    try {
        // Get accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];

        // Switch network if needed
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== NETWORK_CONFIG.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: NETWORK_CONFIG.chainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [NETWORK_CONFIG],
                    });
                } else {
                    throw switchError;
                }
            }
        }

        const provider = getProvider();
        const signer = provider.getSigner();

        // Format amounts properly
        const rentAmount = ethers.utils.parseEther(selectedApartment.price.toString());
        const depositAmount = rentAmount.mul(2);
        const totalAmount = rentAmount.add(depositAmount);

        // Get current gas price
        const gasPrice = await provider.getGasPrice();
        console.log('Current gas price:', gasPrice.toString());

        // Prepare transaction parameters
        const createRentalParams = {
            landlordAddress: selectedApartment.landlord,
            propertyId: selectedApartment._id.toString().substring(0, 31),
            duration: ethers.BigNumber.from(rentalFormData.duration),
            rentAmount: rentAmount
        };

        // Get contract instance
        const contract = getContractInstance('RentalContract', signer);

        // Prepare transaction options with specific gas settings
        const txOptions = {
            value: totalAmount,
            gasLimit: ethers.BigNumber.from('3000000'), // 3 million gas
            gasPrice: gasPrice.mul(120).div(100), // Add 20% to current gas price
            nonce: await provider.getTransactionCount(userAddress, 'latest')
        };

        console.log('Transaction options:', {
            value: txOptions.value.toString(),
            gasLimit: txOptions.gasLimit.toString(),
            gasPrice: txOptions.gasPrice.toString(),
            nonce: txOptions.nonce
        });

        // Send transaction with specific gas settings
        const tx = await contract.createRental(
            createRentalParams.landlordAddress,
            createRentalParams.propertyId,
            createRentalParams.duration,
            createRentalParams.rentAmount,
            txOptions
        );

        console.log('Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait(1); // Wait for 1 confirmation
        console.log('Transaction receipt:', {
            status: receipt.status,
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice.toString(),
            blockNumber: receipt.blockNumber
        });

        if (receipt.status === 1) {
            // Update backend
            const updateResponse = await fetch(`http://localhost:5000/api/apartments/${selectedApartment._id}/rent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantAddress: userAddress,
                    startDate: rentalFormData.startDate,
                    duration: parseInt(rentalFormData.duration),
                    rentAmount: selectedApartment.price,
                    depositAmount: selectedApartment.price * 2,
                    transactionHash: tx.hash
                })
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update apartment status');
            }

            alert('Rental agreement created successfully!');
            setShowRentalForm(false);
            fetchApartments();
        } else {
            throw new Error('Transaction failed');
        }
    } catch (error) {
        console.error('Error creating rental:', error);
        let errorMessage = 'Failed to create rental agreement: ';
        
        if (error.error && error.error.message) {
            errorMessage += error.error.message;
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Unknown error';
        }
        
        alert(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Tenant Dashboard</h1>
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

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'available'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Available Apartments
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'transactions'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          My Transactions
        </button>
      </div>

      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-4">
              <FaSpinner className="animate-spin inline-block mr-2" />
              Loading apartments...
            </div>
          ) : fetchError ? (
            <div className="col-span-3 text-center py-4 text-red-500">
              {fetchError}
            </div>
          ) : apartments.length === 0 ? (
            <div className="col-span-3 text-center py-4">
              No apartments available at the moment.
            </div>
          ) : (
            apartments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={apt.imageUrl}
                    alt={apt.title}
                    className="absolute w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', apt.imageUrl);
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{apt.title}</h3>
                  <p className="text-gray-600">Location: {apt.location}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold">
                      {apt.price} MATIC
                      {maticPrice && (
                        <span className="text-sm text-gray-500 ml-2">
                          (${(parseFloat(apt.price) * maticPrice).toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRentClick(apt)}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Rent Now'}
                  </button>
                </div>
              </div>
            ))
          )}
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
              <div key={index} className="border dark:border-gray-700 rounded p-4 hover:shadow-md 
                transition-shadow bg-white dark:bg-gray-800">
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
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 
                        dark:hover:text-blue-300 ml-1"
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

      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block mb-2">Rating</label>
                <select
                  value={review.rating}
                  onChange={(e) => setReview({...review, rating: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num} Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Comment</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({...review, comment: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRentalForm && selectedApartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Rent Apartment</h3>
              <button 
                onClick={() => setShowRentalForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <img
                src={selectedApartment.imageUrl}
                alt={selectedApartment.title}
                className="w-full h-48 object-cover rounded"
              />
              <h4 className="text-lg font-semibold mt-2">{selectedApartment.title}</h4>
              <p className="text-gray-600">{selectedApartment.location}</p>
              <p className="text-blue-500 font-semibold">
                {selectedApartment.price} MATIC/month
              </p>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                if (!validateRentalForm()) return;
                await handleRentalSubmit(e);
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rentalFormData.startDate}
                  onChange={(e) => setRentalFormData({
                    ...rentalFormData,
                    startDate: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Lease Duration (months)
                </label>
                <select
                  value={rentalFormData.duration}
                  onChange={(e) => setRentalFormData({
                    ...rentalFormData,
                    duration: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="12">12 months</option>
                  <option value="6">6 months</option>
                  <option value="3">3 months</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Security Deposit (MATIC)
                </label>
                <input
                  type="number"
                  value={rentalFormData.depositAmount}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  2 months rent as security deposit
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Confirm Rental'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
