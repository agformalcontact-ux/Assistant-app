import { Suspense, lazy, Component, ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

const Assistant = lazy(() => import('./components/Assistant'));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
    console.log('ErrorBoundary: constructor');
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary: getDerivedStateFromError', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary: componentDidCatch', error, errorInfo);
  }

  render() {
    console.log('ErrorBoundary: render', this.state);
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans antialiased">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">
              The app encountered an error. Please check the console for details.
            </p>
            {this.state.error && (
              <details className="text-left bg-red-900/20 p-4 rounded-lg">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 text-sm text-red-300 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('App: rendering');
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans antialiased">
          <Suspense fallback={<div className="text-white">Loading Nova...</div>}>
            <Assistant />
          </Suspense>
          <Toaster position="top-center" theme="dark" />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
