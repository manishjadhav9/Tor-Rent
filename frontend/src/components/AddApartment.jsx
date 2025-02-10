import { useState } from "react";

const AddApartment = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    image: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Apartment Added:", form);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Add Apartment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-2 border rounded" type="text" name="title" placeholder="Title" onChange={handleChange} required />
        <textarea className="w-full p-2 border rounded" name="description" placeholder="Description" onChange={handleChange} required></textarea>
        <input className="w-full p-2 border rounded" type="number" name="price" placeholder="Price (ETH)" onChange={handleChange} required />
        <input className="w-full p-2 border rounded" type="text" name="location" placeholder="Location" onChange={handleChange} required />
        <input className="w-full p-2 border rounded" type="text" name="image" placeholder="Image URL" onChange={handleChange} />
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Submit</button>
      </form>
    </div>
  );
};

export default AddApartment;
