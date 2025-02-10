import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact Form Submitted:", form);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-center mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-2 border rounded" type="text" name="name" placeholder="Your Name" onChange={handleChange} required />
        <input className="w-full p-2 border rounded" type="email" name="email" placeholder="Your Email" onChange={handleChange} required />
        <textarea className="w-full p-2 border rounded" name="message" placeholder="Your Message" onChange={handleChange} required></textarea>
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
