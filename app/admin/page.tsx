'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Shield, Users, RefreshCw, X, Eye, LogOut,
  ChevronRight, AlertTriangle, Zap, CheckCircle,
  Settings2, Activity, Key, RotateCcw, Play, FlaskConical,
  Bug, ScrollText, Trash2, Search, Filter, Circle,
  UserCog, Copy, QrCode, LayoutDashboard, TrendingUp,
  Cpu, Menu, ChevronLeft, MessageSquare, Flame,
  BarChart2, DollarSign, Clock, Bell, ShieldAlert,
} from 'lucide-react';
import {
  collection, getDocs, orderBy, query, doc, updateDoc,
  deleteDoc, setDoc, serverTimestamp, limit, where,
  onSnapshot, getDoc, increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction, checkRateLimit } from '@/lib/admin';
import { API_RATES } from '@/lib/trackApiUsage';

// ── Constants ──────────────────────────────────────────────────────────────
const isAdminUid = (uid: string) =>
  (process.env.NEXT_PUBLIC_ADMIN_UID ?? '').split(',').map((s) => s.trim()).includes(uid);
const ONLINE_MS = 2 * 60 * 1000;

type AdminView = 'dashboard' | 'analytics' | 'users' | 'costs' | 'alerts' | 'bugs' | 'logs' | 'settings';

// ── Types ──────────────────────────────────────────────────────────────────
interface Ts { toDate?: () => Date }

interface AdminUser {
  uid: string; email: string; displayName: string | null; photoURL?: string | null;
  nativeLanguage: string; targetLanguage: string; level: string;
  subscription: string; trialUsed: boolean; role?: 'admin' | 'user';
  createdAt: Ts | null; lastSeen: Ts | null;
  stats: { totalConversations: number; streak: number; minutesToday?: number; minutesTotal?: number; conversationsToday?: number; lastActiveDate?: string };
  banned?: boolean; bannedReason?: string | null;
  tutor: { name: string } | null;
  practiceProgress?: { currentDay: number; completedDays: number[] };
  onboardingComplete?: boolean;
}

interface ApiUsageDoc {
  date: string; geminiSessions: number; geminiMinutes: number;
  geminiCostUsd: number; totalCostUsd: number;
}

interface ChartPoint { label: string; users: number; conversations: number; cost: number }

interface BugReport {
  id: string; uid: string | null; email: string | null; description: string;
  page: string | null; context: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high'; status: 'new' | 'reviewing' | 'resolved';
  adminNotes: string; timestamp: Ts | null;
}

interface AdminLog {
  id: string; adminUid: string; action: string;
  details: Record<string, unknown>; timestamp: Ts | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const isOnline = (u: AdminUser) =>
  !!(u.lastSeen?.toDate && u.lastSeen.toDate().getTime() > Date.now() - ONLINE_MS);

const fmtDate = (ts: Ts | null) =>
  ts?.toDate ? ts.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function fmtTime(ts: Ts | null | Date): string {
  const d = ts instanceof Date ? ts : ts?.toDate?.();
  if (!d) return 'never';
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function initials(u: AdminUser): string {
  const name = u.displayName ?? u.email ?? '?';
  return name.slice(0, 2).toUpperCase();
}

const SUB_COLOR: Record<string, string> = {
  trial: 'bg-gray-100 text-gray-600',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-indigo-100 text-indigo-700',
  ultra: 'bg-purple-100 text-purple-700',
  expired: 'bg-red-100 text-red-600',
};

const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

function getLast30Days(): { date: string; label: string }[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    };
  });
}

// ── TOTP Gate ──────────────────────────────────────────────────────────────
function TotpGate({ uid, onVerified }: { uid: string; onVerified: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function verify() {
    if (!code.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, uid }),
      });
      const data = await res.json();
      if (data.ok) { onVerified(); }
      else { setError(data.error ?? 'Wrong password. Try again.'); setCode(''); inputRef.current?.focus(); }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">ChatLingo Admin</span>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-1">Secure Access</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your admin password or 6-digit TOTP code.</p>
          <input
            ref={inputRef} type="password" value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verify()}
            placeholder="Password or 000000"
            className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-sm"
          />
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <button
            onClick={verify} disabled={!code.trim() || loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Enter</span><ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics' as AdminView, label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'USERS',
    items: [
      { id: 'users' as AdminView, label: 'Users', icon: Users },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { id: 'costs' as AdminView, label: 'API & Costs', icon: Cpu },
    ],
  },
  {
    title: 'SECURITY',
    items: [
      { id: 'alerts' as AdminView, label: 'Alerts', icon: ShieldAlert },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { id: 'bugs' as AdminView, label: 'Bug Reports', icon: Bug },
      { id: 'logs' as AdminView, label: 'Logs', icon: ScrollText },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings' as AdminView, label: 'Settings', icon: UserCog },
    ],
  },
];

