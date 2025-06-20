import { useState, useRef, useEffect } from 'react';
import { SpeechRecognition } from '../types/speech';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { autoCorrectText } from '../utils/questionDetection';

export interface UseVoiceRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = isSpeechRecognitionSupported();

  // Always start mic on mount and keep it running
  useEffect(() => {
    if (!isSupported) return;
    if (!recognitionRef.current) {
      recognitionRef.current = createSpeechRecognition();
    }
    const recognition = recognitionRef.current;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Always restart
      try {
        recognition.start();
      } catch (e) {}
    };
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const correctedTranscript = autoCorrectText(finalTranscript + interimTranscript);
      setTranscript(correctedTranscript);
    };
    recognition.onerror = () => {
      // Always restart
      try {
        recognition.start();
      } catch (e) {}
    };
    try {
      recognition.start();
    } catch (e) {}
    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isSupported]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  };
};