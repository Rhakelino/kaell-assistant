import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ message, typingMessage, copiedId, copyToClipboard }) => {
  return (
    <div className="mb-6">
      <div className={`flex items-start ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        {!message.isUser && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-lg shadow-xl">
              🤖
            </div>
          </div>
        )}
        <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} w-full lg:max-w-4xl`}>
          <div
            className={`px-4 py-3 rounded-xl shadow-lg ${
              message.isUser
                ? 'bg-violet-600 text-white rounded-br-none'
                : 'bg-neutral-800 text-white rounded-bl-none'
            } ${message.isError ? 'bg-red-800 border border-red-500' : ''}`}
          >
            {message.isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.text}</div>
            ) : (
              <div className="prose prose-invert max-w-none text-neutral-200">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {typingMessage.id === message.id ? typingMessage.text : message.text}
                </ReactMarkdown>
                {typingMessage.id === message.id && (
                  <span className="inline-block w-1 h-4 ml-1 bg-white animate-pulse"></span>
                )}
              </div>
            )}
          </div>

          {/* Copy Button untuk AI Response */}
          {!message.isUser && message.text && !message.isError && (
            <button
              onClick={() => copyToClipboard(message.text, message.id)}
              className="mt-2 px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-lg flex items-center space-x-1 transition-colors shadow-md"
            >
              {copiedId === message.id ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-7 4l3 3 6-6"
                    />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
        {message.isUser && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm shadow-xl">
              👤
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;