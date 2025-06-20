import React, { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '../utils/storage';

interface ChatContainerProps {
  messages: ChatMessage[];
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500 max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Ready to Practice!</h3>
          <p className="text-sm leading-relaxed">
            Tap the microphone button and ask any interview question. I'll help you practice with detailed, professional answers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 w-full max-w-full" style={{scrollBehavior:'smooth'}}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};