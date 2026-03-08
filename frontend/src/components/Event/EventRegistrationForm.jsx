import React, { useState } from 'react';

const EventRegistrationForm = ({ eventId, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: POST to /api/registrations
        onSuccess && onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-2xl shadow">
            <h2 className="text-xl font-bold text-indigo-700">Register for Event</h2>
            <input
                type="text" placeholder="Your Name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
            />
            <input
                type="email" placeholder="Your Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                Register
            </button>
        </form>
    );
};

export default EventRegistrationForm;
