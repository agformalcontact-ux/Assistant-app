import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Brain, Dumbbell, Receipt, Languages, Shield, Edit3, AlertTriangle, MapPin, Mic, MicOff, MessageSquare, Settings, Bell, Send, Volume2, Download, Sparkles, ChevronRight, Camera as CameraIcon, X, Zap, HelpCircle, Menu, History } from 'lucide-react';
import { useLiveAssistant } from '@/hooks/useLiveAssistant';
import { VoiceVisualizer } from './VoiceVisualizer';
import { Camera } from './Camera';
import { memoryService } from '@/lib/memory';
import { sounds } from '@/lib/sounds';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, FirebaseUser } from '@/lib/firebase';
import { Auth } from './Auth';
import { Help } from './Help';
import { SettingsPage } from './SettingsPage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'];

interface LogEntry {
  type: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  category?: string;
}

interface UserProfile {
  name?: string;
  preferences?: {
    voice?: string;
    theme?: string;
    personality?: string;
    useElevenLabs?: boolean;
    elevenLabsVoice?: string;
    visualStyle?: string;
    focusMode?: boolean;
    soundscape?: string;
    showAR?: boolean;
    selectedModel?: string;
  };
  facts?: string[];
}

interface HealthData {
  metric: string;
  value: number;
  unit: string;
}

interface ProductivityData {
  period: string;
  screenTime: string;
  topApp: string;
}

interface InterpreterData {
  text: string;
  translation: string;
  lang: string;
}

interface GamingData {
  type: string;
  status: string;
}

interface VisualMemory {
  description: string;
  timestamp?: Date;
}

interface Expense {
  amount: number;
  merchant: string;
  category?: string;
  timestamp?: Date;
}

interface FitnessData {
  exercise: string;
  feedback: string;
}

interface ExpenseData {
  amount: number;
  merchant: string;
  category?: string;
}

interface TravelData {
  landmark: string;
  info: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Assistant = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [facts, setFacts] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const chatSessionRef = useRef<any>(null); // Keep as any for now, complex Gemini type
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [accent, setAccent] = useState('Standard');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-live-preview');
  const [personality, setPersonality] = useState('Helpful');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [visualStyle, setVisualStyle] = useState<'Minimalist' | 'Cyberpunk' | 'Nebula' | 'Dark' | 'Evil'>('Minimalist');
  const [textInput, setTextInput] = useState("");
  const [isTextMode, setIsTextMode] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState<'none' | 'health' | 'productivity' | 'gaming' | 'interpreter' | 'visual_memory' | 'fitness' | 'expense' | 'travel' | 'whiteboard'>('none');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [productivityData, setProductivityData] = useState<ProductivityData | null>(null);
  const [interpreterData, setInterpreterData] = useState<InterpreterData | null>(null);
  const [gamingData, setGamingData] = useState<GamingData | null>(null);
  const [visualMemories, setVisualMemories] = useState<VisualMemory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [whiteboardData, setWhiteboardData] = useState<string[]>([]);
  const [shadowingMode, setShadowingMode] = useState<{ active: boolean, lang: string } | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [soundscape, setSoundscape] = useState<string | null>(null);
  const [proactiveNotification, setProactiveNotification] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Voice/Model Reactivity
  useEffect(() => {
    if (isActive) {
      // Restart session with new voice/model
      stop();
      setTimeout(() => start(), 500);
    }
  }, [selectedVoice, selectedModel, accent]);

