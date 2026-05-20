"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
  UserCircle,
} from "lucide-react";

// ─── User Avatar — shows platform photo or fallback initials ──────────────────
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
          className="w-7 h-7 rounded-full object-cover border border-emerald-500/30 flex-shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-black text-emerald-400">
            {initials}
          </span>
        </div>
      )}
      <span className="hidden sm:block text-xs font-semibold text-slate-300 max-w-[120px] truncate">
        {displayName}
      </span>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function DashboardNavbar({
  user,
  isGuest,
  onLogout,
}: {
  user: import("@supabase/supabase-js").User | null;
  isGuest: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/50 border-b border-slate-800/60 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left — Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base font-black text-white tracking-tight">
            WitnessChain
          </span>
          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold hidden sm:inline">
            DASHBOARD
          </span>
        </Link>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Auth-aware section */}
          {user ? (
            // ── Logged in ──
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-full">
                <UserAvatar user={user} />
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-red-500/10 border border-slate-700/60 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-full text-xs font-semibold transition-all duration-200"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            // ── Guest / not logged in ──
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={() =>
                  sessionStorage.setItem(
                    "wc_prev_path",
                    window.location.pathname,
                  )
                }
              >
                <button className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-700/60 rounded-full transition-all duration-200">
                  Masuk
                </button>
              </Link>
              <Link href="/login?tab=register">
                <button className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full transition-all duration-200 shadow-sm shadow-emerald-900/40">
                  Daftar
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
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
    const checkUser = async () => {
      try {
        const guestMode = localStorage.getItem("wc_guest_mode") === "true";
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (!session && !guestMode) {
          router.push("/login?redirect=/dashboard");
        } else if (session) {
          setUser(session.user);
          setIsGuest(false);
          loadUserCases(session.access_token);
        } else if (guestMode) {
          setIsGuest(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login?redirect=/dashboard");
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      } else if (session) {
        setUser(session.user);
        setIsGuest(false);
        localStorage.removeItem("wc_guest_mode");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loadUserCases]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("wc_guest_mode");
    router.push("/login");
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative pb-20">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Navbar ── */}
      <DashboardNavbar user={user} isGuest={isGuest} onLogout={handleLogout} />

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-emerald-400" />
              {user
                ? `Selamat Datang, ${user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name?.split(" ")[0] || "Kembali"}`
                : "Selamat Datang"}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {user
                ? "Pantau laporan pelanggaran, draf kelengkapan berkas, dan unduh salinan berkas resmi Anda."
                : "Anda menggunakan mode tamu. Daftar akun untuk menyimpan kasus secara permanen."}
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

        {/* Case List Controls */}
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === key
                      ? `bg-slate-800 ${activeColor}`
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Cases grid */}
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
    </div>
  );
}
