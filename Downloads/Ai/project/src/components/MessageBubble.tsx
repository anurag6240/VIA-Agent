import React from 'react';
import { User, Bot } from 'lucide-react';
import { ChatMessage } from '../utils/storage';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex gap-2 mb-3 sm:mb-2 ${isUser ? 'justify-start' : 'justify-end'} animate-fade-in`}>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={16} className="text-gray-600" />
        </div>
      )}
      <div
        className={`relative max-w-[95vw] sm:max-w-[75%] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-3xl shadow-md text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words break-all overflow-x-auto ${
          isUser
            ? 'bg-white text-gray-900 rounded-bl-xl border border-gray-200'
            : 'bg-blue-500 text-white rounded-br-xl'
        }`}
      >
        {isUser ? (
          <div>{message.content}</div>
        ) : (
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="font-bold text-lg mb-0 mt-0 leading-tight" {...props} />,
              h2: ({node, ...props}) => <h2 className="font-semibold text-base mb-0 mt-0 leading-tight" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc ml-4 my-0 space-y-0" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-0 space-y-0" {...props} />,
              li: ({node, ...props}) => <li className="mb-0 leading-tight" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
              p: ({node, ...props}) => <p className="mb-0 leading-tight" {...props} />,
              code: ({node, ...props}) => <code className="bg-gray-800 text-xs px-1 py-0.5 rounded break-all" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              br: () => <br />,
              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline text-blue-200 hover:text-blue-100" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        <div className={`mt-1 sm:mt-0 sm:absolute sm:bottom-1 sm:right-3 text-[10px] sm:text-xs opacity-60 ${isUser ? 'text-gray-400' : 'text-blue-100'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};