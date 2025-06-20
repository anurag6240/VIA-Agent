import React, { useState, useEffect } from 'react';
import { Trash2, Settings, HelpCircle } from 'lucide-react';
import { ChatContainer } from './components/ChatContainer';
import { VoiceButton } from './components/VoiceButton';
import { StatusIndicator, Status } from './components/StatusIndicator';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { isInterviewQuestion, cleanQuestion } from './utils/questionDetection';
import { generateAnswer } from './utils/geminiApi';
import { 
  ChatMessage, 
  saveChatHistory, 
  loadChatHistory, 
  clearChatHistory, 
  generateMessageId 
} from './utils/storage';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRestartEnabled, setAutoRestartEnabled] = useState(true);

  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition();

  // Load chat history on mount
  useEffect(() => {
    const savedMessages = loadChatHistory();
    setMessages(savedMessages);
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Auto-start microphone when app loads
  useEffect(() => {
    if (isSupported && autoRestartEnabled && !isListening && !isProcessing) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSupported, autoRestartEnabled, isListening, isProcessing, startListening]);

  // Handle speech recognition results
  useEffect(() => {
    if (transcript && !isListening) {
      handleTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening]);

  // Handle speech recognition errors and auto-restart
  useEffect(() => {
    if (error) {
      console.log('Speech recognition error:', error);
      setStatus('error');
      setStatusMessage('Restarting microphone...');
      
      // Auto-restart after error
      setTimeout(() => {
        if (autoRestartEnabled && !isProcessing) {
          startListening();
          setStatus('idle');
          setStatusMessage('');
        }
      }, 1000);
    }
  }, [error, autoRestartEnabled, isProcessing, startListening]);

  // Auto-restart microphone after processing is complete
  useEffect(() => {
    if (!isProcessing && !isListening && autoRestartEnabled && isSupported) {
      const timer = setTimeout(() => {
        startListening();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isListening, autoRestartEnabled, isSupported, startListening]);

  // Update status based on listening state
  useEffect(() => {
    if (isListening) {
      setStatus('listening');
      setStatusMessage('');
    } else if (!isProcessing && status === 'listening') {
      setStatus('idle');
    }
  }, [isListening, isProcessing]);

  const handleTranscript = async (text: string) => {
    const cleanedQuestion = cleanQuestion(text);
    
    if (!isInterviewQuestion(cleanedQuestion)) {
      setStatus('error');
      setStatusMessage('Please ask an interview-related question');
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 2000);
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content: cleanedQuestion,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setStatus('processing');
    setIsProcessing(true);

    try {
      const answer = await generateAnswer(cleanedQuestion);
      
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'ai',
        content: answer,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      setStatus('idle');
    } catch (error) {
      console.error('Error generating answer:', error);
      setStatus('error');
      setStatusMessage('Failed to generate answer. Please try again.');
      
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceButtonClick = () => {
    // Toggle auto-restart instead of stopping the mic
    setAutoRestartEnabled(!autoRestartEnabled);
    if (!autoRestartEnabled) {
      // If re-enabling, start listening immediately
      startListening();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    clearChatHistory();
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <HelpCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Speech Recognition Not Supported
          </h2>
          <p className="text-gray-600 text-sm">
            Your browser doesn't support speech recognition. Please use Chrome, Safari, or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <VoiceButton
            isListening={isListening}
            isProcessing={isProcessing}
            onClick={handleVoiceButtonClick}
            disabled={!isSupported}
            autoRestartEnabled={autoRestartEnabled}
          />
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">VIA</h1>
            <div className="hidden sm:block">
              <StatusIndicator status={status} message={statusMessage} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Clear chat history"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer messages={messages} />
        {isProcessing && (
          <div className="flex justify-end px-6 py-2">
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded-2xl px-4 py-2 shadow animate-pulse">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              <span className="ml-2 text-sm font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {!isListening && !isProcessing && (
        <div className="px-4 pb-3 sm:pb-0 mt-2 sm:mt-0">
          <p className="text-center text-xs text-gray-400">
            {autoRestartEnabled ? 'Microphone is always listening for questions' : 'Tap microphone to enable auto-listening'}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;