import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Mic, Camera, Brain, Bell, Shield, Languages, Dumbbell, Receipt, MapPin, Edit3, UserCircle, Settings, Volume2, Gamepad2, Search, AlertTriangle, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Feature {
  id: string;
  name: string;
  icon: any;
  shortDesc: string;
  longDesc: string;
  settings?: {
    label: string;
    type: 'toggle' | 'select';
    options?: string[];
    value: any;
    onChange: (val: any) => void;
  }[];
}

interface HelpProps {
  onClose: () => void;
  currentSettings: any;
  updateSetting: (key: string, val: any) => void;
}

export const Help = ({ onClose, currentSettings, updateSetting }: HelpProps) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const features: Feature[] = [
    {
      id: 'voice',
      name: 'Voice Interaction',
      icon: Mic,
      shortDesc: 'Talk to Nova in real-time with low latency and natural responses.',
      longDesc: 'Nova uses the Gemini Live API to provide a fluid, conversational experience. You can interrupt Nova, ask follow-up questions, and have a natural dialogue just like talking to a human.',
      settings: [
        {
          label: 'Gemini Voice',
          type: 'select',
          options: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'],
          value: currentSettings.selectedVoice,
          onChange: (val) => updateSetting('selectedVoice', val)
        },
        {
          label: 'Gemini Model',
          type: 'select',
          options: ['gemini-3.1-flash-live-preview', 'gemini-2.0-flash-exp', 'gemini-2.0-flash-preview'],
          value: currentSettings.selectedModel,
          onChange: (val) => updateSetting('selectedModel', val)
        }
      ]
    },
    {
      id: 'vision',
      name: 'Visual Memory',
      icon: Camera,
      shortDesc: 'Nova can see and remember objects through your camera.',
      longDesc: 'By using the camera, Nova can identify objects, read text, and even remember where you put things. Just show Nova an object and ask her to remember it.',
      settings: [
        {
          label: 'AR Overlay',
          type: 'toggle',
          value: currentSettings.showAR,
          onChange: (val) => updateSetting('showAR', val)
        }
      ]
    },
    {
      id: 'style',
      name: 'Visual Styles',
      icon: Sparkles,
      shortDesc: 'Customize Nova\'s appearance with different visual themes.',
      longDesc: 'Choose from various visual styles for Nova\'s orb, including Minimalist, Cyberpunk, and Nebula. Each style has its own unique animation and color palette.',
      settings: [
        {
          label: 'Theme',
          type: 'select',
          options: ['Minimalist', 'Cyberpunk', 'Nebula'],
          value: currentSettings.visualStyle,
          onChange: (val) => updateSetting('visualStyle', val)
        }
      ]
    },
    {
      id: 'focus',
      name: 'Focus Mode',
      icon: Shield,
      shortDesc: 'Minimize distractions and filter notifications for deep work.',
      longDesc: 'Focus Mode acts as an AI gatekeeper, filtering out non-essential notifications and helping you stay in the zone. Nova will only interrupt for high-priority alerts.',
      settings: [
        {
          label: 'Enabled',
          type: 'toggle',
          value: currentSettings.focusMode,
          onChange: (val) => updateSetting('focusMode', val)
        }
      ]
    },
    {
      id: 'interpreter',
      name: 'Real-time Interpreter',
      icon: Languages,
      shortDesc: 'Translate conversations instantly between multiple languages.',
      longDesc: 'Nova can act as a bridge between languages, providing real-time voice and text translation. Perfect for travel or learning a new language.',
    },
    {
      id: 'fitness',
      name: 'Fitness Coach',
      icon: Dumbbell,
      shortDesc: 'Get real-time feedback on your exercise form via camera.',
      longDesc: 'Nova uses computer vision to analyze your movements during workouts, providing audio cues to help you maintain perfect form and avoid injury.',
    },
    {
      id: 'expense',
      name: 'Expense Scanner',
      icon: Receipt,
      shortDesc: 'Scan receipts and track your spending automatically.',
      longDesc: 'Point your camera at any receipt, and Nova will extract the merchant, amount, and category, logging it directly into your finance dashboard.',
    },
    {
      id: 'whiteboard',
      name: 'Collaborative Whiteboard',
      icon: Edit3,
      shortDesc: 'Brainstorm and sketch ideas on a shared digital canvas.',
      longDesc: 'Work together with Nova on a shared whiteboard. You can draw or describe ideas, and Nova can add elements or suggest improvements in real-time.',
    },
    {
      id: 'gaming',
      name: 'AI Gaming',
      icon: Gamepad2,
      shortDesc: 'Play voice-based RPGs, trivia, and mystery games.',
      longDesc: 'Nova can act as a Dungeon Master or game host, creating immersive stories and challenging your knowledge with interactive voice games.',
    },
    {
      id: 'travel',
      name: 'Travel Assistant',
      icon: MapPin,
      shortDesc: 'Get contextual travel info and booking assistance.',
      longDesc: 'Nova helps you plan trips, find local attractions, and manage bookings. She can provide real-time updates on flights and weather.',
    },
    {
      id: 'sos',
      name: 'SOS Emergency',
      icon: AlertTriangle,
      shortDesc: 'Trigger emergency alerts and share your location.',
      longDesc: 'In an emergency, Nova can quickly alert your emergency contacts and share your precise location. Just say "SOS" or use the emergency trigger.',
    },
    {
      id: 'shadowing',
      name: 'Shadowing Mode',
      icon: Brain,
      shortDesc: 'Practice language pronunciation by repeating after Nova.',
      longDesc: 'Shadowing mode helps you master a new language by having you repeat phrases after Nova. She provides instant feedback on your pronunciation and rhythm.',
    },
    {
      id: 'soundscapes',
      name: 'Ambient Soundscapes',
      icon: Music,
      shortDesc: 'Immersive audio environments for focus or relaxation.',
      longDesc: 'Choose from various ambient soundscapes like Nebula, Cyberpunk, or Nature to create the perfect environment for your current task.',
      settings: [
        {
          label: 'Soundscape',
          type: 'select',
          options: ['None', 'Nebula', 'Cyberpunk', 'Nature', 'Deep Space'],
          value: currentSettings.soundscape || 'None',
          onChange: (val) => updateSetting('soundscape', val === 'None' ? null : val)
        }
      ]
    },
    {
      id: 'twin',
      name: 'Digital Twin',
      icon: UserCircle,
      shortDesc: 'Nova can adopt different personas or your own digital twin.',
      longDesc: 'Nova can adapt her personality to match your needs, whether you want a professional assistant, a playful companion, or a digital version of yourself.',
      settings: [
        {
          label: 'Personality',
          type: 'select',
          options: ['Helpful', 'Sarcastic', 'Professional', 'Playful'],
          value: currentSettings.personality,
          onChange: (val) => updateSetting('personality', val)
        }
      ]
    }
  ];

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col">
      <header className="p-6 border-b border-white/10 flex items-center gap-4 bg-zinc-950/50 backdrop-blur-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={selectedFeature ? () => setSelectedFeature(null) : onClose}
          className="rounded-full hover:bg-white/5"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight">
          {selectedFeature ? selectedFeature.name : 'Nova Help Center'}
        </h2>
      </header>

      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          {!selectedFeature ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-4"
            >
              <p className="text-white/40 text-sm mb-6">
                Discover everything Nova can do. Tap any feature to learn more and customize your experience.
              </p>
              
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{feature.name}</h3>
                    <p className="text-xs text-white/40 line-clamp-1">{feature.shortDesc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-8">
                <selectedFeature.icon className="w-10 h-10 text-blue-400" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">{selectedFeature.name}</h3>
              <p className="text-white/60 leading-relaxed mb-8">
                {selectedFeature.longDesc}
              </p>

              {selectedFeature.settings && (
                <div className="space-y-6 pt-8 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Preferences</h4>
                  {selectedFeature.settings.map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-sm font-medium">{setting.label}</span>
                      {setting.type === 'toggle' ? (
                        <button
                          onClick={() => setting.onChange(!!setting.value ? false : true)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${!!setting.value ? 'bg-blue-600' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!!setting.value ? 'left-7' : 'left-1'}`} />
                        </button>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-2 max-w-[200px]">
                          {setting.options?.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setting.onChange(opt)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${setting.value === opt ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};
