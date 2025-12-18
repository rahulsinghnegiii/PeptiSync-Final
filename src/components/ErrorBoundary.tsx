import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
          <Card className="max-w-2xl w-full bg-slate-800/50 border-red-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-6 h-6" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 font-mono text-sm">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              <div className="space-y-2 text-slate-300">
                <h3 className="font-semibold text-white">Common Solutions:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Check that all environment variables are set in Vercel</li>
                  <li>Ensure you've redeployed after adding environment variables</li>
                  <li>Clear your browser cache and reload the page</li>
                  <li>Check the browser console for more details</li>
                </ul>
              </div>

              <div className="space-y-2 text-slate-300">
                <h3 className="font-semibold text-white">Required Environment Variables:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm font-mono">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_PUBLISHABLE_KEY</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

