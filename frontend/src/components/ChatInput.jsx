import React from 'react';

const ChatInput = ({ inputMessage, setInputMessage, handleSubmit, loading, maxChars }) => {
  return (
    <div className="relative max-w-4xl mx-auto px-2 lg:px-0">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Tanyakan apa saja..."
        className="w-full bg-neutral-800 text-white rounded-xl pl-4 pr-24 py-4 focus:outline-none focus:ring-4 focus:ring-violet-500 focus:ring-opacity-50 transition-shadow disabled:opacity-70"
        maxLength={maxChars}
        disabled={loading}
      />

      {/* Character Counter */}
      <span className="absolute right-16 top-1/2 transform -translate-y-1/2 text-xs text-neutral-500">
        {inputMessage.length}/{maxChars}
      </span>

      <button
        onClick={handleSubmit}
        disabled={loading || !inputMessage.trim()}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-violet-600 rounded-lg text-white hover:bg-violet-700 disabled:bg-neutral-700 disabled:text-neutral-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;