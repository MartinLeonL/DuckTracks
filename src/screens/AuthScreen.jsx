import React, { useState } from "react";
import { Bird, Coins, Eye, EyeOff, Loader } from "lucide-react";

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSignIn({ emailOrUsername: loginEmail, password: loginPassword });
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (regUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(regUsername)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    setLoading(true);
    try {
      await onSignUp({
        email: regEmail,
        password: regPassword,
        username: regUsername,
        name: regName,
      });
      setSuccess(
        "Account created! Check your email to confirm your address, then sign in."
      );
      setTab("login");
      setLoginEmail(regEmail);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-black text-emerald-400 tracking-tight">
            DuckTracks
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Complete tasks. Earn coins. Collect ducks.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-2xl border border-slate-700/60 shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-slate-700/60">
          <button
            onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-3.5 text-sm font-semibold rounded-tl-2xl transition-colors ${
              tab === "login"
                ? "text-emerald-400 bg-slate-800/50"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
            className={`flex-1 py-3.5 text-sm font-semibold rounded-tr-2xl transition-colors ${
              tab === "register"
                ? "text-emerald-400 bg-slate-800/50"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-300 text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/40 border border-emerald-700/60 text-emerald-300 text-xs">
              {success}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="email"
                  className={inputClass}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="password"
                    className={inputClass + " pr-10"}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : null}
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <p className="text-center text-xs text-slate-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setTab("register"); setError(""); }}
                  className="text-emerald-400 hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="name"
                    className={inputClass}
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className={inputClass}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email"
                  className={inputClass}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="password"
                    className={inputClass + " pr-10"}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="password"
                  className={inputClass}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : null}
                {loading ? "Creating account…" : "Create Account"}
              </button>

              <p className="text-center text-xs text-slate-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setTab("login"); setError(""); }}
                  className="text-emerald-400 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-700 text-center">
        Your data is synced securely to the cloud.
      </p>
    </div>
  );
}