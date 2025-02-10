import { useState } from "react";
import { ethers } from "ethers";

const ContractInteraction = ({ contract }) => {
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    if (!contract) return;
    try {
      const data = await contract.getMessage();
      setMessage(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="text-center mt-10">
      <h2 className="text-xl font-semibold mb-4">Contract Interaction</h2>
      <button onClick={fetchData} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Fetch Message
      </button>
      {message && <p className="mt-4 text-gray-700">Contract Message: {message}</p>}
    </div>
  );
};

export default ContractInteraction;
