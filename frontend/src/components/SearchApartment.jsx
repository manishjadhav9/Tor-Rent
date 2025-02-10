import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SearchApartment = () => {
  const [searchParams, setSearchParams] = useState({
    city: "",
    priceMin: "",
    priceMax: "",
    propertyType: "",
    amenities: [],
    availableFrom: "",
    availableTo: ""
  });
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchApartments = async () => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams({
        ...searchParams,
        amenities: searchParams.amenities.join(',')
      }).toString();

      const response = await fetch(`/apartments/search?${queryString}`);
      const data = await response.json();
      setApartments(data);
    } catch (error) {
      console.error("Error searching apartments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="City"
          onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
        />
        <select
          className="border p-2 rounded"
          onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})}
        >
          <option value="">Property Type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
          <option value="room">Room</option>
        </select>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-1/2"
            type="number"
            placeholder="Min ETH"
            onChange={(e) => setSearchParams({...searchParams, priceMin: e.target.value})}
          />
          <input
            className="border p-2 rounded w-1/2"
            type="number"
            placeholder="Max ETH"
            onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})}
          />
        </div>
      </div>

      <button
        onClick={searchApartments}
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {apartments.map((apt) => (
          <div key={apt._id} className="border rounded-lg overflow-hidden shadow-lg">
            {apt.images[0] && (
              <img 
                src={`${process.env.REACT_APP_API_URL}${apt.images[0]}`} 
                alt={apt.title} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{apt.title}</h3>
              <p className="text-gray-600 mb-2">{apt.location.city}</p>
              <p className="text-blue-500 font-bold">{apt.price.amount} ETH</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {apt.amenities.map((amenity, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchApartment;