function Sidebar({
  view, onNav, user, onLogout, isOpen, onClose, collapsed, onToggleCollapse, alertCount,
}: {
  view: AdminView; onNav: (v: AdminView) => void;
  user: { email: string | null; displayName?: string | null; uid: string } | null;
  onLogout: () => void; isOpen: boolean; onClose: () => void;
  collapsed: boolean; onToggleCollapse: () => void; alertCount: number;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-slate-900 border-r border-white/5
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-60'}
          w-60
        `}
      >
        {/* Header */}
        <div className={`flex items-center h-16 px-4 border-b border-white/5 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm truncate">ChatLingo Admin</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-6 h-6 items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {section.items.map(({ id, label, icon: Icon }) => {
                const active = view === id;
                return (
                  <button
                    key={id}
                    onClick={() => { onNav(id); onClose(); }}
                    title={collapsed ? label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5
                      ${active
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                    {!collapsed && id === 'alerts' && alertCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {alertCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`px-2 py-4 border-t border-white/5 space-y-1 shrink-0`}>
          <a
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'User view' : undefined}
          >
            <Eye className="w-4 h-4 shrink-0" />
            {!collapsed && <span>User view</span>}
          </a>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-3 pt-2 border-t border-white/5 mt-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {(user.displayName ?? user.email ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <p className="text-slate-400 text-xs truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactElement; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-extrabold text-gray-900 capitalize">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Dashboard View ─────────────────────────────────────────────────────────
function DashboardView({ users, todayUsage, chartData, adminUid, refreshProfile, userProfile, onToast }: {
  users: AdminUser[]; todayUsage: ApiUsageDoc | null;
  chartData: ChartPoint[]; adminUid: string;
  refreshProfile: () => void; userProfile: { subscription?: string } | null;
  onToast: (m: string) => void;
}) {
  const online = users.filter(isOnline);
  const paid = users.filter((u) => ['starter', 'pro', 'ultra'].includes(u.subscription));
  const todayStr = new Date().toISOString().split('T')[0];
  const convToday = users.reduce((s, u) => s + (u.stats?.lastActiveDate === todayStr ? (u.stats?.conversationsToday ?? 0) : 0), 0);
  const minToday = users.reduce((s, u) => s + (u.stats?.lastActiveDate === todayStr ? (u.stats?.minutesToday ?? 0) : 0), 0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total Users" value={users.length} icon={<Users className="w-5 h-5 text-indigo-500" />} color="bg-indigo-50" />
        <KpiCard label="Online Now" value={online.length} icon={<Activity className="w-5 h-5 text-green-500" />} color="bg-green-50" />
        <KpiCard label="Conversations Today" value={convToday} icon={<MessageSquare className="w-5 h-5 text-blue-500" />} color="bg-blue-50" />
        <KpiCard label="Minutes Today" value={`${minToday} min`} sub={`${paid.length} paid users`} icon={<Clock className="w-5 h-5 text-purple-500" />} color="bg-purple-50" />
        <KpiCard
          label="API Cost Today"
          value={`$${(todayUsage?.totalCostUsd ?? 0).toFixed(3)}`}
          sub={`${todayUsage?.geminiSessions ?? 0} sessions · ${(todayUsage?.geminiMinutes ?? 0).toFixed(1)} min`}
          icon={<Cpu className="w-5 h-5 text-amber-500" />}
          color="bg-amber-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">New Users</h3>
              <p className="text-xs text-gray-400">Last 30 days</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={6} />
              <YAxis tick={{ fontSize: 10 }} width={24} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#gu)" strokeWidth={2} dot={false} name="New users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Conversations</h3>
              <p className="text-xs text-gray-400">Last 30 days</p>
            </div>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={6} />
              <YAxis tick={{ fontSize: 10 }} width={24} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="conversations" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My test account */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">My Test Account</h3>
              <p className="text-xs text-gray-400">Switch subscription to test all flows</p>
            </div>
          </div>
          <TestAccountPanel adminUid={adminUid} onRefreshProfile={refreshProfile} />
        </div>

        {/* Online users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Online Now</h3>
              <p className="text-xs text-gray-400">{online.length} active in last 2 minutes</p>
            </div>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          {online.length === 0 ? (
            <p className="text-sm text-gray-400">No users online right now.</p>
          ) : (
            <div className="space-y-2">
              {online.slice(0, 8).map((u) => (
                <div key={u.uid} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                    {initials(u)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.displayName ?? u.email}</p>
                    <p className="text-xs text-gray-400">{u.subscription} · {u.targetLanguage}</p>
                  </div>
                  <button onClick={() => setSelectedUser(u)} className="text-indigo-500 hover:text-indigo-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Signups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Streak</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.slice(0, 8).map((u) => {
                const online = isOnline(u);
                return (
                  <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {initials(u)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{u.displayName ?? '—'}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SUB_COLOR[u.subscription] ?? 'bg-gray-100 text-gray-600'}`}>{u.subscription}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.stats?.streak ?? 0}🔥</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${online ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUser(u)} className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser} adminUid={adminUid}
          onClose={() => setSelectedUser(null)}
          onResetDone={(m) => { onToast(m); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}

// ── Analytics View ─────────────────────────────────────────────────────────
function AnalyticsView({ users, chartData }: { users: AdminUser[]; chartData: ChartPoint[] }) {
  const [range, setRange] = useState<7 | 30>(30);
  const sliced = chartData.slice(range === 7 ? -7 : 0);

  const subBreakdown = ['trial', 'starter', 'pro', 'ultra'].map((s) => ({
    name: s, count: users.filter((u) => u.subscription === s).length,
  }));

  const totalConvs = users.reduce((s, u) => s + (u.stats?.totalConversations ?? 0), 0);
  const avgConvs = users.length ? (totalConvs / users.length).toFixed(1) : '0';
  const activeUsers = users.filter((u) => (u.stats?.totalConversations ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total Conversations" value={totalConvs} icon={<MessageSquare className="w-5 h-5 text-indigo-500" />} color="bg-indigo-50" />
        <KpiCard label="Avg per User" value={avgConvs} icon={<BarChart2 className="w-5 h-5 text-blue-500" />} color="bg-blue-50" />
        <KpiCard label="Active Users" value={activeUsers} icon={<Activity className="w-5 h-5 text-green-500" />} color="bg-green-50" />
        <KpiCard label="Registered" value={users.length} icon={<Users className="w-5 h-5 text-amber-500" />} color="bg-amber-50" />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Trends</h3>
            <p className="text-xs text-gray-400">User signups & conversations</p>
          </div>
          <div className="flex gap-1">
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${range === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={sliced}>
            <defs>
              <linearGradient id="au" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ac" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={range === 7 ? 0 : 4} />
            <YAxis tick={{ fontSize: 10 }} width={28} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#au)" strokeWidth={2} dot={false} name="New users" />
            <Area type="monotone" dataKey="conversations" stroke="#10b981" fill="url(#ac)" strokeWidth={2} dot={false} name="Conversations" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Subscription breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={subBreakdown} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={56} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Users" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Test Account Panel ─────────────────────────────────────────────────────
function TestAccountPanel({ adminUid, onRefreshProfile }: { adminUid: string; onRefreshProfile: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function setSub(sub: string, trialUsed: boolean) {
    setBusy(true); setMsg('');
    try {
      await updateDoc(doc(db, 'users', adminUid), { subscription: sub, subscriptionStatus: 'active', trialUsed });
      await onRefreshProfile();
      setMsg(`✓ Set to ${sub}`);
    } catch { setMsg('✗ Error'); } finally { setBusy(false); }
  }

  const presets = [
    { label: 'Trial', sub: 'trial', trial: false, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { label: 'Starter', sub: 'starter', trial: true, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Pro', sub: 'pro', trial: true, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
    { label: 'Ultra', sub: 'ultra', trial: true, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setSub(p.sub, p.trial)}
            disabled={busy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 ${p.color}`}
          >
            <Zap className="w-3.5 h-3.5" />{p.label}
          </button>
        ))}
      </div>
      {msg && <p className={`text-xs font-medium ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
        <a href="/conversation" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <Play className="w-3.5 h-3.5" /> Test Conv.
        </a>
        <a href="/pricing" className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <Zap className="w-3.5 h-3.5" /> Pricing
        </a>
      </div>
    </div>
  );
}

// ── API Costs View ─────────────────────────────────────────────────────────
function ApiCostsView({ usageDocs, todayUsage }: {
  usageDocs: ApiUsageDoc[]; todayUsage: ApiUsageDoc | null;
}) {
  const [budget, setBudget] = useState(() => {
    if (typeof window === 'undefined') return '50';
    return localStorage.getItem('admin_monthly_budget') ?? '50';
  });
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget);

  const monthlyTotal = usageDocs.reduce((s, d) => s + (d.totalCostUsd ?? 0), 0);
  const monthlyMin = usageDocs.reduce((s, d) => s + (d.geminiMinutes ?? 0), 0);
  const monthlySessions = usageDocs.reduce((s, d) => s + (d.geminiSessions ?? 0), 0);
  const budgetNum = parseFloat(budget) || 50;
  const budgetPct = Math.min((monthlyTotal / budgetNum) * 100, 100);
  const overBudget = monthlyTotal > budgetNum;

  const chartData = usageDocs.map((d) => ({
    label: d.date.slice(5), // MM-DD
    cost: Math.round(d.totalCostUsd * 1000) / 1000,
    sessions: d.geminiSessions,
    minutes: Math.round(d.geminiMinutes * 10) / 10,
  }));

  function saveBudget() {
    setBudget(budgetInput);
    localStorage.setItem('admin_monthly_budget', budgetInput);
    setEditBudget(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="API Cost Today"
          value={`$${(todayUsage?.totalCostUsd ?? 0).toFixed(3)}`}
          sub={`${todayUsage?.geminiSessions ?? 0} sessions`}
          icon={<Cpu className="w-5 h-5 text-amber-500" />}
          color="bg-amber-50"
        />
        <KpiCard
          label="This Month Total"
          value={`$${monthlyTotal.toFixed(2)}`}
          sub={`${monthlySessions} sessions`}
          icon={<DollarSign className="w-5 h-5 text-indigo-500" />}
          color="bg-indigo-50"
        />
        <KpiCard
          label="Total Minutes"
          value={monthlyMin.toFixed(1)}
          sub={`avg ${monthlySessions ? (monthlyMin / monthlySessions).toFixed(1) : 0} min/session`}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          color="bg-blue-50"
        />
        <KpiCard
          label="Rate"
          value={`$${API_RATES.geminiPerMin}/min`}
          sub="Gemini Live estimate"
          icon={<Activity className="w-5 h-5 text-green-500" />}
          color="bg-green-50"
        />
      </div>

      {/* Budget bar */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 ${overBudget ? 'border-red-200' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Monthly Budget</h3>
            <p className="text-xs text-gray-400">Alert threshold for API spending</p>
          </div>
          {editBudget ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">$</span>
              <input
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button onClick={saveBudget} className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg">Save</button>
              <button onClick={() => setEditBudget(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => { setBudgetInput(budget); setEditBudget(true); }} className="text-xs text-indigo-600 hover:underline">
              Edit (${budget}/mo)
            </button>
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${overBudget ? 'bg-red-500' : budgetPct > 80 ? 'bg-amber-400' : 'bg-indigo-500'}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-500">
          <span>${monthlyTotal.toFixed(2)} spent</span>
          <span className={overBudget ? 'text-red-600 font-semibold' : ''}>
            {overBudget ? `⚠️ Over budget by $${(monthlyTotal - budgetNum).toFixed(2)}` : `$${(budgetNum - monthlyTotal).toFixed(2)} remaining`}
          </span>
        </div>
      </div>

      {/* Cost chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Daily API Cost</h3>
        <p className="text-xs text-gray-400 mb-4">Last 30 days — Gemini Live (estimated)</p>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No usage data yet. Costs appear after conversations are completed.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v: unknown) => [`$${typeof v === 'number' ? v.toFixed(3) : v}`, 'Cost']}
              />
              <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="url(#costGrad)" strokeWidth={2} dot={false} name="Cost USD" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-service table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Services Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Usage (month)</th>
              <th className="px-4 py-3 text-left">Rate</th>
              <th className="px-4 py-3 text-left">Estimated Cost</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Gemini Live
              </td>
              <td className="px-4 py-4 text-gray-600">{monthlyMin.toFixed(1)} min · {monthlySessions} sessions</td>
              <td className="px-4 py-4 text-gray-500 text-xs">${API_RATES.geminiPerMin}/min</td>
              <td className="px-4 py-4 font-semibold text-gray-900">${monthlyTotal.toFixed(3)}</td>
              <td className="px-4 py-4">
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" /> Firebase
              </td>
              <td className="px-4 py-4 text-gray-400 text-xs">Via console</td>
              <td className="px-4 py-4 text-gray-400 text-xs">Spark free / Blaze pay-as-go</td>
              <td className="px-4 py-4 text-gray-400 text-xs">See Firebase console</td>
              <td className="px-4 py-4">
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Stripe
              </td>
              <td className="px-4 py-4 text-gray-400 text-xs">—</td>
              <td className="px-4 py-4 text-gray-400 text-xs">1.4% + €0.25/tx (EU)</td>
              <td className="px-4 py-4 text-gray-400 text-xs">Not configured</td>
              <td className="px-4 py-4">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                  <Circle className="w-3.5 h-3.5" /> Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Ban Modal ──────────────────────────────────────────────────────────────
function BanModal({ user, adminUid, onClose, onDone }: {
  user: AdminUser; adminUid: string;
  onClose: () => void; onDone: (m: string) => void;
}) {
  const isBanned = !!user.banned;
  const [keyword, setKeyword] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirmWord = isBanned ? 'UNBAN' : 'BAN';

  async function handleAction() {
    if (keyword !== confirmWord) { setError(`Type "${confirmWord}" to confirm.`); return; }
    setBusy(true); setError('');
    try {
      if (isBanned) {
        await updateDoc(doc(db, 'users', user.uid), {
          banned: false, bannedAt: null, bannedBy: null, bannedReason: null,
        });
        await logAdminAction(adminUid, 'unban_user', { targetUid: user.uid, targetEmail: user.email });
        onDone(`✓ User "${user.email}" unbanned.`);
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          banned: true, bannedAt: serverTimestamp(), bannedBy: adminUid,
          bannedReason: reason.trim() || null,
        });
        await logAdminAction(adminUid, 'ban_user', { targetUid: user.uid, targetEmail: user.email, reason: reason.trim() || null });
        onDone(`✓ User "${user.email}" banned.`);
      }
      onClose();
    } catch (e: unknown) {
      setError(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 flex items-center justify-between rounded-t-2xl ${isBanned ? 'bg-green-600' : 'bg-red-600'}`}>
          <span className="text-white font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" /> {isBanned ? 'Unban User' : 'Ban User'}
          </span>
          <button onClick={onClose}><X className="w-5 h-5 text-white/80" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className={`border rounded-xl px-4 py-3 text-xs ${isBanned ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {isBanned
              ? <>Remove ban for <strong>{user.email}</strong>. The user will be able to log in again.</>
              : <>Ban <strong>{user.email}</strong>. They will be immediately signed out and blocked from logging in.</>
            }
          </div>
          {!isBanned && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
              <input
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Violation of terms of service"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <strong className={isBanned ? 'text-green-600' : 'text-red-600'}>{confirmWord}</strong> to confirm
            </label>
            <input
              value={keyword} onChange={(e) => setKeyword(e.target.value.toUpperCase())}
              placeholder={confirmWord} autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
            <button
              onClick={handleAction} disabled={keyword !== confirmWord || busy}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2 ${isBanned ? 'bg-green-600' : 'bg-red-600'}`}
            >
              {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isBanned ? 'Unban user' : 'Ban user')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Grant Admin Modal ───────────────────────────────────────────────
function ConfirmGrantAdminModal({ user, adminUid, onClose, onDone }: {
  user: AdminUser; adminUid: string;
  onClose: () => void; onDone: (m: string) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleGrant() {
    if (keyword !== 'ADMIN') { setError('Type "ADMIN" to confirm.'); return; }
    setBusy(true); setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
      await logAdminAction(adminUid, 'grant_admin', { targetUid: user.uid, targetEmail: user.email });
      onDone(`✓ Admin granted to ${user.email}`);
      onClose();
    } catch (e: unknown) {
      setError(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <span className="text-white font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" /> Grant Admin Access
          </span>
          <button onClick={onClose}><X className="w-5 h-5 text-indigo-200" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            <strong>Warning.</strong> Granting admin to <strong>{user.email}</strong> gives full access to this panel, all user data, and sensitive settings.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <strong className="text-indigo-600">ADMIN</strong> to confirm
            </label>
            <input
              value={keyword} onChange={(e) => setKeyword(e.target.value.toUpperCase())}
              placeholder="ADMIN" autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
            <button
              onClick={handleGrant} disabled={keyword !== 'ADMIN' || busy}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Grant admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reset Modal ────────────────────────────────────────────────────────────
function ResetModal({ user, adminUid, onClose, onDone }: {
  user: AdminUser; adminUid: string;
  onClose: () => void; onDone: (m: string) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (keyword !== 'RESET') { setError('Type "RESET" to confirm.'); return; }
    if (!checkRateLimit(`reset-${adminUid}`, 3)) { setError('Rate limit: max 3 resets/min.'); return; }
    setBusy(true); setError('');
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await setDoc(doc(db, 'user_snapshots', user.uid), {
          uid: user.uid, email: user.email,
          snapshotData: snap.data(), createdAt: serverTimestamp(), adminUid,
        });
      }
      for (const sub of ['conversations', 'difficultWords']) {
        const subSnap = await getDocs(collection(db, 'users', user.uid, sub));
        await Promise.all(subSnap.docs.map((d) => deleteDoc(d.ref)));
      }
      await updateDoc(userRef, {
        subscription: 'trial', subscriptionStatus: 'active', trialUsed: false,
        onboardingComplete: false, stripeCustomerId: null, stripeSubscriptionId: null,
        subscriptionEndsAt: null, level: 'A1',
        practiceProgress: { currentDay: 1, completedDays: [], lastPracticeDate: '', phase: 'fluency' },
        stats: { streak: 0, longestStreak: 0, lastActiveDate: '', totalConversations: 0, conversationsToday: 0, conversationsThisWeek: 0, conversationsThisMonth: 0, minutesToday: 0, correctionsReceived: 0 },
      });
      await logAdminAction(adminUid, 'reset_account', { targetUid: user.uid, targetEmail: user.email });
      onDone(`✓ Account "${user.email}" reset.`);
      onClose();
    } catch (e: unknown) {
      setError(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <span className="text-white font-semibold text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset Account</span>
          <button onClick={onClose}><X className="w-5 h-5 text-red-100" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
            <strong>Destructive.</strong> Deletes all data for <strong>{user.email}</strong>. A snapshot is saved automatically.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type <strong className="text-red-600">RESET</strong> to confirm</label>
            <input
              value={keyword} onChange={(e) => setKeyword(e.target.value.toUpperCase())}
              placeholder="RESET" autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
            <button
              onClick={handleReset} disabled={keyword !== 'RESET' || busy}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User Modal ─────────────────────────────────────────────────────────────
function UserModal({ user, adminUid, onClose, onResetDone }: {
  user: AdminUser; adminUid: string;
  onClose: () => void; onResetDone: (m: string) => void;
}) {
  const [showReset, setShowReset] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const online = isOnline(user);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
            <span className="text-indigo-100 text-sm font-medium">{user.displayName ?? user.email}</span>
            <button onClick={onClose}><X className="w-5 h-5 text-indigo-200" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 text-lg font-bold flex items-center justify-center shrink-0">
                {initials(user)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user.displayName ?? '—'}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-gray-400 text-xs font-mono mt-0.5">{user.uid}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SUB_COLOR[user.subscription] ?? 'bg-gray-100 text-gray-600'}`}>{user.subscription}</span>
                <span className={`flex items-center gap-1 text-xs ${online ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {online ? 'Online' : `Seen ${fmtTime(user.lastSeen)}`}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'Native', value: user.nativeLanguage },
                { label: 'Learning', value: user.targetLanguage },
                { label: 'Level', value: user.level },
                { label: 'Role', value: user.role ?? 'user' },
                { label: 'Conversations', value: String(user.stats?.totalConversations ?? 0) },
                { label: 'Streak', value: `${user.stats?.streak ?? 0}🔥` },
                { label: 'Practice day', value: String(user.practiceProgress?.currentDay ?? 1) },
                { label: 'Completed', value: `${user.practiceProgress?.completedDays?.length ?? 0}/30` },
                { label: 'Joined', value: fmtDate(user.createdAt) },
                { label: 'Trial used', value: user.trialUsed ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-semibold text-gray-800 capitalize text-sm">{value}</p>
                </div>
              ))}
            </div>
            {user.banned && user.bannedReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
                <strong>Banned:</strong> {user.bannedReason}
              </div>
            )}
            <div className="pt-1 flex justify-end gap-2">
              <button
                onClick={() => setShowBan(true)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${user.banned ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'bg-orange-50 hover:bg-orange-100 text-orange-700'}`}
              >
                <Shield className="w-3.5 h-3.5" /> {user.banned ? 'Unban' : 'Ban user'}
              </button>
              <button
                onClick={() => setShowReset(true)}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset account
              </button>
            </div>
          </div>
        </div>
      </div>
      {showReset && (
        <ResetModal
          user={user} adminUid={adminUid}
          onClose={() => setShowReset(false)}
          onDone={(m) => { onResetDone(m); onClose(); }}
        />
      )}
      {showBan && (
        <BanModal
          user={user} adminUid={adminUid}
          onClose={() => setShowBan(false)}
          onDone={(m) => { onResetDone(m); onClose(); }}
        />
      )}
    </>
  );
}

// ── Users View ─────────────────────────────────────────────────────────────
function UsersView({ users, loading, adminUid, onRefresh, onToast }: {
  users: AdminUser[]; loading: boolean; adminUid: string;
  onRefresh: () => void; onToast: (m: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterSub, setFilterSub] = useState('all');
  const [filterOnline, setFilterOnline] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(0);
  const PAGE = 25;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const ms = !q || (u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q) || u.uid.includes(q));
    const mp = filterSub === 'all' || u.subscription === filterSub;
    const mo = !filterOnline || isOnline(u);
    return ms && mp && mo;
  });

  const paged = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.ceil(filtered.length / PAGE);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search email, name, UID…"
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
          />
        </div>
        <select
          value={filterSub} onChange={(e) => { setFilterSub(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All plans</option>
          <option value="trial">Trial</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="ultra">Ultra</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={() => { setFilterOnline(!filterOnline); setPage(0); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${filterOnline ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-500 hover:text-gray-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-green-500" /> Online only
        </button>
        <button onClick={onRefresh} disabled={loading} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Languages</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Convs</th>
                <th className="px-4 py-3 text-left">Min Tot</th>
                <th className="px-4 py-3 text-left">Streak</th>
                <th className="px-4 py-3 text-left">Practice</th>
                <th className="px-4 py-3 text-left">Last seen</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map((u) => {
                const online = isOnline(u);
                const isMe = u.uid === adminUid;
                return (
                  <tr key={u.uid} className={`hover:bg-gray-50 transition-colors ${isMe ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isMe ? 'bg-amber-200 text-amber-800' : 'bg-indigo-100 text-indigo-700'}`}>
                          {initials(u)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight flex items-center gap-1.5">
                            {u.displayName ?? '—'}
                            {isMe && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span>}
                            {u.role === 'admin' && !isMe && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Admin</span>}
                          </p>
                          <p className="text-gray-400 text-xs truncate max-w-[180px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.nativeLanguage} / {u.targetLanguage}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SUB_COLOR[u.subscription] ?? 'bg-gray-100 text-gray-600'}`}>{u.subscription}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.stats?.totalConversations ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.stats?.minutesTotal ?? 0} min</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.stats?.streak ?? 0}🔥</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.practiceProgress?.completedDays?.length ?? 0}/30</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtTime(u.lastSeen)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${online ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(u)} className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No users match.</div>}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{page * PAGE + 1}–{Math.min((page + 1) * PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <UserModal
          user={selected} adminUid={adminUid}
          onClose={() => setSelected(null)}
          onResetDone={(m) => { onToast(m); setSelected(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ── Bugs View ──────────────────────────────────────────────────────────────
function BugModal({ bug, adminUid, onClose, onUpdated }: {
  bug: BugReport; adminUid: string; onClose: () => void; onUpdated: () => void;
}) {
  const [notes, setNotes] = useState(bug.adminNotes ?? '');
  const [status, setStatus] = useState<BugReport['status']>(bug.status);
  const [priority, setPriority] = useState<BugReport['priority']>(bug.priority);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'bug_reports', bug.id), { adminNotes: notes, status, priority });
      await logAdminAction(adminUid, 'update_bug', { bugId: bug.id, status, priority });
      onUpdated(); onClose();
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <span className="text-gray-100 text-sm font-medium flex items-center gap-2"><Bug className="w-4 h-4" /> Bug Report</span>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-300" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">User</p>
              <p className="font-semibold text-gray-800 text-xs">{bug.email ?? bug.uid ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Page</p>
              <p className="font-semibold text-gray-800 text-xs font-mono">{bug.page ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 col-span-2">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-800">{bug.description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BugReport['status'])}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as BugReport['priority'])}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Admin notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Internal notes…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BugsView({ adminUid }: { adminUid: string }) {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selected, setSelected] = useState<BugReport | null>(null);

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'bug_reports'), orderBy('timestamp', 'desc'), limit(100)));
      setBugs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BugReport)));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const filtered = bugs.filter((b) =>
    (filterStatus === 'all' || b.status === filterStatus) &&
    (filterPriority === 'all' || b.priority === filterPriority)
  );
  const newCount = bugs.filter((b) => b.status === 'new').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={fetchBugs} disabled={loading} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-xs text-gray-400">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</span>
        {newCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{newCount} new</span>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && bugs.length === 0 ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No bug reports. 🎉</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((b) => (
              <button key={b.id} onClick={() => setSelected(b)}
                className="w-full flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLOR[b.priority]}`}>{b.priority}</span>
                    {b.page && <span className="text-xs text-gray-400 font-mono">{b.page}</span>}
                  </div>
                  <p className="text-sm text-gray-800 truncate">{b.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.email ?? b.uid ?? 'anonymous'} · {fmtTime(b.timestamp)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <BugModal bug={selected} adminUid={adminUid} onClose={() => setSelected(null)} onUpdated={fetchBugs} />}
    </div>
  );
}

// ── Alerts View ────────────────────────────────────────────────────────────
interface SuspiciousEvent {
  id: string;
  uid: string | null;
  email: string | null;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, unknown>;
  timestamp: Ts | null;
  resolved: boolean;
  resolvedBy: string | null;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-gray-100 text-gray-600 border-gray-200',
};

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-amber-400',
  low:      'bg-gray-400',
};

const TYPE_LABEL: Record<string, string> = {
  too_many_conversations: 'API Abuse',
  excessive_usage:        'High Usage',
  long_session:           'Long Session',
  admin_brute_force:      'Brute Force',
  admin_access_attempt:   'Unauthorized Access',
  api_cost_spike:         'Cost Spike',
  rapid_signups:          'Bot Signup',
};

function AlertsView({ adminUid, onToast }: { adminUid: string; onToast: (m: string) => void }) {
  const [events, setEvents] = useState<SuspiciousEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterResolved, setFilterResolved] = useState(false);
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const q = query(
      collection(db, 'suspicious_events'),
      orderBy('timestamp', 'desc'),
      limit(200),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SuspiciousEvent));
        setEvents(list);
        setLoading(false);
        list
          .filter((e) => !e.resolved && (e.severity === 'critical' || e.severity === 'high'))
          .filter((e) => !notifiedIds.current.has(e.id))
          .forEach((e) => {
            notifiedIds.current.add(e.id);
            if (Notification.permission === 'granted') {
              new Notification(`⚠️ ${TYPE_LABEL[e.type] ?? e.type}`, {
                body: e.description,
                icon: '/favicon.ico',
              });
            }
          });
      },
      () => { setLoading(false); }, // error callback
    );
    return () => unsub();
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  async function resolve(event: SuspiciousEvent) {
    try {
      await updateDoc(doc(db, 'suspicious_events', event.id), {
        resolved: true,
        resolvedBy: adminUid,
        resolvedAt: serverTimestamp(),
      });
      await logAdminAction(adminUid, 'resolve_alert', { eventId: event.id, type: event.type });
      onToast(`✓ Alert resolved`);
    } catch {
      onToast('✗ Error resolving alert');
    }
  }

  const filtered = events.filter((e) => {
    const ms = filterSeverity === 'all' || e.severity === filterSeverity;
    const mr = filterResolved ? true : !e.resolved;
    return ms && mr;
  });

  const unresolvedCritical = events.filter((e) => !e.resolved && e.severity === 'critical').length;
  const unresolvedHigh = events.filter((e) => !e.resolved && e.severity === 'high').length;

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      {(unresolvedCritical > 0 || unresolvedHigh > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {unresolvedCritical > 0 && `${unresolvedCritical} critical`}
              {unresolvedCritical > 0 && unresolvedHigh > 0 && ' · '}
              {unresolvedHigh > 0 && `${unresolvedHigh} high`}
              {' '}unresolved alert{unresolvedCritical + unresolvedHigh !== 1 ? 's' : ''} require attention
            </p>
            <p className="text-xs text-red-600 mt-0.5">Review and resolve to keep the system secure.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => setFilterResolved((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${filterResolved ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-500 hover:text-gray-700'}`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> Show resolved
        </button>
        {Notification.permission !== 'granted' && (
          <button
            onClick={() => Notification.requestPermission()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" /> Enable notifications
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} alert{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Events list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No alerts</p>
            <p className="text-xs text-gray-400 mt-1">Everything looks clean.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((e) => (
              <div
                key={e.id}
                className={`flex items-start gap-4 px-6 py-4 transition-colors ${e.resolved ? 'opacity-50' : 'hover:bg-gray-50'}`}
              >
                {/* Severity dot */}
                <div className="mt-1.5 shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full block ${e.resolved ? 'bg-gray-300' : SEVERITY_DOT[e.severity]}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_COLOR[e.severity]}`}>
                      {e.severity}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {TYPE_LABEL[e.type] ?? e.type}
                    </span>
                    {e.resolved && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{e.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {e.email && <span>{e.email}</span>}
                    {e.uid && <span className="font-mono">{e.uid.slice(0, 10)}…</span>}
                    <span>{fmtTime(e.timestamp)}</span>
                  </div>
                  {Object.keys(e.metadata ?? {}).length > 0 && (
                    <pre className="text-xs text-gray-400 mt-1 font-mono truncate">
                      {JSON.stringify(e.metadata)}
                    </pre>
                  )}
                </div>

                {!e.resolved && (
                  <button
                    onClick={() => resolve(e)}
                    className="shrink-0 flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Logs View ──────────────────────────────────────────────────────────────
function LogsView() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(200)));
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminLog)));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionTypes = ['all', ...Array.from(new Set(logs.map((l) => l.action)))];
  const filtered = logs.filter((l) => filterAction === 'all' || l.action === filterAction);

  const ACTION_ICONS: Record<string, React.ReactElement> = {
    reset_account: <RotateCcw className="w-4 h-4 text-red-500" />,
    update_bug: <Bug className="w-4 h-4 text-amber-500" />,
    grant_admin: <Shield className="w-4 h-4 text-indigo-500" />,
    revoke_admin: <Shield className="w-4 h-4 text-gray-400" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          {actionTypes.map((a) => <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>)}
        </select>
        <button onClick={fetchLogs} disabled={loading} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-xs text-gray-400">{filtered.length} log{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No logs yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-start gap-4 px-6 py-4">
                <div className="mt-0.5 shrink-0">{ACTION_ICONS[l.action] ?? <Circle className="w-4 h-4 text-gray-400" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{l.action}</span>
                    <span className="text-xs text-gray-400">{fmtTime(l.timestamp)}</span>
                  </div>
                  {Object.keys(l.details ?? {}).length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{JSON.stringify(l.details)}</p>
                  )}
                  <p className="text-xs text-gray-400">by {l.adminUid.slice(0, 10)}…</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Settings View ──────────────────────────────────────────────────────────
function SettingsView({ users, adminUid, onToast, onRefreshUsers }: {
  users: AdminUser[]; adminUid: string;
  onToast: (m: string) => void; onRefreshUsers: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [confirmGrantUser, setConfirmGrantUser] = useState<AdminUser | null>(null);

  // Fetch TOTP URI from server — secret never exposed in client bundle
  useEffect(() => {
    fetch('/api/admin/totp-uri')
      .then((r) => r.json())
      .then((d) => { if (d.uri) { setTotpUri(d.uri); setTotpSecret(d.secret ?? ''); } })
      .catch(() => {});
  }, []);

  async function revokeAdmin(u: AdminUser) {
    setBusy(u.uid);
    try {
      await updateDoc(doc(db, 'users', u.uid), { role: 'user' });
      await logAdminAction(adminUid, 'revoke_admin', { targetUid: u.uid, targetEmail: u.email });
      onToast(`✓ Admin revoked from ${u.email}`);
      onRefreshUsers();
    } catch (e: unknown) {
      onToast(`✗ Error: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally { setBusy(null); }
  }

  function copySecret() {
    navigator.clipboard.writeText(totpSecret).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const adminUsers = users.filter((u) => u.role === 'admin' || isAdminUid(u.uid));
  const nonAdminUsers = users.filter((u) => u.role !== 'admin' && !isAdminUid(u.uid));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* TOTP Setup */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <QrCode className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">TOTP / 2FA Setup</h2>
            <p className="text-xs text-gray-400">Scan with Google Authenticator for 2FA login</p>
          </div>
        </div>
        {totpUri ? (
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shrink-0">
              <QRCodeSVG value={totpUri} size={150} />
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Keep this secret safe</p>
                <p className="text-xs text-amber-700">Only scan once on your authenticator app.</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Manual entry key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 text-gray-700 text-xs font-mono px-3 py-2 rounded-xl break-all">{totpSecret}</code>
                  <button onClick={copySecret} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl shrink-0">
                    <Copy className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>1. Open Google Authenticator or Authy</p>
                <p>2. Tap + → Scan QR code</p>
                <p>3. Use 6-digit code to log in to /admin</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">TOTP secret not configured</p>
            <p className="text-xs text-amber-700">Add <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_ADMIN_TOTP_SECRET</code> to <code className="bg-amber-100 px-1 rounded">.env.local</code></p>
          </div>
        )}
      </div>

      {/* Manage Admins */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <UserCog className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Manage Admins</h2>
            <p className="text-xs text-gray-400">Grant or revoke admin access</p>
          </div>
        </div>

        {adminUsers.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current admins</p>
            <div className="space-y-2">
              {adminUsers.map((u) => {
                const isMe = u.uid === adminUid;
                return (
                  <div key={u.uid} className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold flex items-center justify-center">{initials(u)}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          {u.displayName ?? u.email}
                          {isMe && <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full">You</span>}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    {!isMe && (
                      <button onClick={() => revokeAdmin(u)} disabled={busy === u.uid}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-40">
                        {busy === u.uid ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <><Shield className="w-3.5 h-3.5" />Revoke</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Grant access</p>
          {nonAdminUsers.length === 0 ? (
            <p className="text-sm text-gray-400">All users are admins.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {nonAdminUsers.map((u) => (
                <div key={u.uid} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">{initials(u)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.displayName ?? u.email}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmGrantUser(u)} disabled={busy === u.uid}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-40">
                    <Shield className="w-3.5 h-3.5" />Grant
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmGrantUser && (
        <ConfirmGrantAdminModal
          user={confirmGrantUser} adminUid={adminUid}
          onClose={() => setConfirmGrantUser(null)}
          onDone={(m) => { onToast(m); setConfirmGrantUser(null); onRefreshUsers(); }}
        />
      )}

      {/* App config check */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Environment Check</h2>
            <p className="text-xs text-gray-400">API keys and configuration status</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: 'Firebase API Key', ok: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
            { label: 'Firebase Project', ok: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
            { label: 'Stripe Publishable Key', ok: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY },
            { label: 'Admin UIDs', ok: !!process.env.NEXT_PUBLIC_ADMIN_UID },
            { label: 'TOTP Secret', ok: !!process.env.NEXT_PUBLIC_ADMIN_TOTP_SECRET },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
              <span className="text-xs text-gray-600">{label}</span>
              <span className={`flex items-center gap-1 text-xs font-semibold ${ok ? 'text-green-600' : 'text-red-500'}`}>
                {ok ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {ok ? 'Set' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Admin Layout ───────────────────────────────────────────────────────────
function AdminLayout() {
  const { user, userProfile, logOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<AdminView>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usageDocs, setUsageDocs] = useState<ApiUsageDoc[]>([]);
  const [todayUsage, setTodayUsage] = useState<ApiUsageDoc | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [unresolvedAlerts, setUnresolvedAlerts] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }, []);

  // Stagger listeners to avoid concurrent-stream race condition in Firebase 12.x
  // Listener 1: real-time users (most important)
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AdminUser)));
        setUsersLoading(false);
        setLastRefresh(new Date());
      },
      () => { setUsersLoading(false); }, // error: stop spinner silently
    );
    return () => unsub();
  }, []);

  // Listener 2: unresolved alerts badge — delayed 400ms to avoid stream collision
  useEffect(() => {
    let unsub: (() => void) | undefined;
    const timer = setTimeout(() => {
      const q = query(collection(db, 'suspicious_events'), where('resolved', '==', false), limit(50));
      unsub = onSnapshot(q, (snap) => setUnresolvedAlerts(snap.size), () => {});
    }, 400);
    return () => { clearTimeout(timer); unsub?.(); };
  }, []);

  // API usage: poll instead of onSnapshot to avoid a 3rd concurrent stream
  useEffect(() => {
    const days = getLast30Days();
    const today = days[days.length - 1].date;

    async function fetchUsage() {
      try {
        const [todaySnap, allSnap] = await Promise.all([
          getDoc(doc(db, 'api_usage', today)),
          getDocs(query(collection(db, 'api_usage'), orderBy('date', 'desc'), limit(30))),
        ]);
        setTodayUsage(todaySnap.exists() ? (todaySnap.data() as ApiUsageDoc) : null);
        const byDate: Record<string, ApiUsageDoc> = {};
        allSnap.docs.forEach((d) => { byDate[d.id] = d.data() as ApiUsageDoc; });
        setUsageDocs(days.map((d) => byDate[d.date] ?? { date: d.date, geminiSessions: 0, geminiMinutes: 0, geminiCostUsd: 0, totalCostUsd: 0 }));
      } catch { /* ignore */ }
    }

    fetchUsage();
    // Re-poll every 2 minutes
    const interval = setInterval(fetchUsage, 120_000);
    return () => clearInterval(interval);
  }, []);

  // Build chart data (merge users + usage)
  useEffect(() => {
    const days = getLast30Days();
    const convByDay: Record<string, number> = {};
    users.forEach((u) => {
      // estimate: if user was active today, count their conversationsToday
      if (u.stats?.lastActiveDate) {
        convByDay[u.stats.lastActiveDate] = (convByDay[u.stats.lastActiveDate] ?? 0) + (u.stats.conversationsToday ?? 0);
      }
    });
    const usersByDay: Record<string, number> = {};
    users.forEach((u) => {
      if (u.createdAt?.toDate) {
        const d = u.createdAt.toDate().toISOString().split('T')[0];
        usersByDay[d] = (usersByDay[d] ?? 0) + 1;
      }
    });
    setChartData(days.map((d) => ({
      label: d.label,
      users: usersByDay[d.date] ?? 0,
      conversations: convByDay[d.date] ?? 0,
      cost: usageDocs.find((u) => u.date === d.date)?.totalCostUsd ?? 0,
    })));
  }, [users, usageDocs]);

  const VIEW_TITLES: Record<AdminView, string> = {
    dashboard: 'Dashboard', analytics: 'Analytics', users: 'Users',
    costs: 'API & Costs', alerts: 'Security Alerts', bugs: 'Bug Reports', logs: 'Logs', settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        view={view} onNav={setView}
        user={user}
        onLogout={async () => { await logOut(); router.push('/'); }}
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        alertCount={unresolvedAlerts}
      />

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60'}`}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-base">{VIEW_TITLES[view]}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Refreshed {fmtTime(lastRefresh)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/chat" className="hidden sm:flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              <Play className="w-4 h-4" /> Test
            </a>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              {((user?.displayName ?? user?.email ?? '?').slice(0, 2)).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {view === 'dashboard' && (
            <DashboardView
              users={users} todayUsage={todayUsage} chartData={chartData}
              adminUid={user?.uid ?? ''} refreshProfile={refreshProfile}
              userProfile={userProfile} onToast={showToast}
            />
          )}
          {view === 'analytics' && <AnalyticsView users={users} chartData={chartData} />}
          {view === 'users' && (
            <UsersView
              users={users} loading={usersLoading}
              adminUid={user?.uid ?? ''}
              onRefresh={() => {}}
              onToast={showToast}
            />
          )}
          {view === 'costs' && <ApiCostsView usageDocs={usageDocs} todayUsage={todayUsage} />}
          {view === 'alerts' && <AlertsView adminUid={user?.uid ?? ''} onToast={showToast} />}
          {view === 'bugs' && <BugsView adminUid={user?.uid ?? ''} />}
          {view === 'logs' && <LogsView />}
          {view === 'settings' && (
            <SettingsView
              users={users} adminUid={user?.uid ?? ''}
              onToast={showToast} onRefreshUsers={() => {}}
            />
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Root Page ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // null = checking, false = not verified, true = verified
  const [verified, setVerified] = useState<boolean | null>(null);

  const isAdmin = userProfile?.role === 'admin' || (user ? isAdminUid(user.uid) : false);

  // Check httpOnly cookie server-side on mount
  useEffect(() => {
    fetch('/api/admin/check-session')
      .then((r) => r.json())
      .then((d) => setVerified(!!d.valid))
      .catch(() => setVerified(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) router.replace('/');
  }, [user, loading, isAdmin, router]);

  // Logout clears cookie too
  const { logOut } = useAuth();
  async function handleLogout() {
    await fetch('/api/admin/check-session', { method: 'DELETE' });
    await logOut();
    router.push('/');
  }

  if (loading || verified === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;
  if (!verified) return <TotpGate uid={user.uid} onVerified={() => setVerified(true)} />;
  return <AdminLayout />;
}
