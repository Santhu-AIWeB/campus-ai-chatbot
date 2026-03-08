import React from 'react';
import ChatWindow from '../components/Chat/ChatWindow';

const ChatbotPage = () => {
    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-10 flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">💬 AI Campus Chat</h1>
                <p className="text-sm text-gray-500 mt-0.5">Ask anything — powered by Rasa + LLM</p>
            </div>
            {/* ChatWindow fills remaining vertical space */}
            <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
                <ChatWindow />
            </div>
        </div>
    );
};

export default ChatbotPage;
