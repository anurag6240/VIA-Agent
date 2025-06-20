import React from 'react';
import { Mic, MicOff, Brain, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export type Status = 'idle' | 'listening' | 'processing' | 'error' | 'offline';

interface StatusIndicatorProps {
  status: Status;
  message?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, message }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          icon: <Mic size={16} />,
          text: 'Listening...',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'processing':
        return {
          icon: <Brain size={16} className="animate-pulse" />,
          text: 'Thinking...',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          text: message || 'Error occurred',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'offline':
        return {
          icon: <WifiOff size={16} />,
          text: 'Offline mode',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          icon: <MicOff size={16} />,
          text: 'Tap mic to start',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium shadow-sm bg-opacity-95 ${config.className}`}
      style={{minHeight:'2.2rem'}}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};