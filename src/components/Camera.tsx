import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera as CameraIcon, X, RefreshCw, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface CameraProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  showAR?: boolean;
}

export const Camera = ({ onCapture, onClose, showAR = false }: CameraProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [arLabels, setArLabels] = useState<{ x: number, y: number, text: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulated AR detection
  useEffect(() => {
    if (isReady && showAR) {
      const interval = setInterval(() => {
        const labels = [
          { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, text: "Object Detected" },
          { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, text: "Analyzing..." }
        ];
        setArLabels(labels);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setArLabels([]);
    }
  }, [isReady, showAR]);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        setIsReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(base64.split(',')[1]); // Send just the data part
        stopCamera();
        onClose();
      }
    }
  };

  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="relative flex-1 bg-zinc-900 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-3xl pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-l-2 border-blue-500 absolute top-0 left-0 rounded-tl-xl" />
          <div className="w-8 h-8 border-t-2 border-r-2 border-blue-500 absolute top-0 right-0 rounded-tr-xl" />
          <div className="w-8 h-8 border-b-2 border-l-2 border-blue-500 absolute bottom-0 left-0 rounded-bl-xl" />
          <div className="w-8 h-8 border-b-2 border-r-2 border-blue-500 absolute bottom-0 right-0 rounded-br-xl" />
        </div>

        {/* AR Labels */}
        <AnimatePresence>
          {arLabels.map((label, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ left: `${label.x}%`, top: `${label.y}%` }}
              className="absolute pointer-events-none"
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full border-2 border-blue-400 animate-ping" />
                <div className="mt-2 px-2 py-1 bg-blue-600/80 backdrop-blur-md rounded text-[10px] text-white font-mono whitespace-nowrap">
                  {label.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => { stopCamera(); onClose(); }}
          className="absolute top-6 right-6 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="h-32 bg-black flex items-center justify-around px-8">
        <Button variant="ghost" size="icon" className="text-white/60">
          <Zap className="w-6 h-6" />
        </Button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={capture}
          disabled={!isReady}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white transition-opacity hover:opacity-80" />
        </motion.button>

        <Button variant="ghost" size="icon" className="text-white/60">
          <RefreshCw className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  );
};
