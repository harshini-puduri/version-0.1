import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecordingProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

export function useVoiceRecording({ onTranscript, onError, continuous = true }: UseVoiceRecordingProps) {
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
    
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Attempting to start recording...');
      
      // Check if Speech Recognition is supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('❌ Speech Recognition not supported in this browser');
        onErrorRef.current?.('not-supported');
        return;
      }

      console.log('✅ Speech Recognition API available');

      // Request microphone permission first
      try {
        console.log('🎤 Requesting microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        console.error('❌ Microphone permission error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          onErrorRef.current?.('not-allowed');
        } else if (err.name === 'NotFoundError') {
          onErrorRef.current?.('audio-capture');
        } else {
          onErrorRef.current?.('not-allowed');
        }
        return;
      }

      // Create and configure speech recognition
      const recognition = new SpeechRecognition();
      
      // Safari-friendly settings
      recognition.continuous = false; // Safari works better with false, we'll manually restart
      recognition.interimResults = false; // Safari prefers final results only
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log('📋 Recognition configured:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });

      recognition.onstart = () => {
        console.log('✅ Speech recognition started successfully');
        setIsRecording(true);
        isStoppingRef.current = false;
      };

      recognition.onresult = (event: any) => {
        console.log('📝 Got speech result:', event.results);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          console.log('📝 Transcript:', transcript, 'isFinal:', result.isFinal);
          
          if (result.isFinal) {
            onTranscriptRef.current(transcript + ' ');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        
        // Don't trigger errors when we're intentionally stopping
        if (isStoppingRef.current) {
          console.log('(Error ignored - we are stopping)');
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsRecording(false);
          onErrorRef.current?.('not-allowed');
        } else if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, will restart...');
          // Don't show error - this is normal
        } else if (event.error === 'audio-capture') {
          setIsRecording(false);
          onErrorRef.current?.('audio-capture');
        } else if (event.error === 'network') {
          setIsRecording(false);
          onErrorRef.current?.('network');
        } else if (event.error === 'aborted') {
          console.log('(Aborted - normal when stopping)');
        } else {
          console.error('Unknown error:', event.error);
        }
      };

      recognition.onend = () => {
        console.log('🛑 Speech recognition ended');
        
        // Auto-restart if we're in continuous mode and not intentionally stopping
        if (continuous && !isStoppingRef.current && isRecordingRef.current) {
          console.log('🔄 Auto-restarting recognition in 300ms...');
          restartTimeoutRef.current = window.setTimeout(() => {
            if (!isStoppingRef.current && isRecordingRef.current) {
              try {
                console.log('🔄 Restarting...');
                recognitionRef.current?.start();
              } catch (e: any) {
                console.error('❌ Error restarting:', e.message);
                setIsRecording(false);
              }
            }
          }, 300);
        } else {
          console.log('Not restarting - continuous:', continuous, 'isStopping:', isStoppingRef.current);
          setIsRecording(false);
          recognitionRef.current = null;
        }
      };

      // Start recording
      recognition.start();
      recognitionRef.current = recognition;
      console.log('🚀 Recognition start() called');

    } catch (error: any) {
      console.error('❌ Failed to start recording:', error.message);
      setIsRecording(false);
      onErrorRef.current?.('not-allowed');
    }
  }, [continuous]);

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
