import { Assistant } from './components/Assistant';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans antialiased">
        <Assistant />
        <Toaster position="top-center" theme="dark" />
      </div>
    </TooltipProvider>
  );
}
