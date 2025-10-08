import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';

export default function EnhancedChatbot() {
  const [conversations, setConversations] = useState([
    { id: 1, title: 'New Chat', messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [typingMessage, setTypingMessage] = useState({ id: null, text: '' });
  const [selectedFiles, setSelectedFiles] = useState([]); // unused for now
  const [isDragging, setIsDragging] = useState(false); // unused for now
  const [copiedId, setCopiedId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const maxChars = 2000;
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const createNewChat = () => {
    const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
    setConversations(prev => [...prev, { id: newId, title: 'New Chat', messages: [] }]);
    setActiveConversationId(newId);
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setLoading(false);
    setIsGenerating(false);

    setTypingMessage(prevTyping => {
      if (prevTyping.id) {
        setConversations(prevConvs => prevConvs.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === prevTyping.id ? { ...msg, text: prevTyping.text } : msg
              )
            };
          }
          return conv;
        }));
      }
      return { id: null, text: '' };
    });
  };

  const simulateTypingEffect = (text, messageId) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    let index = 0;
    setTypingMessage({ id: messageId, text: '' });

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage(prev => ({
          id: messageId,
          text: prev.text + text[index]
        }));
        index++;
      } else {
        clearInterval(typingInterval);
        typingIntervalRef.current = null;

        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId ? { ...msg, text } : msg
              )
            };
          }
          return conv;
        }));

        setTypingMessage({ id: null, text: '' });
        setIsGenerating(false);
      }
    }, 10);

    typingIntervalRef.current = typingInterval;
  };

  const handleSubmit = async () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        return {
          ...conv,
          messages: updatedMessages,
          title: updatedMessages.length === 1 ? inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : '') : conv.title
        };
      }
      return conv;
    }));

    setInputMessage('');
    setLoading(true);
    setIsGenerating(true);

    const aiMessageId = Date.now() + 1;
    const aiMessagePlaceholder = {
      id: aiMessageId,
      text: '...',
      isUser: false
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        return { ...conv, messages: [...conv.messages, aiMessagePlaceholder] };
      }
      return conv;
    }));

    abortControllerRef.current = new AbortController();

    try {
      const currentConv = conversations.find(c => c.id === activeConversationId);
      const chatHistory = currentConv ? [...currentConv.messages, userMessage] : [userMessage];

      const response = await fetch('http://localhost:9000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputMessage,
          history: chatHistory
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      simulateTypingEffect(data.response, aiMessageId);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted by user.');
      } else {
        console.error('Error:', error);
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === aiMessageId ? {
                  ...msg,
                  text: `Error: ${error.message}`,
                  isError: true
                } : msg
              )
            };
          }
          return conv;
        }));

        setLoading(false);
        setIsGenerating(false);
        setTypingMessage({ id: null, text: '' });
      }
    } finally {
      if (abortControllerRef.current !== null) {
        setLoading(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages, typingMessage]);

  return (
    <div className="flex h-screen bg-neutral-900 relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-violet-600 rounded-full text-white shadow-lg"
      >
        {isSidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static w-64 h-full bg-neutral-800 text-white p-4
          flex flex-col transition-transform duration-300 ease-in-out z-40
        `}
      >
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          createNewChat={createNewChat}
          setActiveConversationId={setActiveConversationId}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full relative overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 pt-20 lg:pt-4 pb-32">
          {activeConversation.messages.length === 0 && !loading ? (
            <WelcomeScreen setInputMessage={setInputMessage} />
          ) : (
            <div>
              {activeConversation.messages.map((message, index) => (
                <Message
                  key={message.id || index}
                  message={message}
                  typingMessage={typingMessage}
                  copiedId={copiedId}
                  copyToClipboard={copyToClipboard}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Container */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-neutral-900 p-4 border-t border-neutral-700">
          {/* Stop Button */}
          {isGenerating && (
            <div className="max-w-4xl mx-auto mb-2 flex justify-center">
              <button
                onClick={stopGenerating}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full flex items-center space-x-2 transition-colors shadow-xl"
              >
                <span>⏹</span>
                <span>Stop Generating</span>
              </button>
            </div>
          )}

          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSubmit={handleSubmit}
            loading={loading}
            maxChars={maxChars}
          />
        </div>
      </div>
    </div>
  );
}