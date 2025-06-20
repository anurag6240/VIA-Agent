import { SpeechRecognition, SpeechRecognitionEvent } from '../types/speech';

export const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const createSpeechRecognition = async (deviceId?: string): Promise<{ recognition: SpeechRecognition | null, stream?: MediaStream }> => {
  if (!isSpeechRecognitionSupported()) {
    return { recognition: null };
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();
  
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-IN';
  recognition.maxAlternatives = 1;

  let stream: MediaStream | undefined = undefined;
  if (deviceId) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
      // Note: Web Speech API does not allow us to directly set the input stream, but requesting getUserMedia may help browsers pick the right device.
    } catch (e) {
      // fallback: ignore error, use default mic
    }
  }

  return { recognition, stream };
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