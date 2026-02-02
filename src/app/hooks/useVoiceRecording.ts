import { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeAudioBlob } from '@/services/sttApi';

interface UseVoiceRecordingProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

export function useVoiceRecording({ onTranscript, onError, continuous = true }: UseVoiceRecordingProps) {
    // --- Audio Recorder for backend STT ---
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Helper: Start MediaRecorder for backend STT
    const startMediaRecorder = useCallback(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            const transcript = await transcribeAudioBlob(audioBlob);
            onTranscriptRef.current(transcript + ' ');
          } catch (err: any) {
            onErrorRef.current?.(err.message || 'stt-failed');
          }
          // Clean up stream
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err: any) {
        onErrorRef.current?.('not-allowed');
      }
    }, []);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);
  const restartTimeoutRef = useRef<number>();
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const isRecordingRef = useRef(false);

  // Keep refs up to date
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    console.log('⏹️ Stopping recording...');
    isStoppingRef.current = true;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = undefined;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      recognitionRef.current = null;
    }
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    // Try browser STT first
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        // Browser STT logic (original)
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
          setIsRecording(true);
          isStoppingRef.current = false;
        };
        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            if (result.isFinal) {
              onTranscriptRef.current(transcript + ' ');
            }
          }
        };
        recognition.onerror = (event: any) => {
          if (isStoppingRef.current) return;
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setIsRecording(false);
            onErrorRef.current?.('not-allowed');
          } else if (event.error === 'no-speech') {
            // normal
          } else if (event.error === 'audio-capture') {
            setIsRecording(false);
            onErrorRef.current?.('audio-capture');
          } else if (event.error === 'network') {
            setIsRecording(false);
            onErrorRef.current?.('network');
          }
        };
        recognition.onend = () => {
          if (continuous && !isStoppingRef.current && isRecordingRef.current) {
            restartTimeoutRef.current = window.setTimeout(() => {
              if (!isStoppingRef.current && isRecordingRef.current) {
                try {
                  recognitionRef.current?.start();
                } catch (e: any) {
                  setIsRecording(false);
                }
              }
            }, 300);
          } else {
            setIsRecording(false);
            recognitionRef.current = null;
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
        return;
      } catch (err: any) {
        // Fallback to backend STT if browser STT fails
      }
    }
    // Fallback: Use backend STT (record audio, send to API)
    await startMediaRecorder();
  }, [continuous, startMediaRecorder]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
