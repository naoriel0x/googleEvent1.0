"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { IntroScreen } from "@/components/ui/IntroScreen";
import {
  Shield,
  Lock,
  FileCheck2,
  ArrowRight,
  MessageSquare,
  Upload,
  CheckCircle,
  Scale,
  MapPin,
  Menu,
  X,
  Clock,
  FileText,
  Users,
  AlertTriangle,
  ChevronRight,
  Phone,
  AtSign,
  Camera,
  Briefcase,
  Code2,
  AlertOctagon,
} from "lucide-react";

// ─── Animated Chat Card ───────────────────────────────────────────────────────
const CHAT_MESSAGES = [
  { id: 1, from: "ai", text: "Apa jenis pelanggaran yang Anda alami?" },
  {
    id: 2,
    from: "user",
    text: "Rumah saya digusur paksa tanpa surat resmi...",
  },
  { id: 3, from: "ai", text: "Kapan kejadian itu berlangsung?" },
  { id: 4, from: "user", text: "Tanggal 14 Mei, sekitar pukul 07.00 pagi." },
  { id: 5, from: "ai", text: "Apakah ada saksi yang hadir saat itu?" },
];

function AnimatedChatCard() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const [score, setScore] = useState(35);
  const [fadeOut, setFadeOut] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let typingTimeout: ReturnType<typeof setTimeout>;
    let revealTimeout: ReturnType<typeof setTimeout>;

    // All messages shown — wait, fade out, reset, loop
    if (visibleCount >= CHAT_MESSAGES.length) {
      revealTimeout = setTimeout(() => {
        setFadeOut(true);
        // After fade, reset state
        setTimeout(() => {
          setVisibleCount(1);
          setScore(35);
          setFadeOut(false);
        }, 800);
      }, 2200); // pause before looping
      return () => clearTimeout(revealTimeout);
    }

    const nextMsg = CHAT_MESSAGES[visibleCount];
    const isAI = nextMsg.from === "ai";

    if (isAI) {
      typingTimeout = setTimeout(() => setTyping(true), 600);
      revealTimeout = setTimeout(() => {
        setTyping(false);
        setVisibleCount((v) => v + 1);
        setScore((s) => Math.min(s + 13, 78));
      }, 2000);
    } else {
      revealTimeout = setTimeout(() => {
        setVisibleCount((v) => v + 1);
        setScore((s) => Math.min(s + 13, 78));
      }, 900);
    }

    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(revealTimeout);
    };
  }, [visibleCount]);

  // Scroll only INSIDE the card's message container, not the page
  useEffect(() => {
    const container = scrollRef.current;
    const bottom = bottomRef.current;
    if (!container || !bottom) return;
    container.scrollTo({ top: bottom.offsetTop, behavior: "smooth" });
  }, [visibleCount, typing]);

  return (
    <div className="relative flex justify-center h-full">
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl pointer-events-none" />

      <div
        className="relative w-full max-w-sm bg-slate-800/90 backdrop-blur-sm border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 flex flex-col"
        style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.6s ease" }}
      >
        {/* Top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60 bg-slate-800/60">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex items-center gap-2 ml-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-300 tracking-wide">
              WitnessChain AI
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="px-4 py-4 space-y-3 flex-1 overflow-y-auto scrollbar-none"
        >
          {CHAT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              style={{
                animation:
                  "chatSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {msg.from === "ai" && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.from === "ai"
                    ? "bg-emerald-600/20 border border-emerald-500/30 text-slate-200 rounded-tl-sm"
                    : "bg-slate-600/60 border border-slate-500/40 text-slate-100 rounded-tr-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div
              className="flex gap-2 items-start"
              style={{ animation: "chatSlideIn 0.3s ease both" }}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    style={{
                      animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Score bar */}
        <div className="px-4 pb-4">
          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase">
                Score Kelengkapan
              </span>
              <span
                className="text-sm font-black text-emerald-400 tabular-nums transition-all duration-700"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {score}%
              </span>
            </div>
            <div className="relative h-2 bg-slate-600/60 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${score}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  boxShadow: "0 0 8px rgba(52,211,153,0.5)",
                }}
              />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes chatSlideIn {
            from { opacity: 0; transform: translateY(10px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30%            { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Animated Score Card ──────────────────────────────────────────────────────
const SCORE_ITEMS = [
  { label: "Identitas", points: 13 },
  { label: "Kronologi", points: 15 },
  { label: "Lokasi", points: 12 },
  { label: "Saksi", points: 15 },
  { label: "Foto Bukti", points: 14 },
  { label: "Surat Resmi", points: 9 },
];
const SCORE_BASE = 22;
const SCORE_MAX = SCORE_ITEMS.reduce((a, b) => a + b.points, SCORE_BASE);

function AnimatedScoreCard() {
  const [checkedCount, setCheckedCount] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const score =
    SCORE_BASE +
    SCORE_ITEMS.slice(0, checkedCount).reduce((a, b) => a + b.points, 0);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / SCORE_MAX) * circ;

  useEffect(() => {
    if (checkedCount >= SCORE_ITEMS.length) {
      // Pause then reset loop
      const t = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setCheckedCount(0);
          setFadeOut(false);
        }, 700);
      }, 2000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCheckedCount((c) => c + 1), 900);
    return () => clearTimeout(t);
  }, [checkedCount]);

  return (
    <div
      className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/80 shadow-2xl shadow-black/40 p-6 flex flex-col items-center justify-center gap-4"
      style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Score Kelengkapan
      </p>

      {/* Circular ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full bg-emerald-500/8 blur-xl" />
        <svg
          width="140"
          height="140"
          viewBox="0 0 148 148"
          className="rotate-[-90deg]"
        >
          <circle
            cx="74"
            cy="74"
            r={r}
            fill="none"
            stroke="rgba(16,185,129,0.1)"
            strokeWidth="10"
          />
          <circle
            cx="74"
            cy="74"
            r={r}
            fill="none"
            stroke="url(#sg2)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{
              filter: "drop-shadow(0 0 6px rgba(52,211,153,0.7))",
              transition:
                "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
          <defs>
            <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className="text-3xl font-black text-emerald-400 leading-none tabular-nums"
            style={{ transition: "all 0.5s ease" }}
          >
            {score}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
            /{SCORE_MAX}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
        {SCORE_ITEMS.map((item, i) => {
          const done = i < checkedCount;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2"
              style={{
                transition: "opacity 0.3s ease",
                opacity: i <= checkedCount ? 1 : 0.35,
              }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: done
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(100,116,139,0.2)",
                  border: done
                    ? "1px solid rgba(16,185,129,0.5)"
                    : "1px solid rgba(100,116,139,0.3)",
                  transition: "all 0.4s ease",
                  boxShadow: done ? "0 0 6px rgba(16,185,129,0.3)" : "none",
                }}
              >
                {done && (
                  <svg
                    viewBox="0 0 10 8"
                    className="w-2.5 h-2.5"
                    style={{
                      animation:
                        "checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  >
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${done ? "text-slate-200" : "text-slate-500"}`}
              >
                {item.label}
              </span>
              {done && (
                <span
                  className="ml-auto text-[10px] font-bold text-emerald-400"
                  style={{ animation: "fadeInUp 0.3s ease both" }}
                >
                  +{item.points}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="w-full">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
          <span>
            {checkedCount} / {SCORE_ITEMS.length} item lengkap
          </span>
          {checkedCount < SCORE_ITEMS.length && (
            <span className="text-amber-400 font-semibold">
              {SCORE_ITEMS.length - checkedCount} item kurang
            </span>
          )}
          {checkedCount === SCORE_ITEMS.length && (
            <span className="text-emerald-400 font-semibold">Lengkap! ✓</span>
          )}
        </div>
        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(checkedCount / SCORE_ITEMS.length) * 100}%`,
              background: "linear-gradient(90deg, #10b981, #34d399)",
              boxShadow: "0 0 8px rgba(52,211,153,0.5)",
              transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes checkPop {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Animated Notifications ──────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    id: 1,
    iconType: "check",
    title: "Dokumen berhasil dibuat",
    desc: "PDF kronologi siap diunduh",
    time: "2 menit lalu",
    color: "emerald",
  },
  {
    id: 2,
    iconType: "document",
    title: "Score kelengkapan: 87/100",
    desc: "Dokumen hampir sempurna",
    time: "5 menit lalu",
    color: "blue",
  },
  {
    id: 3,
    iconType: "scale",
    title: "Legal Radar selesai",
    desc: "3 pasal hukum teridentifikasi",
    time: "8 menit lalu",
    color: "purple",
  },
  {
    id: 4,
    iconType: "location",
    title: "LBH terdekat ditemukan",
    desc: "LBH Jakarta — 2.3 km dari lokasi",
    time: "12 menit lalu",
    color: "amber",
  },
];

function AnimatedNotifications() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (visibleCount >= NOTIFICATIONS.length) {
      const t = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setVisibleCount(0);
          setFadeOut(false);
        }, 600);
      }, 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleCount((v) => v + 1), 1200);
    return () => clearTimeout(t);
  }, [visibleCount]);

  const colorMap: Record<string, { bg: string; border: string; dot: string }> =
    {
      emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        dot: "bg-emerald-400",
      },
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        dot: "bg-blue-400",
      },
      purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        dot: "bg-purple-400",
      },
      amber: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        dot: "bg-amber-400",
      },
    };

  const getNotificationIcon = (iconType: string) => {
    switch (iconType) {
      case "check":
        return <CheckCircle className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
      case "scale":
        return <Scale className="w-5 h-5" />;
      case "location":
        return <MapPin className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="hidden lg:flex flex-col justify-center gap-3 w-64 flex-shrink-0"
      style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      {/* Header label */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Aktivitas Terkini
        </p>
      </div>

      {NOTIFICATIONS.slice(0, visibleCount).map((notif, i) => {
        const c = colorMap[notif.color];
        return (
          <div
            key={notif.id}
            className={`${c.bg} border ${c.border} rounded-xl px-4 py-3 backdrop-blur-sm shadow-lg`}
            style={{
              animation:
                "notifSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-slate-300">
                {getNotificationIcon(notif.iconType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 leading-tight">
                  {notif.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  {notif.desc}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className={`w-1 h-1 rounded-full ${c.dot}`} />
                  <p className="text-[9px] text-slate-500 font-medium">
                    {notif.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Placeholder cards saat belum muncul */}
      {Array.from({
        length: Math.max(0, NOTIFICATIONS.length - visibleCount),
      }).map((_, i) => (
        <div
          key={`placeholder-${i}`}
          className="border border-slate-700/30 rounded-xl px-4 py-3 opacity-20"
        >
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-slate-700 rounded w-3/4" />
              <div className="h-1.5 bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(-16px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleStartGuest = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('wc_cases');
      localStorage.setItem("wc_guest_mode", "true");
      document.cookie = "wc_guest_mode=true; path=/; max-age=31536000";
    }
  };

  useEffect(() => {
    // Always start at top on mount/refresh
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
      <IntroScreen />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-black/20"
            : "bg-slate-50/80 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40"
        } min-h-[70px]`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between min-h-[70px]">
          {/* Logo — kiri mepet */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="p-1 bg-emerald-950 rounded text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span>WitnessChain</span>
          </button>

          {/* Nav items — tengah absolute */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {[
              { label: "Cara Kerja", id: "how-it-works" },
              { label: "Fitur", id: "features" },
              { label: "Tentang", id: "why" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Buttons — kanan mepet */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            {/* ThemeToggle removed — dark-only mode */}
            <Link
              href="/login"
              onClick={() =>
                sessionStorage.setItem("wc_prev_path", window.location.pathname)
              }
            >
              <Button
                variant="ghost"
                size="sm"
                className="font-medium hidden sm:flex text-slate-300 hover:text-white"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/dashboard" onClick={handleStartGuest}>
              <Button
                variant="primary"
                size="sm"
                className="font-semibold hidden sm:flex bg-emerald-500 hover:bg-emerald-400 text-white">
                Mulai Gratis
              </Button>
            </Link>
            <button
              className="md:hidden p-2 text-white cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3">
            {[
              { label: "Cara Kerja", id: "how-it-works" },
              { label: "Fitur", id: "features" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-slate-300 p-2 font-medium cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/login"
              className="block"
              onClick={() =>
                sessionStorage.setItem("wc_prev_path", window.location.pathname)
              }
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full font-medium text-slate-300"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/dashboard" className="block" onClick={handleStartGuest}>
              <Button
                variant="primary"
                size="sm"
                className="w-full font-semibold bg-emerald-500 text-white"
              >
                Mulai Gratis
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-100 via-white to-emerald-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-32 px-4 pb-24 relative overflow-hidden transition-colors duration-500">
        {/* Mesh background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-teal-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/6 rounded-full blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 border border-emerald-700/40 backdrop-blur-sm">
              <span className="text-emerald-300 text-sm font-medium">
                ✦ Gratis · Bisa tanpa akun · Data tersimpan aman
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-4">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Ceritamu penting.
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Kami bantu dokumentasikan
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                dengan benar.
              </span>
            </h1>
          </div>

          <p className="text-center max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
            WitnessChain membantu korban penggusuran, sengketa lahan, dan
            pelanggaran hak mendokumentasikan bukti secara terstruktur — untuk
            dibawa ke LBH atau lembaga terkait.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/dashboard" onClick={handleStartGuest}>
              <Button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base rounded-full shadow-lg shadow-emerald-900/40 hover:scale-105 transition-transform">
                Mulai Dokumentasi →
              </Button>
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-base rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Pelajari Cara Kerja
            </button>
          </div>

          {/* Hero bottom: Notifications + Chat + Maskot */}
          <div className="relative w-full h-96">
            {/* Notification column — kiri */}
            <div className="hidden lg:block absolute left-0 bottom-0">
              <AnimatedNotifications />
            </div>

            {/* Chat Card — tengah */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 h-[420px] w-full max-w-sm">
              <AnimatedChatCard />
            </div>

            {/* Maskot — kanan, desktop only */}
            <div className="hidden md:block absolute bottom-[-150px] right-1/5 translate-x-2/3 flex-shrink-0 -ml-4 h-[550px]">
              {/* Maskot image */}
              <img
                src="/maskot.webp"
                alt="WitnessChain Maskot"
                className="relative z-10 select-none"
                style={{
                  width: "750px",
                  height: "auto",
                  maxHeight: "420px",
                  objectFit: "contain",
                  animation: "maskotFloat 3s ease-in-out infinite",
                }}
                draggable={false}
              />

              <style>{`
                @keyframes maskotFloat {
                  0%, 100% { transform: translateY(0px) rotate(-1deg); }
                  50%       { transform: translateY(-12px) rotate(1deg); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative border-y border-slate-800 py-16 px-4 overflow-hidden">
        {/* Rich background */}
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-transparent to-teal-950/30 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-600/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-500/6 rounded-full blur-[60px] pointer-events-none" />
        {/* Subtle horizontal lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #10b981 1px, transparent 1px)",
            backgroundSize: "100% 40px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="w-8 h-8 text-emerald-400" />,
              value: "~30 menit",
              label: "Rata-rata waktu dokumentasi lengkap",
            },
            {
              icon: <FileText className="w-8 h-8 text-emerald-400" />,
              value: "Gratis",
              label: "Tanpa biaya untuk memulai dokumentasi",
            },
            {
              icon: <Users className="w-8 h-8 text-emerald-400" />,
              value: "20+ LBH",
              label: "Referral bantuan hukum di seluruh Indonesia",
            },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-3">{s.icon}</div>
              <p className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">
                {s.value}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="relative py-24 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Tiga langkah menyusun dokumentasi
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Dari cerita menjadi ringkasan terstruktur yang lebih mudah dibaca
              LBH
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
                title: "Ceritakan Kejadian",
                desc: "Asisten AI mengajukan pertanyaan terstruktur agar kronologi, lokasi, dan pihak terlibat tercatat rapi. Ceritakan kejadian dengan bahasa Anda sendiri.",
              },
              {
                num: "02",
                icon: <Upload className="w-6 h-6 text-emerald-400" />,
                title: "Upload Bukti",
                desc: "Foto, video, dan dokumen dicatat dengan waktu unggah serta hash SHA-256 sebagai referensi integritas berkas.",
              },
              {
                num: "03",
                icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
                title: "Dapatkan Dokumen",
                desc: "Unduh ringkasan PDF berisi kronologi, daftar saksi, dan bukti — sebagai bahan awal saat konsultasi ke LBH atau lembaga terkait.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/60 rounded-2xl p-8 hover:border-emerald-500/40 hover:shadow-lg transition-all"
              >
                <p className="text-8xl font-black text-emerald-900/20 mb-2">
                  {step.num}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  {step.icon}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.05),transparent_60%)] pointer-events-none" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-sm font-medium mb-4">
                Mengapa WitnessChain?
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Dokumentasi yang dirancang untuk keperluan hukum
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                WitnessChain bukan pengganti pengacara — tapi alat yang membantu
                warga menyiapkan dokumentasi yang lebih kuat sebelum bertemu LBH
                atau Polri.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: <FileCheck2 className="w-6 h-6 text-emerald-400" />,
                    title: "Evidence Completeness Score",
                    desc: "Tahu persis kekuatan dokumenmu — apa yang sudah ada dan apa yang masih kurang",
                  },
                  {
                    icon: <Scale className="w-6 h-6 text-emerald-400" />,
                    title: "Legal Radar AI",
                    desc: "Membantu menandai pasal hukum yang mungkin relevan — bukan penilaian hukum yang mengikat",
                  },
                  {
                    icon: <Lock className="w-6 h-6 text-emerald-400" />,
                    title: "Timestamp & Hash Terkunci",
                    desc: "Setiap unggahan mendapat cap waktu dan hash sebagai catatan referensi di berkas kasus",
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-emerald-400" />,
                    title: "Referral LBH Terdekat",
                    desc: "Daftar LBH di berbagai kota beserta kontak dan spesialisasi kasus",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Animated Score Card — fixed height so no layout shift ── */}
            <div className="relative">
              <div className="relative h-[480px]">
                {/* Decorative depth layers */}
                <div className="absolute inset-0 bg-emerald-600/5 rounded-2xl border border-emerald-500/10 transform translate-y-6 translate-x-6 scale-95" />
                <div className="absolute inset-0 bg-emerald-600/3 rounded-2xl border border-emerald-500/5 transform translate-y-3 translate-x-3 scale-97" />
                {/* Animated score card fills the container */}
                <AnimatedScoreCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section id="why" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-slate-50 to-white dark:from-emerald-950 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">
            Kenapa dokumentasi itu penting?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-16">
            Banyak kasus pelanggaran hak warga tidak bisa diproses bukan karena
            tidak ada bukti — tapi karena bukti tidak terstruktur dan tidak tahu
            cara menyajikannya secara hukum.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              {
                icon: <FileCheck2 className="w-6 h-6 text-emerald-400" />,
                title: "Bukti Terstruktur",
                desc: "LBH dan pengacara membutuhkan dokumentasi yang kronologis dan lengkap untuk bisa memproses kasusmu dengan efektif.",
              },
              {
                icon: <Clock className="w-6 h-6 text-emerald-400" />,
                title: "Waktu adalah Bukti",
                desc: "Semakin lama menunggu, semakin banyak detail yang terlupakan. Dokumentasi segera setelah kejadian menghasilkan bukti yang lebih kuat.",
              },
              {
                icon: <Shield className="w-6 h-6 text-emerald-400" />,
                title: "Akses Setara",
                desc: "WitnessChain membantu warga menyusun catatan awal sebelum bertemu LBH atau pendamping hukum.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-left shadow-sm"
              >
                <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — IMPROVED CONTRAST ── */}
      <section className="py-24 px-4 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Mulai sekarang — gratis untuk digunakan
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Jangan tunda.
            <br />
            Dokumentasikan sekarang.
          </h2>
          <p className="text-lg text-emerald-50/90 mb-10">
            Semakin cepat dicatat, semakin sedikit detail yang terlewat.
          </p>

          {/* HIGH CONTRAST CTA button — dark on light */}
          <Link href="/dashboard" onClick={handleStartGuest}>
            <button className="group inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-emerald-300 font-black text-base rounded-full shadow-[0_8px_40px_rgba(2,6,23,0.6)] hover:bg-slate-800 hover:scale-105 active:scale-100 transition-all duration-200">
              Mulai Dokumentasi Gratis
              <span className="w-7 h-7 rounded-full bg-slate-800/60 flex items-center justify-center group-hover:bg-slate-700/60 transition-colors">
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </span>
            </button>
          </Link>

          <p className="mt-5 text-sm text-white/60">
            Tidak perlu daftar · Tidak ada kartu kredit · Langsung mulai
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto w-full relative z-10 bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-500">
        {/* Top gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Brand col */}
            <div className="lg:col-span-1 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-white tracking-tight">WitnessChain</span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Platform dokumentasi hak warga Indonesia. Membantu korban penggusuran,
                sengketa lahan, dan pelanggaran hak mendapatkan akses keadilan.
              </p>
              <div className="flex items-start gap-2.5 bg-amber-950/30 border border-amber-800/30 rounded-xl px-3.5 py-3">
                <span className="text-amber-400 text-sm mt-0.5 flex-shrink-0">⚠</span>
                <p className="text-[10px] text-amber-400/80 leading-relaxed">
                  Bukan pengganti konsultasi pengacara profesional. Untuk kasus serius, selalu hubungi LBH atau advokat.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {[
                  { label: "Twitter/X", href: "#", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                  { label: "Instagram", href: "https://www.instagram.com/kyroxx_a", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                  { label: "LinkedIn", href: "https://www.linkedin.com/in/devandraelsyadam", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                  { label: "GitHub", href: "https://github.com/DevanTQ/developmentweb", path: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" },
                ].map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:scale-110 transition-all duration-200 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Platform</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Mulai Dokumentasi", href: "/interview" },
                  { label: "Legal Radar AI", href: "/legal-radar" },
                  { label: "Cari LBH", href: "/referral" },
                  { label: "Bagikan Dokumen", href: "/result" },
                  { label: "Dashboard", href: "/dashboard" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:translate-x-1">
                      <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] group-hover:scale-150 transition-all duration-200 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sitemap */}
            <div className="space-y-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Sitemap</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Beranda", href: "/" },
                  { label: "Cara Kerja", id: "how-it-works" },
                  { label: "Fitur", id: "features" },
                  { label: "Tentang", id: "why" },
                  { label: "Masuk / Daftar", href: "/login" },
                ].map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link href={item.href}
                        className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:translate-x-1">
                        <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] group-hover:scale-150 transition-all duration-200 flex-shrink-0" />
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => document.getElementById(item.id!)?.scrollIntoView({ behavior: "smooth" })}
                        className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:translate-x-1">
                        <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] group-hover:scale-150 transition-all duration-200 flex-shrink-0" />
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Syarat Penggunaan", href: "/terms" },
                  { label: "Kebijakan Privasi", href: "/privacy" },
                  { label: "Disclaimer Hukum", href: "/disclaimer" },
                  { label: "Lisensi Open Source", href: "/license" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:translate-x-1">
                      <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.6)] group-hover:scale-150 transition-all duration-200 flex-shrink-0" />
                      {item.label}
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
                {[
                  { label: "Komnas HAM RI", number: "119 ext 6" },
                  { label: "YLBHI Jakarta", number: "(021) 315-7038" },
                  { label: "Polisi Darurat", number: "110" },
                  { label: "Ambulans", number: "118" },
                ].map((contact) => (
                  <li key={contact.label} className="flex items-center gap-3 group cursor-pointer">
                    <div className="p-1.5 bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 group-hover:border-red-500/50 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:scale-110">
                      <Phone className="w-3 h-3 text-red-400" />
                    </div>
                    <a href={`tel:${contact.number.replace(/\D/g, '')}`} className="block">
                      <p className="text-[10px] text-slate-500 font-semibold leading-none mb-0.5 group-hover:text-slate-400 transition-colors">{contact.label}</p>
                      <p className="text-xs font-extrabold text-white tracking-wide group-hover:text-red-400 transition-colors duration-200">{contact.number}</p>
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
                © 2026 WitnessChain · All rights reserved · Inovasi Tanpa Batas
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-700 font-medium">v1.0.0</span>
              <span className="text-slate-700">·</span>
              <span className="text-[10px] text-slate-700 font-medium">Open Source</span>
              <span className="text-slate-700">·</span>
              <span className="text-[10px] text-emerald-600/70 font-bold">MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}