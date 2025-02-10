import { useState } from "react";
import { ethers } from "ethers";

const Payment = ({ contract }) => {
  const [amount, setAmount] = useState("");

  const handlePayment = async () => {
    if (!window.ethereum || !contract) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const transaction = await signer.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther(amount),
      });
      console.log("Payment Successful:", transaction);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div className="text-center mt-10">
      <h2 className="text-xl font-semibold">Make a Payment</h2>
      <input className="border p-2 rounded mt-2" type="number" placeholder="Amount in ETH" onChange={(e) => setAmount(e.target.value)} />
      <button onClick={handlePayment} className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Pay Now
      </button>
    </div>
  );
};

export default Payment;
