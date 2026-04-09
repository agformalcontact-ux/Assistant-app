import { motion } from "motion/react";

interface VoiceVisualizerProps {
  isUserActive: boolean;
  isAssistantActive: boolean;
  volume?: number;
  style?: 'Cyberpunk' | 'Minimalist' | 'Nebula' | 'Dark' | 'Evil';
}

export const VoiceVisualizer = ({ isUserActive, isAssistantActive, volume = 0, style = 'Minimalist' }: VoiceVisualizerProps) => {
  // Scale volume for visual impact
  const scale = isUserActive ? 1 + volume * 5 : 1;
  const assistantScale = isAssistantActive ? 1 + volume * 5 : 1;

  const getOrbColor = () => {
    switch (style) {
      case 'Cyberpunk': return 'from-cyan-400 to-fuchsia-600';
      case 'Nebula': return 'from-indigo-600 via-purple-600 to-pink-500';
      case 'Dark': return 'from-zinc-800 to-zinc-950';
      case 'Evil': return 'from-red-900 to-black';
      default: return 'from-blue-400 to-indigo-600';
    }
  };

  const getBarColor = () => {
    switch (style) {
      case 'Cyberpunk': return 'bg-fuchsia-500';
      case 'Nebula': return 'bg-purple-500';
      case 'Dark': return 'bg-zinc-600';
      case 'Evil': return 'bg-red-600';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          scale: isUserActive || isAssistantActive ? [1, 1.2 * scale, 1] : 1,
          opacity: isUserActive || isAssistantActive ? [0.2, 0.4, 0.2] : 0.1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Orb */}
      <motion.div
        className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${getOrbColor()} shadow-[0_0_50px_rgba(59,130,246,0.5)]`}
        animate={{
          scale: isAssistantActive ? assistantScale : isUserActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
      >
        {style === 'Nebula' && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
          />
        )}
        {/* Inner pulsing rings */}
        {(isAssistantActive || isUserActive) && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2 * (isAssistantActive ? assistantScale : scale), opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          </>
        )}
      </motion.div>

      {/* Waveform bars */}
      <div className="absolute bottom-0 flex gap-1 h-12 items-end">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 ${getBarColor()} rounded-full`}
            animate={{
              height: isUserActive ? [8, 8 + (Math.random() * 32 * scale), 8] : 4,
              opacity: isUserActive ? 1 : 0.2,
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    </div>
  );
};
