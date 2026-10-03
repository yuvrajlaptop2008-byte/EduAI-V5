import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { normalizeRole, ROLE_HOME } from "../utils/roles";

const Login = () => {
  const navigate = useNavigate();
  const {
    user,
    loginWithGoogle,
    loginWithEmail,
    forgotPassword,
    loginAnonymously,
  } = useUser();

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect once user is authenticated
  useEffect(() => {
    if (user) {
      const role = normalizeRole(user.role);
      navigate(ROLE_HOME[role] || "/app", { replace: true });
    }
  }, [user, navigate]);

  const validateEmail = (val: string) => {
    return String(val)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      setSuccessMsg("");
      setLoading(true);
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password authentication is not enabled in Firebase Console.");
      } else {
        setError(`Login failed: ${err.message || "Please check your network and try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to receive a password reset link.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await forgotPassword(email);
      setSuccessMsg("Password reset link sent! Check your inbox and spam folder.");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(`Failed to send password reset email: ${err.message || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setSuccessMsg("");
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google login error:", err);
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/user-cancelled"
      ) {
        setError("Sign-in popup was closed before completing. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups for this site or open in a new tab.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not yet authorized in Firebase Console > Authentication > Settings.");
      } else {
        setError(`Google login: ${err.message || "Could not complete authentication. Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (asRole: string = "student") => {
    try {
      setError("");
      setSuccessMsg("");
      setLoading(true);
      await loginAnonymously(asRole);
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError(`Guest Login failed: ${err.message || "Please check your connection and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10 border border-slate-200/80 dark:border-slate-800"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-amber-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Edu<span className="text-brand">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Sign in to continue your JEE & NEET preparation
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200/80 dark:border-red-900/50 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="leading-snug">{error}</p>
              {error.includes("popup was blocked") && (
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, "_blank")}
                  className="mt-2 bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                >
                  Open in New Tab
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="leading-snug">{successMsg}</p>
          </motion.div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-brand/40 focus:border-brand outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-brand/40 focus:border-brand outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-brand text-slate-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Alternative Login Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleGuestLogin("student")}
              type="button"
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-brand/50 hover:border-brand bg-brand/5 hover:bg-brand/10 text-brand font-semibold text-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Guest Student</span>
            </button>
            <button
              onClick={() => handleGuestLogin("admin")}
              type="button"
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-rose-500/50 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>🛡️ Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
