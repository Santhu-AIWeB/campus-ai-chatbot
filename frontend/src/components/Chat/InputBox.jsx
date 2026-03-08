import React, { useState } from 'react';

const InputBox = ({ onSend }) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim()) {
            onSend(value.trim());
            setValue('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]"
        >
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-[var(--text-muted)]"
            />
            <button
                type="submit"
                className="bg-indigo-600 text-white rounded-full px-4 py-2 text-sm hover:bg-indigo-700 transition"
            >
                Send
            </button>
        </form>
    );
};

export default InputBox;
