import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[EduAI ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const errorMessage = String(this.state.error?.message || "");
    const isChunkError =
      errorMessage.includes("Failed to fetch dynamically imported module") ||
      errorMessage.includes("Importing a module script failed") ||
      errorMessage.includes("error loading dynamically imported module") ||
      this.state.error?.name === "ChunkLoadError";

    if (isChunkError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="text-brand animate-spin" size={28} />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">New Update Available</h1>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              EduAI has been updated with the latest improvements. Please refresh your browser to load the newest version.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 shadow-lg shadow-brand/25 transition-all"
              >
                <RefreshCw size={15} /> Reload Now
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-400 mb-2">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <p className="text-xs text-slate-600 mb-6 font-mono bg-white/5 rounded-lg p-3 text-left break-all">
            {this.state.error?.stack?.split("\n")[0]}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15"
            >
              <RefreshCw size={15} /> Try again
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
