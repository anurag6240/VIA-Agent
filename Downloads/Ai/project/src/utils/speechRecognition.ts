import { SpeechRecognition, SpeechRecognitionEvent } from '../types/speech';

export const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const createSpeechRecognition = (): SpeechRecognition | null => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();
  
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  return recognition;
};

export const startListening = (
  recognition: SpeechRecognition,
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onStart: () => void,
  onEnd: () => void
): void => {
  recognition.onstart = onStart;
  recognition.onend = onEnd;
  
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript.trim();
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  try {
    recognition.start();
  } catch (error) {
    onError('Failed to start speech recognition');
  }
};