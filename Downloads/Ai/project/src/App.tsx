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
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [showDeviceHelp, setShowDeviceHelp] = useState(false);

  const {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition(selectedDeviceId);

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

  // Fetch audio input devices
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
      });
    });
  }, []);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-30 shadow-sm" style={{height:'56px'}}>
        <div className="flex items-center gap-3">
          {/* Hide mic button in header on mobile, show on desktop */}
          <div className="hidden sm:block">
            <VoiceButton
              isListening={isListening}
              isProcessing={isProcessing}
              onClick={handleVoiceButtonClick}
              disabled={!isSupported}
              autoRestartEnabled={autoRestartEnabled}
            />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">VIA</h1>
            {/* Device selection dropdown: always visible, styled for mobile */}
            {audioDevices.length > 1 && (
              <select
                className="border rounded px-1 py-1 text-xs max-w-[90px] sm:max-w-xs focus:outline-none"
                value={selectedDeviceId || ''}
                onChange={e => setSelectedDeviceId(e.target.value)}
                title="Select microphone device"
                style={{fontSize:'12px'}}
              >
                <option value="">Default Mic</option>
                {audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(-4)}`}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs underline text-blue-500 hover:text-blue-700"
            onClick={() => setShowDeviceHelp(v => !v)}
            title="Help with Bluetooth and mic selection"
          >
            Mic Help
          </button>
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
      {/* Device help tooltip */}
      {showDeviceHelp && (
        <div className="absolute top-14 right-2 bg-white border border-gray-200 rounded shadow-lg p-3 text-xs z-30 max-w-xs">
          <b>Bluetooth/External Mic Tips:</b>
          <ul className="list-disc ml-4 mt-1">
            <li>Connect your Bluetooth or external mic before opening this app.</li>
            <li>If your mic doesn't appear, refresh the page after connecting.</li>
            <li>On mobile, browser support for device selection may be limited.</li>
            <li>Some browsers may still use the default mic for speech recognition.</li>
          </ul>
        </div>
      )}

      {/* Chat Area (fills between header and footer) */}
      <main className="flex-1 flex flex-col overflow-hidden pt-[56px] pb-[48px]">
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
      </main>

      {/* Fixed Footer for Helper Text */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30" style={{height:'48px'}}>
        <p className="text-center text-xs text-gray-400 m-0">
          {isProcessing ? 'Processing...' :
            (autoRestartEnabled ? 'Microphone is always listening for questions' : 'Tap microphone to enable auto-listening')}
        </p>
      </footer>

      {/* Floating mic button for mobile */}
      <div className="sm:hidden fixed bottom-16 right-4 z-40">
        <VoiceButton
          isListening={isListening}
          isProcessing={isProcessing}
          onClick={handleVoiceButtonClick}
          disabled={!isSupported}
          autoRestartEnabled={autoRestartEnabled}
        />
      </div>
    </div>
  );
}

export default App;