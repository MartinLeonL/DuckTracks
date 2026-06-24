import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Loader,
  Shield,
  Database,
} from "lucide-react";

function Section({ title, icon: Icon, children }) {
  return (
    <section className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/60 flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-slate-700/40">{children}</div>
    </section>
  );
}

function EditableRow({ label, value, onSave, type = "text", placeholder, validate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (validate) {
      const err = validate(val);
      if (err) { setError(err); return; }
    }
    setLoading(true);
    try {
      await onSave(val);
      setEditing(false);
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVal(value || "");
    setEditing(false);
    setError("");
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <span className="truncate max-w-[160px]">{value || "—"}</span>
            <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
          </button>
        )}
      </div>
      {editing && (
        <div className="mt-2 space-y-2">
          <input
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? <Loader size={12} className="animate-spin" /> : <Check size={12} />}
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordChange({ onSave }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError("");
    if (next.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (next !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await onSave(next);
      setSuccess(true);
      setTimeout(() => { setOpen(false); setSuccess(false); setCurrent(""); setNext(""); setConfirm(""); }, 1500);
    } catch (e) {
      setError(e.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Password</span>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <span>••••••••</span>
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 space-y-2">
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="New password (min. 6 chars)"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            autoFocus
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">Password updated!</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading || success}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? <Loader size={12} className="animate-spin" /> : <Check size={12} />}
              Update
            </button>
            <button
              onClick={() => { setOpen(false); setError(""); setCurrent(""); setNext(""); setConfirm(""); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DangerButton({ label, icon: Icon, description, confirmLabel, confirmClass, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="px-4 py-3">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div>
            <p className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors flex items-center gap-2">
              <Icon size={14} />
              {label}
            </p>
            {description && (
              <p className="text-xs text-slate-600 mt-0.5">{description}</p>
            )}
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-900/20 rounded-xl border border-red-700/40">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{confirmLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? <Loader size={12} className="animate-spin" /> : <Icon size={12} />}
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountScreen({
  user,
  profile,
  coins,
  ownedDuckCount,
  onSignOut,
  onUpdateUsername,
  onUpdateName,
  onUpdatePassword,
  onResetData,
}) {
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("default", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-4">
      {/* Profile summary */}
      <div className="glass rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
          {(profile?.name || profile?.username || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-100 truncate">
            {profile?.name || profile?.username || "Duck Collector"}
          </p>
          <p className="text-xs text-slate-500 truncate">@{profile?.username}</p>
          {joinedDate && (
            <p className="text-xs text-slate-600 mt-0.5">Member since {joinedDate}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-yellow-300">{coins}</p>
          <p className="text-xs text-slate-500 mt-0.5">Coins</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-400">{ownedDuckCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Ducks Owned</p>
        </div>
      </div>

      {/* Profile info */}
      <Section title="Profile" icon={User}>
        <EditableRow
          label="Name"
          value={profile?.name}
          onSave={onUpdateName}
          placeholder="Your display name"
          validate={(v) => v.trim().length < 1 ? "Name cannot be empty." : null}
        />
        <EditableRow
          label="Username"
          value={profile?.username}
          onSave={onUpdateUsername}
          placeholder="username"
          validate={(v) => {
            if (v.length < 3) return "Username must be at least 3 characters.";
            if (!/^[a-zA-Z0-9_]+$/.test(v)) return "Letters, numbers, and underscores only.";
            return null;
          }}
        />
      </Section>

      {/* Account / security */}
      <Section title="Account & Security" icon={Shield}>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">Email</span>
          <span className="text-sm text-slate-400 truncate max-w-[200px]">{user?.email}</span>
        </div>
        <PasswordChange onSave={onUpdatePassword} />
      </Section>

      {/* Data */}
      <Section title="Data & Storage" icon={Database}>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">Sync</span>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cloud synced
          </span>
        </div>
        <DangerButton
          label="Reset All Data"
          icon={Trash2}
          description="Wipe coins, tasks, and duck collection"
          confirmLabel="This will permanently delete all your coins, tasks, and duck collection. This cannot be undone."
          onConfirm={onResetData}
        />
      </Section>

      {/* Sign out */}
      <Section title="Session" icon={LogOut}>
        <DangerButton
          label="Sign Out"
          icon={LogOut}
          description="You can sign back in anytime"
          confirmLabel="Are you sure you want to sign out?"
          onConfirm={onSignOut}
        />
      </Section>

      <p className="text-center text-xs text-slate-700 pb-2">
        DuckTracks · Your data is yours
      </p>
    </div>
  );
}