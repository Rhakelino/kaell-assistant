import React from 'react';

const Sidebar = ({ conversations, activeConversationId, createNewChat, setActiveConversationId, setIsSidebarOpen }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-2xl font-extrabold mb-6 text-violet-400">Kaell Assistant</div>
      <button
        onClick={() => {
          createNewChat();
          setIsSidebarOpen(false);
        }}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 px-4 mb-4 flex items-center justify-center space-x-2 transition-transform duration-150 transform hover:scale-[1.02]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Chat Baru</span>
      </button>
      <div className="flex-1 overflow-y-auto space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => {
              setActiveConversationId(conv.id);
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
              conv.id === activeConversationId ? 'bg-violet-600 text-white shadow-lg' : 'hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-xl">💬</span>
              <div className="truncate font-medium">{conv.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;