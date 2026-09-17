import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserProfileDropdown({ isDark }) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";

  const providerBadge =
    user.auth_provider === "google"
      ? "Google"
      : user.auth_provider === "github"
      ? "GitHub"
      : "Verified Email";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Chip Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 transition-all duration-200 cursor-pointer shadow-sm ${
          isDark
            ? "border-[#3A3945] bg-[#1E1D26] text-white hover:border-emerald-500/50 hover:bg-[#252430]"
            : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
        }`}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="h-6 w-6 rounded-full object-cover border border-emerald-500/50"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950">
            {initials}
          </div>
        )}

        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-none">{user.full_name}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-medium leading-tight">
            {providerBadge}
          </p>
        </div>

        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div
          className={`absolute right-0 top-12 z-50 w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? "border-[#323142] bg-[#14131D] text-white"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          {/* User Details Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#252435]">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-11 w-11 rounded-full object-cover border-2 border-emerald-500/60 shadow-md"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-slate-950 shadow-md">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold truncate">{user.full_name}</h4>
              <p className="text-xs text-slate-400 truncate font-mono">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Verified Account
                </span>
              </div>
            </div>
          </div>

          {/* Account Meta Badges */}
          <div className="my-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-[#1D1C2A] p-2 border border-[#2B2A3B]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Method</p>
              <p className="text-xs font-bold text-white capitalize">{user.auth_provider}</p>
            </div>
            <div className="rounded-xl bg-[#1D1C2A] p-2 border border-[#2B2A3B]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
              <p className="text-xs font-bold text-emerald-400">Active User</p>
            </div>
          </div>

          {/* Action List */}
          <div className="pt-1 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </div>
              <span className="text-[10px] uppercase font-mono opacity-0 group-hover:opacity-100 transition">
                Logout →
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
