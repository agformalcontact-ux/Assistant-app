import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Mic, 
  Sparkles, 
  Shield, 
  User, 
  Volume2, 
  Palette, 
  Bell, 
  Eye, 
  LogOut,
  Check,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsPageProps {
  onClose: () => void;
  user: any;
  currentSettings: any;
  updateSetting: (key: string, val: any) => void;
  onLogout: () => void;
}

const GEMINI_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'];
const GEMINI_MODELS = [
  'gemini-3.1-flash-live-preview',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-preview'
];
const VISUAL_STYLES = ['Minimalist', 'Cyberpunk', 'Nebula', 'Dark', 'Evil'];
const ACCENTS = ['Standard', 'Irish', 'British', 'Australian', 'Southern'];
const PERSONALITIES = ['Helpful', 'Sarcastic', 'Professional', 'Playful'];

export const SettingsPage = ({ onClose, user, currentSettings, updateSetting, onLogout }: SettingsPageProps) => {
  return (
    <div className="absolute inset-0 bg-black z-[70] flex flex-col">
      <header className="p-6 border-b border-white/10 flex items-center gap-4 bg-zinc-950/50 backdrop-blur-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="rounded-full hover:bg-white/5"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
      </header>

      <Tabs defaultValue="voice" className="flex-1 flex flex-col">
        <div className="px-6 py-2 border-b border-white/10 bg-zinc-950/30 overflow-x-auto">
          <TabsList className="bg-white/5 border-white/10 w-full justify-start gap-2 h-12 p-1 rounded-xl flex-nowrap">
            <TabsTrigger value="voice" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Visuals
            </TabsTrigger>
            <TabsTrigger value="features" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="p-6">
            <TabsContent value="voice" className="space-y-8 mt-0">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Gemini Voice
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {GEMINI_VOICES.map((v) => (
                    <button
                      key={v}
                      onClick={() => updateSetting('selectedVoice', v)}
                      className={`px-4 py-3 rounded-xl text-sm border transition-all flex items-center justify-between ${
                        currentSettings.selectedVoice === v
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
                      }`}
                    >
                      {v}
                      {currentSettings.selectedVoice === v && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Accent
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {ACCENTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => updateSetting('accent', a)}
                      className={`px-4 py-3 rounded-xl text-sm border transition-all flex items-center justify-between ${
                        currentSettings.accent === a
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
                      }`}
                    >
                      {a}
                      {currentSettings.accent === a && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Gemini Model
                </h3>
                <div className="space-y-2">
                  {GEMINI_MODELS.map((m) => (
                    <button
                      key={m}
                      onClick={() => updateSetting('selectedModel', m)}
                      className={`w-full px-4 py-3 rounded-xl text-xs border transition-all flex items-center justify-between ${
                        currentSettings.selectedModel === m
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
                      }`}
                    >
                      {m}
                      {currentSettings.selectedModel === m && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Personality</h3>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => updateSetting('personality', p)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        currentSettings.personality === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-8 mt-0">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Visual Style</h3>
                <div className="space-y-3">
                  {VISUAL_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => updateSetting('visualStyle', style)}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        currentSettings.visualStyle === style
                          ? 'bg-blue-600/10 border-blue-500/50'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${
                          style === 'Minimalist' ? 'bg-white/10' :
                          style === 'Cyberpunk' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        } flex items-center justify-center`}>
                          <Palette className={`w-5 h-5 ${
                            style === 'Minimalist' ? 'text-white' :
                            style === 'Cyberpunk' ? 'text-blue-400' : 'text-purple-400'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm">{style}</p>
                          <p className="text-[10px] text-white/40">Nova's primary interface theme</p>
                        </div>
                      </div>
                      {currentSettings.visualStyle === style && <Check className="w-5 h-5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Interface</h3>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show AR Overlay</Label>
                      <p className="text-[10px] text-white/40">Display visual cues in camera mode</p>
                    </div>
                    <Switch 
                      checked={currentSettings.showAR} 
                      onCheckedChange={(val) => updateSetting('showAR', val)}
                    />
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="features" className="space-y-8 mt-0">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Security & Focus</h3>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <Label className="text-sm font-medium">Focus Mode</Label>
                      </div>
                      <p className="text-[10px] text-white/40">Filter distractions and non-urgent alerts</p>
                    </div>
                    <Switch 
                      checked={currentSettings.focusMode} 
                      onCheckedChange={(val) => updateSetting('focusMode', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-yellow-400" />
                        <Label className="text-sm font-medium">Proactive Alerts</Label>
                      </div>
                      <p className="text-[10px] text-white/40">Allow Nova to suggest actions based on context</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Soundscapes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['None', 'Nebula', 'Cyberpunk', 'Nature', 'Deep Space'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateSetting('soundscape', s === 'None' ? null : s)}
                      className={`px-4 py-3 rounded-xl text-xs font-medium border transition-all ${
                        (currentSettings.soundscape === s || (s === 'None' && !currentSettings.soundscape))
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="account" className="space-y-8 mt-0">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Profile</h3>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/50 mx-auto mb-4">
                    <img src={user?.photoURL || ''} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="text-lg font-bold">{user?.displayName}</h4>
                  <p className="text-xs text-white/40">{user?.email}</p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Connected Apps & Devices</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'Google Calendar', status: 'Connected', icon: '📅' },
                    { name: 'Spotify', status: 'Connected', icon: '🎵' },
                    { name: 'Smart Home (HomeKit)', status: 'Connected', icon: '🏠' },
                    { name: 'Phone Integration', status: 'Not Linked', icon: '📱' }
                  ].map(app => (
                    <div key={app.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{app.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className={`text-[10px] ${app.status === 'Connected' ? 'text-green-400' : 'text-white/40'}`}>{app.status}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                        {app.status === 'Connected' ? 'Manage' : 'Link'}
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/30 px-2">
                  Nova can interact with your phone and apps once linked. Some features may require the Nova mobile companion app.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Data Management</h3>
                <Button variant="outline" className="w-full justify-start gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white/60">
                  <Eye className="w-4 h-4" />
                  Privacy Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="w-full justify-start gap-3 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </section>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
