import { Suspense, lazy } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

const Assistant = lazy(() => import('./components/Assistant'));

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans antialiased">
        <Suspense fallback={<div className="text-white">Loading Nova...</div>}>
          <Assistant />
        </Suspense>
        <Toaster position="top-center" theme="dark" />
      </div>
    </TooltipProvider>
  );
}
