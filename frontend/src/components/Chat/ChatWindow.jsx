import React, { useState } from 'react';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);

  const handleSend = (text) => {
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    // TODO: Call chatbot API and append bot response
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
      <div className="bg-indigo-600 text-white px-6 py-4 font-bold text-lg">
        🎓 Campus AI Assistant
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <InputBox onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
