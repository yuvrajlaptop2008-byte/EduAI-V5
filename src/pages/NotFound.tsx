import React from"react";
import { Link } from"react-router-dom";
import { Home, AlertTriangle } from"lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
        <AlertTriangle size={48} />
      </div>
      <h1 className="text-6xl font-black mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/app"
        className="bg-brand text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand/90 transition-colors"
      >
        <Home size={20} />
        Back to Home
      </Link>
    </div>
  );
}
