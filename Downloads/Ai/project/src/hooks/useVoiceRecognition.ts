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

export const useVoiceRecognition = (selectedDeviceId?: string): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const deviceIdRef = useRef<string | undefined>(undefined);
  const isListeningRef = useRef(false);
  const isMountedRef = useRef(true);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cleanupStream: (() => void) | null = null;
    let cleanupRecognition: (() => void) | null = null;
    // Only recreate if deviceId actually changes
    if (!isSupported) return;
    if (deviceIdRef.current === selectedDeviceId && recognitionRef.current) {
      // No change, do nothing
      return;
    }
    deviceIdRef.current = selectedDeviceId;
    (async () => {
      // Clean up previous recognition and stream
      if (recognitionRef.current) {
        try { recognitionRef.current.onstart = null; recognitionRef.current.onend = null; recognitionRef.current.onresult = null; recognitionRef.current.onerror = null; recognitionRef.current.stop(); } catch (e) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      const { recognition, stream } = await createSpeechRecognition(selectedDeviceId);
      recognitionRef.current = recognition;
      if (stream) {
        streamRef.current = stream;
        cleanupStream = () => {
          stream.getTracks().forEach(track => track.stop());
        };
      }
      if (!recognition) return;
      isListeningRef.current = false;
      recognition.onstart = () => { if (isMountedRef.current) { setIsListening(true); isListeningRef.current = true; } };
      recognition.onend = () => {
        if (isMountedRef.current) { setIsListening(false); isListeningRef.current = false; }
        // Always restart if not unmounted
        if (isMountedRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
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
        if (isMountedRef.current) setTranscript(correctedTranscript);
      };
      recognition.onerror = () => {
        // Always restart if not unmounted
        if (isMountedRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };
      // Only start if not already listening
      if (!isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    })();
    return () => {
      if (cleanupStream) cleanupStream();
      if (recognitionRef.current) {
        try { recognitionRef.current.onstart = null; recognitionRef.current.onend = null; recognitionRef.current.onresult = null; recognitionRef.current.onerror = null; recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [isSupported, selectedDeviceId]);

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