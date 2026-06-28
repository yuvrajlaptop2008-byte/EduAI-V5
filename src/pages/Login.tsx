import React, { useState } from"react";
import { motion } from"motion/react";
import { Link, useNavigate } from"react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const {
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

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
      navigate("/app");
    } catch (err: any) {
      if (
        err.code ==="auth/user-not-found" ||
        err.code ==="auth/wrong-password" ||
        err.code ==="auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please check your credentials and try again.",
        );
      } else if (err.code ==="auth/too-many-requests") {
        setError("Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.",
        );
      } else if (
        err.message &&
        err.message.includes("Email/Password authentication is not enabled")
      ) {
        setError(err.message);
      } else if (err.code ==="auth/operation-not-allowed") {
        setError("Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.",
        );
      } else {
        setError("Failed to log in. Please check your internet connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to reset your password.");
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
      setSuccessMsg("Password reset link sent! Check your email inbox and spam folder.",
      );
    } catch (err: any) {
      if (err.code ==="auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/app");
    } catch (err: any) {
      console.error("Google login error:", err);
      if (
        err.code ==="auth/network-request-failed" ||
        err.code ==="auth/internal-error"
      ) {
        setError("Secure redirect initiated due to iframe restrictions...");
        setLoading(true);
      } else if (
        err.code ==="auth/popup-closed-by-user" ||
        err.code ==="auth/user-cancelled"
      ) {
        setError("Sign-in was cancelled. If the popup was blocked, please allow popups for this site or try opening the app in a new tab.",
        );
      } else if (err.code ==="auth/unauthorized-domain") {
        setError("This domain is not authorized for OAuth operations. Please add it to the authorized domains in Firebase Console.",
        );
      } else {
        setError(
          `Failed to log in with Google: ${err.message || err.code ||"Unknown error"}`,
        );
        setLoading(false);
      }
    }
  };





  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-white font-bold font-sans tracking-tight text-2xl">
              M
            </div>
            <span className="text-2xl font-bold font-sans tracking-tight text-brand tracking-tight">
              MARKS
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Log in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex flex-col gap-3">
            <p>{error}</p>
            {(error.includes("popup was blocked") ||
              error.includes("new tab")) && (
              <button
                onClick={() => window.open(window.location.href,"_blank")}
                className="bg-red-100 text-red-700 py-2 px-4 rounded-lg font-bold hover:bg-red-200 transition-colors w-full"
              >
                Open App in New Tab
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium border border-emerald-100 flex flex-col gap-3">
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                size={20}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-bold text-brand hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                size={20}
              />
              <input
                type={showPassword ?"text" :"password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-slate-900 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ?"Logging in..." :"Log In"}
            {!loading && (
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <span className="relative px-4 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400 font-medium">
              Or continue with
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading}
              className="flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://www.google.com/favicon.ico"
                className="w-5 h-5"
                alt="Google"
              />
              <span>Continue with Google</span>
            </button>
          </div>
          <button
            onClick={async () => {
              try {
                setError("");
                setLoading(true);
                await loginAnonymously();
                navigate("/app");
              } catch (err: any) {
                console.error("Anonymous login error:", err);
                setError(`Failed to log in as Guest: ${err.message || "Unknown error"}`);
                setLoading(false);
              }
            }}
            type="button"
            disabled={loading}
            className="w-full mt-3 py-3 border border-dashed border-brand/50 text-brand rounded-xl hover:bg-brand/5 transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Log In as Guest (Demo Mode)
          </button>
          {/* Removed demo admin login button */}
        </div>

        <p className="text-center mt-10 text-slate-500 dark:text-slate-400 font-medium">
          Don't have an account?{""}
          <Link to="/signup" className="text-brand font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