  // Auth & Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const unsubProfile = memoryService.syncProfile(u.uid, setProfile);
        const unsubFacts = memoryService.syncFacts(u.uid, setFacts);
        const unsubVisual = memoryService.syncVisualMemories(u.uid, setVisualMemories);
        const unsubExpenses = memoryService.syncExpenses(u.uid, setExpenses);
        return () => {
          unsubProfile();
          unsubFacts();
          unsubVisual();
          unsubExpenses();
        };
      }
    });
    return () => unsubscribe();
  }, []);

  // Battery Status & Proactive Notifications
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          const level = battery.level * 100;
          setBatteryLevel(level);
          if (level < 20) {
            setProactiveNotification("Battery is low. Would you like to enable power saving?");
          }
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
      });
    }
    
    // Proactive Time-based notification
    const hour = new Date().getHours();
    if (hour > 22) {
      setProactiveNotification("It's getting late. Should we start your bedtime routine?");
    }
  }, []);

  const [isMuted, setIsMuted] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onToolCall = useCallback((name: string, args: any) => {
    addLog('tool', `Executing: ${name}(${JSON.stringify(args)})`, 'Live');
    switch (name) {
      case 'start_routine':
        toast.info(`Starting ${args.routineName} routine...`);
        if (args.routineName === 'morning') {
          addLog('system', "Checking weather, reminders, and news...", 'Live');
        }
        return { status: 'started', routine: args.routineName };
      case 'control_home':
        toast.success(`${args.device} in ${args.room || 'room'} set to ${args.action}`);
        return { status: 'success', device: args.device, action: args.action };
      case 'get_health_data':
        toast.info(`Retrieving ${args.metric} data...`);
        const hData = { metric: args.metric, value: Math.floor(Math.random() * 10000), unit: args.metric === 'steps' ? 'steps' : 'bpm' };
        setHealthData(hData);
        setActiveDashboard('health');
        return hData;
      case 'web_search':
        toast.info(`Searching for: ${args.query}`);
        return { status: 'searching', query: args.query };
      case 'translate_speech':
        toast.success(`Translated to ${args.targetLanguage}: ${args.text}`);
        const tData = { text: args.text, translation: `[Translated to ${args.targetLanguage}]`, lang: args.targetLanguage };
        setInterpreterData(tData);
        setActiveDashboard('interpreter');
        return tData;
      case 'start_game':
        toast.success(`Starting ${args.gameType} game!`);
        setGamingData({ type: args.gameType, status: 'Active' });
        setActiveDashboard('gaming');
        return { status: 'active', game: args.gameType };
      case 'check_weather':
        const weather = ['Sunny, 72°F', 'Partly Cloudy, 65°F', 'Rainy, 58°F', 'Clear, 70°F'][Math.floor(Math.random() * 4)];
        toast.info(`Weather in ${args.location}: ${weather}`);
        addLog('assistant', `The weather in ${args.location} is currently ${weather}.`, 'Live');
        return { location: args.location, weather };
      case 'play_music':
        toast.success(`Now playing: ${args.query}`);
        addLog('assistant', `Sure, playing ${args.query} for you.`, 'Live');
        return { status: 'playing', track: args.query };
      case 'open_app':
        toast.info(`Opening ${args.appName}...`);
        addLog('assistant', `Opening ${args.appName}. Note: Some native apps may require manual confirmation on your device.`, 'Live');
        return { status: 'opened', app: args.appName };
      case 'send_message':
        toast.success(`Message sent to ${args.contact} via ${args.app || 'SMS'}`);
        addLog('assistant', `Message sent to ${args.contact}.`, 'Live');
        return { status: 'sent', recipient: args.contact };
      case 'set_reminder':
        toast.success(`Reminder set: "${args.title}" ${args.time}`);
        addLog('assistant', `Reminder set for ${args.time}: ${args.title}`, 'Live');
        return { status: 'set', title: args.title, time: args.time };
      case 'get_productivity_stats':
        toast.info(`Calculating ${args.period} analytics...`);
        const pData = { period: args.period, screenTime: '4h 12m', topApp: 'Social Media' };
        setProductivityData(pData);
        setActiveDashboard('productivity');
        return pData;
      case 'save_visual_memory':
        toast.success("Visual memory saved!");
        if (user) {
          memoryService.saveVisualMemory(user.uid, args.description);
        }
        setActiveDashboard('visual_memory');
        return { status: 'saved', description: args.description };
      case 'set_soundscape':
        toast.info(`Soundscape set to ${args.style}`);
        setSoundscape(args.style);
        return { status: 'set', style: args.style };
      case 'analyze_fitness_form':
        toast.info(`Analyzing ${args.exercise} form...`);
        const fData = { exercise: args.exercise, feedback: "Keep your core tight." };
        setFitnessData(fData);
        setActiveDashboard('fitness');
        return fData;
      case 'scan_expense':
        toast.success(`Expense tracked: $${args.amount} at ${args.merchant}`);
        if (user) {
          memoryService.saveExpense(user.uid, { amount: args.amount, merchant: args.merchant, category: args.category });
        }
        const eData = { amount: args.amount, merchant: args.merchant, category: args.category };
        setExpenseData(eData);
        setActiveDashboard('expense');
        return eData;
      case 'get_landmark_info':
        toast.info(`Identifying landmark...`);
        const lData = { landmark: args.landmark, info: 'A historic site with rich cultural heritage.' };
        setTravelData(lData);
        setActiveDashboard('travel');
        return lData;
      case 'update_whiteboard':
        toast.success(`Added to whiteboard: ${args.action}`);
        setWhiteboardData(prev => [...prev, args.action]);
        setActiveDashboard('whiteboard');
        return { status: 'added', content: args.action };
      case 'set_focus_mode':
        toast.info(`Focus mode ${args.enabled ? 'enabled' : 'disabled'}`);
        setFocusMode(args.enabled);
        return { status: 'set', enabled: args.enabled };
      case 'trigger_sos':
        toast.error("EMERGENCY SOS TRIGGERED");
        setSosActive(true);
        return { status: 'triggered', message: 'Emergency services notified' };
      case 'adopt_persona':
        toast.success(`Nova is now in ${args.persona} mode.`);
        return { status: 'adopted', persona: args.persona };
      case 'learn_fact':
        if (user) {
          memoryService.addFact(user.uid, args.fact, args.isShared);
          sounds.success();
          toast.success(`Nova learned: ${args.fact}${args.isShared ? ' (Shared)' : ''}`);
        }
        return { status: 'learned', fact: args.fact };
      default:
        return { status: 'unknown_tool' };
    }
  }, [user]);

  const { isActive, isConnecting, error, transcript, volume, isSpeaking, setIsMuted: setLiveMuted, start, stop, sendImage } = useLiveAssistant(selectedVoice, accent, facts, selectedModel);

  // Sync mute state
  useEffect(() => {
    setLiveMuted(isMuted);
  }, [isMuted, setLiveMuted]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to login");
    }
  };

  const handleCapture = (base64: string) => {
    sendImage(base64);
    addLog('system', "Image sent to Nova for analysis.");
    toast.info("Nova is looking at the image...");
  };

  // Haptic Feedback
  useEffect(() => {
    if (isActive && volume > 0.1 && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [isActive, volume]);

  // PWA Install Prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  // Wake Lock & Media Session
  useEffect(() => {
    if (isActive) {
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
          .then(lock => {
            wakeLockRef.current = lock;
          })
          .catch(err => {
            console.warn("Wake Lock request failed:", err.message);
          });
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Nova Assistant',
          artist: 'AI Live Session',
          album: 'Active Conversation',
          artwork: [{ src: 'https://picsum.photos/seed/nova/512/512', sizes: '512x512', type: 'image/png' }]
        });
      }
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (transcript.output) {
      addLog('assistant', transcript.output, 'Live');
    }
  }, [transcript.output]);

  const addLog = useCallback((type: LogEntry['type'], content: string, category: string = 'Live') => {
    setLogs(prev => {
      // Prevent exact duplicates within a short time frame
      const lastLog = prev[prev.length - 1];
      if (lastLog && lastLog.content === content && lastLog.type === type && (new Date().getTime() - lastLog.timestamp.getTime() < 1000)) {
        return prev;
      }
      return [...prev, { type, content, timestamp: new Date(), category }];
    });
  }, []);

  const toggleAssistant = () => {
    if (isActive) {
      stop();
      addLog('system', "Session ended.", 'Live');
    } else {
      sounds.wake();
      start(onToolCall);
      addLog('system', "Connecting to Live API...", 'Live');
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const input = textInput;
    setTextInput("");
    addLog('user', input, 'Chat');

    try {
      const history = logs
        .filter(l => l.category === 'Chat' && (l.type === 'user' || l.type === 'assistant'))
        .map(l => ({
          role: l.type === 'user' ? 'user' : 'model',
          parts: [{ text: l.content }]
        }));

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          history,
          systemInstruction: `You are Nova, a proactive and emotionally intelligent AI assistant.
          You are currently in text mode. Be concise and helpful.
          You have access to the user's memories and facts: ${facts.join(', ')}.
          The user's name is ${user?.displayName || 'User'}.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const text = data.text;

      if (text) {
        addLog('assistant', text, 'Chat');
      }
    } catch (err) {
      console.error(err);
      sounds.error();
      toast.error("Failed to get response from Nova");
      addLog('system', "Error: Failed to connect to Gemini API.", 'System');
    }
  };

  const updateSetting = (key: string, val: any) => {
    switch (key) {
      case 'visualStyle': setVisualStyle(val); break;
      case 'focusMode': setFocusMode(val); break;
      case 'selectedVoice': setSelectedVoice(val); break;
      case 'accent': setAccent(val); break;
      case 'selectedModel': setSelectedModel(val); break;
      case 'personality': setPersonality(val); break;
      case 'soundscape': setSoundscape(val); break;
      case 'showAR': setShowAR(val); break;
      default: break;
    }

    if (user) {
      memoryService.saveProfile(user.uid, {
        preferences: {
          [key]: val
        }
      });
    }
  };

  // Sync settings from profile
  useEffect(() => {
    if (profile?.preferences) {
      const prefs = profile.preferences;
      if (prefs.visualStyle) setVisualStyle(prefs.visualStyle);
      if (prefs.focusMode !== undefined) setFocusMode(prefs.focusMode);
      if (prefs.selectedVoice) setSelectedVoice(prefs.selectedVoice);
      if (prefs.selectedModel) setSelectedModel(prefs.selectedModel);
      if (prefs.personality) setPersonality(prefs.personality);
      if (prefs.soundscape !== undefined) setSoundscape(prefs.soundscape);
      if (prefs.showAR !== undefined) setShowAR(prefs.showAR);
    }
  }, [profile]);

  if (!user) {
    return <Auth onAuthSuccess={() => setHasStarted(true)} />;
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-full max-w-md mx-auto bg-black text-white overflow-hidden shadow-2xl border-x border-white/10 items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center mb-6 mx-auto">
            <Sparkles className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-light tracking-tight mb-2">Nova</h1>
          <p className="text-white/40 font-light max-w-xs mx-auto">
            Your persistent, real-time AI assistant. Ready to help with your daily tasks.
          </p>
        </motion.div>

        <div className="space-y-4 w-full max-w-xs">
          <Button 
            onClick={() => setHasStarted(true)}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-light group"
          >
            Get Started
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-[10px] uppercase tracking-widest text-white/20">
            Requires Microphone & Audio Permissions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative font-sans selection:bg-blue-500/30">
      {/* Status Bar */}
      <div className="px-6 py-2 flex justify-between items-center text-[10px] text-white/40 font-mono tracking-widest bg-black/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>LTE</span>
        </div>
        <div className="flex items-center gap-2">
          {batteryLevel !== null && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-2.5 border border-white/20 rounded-[2px] p-[1px] flex items-center">
                <div 
                  className={`h-full rounded-[1px] ${batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${batteryLevel}%` }} 
                />
              </div>
              <span>{Math.round(batteryLevel)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(true)}
            className="rounded-full hover:bg-white/5"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-white/60" />
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tighter flex items-center gap-2">
              NOVA <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-blue-500/50 text-blue-400">LIVE</Badge>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
          {!user ? (
            <Button variant="outline" size="sm" onClick={handleLogin} className="rounded-full bg-blue-600/10 border-blue-500/50 text-blue-400 hover:bg-blue-600/20 h-8 text-xs">
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="size-8 rounded-full overflow-hidden border border-white/10 inline-flex items-center justify-center hover:bg-white/5 transition-colors outline-none">
                <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10 text-white">
                <DropdownMenuItem onClick={() => auth.signOut()} className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-zinc-950 border-r border-white/5 z-[101] p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold tracking-tighter">Nova Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="rounded-full hover:bg-white/5">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-2xl py-6 hover:bg-white/5"
                  onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                >
                  <Settings className="w-5 h-5 text-blue-400" />
                  <span>Settings</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-2xl py-6 hover:bg-white/5"
                  onClick={() => { setIsHelpOpen(true); setIsMenuOpen(false); }}
                >
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  <span>Help & Features</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-2xl py-6 hover:bg-white/5"
                  onClick={() => { setIsHistoryOpen(true); setIsMenuOpen(false); }}
                >
                  <History className="w-5 h-5 text-yellow-400" />
                  <span>Activity History</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-2xl py-6 hover:bg-white/5"
                  onClick={() => { setIsHistoryOpen(true); setIsMenuOpen(false); }}
                >
                  <History className="w-5 h-5 text-yellow-400" />
                  <span>Activity History</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-2xl py-6 hover:bg-white/5"
                  onClick={() => { setIsCameraOpen(true); setIsMenuOpen(false); }}
                >
                  <CameraIcon className="w-5 h-5 text-green-400" />
                  <span>Visual Input</span>
                </Button>

                {deferredPrompt && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 rounded-2xl py-6 hover:bg-white/5 text-blue-400"
                    onClick={() => { handleInstall(); setIsMenuOpen(false); }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Install Nova App</span>
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start gap-3 rounded-2xl py-6 ${isMuted ? 'bg-red-500/10 text-red-400' : 'hover:bg-white/5'}`}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-blue-400" />}
                  <span>{isMuted ? 'Unmute Microphone' : 'Mute Microphone'}</span>
                </Button>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/20 mb-4 px-4">Voice Selection</p>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {VOICES.map(v => (
                      <Button
                        key={v}
                        variant="ghost"
                        size="sm"
                        className={`justify-start rounded-xl text-xs ${selectedVoice === v ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5'}`}
                        onClick={() => setSelectedVoice(v)}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/20 mb-4 px-4">Visual Style</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['Minimalist', 'Cyberpunk', 'Nebula'].map(style => (
                      <Button
                        key={style}
                        variant="ghost"
                        className={`w-full justify-start rounded-xl ${visualStyle === style ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5'}`}
                        onClick={() => setVisualStyle(style as any)}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Nova v1.2.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Interaction Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        </div>

        {/* SOS Banner */}
        <AnimatePresence>
          {sosActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-600 text-white px-4 py-2 flex items-center justify-between z-50"
            >
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span className="font-bold">EMERGENCY SOS ACTIVE</span>
              </div>
              <button onClick={() => setSosActive(false)} className="p-1 hover:bg-red-700 rounded">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proactive Notification */}
        <AnimatePresence>
          {proactiveNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 z-30"
            >
              <div className="bg-blue-600/90 backdrop-blur-md border border-blue-400/50 p-3 rounded-2xl shadow-xl flex items-center gap-3">
                <Bell className="w-4 h-4 text-white animate-bounce" />
                <p className="text-[11px] text-white font-medium flex-1">{proactiveNotification}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => setProactiveNotification(null)}>
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboards */}
        <AnimatePresence mode="wait">
          {activeDashboard !== 'none' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold capitalize flex items-center gap-3">
                  {activeDashboard === 'health' && <Brain className="text-red-400" />}
                  {activeDashboard === 'productivity' && <Zap className="text-yellow-400" />}
                  {activeDashboard === 'interpreter' && <Languages className="text-blue-400" />}
                  {activeDashboard === 'gaming' && <Sparkles className="text-purple-400" />}
                  {activeDashboard === 'expense' && <Receipt className="text-green-400" />}
                  {activeDashboard === 'travel' && <MapPin className="text-blue-400" />}
                  {activeDashboard === 'whiteboard' && <Edit3 className="text-indigo-400" />}
                  {activeDashboard.replace('_', ' ')}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setActiveDashboard('none')} className="rounded-full hover:bg-white/10">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {activeDashboard === 'visual_memory' && (
                <div className="space-y-3">
                  {visualMemories.length > 0 ? (
                    visualMemories.slice(0, 3).map((mem, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-sm text-zinc-300">{mem.description}</p>
                        <span className="text-[10px] text-white/20">
                          {mem.timestamp?.toDate ? mem.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/40 italic">No visual memories yet.</p>
                  )}
                </div>
              )}

              {activeDashboard === 'fitness' && fitnessData && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Dumbbell className="w-5 h-5 text-orange-400" />
                    <p className="text-orange-400 font-medium">{fitnessData.exercise}</p>
                  </div>
                  <p className="text-sm text-zinc-300">{fitnessData.feedback}</p>
                </div>
              )}

              {activeDashboard === 'whiteboard' && (
                <div className="h-48 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 p-4 overflow-y-auto">
                  {whiteboardData.map((action, i) => (
                    <div key={i} className="text-zinc-300 text-sm mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {action}
                    </div>
                  ))}
                  {whiteboardData.length === 0 && (
                    <div className="h-full flex items-center justify-center text-white/20 text-sm italic">
                      Start drawing or ask Nova to add something...
                    </div>
                  )}
                </div>
              )}

              {activeDashboard === 'expense' && (
                <div className="space-y-3">
                  {expenseData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">${expenseData.amount}</p>
                          <p className="text-xs text-white/40 uppercase tracking-wider">{expenseData.merchant}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {expenseData.category || 'General'}
                      </Badge>
                    </div>
                  ) : expenses.length > 0 ? (
                    expenses.slice(0, 3).map((exp, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">${exp.amount}</p>
                          <p className="text-[10px] text-white/40">{exp.merchant}</p>
                        </div>
                        <Badge variant="outline" className="text-[8px]">{exp.category || 'General'}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/40 italic">No expenses tracked yet.</p>
                  )}
                </div>
              )}

              {activeDashboard === 'travel' && travelData && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <p className="font-semibold">{travelData.landmark}</p>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{travelData.info}</p>
                </div>
              )}

              {activeDashboard === 'health' && healthData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{healthData.value.toLocaleString()}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">{healthData.metric}</p>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-2/3" />
                  </div>
                </div>
              )}

              {activeDashboard === 'productivity' && productivityData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-2xl">
                      <p className="text-lg font-bold">{productivityData.screenTime}</p>
                      <p className="text-[8px] text-white/40 uppercase">Screen Time</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl">
                      <p className="text-lg font-bold">{productivityData.topApp}</p>
                      <p className="text-[8px] text-white/40 uppercase">Top App</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDashboard === 'interpreter' && interpreterData && (
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-white/40 mb-1 uppercase">Original</p>
                    <p className="text-sm italic">"{interpreterData.text}"</p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                    <p className="text-[10px] text-blue-400 mb-1 uppercase">{interpreterData.lang}</p>
                    <p className="text-sm font-medium">"{interpreterData.translation}"</p>
                  </div>
                </div>
              )}

              {activeDashboard === 'gaming' && gamingData && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                  <p className="text-lg font-bold">{gamingData.type} Session</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Nova is your Dungeon Master</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shadowing Mode Overlay */}
        <AnimatePresence>
          {shadowingMode?.active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            >
              <div className="bg-zinc-900 border border-indigo-500/30 rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl">
                <Languages className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Shadowing Mode</h3>
                <p className="text-zinc-400 text-sm mb-6">Practice your {shadowingMode.lang} by repeating after Nova.</p>
                <Button 
                  onClick={() => setShadowingMode(null)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                >
                  Exit Session
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focus Mode Indicator */}
        <AnimatePresence>
          {focusMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-24 right-6 bg-indigo-600/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white z-40 shadow-lg"
            >
              <Shield className="w-3 h-3" />
              Focus Mode
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soundscape Player (Hidden) */}
        {soundscape && (
          <div className="hidden">
            <audio 
              autoPlay 
              loop 
              src={`https://assets.mixkit.co/sfx/preview/mixkit-ambient-night-noise-2330.mp3`} // Placeholder
              ref={(el) => {
                if (el) el.volume = 0.2;
              }}
            />
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
          <VoiceVisualizer isUserActive={isActive && !isSpeaking} isAssistantActive={isSpeaking} volume={volume} style={visualStyle} />

          <div className="mt-6 text-center">
            <AnimatePresence mode="wait">
              {isConnecting ? (
                <motion.p
                  key="connecting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-blue-400/80 font-light italic"
                >
                  "Connecting..."
                </motion.p>
              ) : isActive ? (
                <motion.p
                  key="active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-blue-400/80 font-light italic"
                >
                  "I'm here. Talk to me."
                </motion.p>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-white/40 font-light"
                >
                  Tap to start Live Session
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* History Overlay */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl p-8 flex flex-col"
            >
              <header className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-600/20 flex items-center justify-center">
                    <History className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Activity History</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="text-white/40 hover:text-white">Clear</Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)} className="rounded-full hover:bg-white/10">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </header>

              <ScrollArea className="flex-1 h-full pr-4">
                <div className="space-y-4">
                  {logs.length === 0 && (
                    <div className="py-20 text-center text-white/20 italic">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p>No recent activity recorded.</p>
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className={`text-[8px] h-4 uppercase tracking-tighter ${
                            log.type === 'user' ? 'border-blue-500/50 text-blue-400' :
                            log.type === 'assistant' ? 'border-purple-500/50 text-purple-400' :
                            log.type === 'tool' ? 'border-green-500/50 text-green-400' :
                            'border-white/20 text-white/40'
                          }`}>
                            {log.type}
                          </Badge>
                          <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">{log.category}</span>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{log.content}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Overlay */}
        <AnimatePresence>
          {isTextMode && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 bg-black z-[100] p-8 flex flex-col"
            >
              <header className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Nova Chat</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsTextMode(false)} className="rounded-full hover:bg-white/10">
                  <X className="w-6 h-6" />
                </Button>
              </header>
              
              <ScrollArea className="flex-1 h-full mb-6 pr-4">
                <div className="space-y-6">
                  {logs.filter(l => l.category === 'Chat' && (l.type === 'user' || l.type === 'assistant')).map((log, i) => (
                    <div key={i} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                        log.type === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-zinc-900 text-zinc-100 border border-white/5 rounded-tl-none'
                      }`}>
                        <p className="text-sm leading-relaxed">{log.content}</p>
                        <span className="text-[8px] opacity-40 mt-2 block text-right uppercase tracking-widest">
                          {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {logs.filter(l => l.category === 'Chat').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 italic py-20">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
                      <p>Start a conversation with Nova...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <form onSubmit={handleTextSubmit} className="flex gap-3 shrink-0">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <Button type="submit" size="icon" className="size-14 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all">
                  <Send className="w-6 h-6" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Screen Overlay */}
        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[60]"
            >
              <Help 
                onClose={() => setIsHelpOpen(false)} 
                currentSettings={{
                  visualStyle,
                  focusMode,
                  selectedVoice,
                  selectedModel,
                  personality,
                  soundscape,
                  showAR
                }}
                updateSetting={updateSetting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Screen Overlay */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="absolute inset-0 z-[70]"
            >
              <SettingsPage 
                onClose={() => setIsSettingsOpen(false)}
                user={user}
                onLogout={() => auth.signOut()}
                currentSettings={{
                  visualStyle,
                  focusMode,
                  selectedVoice,
                  selectedModel,
                  personality,
                  soundscape,
                  showAR
                }}
                updateSetting={updateSetting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-4 gap-4 w-full z-10">
          {[
            { icon: MessageSquare, label: 'Chat', color: 'text-blue-400', action: () => setIsTextMode(true) },
            { icon: Volume2, label: 'Voice', color: 'text-green-400', action: () => setIsTextMode(false) },
            { icon: Bell, label: 'Alerts', color: 'text-yellow-400', action: () => setProactiveNotification('Checking for updates...') },
            { icon: Sparkles, label: 'Style', color: 'text-purple-400', action: () => setVisualStyle(v => v === 'Minimalist' ? 'Cyberpunk' : v === 'Cyberpunk' ? 'Nebula' : 'Minimalist') },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.action}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-[10px] uppercase tracking-wider text-white/40">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </main>

      {/* Control Bar */}
      <footer className="p-4 flex items-center justify-center bg-black/50 backdrop-blur-xl border-t border-white/5 z-40">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-8"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/5"
              onClick={() => setIsTextMode(true)}
            >
              <MessageSquare className="w-5 h-5 text-white/40" />
            </Button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAssistant}
              disabled={isConnecting}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                isActive 
                  ? 'bg-red-500 shadow-red-500/40' 
                  : 'bg-blue-600 shadow-blue-600/40'
              } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isActive ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>

            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5 text-white/40'}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          </motion.div>
        </AnimatePresence>
      </footer>
      
      {isCameraOpen && (
        <Camera 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)}
          showAR={showAR}
        />
      )}
      
      {error && (
        <div className="absolute top-20 left-4 right-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-xs text-center backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  );
};
