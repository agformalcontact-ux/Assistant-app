import { useState, useCallback, useRef, useEffect } from 'react';
import { connectLive } from '@/lib/gemini';
import { LiveServerMessage } from '@google/genai';

export const useLiveAssistant = (voice: string = "Puck", accent: string = "Standard", facts: string[] = [], model: string = "gemini-3.1-flash-live-preview") => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState({ input: '', output: '' });
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const playNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const pcmData = audioQueueRef.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 32768.0;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      playNextChunk();
    };
    source.start();
  }, []);

  const start = useCallback(async (onToolCall?: (name: string, args: any) => Promise<any> | any) => {
    // Check if we're in a serverless environment (Vercel)
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      setError("Live voice mode is not available in this deployment. Please use text mode.");
      setIsConnecting(false);
      return;
    }

    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      setError("AudioContext is not supported in this browser.");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Microphone access is not supported in this browser.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      await audioContextRef.current.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // ScriptProcessor is deprecated but easiest for raw PCM in this context
      // For production, use AudioWorklet
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      const sessionPromise = connectLive({
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          source.connect(processorRef.current!);
          processorRef.current!.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const binary = atob(base64Audio);
            const pcm = new Int16Array(binary.length / 2);
            for (let i = 0; i < pcm.length; i++) {
              pcm[i] = (binary.charCodeAt(i * 2) & 0xFF) | ((binary.charCodeAt(i * 2 + 1) & 0xFF) << 8);
            }
            audioQueueRef.current.push(pcm);
            if (!isPlayingRef.current) playNextChunk();
          }

          // Handle Transcriptions
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
             setTranscript(prev => ({ ...prev, output: message.serverContent?.modelTurn?.parts?.[0]?.text || '' }));
          }

          // Handle Tool Calls
          const toolCalls = message.toolCall?.functionCalls;
          if (toolCalls && onToolCall && sessionRef.current) {
            const responses = [];
            for (const call of toolCalls) {
              const result = await Promise.resolve(onToolCall(call.name, call.args));
              responses.push({
                id: call.id,
                name: call.name,
                response: { result: result || { status: 'success' } }
              });
            }
            sessionRef.current.sendToolResponse({ functionResponses: responses });
          }

          // Handle Interruption
          if (message.serverContent?.interrupted) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsSpeaking(false);
          }
        },
        onerror: (e: any) => {
          setError(e.message || "Connection error");
          stop();
        },
        onclose: () => stop()
      }, voice, accent, facts, model);

      sessionRef.current = await sessionPromise;

      processorRef.current!.onaudioprocess = (e) => {
        if (!sessionRef.current || isMuted) {
          setVolume(0);
          return;
        }
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setVolume(rms);

        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Safer base64 conversion for large arrays
        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = "";
        const len = uint8.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      };

    } catch (err: any) {
      setError(err.message || "Failed to start assistant");
      setIsConnecting(false);
      stop();
    }
  }, [voice, stop, playNextChunk]);

  const sendImage = useCallback((base64: string) => {
    if (sessionRef.current && isActive) {
      sessionRef.current.sendRealtimeInput({
        image: { data: base64, mimeType: 'image/jpeg' }
      });
    }
  }, [isActive]);

  return {
    isActive,
    isConnecting,
    error,
    transcript,
    volume,
    isSpeaking,
    isMuted,
    setIsMuted,
    start,
    stop,
    sendImage
  };
};
