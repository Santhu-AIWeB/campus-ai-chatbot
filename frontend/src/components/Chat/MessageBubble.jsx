import React from 'react';

const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot';
    return (
        <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
            <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${isBot
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}
            >
                {message.text}
            </div>
        </div>
    );
};

export default MessageBubble;
