import React from 'react';
import { Mic, MicOff, Pause, Play } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
  disabled?: boolean;
  autoRestartEnabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  isListening, 
  isProcessing, 
  onClick, 
  disabled = false,
  autoRestartEnabled = true
}) => {
  const getButtonClass = () => {
    if (disabled) {
      return 'bg-gray-300 cursor-not-allowed';
    }
    if (!autoRestartEnabled) {
      return 'bg-gray-500 hover:bg-gray-600 shadow-md shadow-gray-200';
    }
    if (isListening) {
      return 'bg-green-500 animate-pulse shadow-md shadow-green-200';
    }
    if (isProcessing) {
      return 'bg-blue-500 cursor-wait animate-pulse';
    }
    return 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-200';
  };

  const getIcon = () => {
    if (!autoRestartEnabled) {
      return <Play size={18} />;
    }
    if (isListening) {
      return <Mic size={18} />;
    }
    if (isProcessing) {
      return <Mic size={18} className="animate-spin" />;
    }
    return <Mic size={18} />;
  };

  const getAriaLabel = () => {
    if (!autoRestartEnabled) {
      return 'Enable auto-listening';
    }
    if (isListening) {
      return 'Microphone active - tap to disable auto-restart';
    }
    if (isProcessing) {
      return 'Processing - microphone will restart automatically';
    }
    return 'Microphone ready - tap to disable auto-restart';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 transform active:scale-95 shadow-lg ${getButtonClass()}`}
      aria-label={getAriaLabel()}
      title={autoRestartEnabled ? 'Auto-listening enabled' : 'Auto-listening disabled'}
      style={{boxShadow:'0 4px 24px 0 rgba(0,0,0,0.10)'}}
    >
      {getIcon()}
    </button>
  );
};