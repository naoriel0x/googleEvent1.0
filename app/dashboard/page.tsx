"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Case } from "@/types";
import {
  Shield,
  Plus,
  FileText,
  Users,
  Download,
  Lock,
  Search,
  LogOut,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  LayoutDashboard,
  Phone,
} from "lucide-react";

// ─── User Avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ user }: { user: import("@supabase/supabase-js").User }) {
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    user.email?.split("@")[0] ||
    "Pengguna";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-6 h-6 rounded-full object-cover border border-emerald-500/40 flex-shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-black text-emerald-400">
            {initials}
          </span>
        </div>
      )}
      <span className="hidden sm:block text-xs font-semibold text-slate-300 max-w-[100px] truncate">
        {displayName}
      </span>
    </div>
  );
}

// ─── Dynamic Island Navbar ─────────────────────────────────────────────────────
function DashboardNavbar({
  user,
  isGuest,
  onLogout,
}: {
  user: import("@supabase/supabase-js").User | null;
  isGuest: boolean;
  onLogout: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Outer wrapper: full width, sticky, transparent — just for positioning
    <div className="sticky top-0 z-50 w-full flex justify-center pt-3 pb-1 pointer-events-none">
      {/* The floating pill — pointer-events-auto so it's clickable */}
      <header
        className={`
          pointer-events-auto
          flex items-center justify-between gap-3
          px-3 py-2
          rounded-2xl border
          backdrop-blur-2xl
          shadow-2xl
          transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${
            scrolled
              ? "bg-white/90 dark:bg-slate-900/85 border-slate-200/80 dark:border-slate-700/70 shadow-slate-300/30 dark:shadow-black/60 scale-[0.98]"
              : "bg-white/80 dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-700/50 shadow-slate-200/20 dark:shadow-black/40"
          }
        `}
        style={{
          width: scrolled
            ? "min(720px, calc(100vw - 2rem))"
            : "min(860px, calc(100vw - 2rem))",
        }}
      >
        {/* Left — Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 flex-shrink-0 group cursor-pointer"
        >
          <div className="p-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500/25 group-hover:border-emerald-500/40 group-hover:scale-105 transition-all duration-300">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
            WitnessChain
          </span>
          <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold hidden sm:inline tracking-wider">
            DASHBOARD
          </span>
        </Link>

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800/70 transition-all duration-200">
                <UserAvatar user={user} />
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-red-500/15 border border-slate-700/50 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-all duration-200"
                title="Keluar"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline text-[11px]">Keluar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                onClick={() =>
                  sessionStorage.setItem(
                    "wc_prev_path",
                    window.location.pathname,
                  )
                }
              >
                <button className="px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-700/60 rounded-xl transition-all duration-200">
                  Masuk
                </button>
              </Link>
              <Link
                href="/login?tab=register"
                onClick={() =>
                  sessionStorage.setItem(
                    "wc_prev_path",
                    window.location.pathname,
                  )
                }
              >
                <button className="px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-700/40">
                  Daftar
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

// ─── Dashboard Footer ─────────────────────────────────────────────────────────
function DashboardFooter() {
  const platformLinks = [
    { label: "Mulai Dokumentasi", href: "/interview" },
    { label: "Legal Radar AI", href: "/legal" },
    { label: "Cari LBH", href: "/referral" },
    { label: "Bagikan Dokumen", href: "/result" },
    { label: "Dashboard", href: "/dashboard" },
  ];
  const sitemapLinks = [
    { label: "Beranda", href: "/" },
    { label: "Cara Kerja", href: "/cara-kerja" },
    { label: "Fitur", href: "/fitur" },
    { label: "Tentang", href: "/tentang" },
    { label: "Masuk / Daftar", href: "/login" },
  ];
  const legalLinks = [
    { label: "Syarat Penggunaan", href: "/terms" },
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Disclaimer Hukum", href: "/disclaimer" },
    { label: "Lisensi Open Source", href: "/license" },
  ];
  const emergencyContacts = [
    { label: "Komnas HAM RI", number: "119 ext 6" },
    { label: "YLBHI Jakarta", number: "(021) 315-7038" },
    { label: "Polisi Darurat", number: "110" },
    { label: "Ambulans", number: "118" },
  ];
  const socialLinks = [
    {
      label: "X",
      href: "#",
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
      label: "Instagram",
      href: "#",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
    {
      label: "LinkedIn",
      href: "#",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      label: "GitHub",
      href: "#",
      path: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
    },
  ];

  return (
    <footer className="mt-auto w-full relative z-10 bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-500">
      {/* Top gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12"
        style={{
          paddingBottom:
            "max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                WitnessChain
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Platform dokumentasi hak warga Indonesia. Membantu korban
              penggusuran, sengketa lahan, dan pelanggaran hak mendapatkan akses
              keadilan.
            </p>
            <div className="flex items-start gap-2.5 bg-amber-950/30 border border-amber-800/30 rounded-xl px-3.5 py-3">
              <span className="text-amber-400 text-sm mt-0.5 flex-shrink-0">
                ⚠
              </span>
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                Bukan pengganti konsultasi pengacara profesional. Untuk kasus
                serius, selalu hubungi LBH atau advokat.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Platform
            </p>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] transition-all duration-200 flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sitemap */}
          <div className="space-y-4">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Sitemap
            </p>
            <ul className="space-y-2.5">
              {sitemapLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] transition-all duration-200 flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Legal
            </p>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] transition-all duration-200 flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak Darurat */}
          <div className="space-y-4">
            <p className="text-[10px] font-extrabold text-red-400/90 uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              Kontak Darurat
            </p>
            <ul className="space-y-3">
              {emergencyContacts.map((contact) => (
                <li key={contact.label}>
                  <a
                    href={`tel:${contact.number.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-3 group cursor-pointer w-fit"
                  >
                    <div className="p-1.5 bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 group-hover:border-red-500/40 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:scale-105">
                      <Phone className="w-3 h-3 text-red-400 group-hover:text-red-300 transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 group-hover:text-slate-400 font-semibold leading-none mb-0.5 transition-colors">
                        {contact.label}
                      </p>
                      <p className="text-xs font-extrabold text-white group-hover:text-red-100 tracking-wide transition-colors">
                        {contact.number}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <p className="text-[10px] text-slate-600 font-medium">
              © 2026 WitnessChain · All rights reserved · Dibuat untuk keadilan
              Indonesia
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-700 font-medium">
              v1.0.0
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-[10px] text-slate-700 font-medium">
              Open Source
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-[10px] text-emerald-600/70 font-bold">
              MIT License
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(
    null,
  );
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "completed"
  >("all");
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    completed: 0,
    avgCompleteness: 0,
  });

  const calculateStats = useCallback((items: Case[]) => {
    const total = items.length;
    const drafts = items.filter((c) => c.status !== "completed").length;
    const completed = items.filter((c) => c.status === "completed").length;
    const totalCompleteness = items.reduce(
      (acc, c) => acc + (c.completeness_score || 0),
      0,
    );
    const avgCompleteness =
      total > 0 ? Math.round(totalCompleteness / total) : 0;
    setStats({ total, drafts, completed, avgCompleteness });
  }, []);

  const resetDashboardState = useCallback(() => {
    setCases([]);

    setStats({
      total: 0,
      drafts: 0,
      completed: 0,
      avgCompleteness: 0,
    });
  }, []);

  const loadUserCases = useCallback(
    async (token: string) => {
      try {
        const response = await fetch("/api/cases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setCases(data);
          calculateStats(data);
        }
      } catch (err) {
        console.error("Error loading cases:", err);
      } finally {
        setLoading(false);
      }
    },
    [calculateStats],
  );

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      try {
        // =====================================================
        // NORMAL LOGIN FLOW (CEK SESSION DULU)
        // =====================================================
        const {
          data: { session },
          error: sessionError // Tangkap error session di sini
        } = await supabaseClient.auth.getSession();

        // Kalau ada error (misal: token basi / Invalid Refresh Token)
        // Paksa sign out untuk membersihkan token yang nyangkut
        if (sessionError) {
          await supabaseClient.auth.signOut();
        }

        // Kalau ada session aktif, selalu prioritaskan login
        if (session) {
          if (!mounted) return;

          localStorage.removeItem("wc_guest_mode");
          document.cookie = 'wc_guest_mode=; path=/; max-age=0';
          sessionStorage.removeItem("sessionId");

          setUser(session.user);
          setIsGuest(false);
          await loadUserCases(session.access_token);
          return;
        }

        // =====================================================
        // CHECK GUEST MODE (KALAU TIDAK ADA SESSION)
        // =====================================================
        const guestMode = localStorage.getItem("wc_guest_mode") === "true";

        if (guestMode) {
          if (!mounted) return;

          setIsGuest(true);
          setUser(null);
          resetDashboardState();
          setLoading(false);
          return;
        }

        // =====================================================
        // BELUM LOGIN DAN BUKAN GUEST
        // =====================================================
        sessionStorage.setItem(
          "wc_prev_path",
          window.location.pathname || "/dashboard",
        );

        router.replace("/login?redirect=/dashboard");
      } catch (err) {
        console.error("Dashboard init error:", err);

        sessionStorage.setItem(
          "wc_prev_path",
          window.location.pathname || "/dashboard",
        );

        router.replace("/login?redirect=/dashboard");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeDashboard();

    // =========================================================
    // AUTH LISTENER
    // =========================================================
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      async (
        event: import("@supabase/supabase-js").AuthChangeEvent,
        session: import("@supabase/supabase-js").Session | null,
      ) => {
        // Jika guest mode aktif -> abaikan auth
        const guestMode = localStorage.getItem("wc_guest_mode") === "true";

        if (guestMode) {
          return;
        }

        // =====================================================
        // SIGNED OUT
        // =====================================================
        if (event === "SIGNED_OUT") {
          setUser(null);

          resetDashboardState();

          sessionStorage.setItem(
            "wc_prev_path",
            window.location.pathname || "/dashboard",
          );

          router.replace("/login");

          return;
        }

        // =====================================================
        // LOGIN VALID
        // =====================================================
        if (session) {
          setUser(session.user);

          setIsGuest(false);

          localStorage.removeItem("wc_guest_mode");

          await loadUserCases(session.access_token);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, loadUserCases, resetDashboardState]);

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut({
        scope: "local",
      });

      localStorage.removeItem("wc_guest_mode");

      sessionStorage.removeItem("sessionId");

      sessionStorage.removeItem('wc_prev_path');

      setUser(null);

      setIsGuest(false);

      resetDashboardState();

      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const resumeDraft = (item: Case) => {
    sessionStorage.setItem("sessionId", item.session_id);
    router.push("/interview");
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      (c.reporter_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.violation_type || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.incident_location || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
          ? c.status === "completed"
          : c.status !== "completed";
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto text-emerald-500" />
          <p className="text-slate-400 text-sm font-semibold">
            Memuat Data Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-dvh w-full bg-slate-950 text-slate-100 font-sans relative">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── Navbar (dynamic island) ── */}
      <DashboardNavbar user={user} isGuest={isGuest} onLogout={handleLogout} />

      {/* ── Main Content — grows to fill space ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-8 relative z-10">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl transition-colors duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-emerald-400" />
              {isGuest
                ? "Selamat Datang, Tamu"
                : user
                  ? `Selamat Datang, ${
                      user.user_metadata?.full_name?.split(" ")[0] ||
                      user.user_metadata?.name?.split(" ")[0] ||
                      "Kembali"
                    }`
                  : "Selamat Datang"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {isGuest
                ? "Anda menggunakan mode tamu. Daftar akun untuk menyimpan kasus secara permanen."
                : user
                  ? "Pantau laporan pelanggaran, draf kelengkapan berkas, dan unduh salinan berkas resmi Anda."
                  : "Memuat dashboard..."}
            </p>
          </div>
          <Link href="/interview">
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/30 flex items-center gap-2 group transition-all"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
              Mulai Kasus Baru
            </Button>
          </Link>
        </div>

        {/* Guest CTA banner */}
        {isGuest && !user && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl px-6 py-4">
            <div>
              <p className="text-sm font-bold text-emerald-300">
                Simpan kasus Anda secara permanen
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Buat akun gratis untuk menyimpan, mengunduh, dan melanjutkan
                kasus kapan saja.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href="/login"
                onClick={() =>
                  sessionStorage.setItem(
                    "wc_prev_path",
                    window.location.pathname,
                  )
                }
              >
                <button className="px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-all">
                  Masuk
                </button>
              </Link>
              <Link href="/login?tab=register">
                <button className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all">
                  Daftar Gratis
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Kasus",
              value: stats.total,
              color: "slate",
              icon: <FileText className="w-5 h-5" />,
              textColor: "text-white",
            },
            {
              label: "Draf Aktif",
              value: stats.drafts,
              color: "amber",
              icon: <Clock className="w-5 h-5" />,
              textColor: "text-amber-400",
            },
            {
              label: "Simpan Permanen",
              value: stats.completed,
              color: "emerald",
              icon: <CheckCircle className="w-5 h-5" />,
              textColor: "text-emerald-400",
            },
            {
              label: "Rata Kelengkapan",
              value: `${stats.avgCompleteness}%`,
              color: "teal",
              icon: <TrendingUp className="w-5 h-5" />,
              textColor: "text-teal-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-slate-700 transition-all"
            >
              <div
                className={`p-3.5 bg-${stat.color}-500/10 text-${stat.color}-400 rounded-xl border border-${stat.color}-500/20 shadow-inner flex-shrink-0`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black mt-0.5 ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Case List */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ID Kasus, Pelapor, Lokasi..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl text-xs placeholder-slate-600 text-white transition-all"
              />
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-end md:self-auto">
              {[
                {
                  key: "all",
                  label: `Semua (${stats.total})`,
                  activeColor: "text-white",
                },
                {
                  key: "draft",
                  label: `Draf (${stats.drafts})`,
                  activeColor: "text-amber-400",
                },
                {
                  key: "completed",
                  label: `Simpan Permanen (${stats.completed})`,
                  activeColor: "text-emerald-400",
                },
              ].map(({ key, label, activeColor }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as typeof statusFilter)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === key ? `bg-slate-800 ${activeColor}` : "text-slate-500 hover:text-slate-300"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-sm text-slate-400 font-bold">
                Tidak ada berkas kasus ditemukan
              </p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Silakan mulai sesi wawancara asisten baru untuk mencatat berkas
                kasus Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((item) => {
                const isCompleted = item.status === "completed";
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200 group hover:-translate-y-0.5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                          #{item.id.substring(0, 8).toUpperCase()}
                        </span>
                        {isCompleted ? (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Permanen
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Draf Kasus
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-white text-base truncate group-hover:text-emerald-400 transition-colors">
                          {item.violation_type
                            ?.replace(/_/g, " ")
                            .toUpperCase() || "JENIS PELANGGARAN DRAF"}
                        </h3>
                        <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                          <p className="flex items-center gap-2 truncate">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            Pelapor:{" "}
                            <strong className="text-slate-300 ml-0.5">
                              {item.reporter_name || "Tamu / Anonim"}
                            </strong>
                          </p>
                          {item.incident_location && (
                            <p className="flex items-center gap-2 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              Lokasi:{" "}
                              <span className="text-slate-300 ml-0.5">
                                {item.incident_location}
                              </span>
                            </p>
                          )}
                          {item.incident_date && (
                            <p className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              Tanggal:{" "}
                              <span className="text-slate-300 ml-0.5">
                                {new Date(
                                  item.incident_date,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>Kelengkapan Berkas</span>
                          <span
                            className={
                              item.completeness_score >= 70
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {item.completeness_score}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${item.completeness_score >= 70 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${item.completeness_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                      <Link
                        href={`/result/${item.id}`}
                        className="text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                      >
                        Detail Kasus <ArrowRight className="w-3 h-3" />
                      </Link>
                      {isCompleted ? (
                        item.document_url ? (
                          <button
                            onClick={() =>
                              window.open(item.document_url, "_blank")
                            }
                            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh PDF
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold italic">
                            PDF belum dibuat
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => resumeDraft(item)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-1.5 px-3 rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          Lanjutkan Wawancara
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <DashboardFooter />
    </div>
  );
}