"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/interview/ChatBubble";
import { TypingIndicator } from "@/components/interview/TypingIndicator";
import { ProgressTracker } from "@/components/interview/ProgressTracker";
import { EvidenceUpload } from "@/components/interview/EvidenceUpload";
import { CaseFormModal } from "@/components/interview/CaseFormModal";
import type { Case, Message, Evidence } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Shield,
  FileText,
  Users,
  Paperclip,
  CheckCircle,
  Image as ImageIcon,
  Video,
  Sparkles,
  Send,
  ArrowRight,
} from "lucide-react";

export default function InterviewPage() {
  const supabaseClient = getSupabaseClient();
  const [sessionId, setSessionId] = useState<string>("");
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(
    null,
  );

  const [caseData, setCaseData] = useState<Partial<Case>>({
    status: "draft",
    description: "",
    witnesses: [],
    evidence: [],
    messages: [],
    completeness_score: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThinkingStatus, setAiThinkingStatus] = useState(
    "Asisten sedang memikirkan respons...",
  );
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [initialFormTab, setInitialFormTab] = useState<"info" | "witnesses">(
    "info",
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const shouldAutoScrollRef = useRef<boolean>(true);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    // Mengecek apakah user berada di dekat paling bawah (toleransi 100px)
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;

    // Simpan statusnya ke dalam ref
    shouldAutoScrollRef.current = isAtBottom;
  };

  // Initialize user session on mount
  useEffect(() => {
    supabaseClient.auth
      .getSession()
      .then(
        ({
          data: { session },
        }: {
          data: { session: import("@supabase/supabase-js").Session | null };
        }) => {
          setUser(session?.user ?? null);
        },
      );
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      (
        _event: import("@supabase/supabase-js").AuthChangeEvent,
        session: import("@supabase/supabase-js").Session | null,
      ) => {
        setUser(session?.user ?? null);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  // Initialize sessionId on mount
  // ✅ FIX Bug #2: Cek apakah session lama sudah completed — kalau iya, buat session baru
  useEffect(() => {
    const t = setTimeout(() => {
      const existingId = sessionStorage.getItem("sessionId");
      const sessionCompleted = sessionStorage.getItem("sessionCompleted");

      // Kalau session sebelumnya sudah dikunci/completed, buat session baru
      if (existingId && sessionCompleted === "true") {
        sessionStorage.removeItem("sessionId");
        sessionStorage.removeItem("sessionCompleted");
      }

      const id = sessionStorage.getItem("sessionId") || `session-${Date.now()}`;
      sessionStorage.setItem("sessionId", id);
      setSessionId(id);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    return session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};
  };

  // Load case from API on mount
  useEffect(() => {
    if (!sessionId) return;
    const loadCase = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`/api/cases?session_id=${sessionId}`, {
          headers: authHeaders,
        });
        const data = await response.json();
        if (data && data.id) {
          // ✅ FIX Bug #2: Kalau kasus yang ke-load sudah completed, jangan tampilkan
          // chat lama — reset ke state awal dan buat session baru
          if (data.status === "completed") {
            const newId = `session-${Date.now()}`;
            sessionStorage.setItem("sessionId", newId);
            sessionStorage.removeItem("sessionCompleted");
            setSessionId(newId);
            setCaseData({
              status: "draft",
              description: "",
              witnesses: [],
              evidence: [],
              messages: [],
              completeness_score: 0,
            });
            setMessages([]);
            setHasStarted(false);
            return;
          }

          setCaseData(data);
          setMessages(data.messages || []);
          if ((data.messages || []).length > 0) {
            setHasStarted(true);
          }
        } else {
          setCaseData((prev) => ({ ...prev, session_id: sessionId }));
        }
      } catch (error) {
        console.error("Load case error:", error);
      }
    };

    loadCase();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    // Hanya jalankan scroll JIKA shouldAutoScrollRef mengizinkan
    if (chatContainerRef.current && shouldAutoScrollRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, aiThinking]);

  // Clear toast alert automatically after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const startInterview = async () => {
    setLoading(true);
    setAiThinkingStatus("Asisten sedang mempersiapkan sesi wawancara...");
    setAiThinking(true);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Halo, saya ingin memulai dokumentasi kasus saya",
              timestamp: new Date().toISOString(),
            },
          ],
          caseData,
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        role: "ai",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const userMessage: Message = {
        role: "user",
        content: "Halo, saya ingin memulai dokumentasi kasus saya",
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);

      const updated: Partial<Case> = {
        ...caseData,
        ...data.extractedData,
        messages: updatedMessages,
        completeness_score: data.score,
      };

      setCaseData(updated);
      setHasStarted(true);

      const authHeaders = await getAuthHeaders();
      await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error("Start interview error:", error);
      setToast({
        message: "Gagal memulai interview. Silahkan coba lagi.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || aiThinking) return;

    shouldAutoScrollRef.current = true;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);
    setAiThinkingStatus("Asisten sedang mencerna pesan Anda...");
    setAiThinking(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          caseData,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: "ai",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      const updated: Partial<Case> = {
        ...caseData,
        ...data.extractedData,
        messages: finalMessages,
        completeness_score: data.score,
        document_url: undefined,
      };

      const authHeaders = await getAuthHeaders();
      const dbResponse = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          ...updated,
          session_id:
            updated.session_id ||
            sessionId ||
            sessionStorage.getItem("sessionId") ||
            undefined,
          document_url: null,
        }),
      });
      const dbData = await dbResponse.json();

      if (dbData && dbData.id) {
        setCaseData(dbData);
      } else {
        setCaseData(updated);
      }
    } catch (error) {
      console.error("Send message error:", error);
      setToast({
        message: "Gagal mengirim pesan. Silahkan coba lagi.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  const handleEvidenceUpload = async (evidence: Evidence) => {
    setShowEvidenceUpload(false);
    const updatedEvidence = [...(caseData.evidence || []), evidence];
    const updated: Partial<Case> = {
      ...caseData,
      evidence: updatedEvidence,
    };
    setCaseData(updated);

    try {
      const authHeaders = await getAuthHeaders();
      await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(updated),
      });

      setToast({
        message: `Bukti "${evidence.type === "photo" ? "Foto" : evidence.type === "video" ? "Video" : "Dokumen"}" berhasil diunggah!`,
        type: "success",
      });

      const userMessage: Message = {
        role: "user",
        content: `Saya baru saja mengunggah bukti baru: ${evidence.type === "photo" ? "Foto" : evidence.type === "video" ? "Video" : "Dokumen"} (${evidence.description || "Tanpa keterangan"}).`,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setLoading(true);
      setAiThinkingStatus("Asisten sedang memverifikasi berkas bukti...");
      setAiThinking(true);

      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          caseData: updated,
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        role: "ai",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      const finalCase: Partial<Case> = {
        ...updated,
        ...data.extractedData,
        messages: finalMessages,
        completeness_score: data.score,
        document_url: undefined,
      };

      const dbResponse = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          ...finalCase,
          session_id:
            finalCase.session_id ||
            sessionId ||
            sessionStorage.getItem("sessionId") ||
            undefined,
          document_url: null,
        }),
      });
      const dbData = await dbResponse.json();

      if (dbData && dbData.id) {
        setCaseData(dbData);
      } else {
        setCaseData(finalCase);
      }
    } catch (error) {
      console.error("Evidence upload callback error:", error);
      setToast({ message: "Gagal memproses unggahan bukti.", type: "error" });
    } finally {
      setLoading(false);
      setAiThinking(false);
      setShowEvidenceUpload(false);
    }
  };

  const handleSaveCaseForm = async (updatedData: Partial<Case>) => {
    setLoading(true);
    setAiThinkingStatus("Asisten sedang memperbarui draf kasus Anda...");
    setAiThinking(true);
    setShowCaseForm(false);

    try {
      setCaseData({ ...updatedData, document_url: undefined });

      const userMessage: Message = {
        role: "user",
        content: `Saya baru saja memperbarui informasi kasus melalui formulir interaktif (Nama Pelapor: ${updatedData.reporter_name || "-"}, Pihak Terlibat/Pelaku: ${updatedData.involved_parties || "-"}, Jenis Pelanggaran: ${updatedData.violation_type || "-"}, Tanggal: ${updatedData.incident_date || "-"}, Lokasi: ${updatedData.incident_location || "-"}, Deskripsi/Kronologi: ${updatedData.description ? "Ada" : "Belum"}, Jumlah Saksi: ${updatedData.witnesses?.length || 0} orang).`,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const authHeaders = await getAuthHeaders();
      const dbResponse = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          ...updatedData,
          session_id:
            updatedData.session_id ||
            sessionId ||
            sessionStorage.getItem("sessionId") ||
            undefined,
          document_url: null,
          messages: updatedMessages,
        }),
      });
      const dbData = await dbResponse.json();

      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          caseData: { ...updatedData, id: dbData.id, document_url: undefined },
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        role: "ai",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      const finalCase: Partial<Case> = {
        ...updatedData,
        ...data.extractedData,
        id: dbData.id,
        messages: finalMessages,
        completeness_score: data.score,
      };

      setCaseData(finalCase);

      await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          ...finalCase,
          session_id:
            finalCase.session_id ||
            sessionId ||
            sessionStorage.getItem("sessionId") ||
            undefined,
        }),
      });

      setToast({ message: "Data kasus berhasil diperbarui!", type: "success" });
    } catch (error) {
      console.error("Save case form error:", error);
      setToast({ message: "Gagal memperbarui formulir.", type: "error" });
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  // ✅ FIX Bug #2: Dipanggil dari tombol "Cek Detail Kasus" — mark session sebagai completed
  // sehingga saat user balik ke /interview, chat lama tidak muncul lagi
  const handleFinishCase = () => {
    sessionStorage.setItem("sessionCompleted", "true");
  };

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 transition-colors duration-500 flex-1 flex flex-col relative font-sans">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <div
            className={`p-1 rounded-full ${toast.type === "success" ? "bg-emerald-100" : "bg-red-100"}`}
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Auth banner */}
      <div className="relative z-10 bg-gradient-to-r from-slate-950 via-emerald-950/80 to-slate-950 text-slate-100 py-3 px-4 sm:px-6 border-b border-emerald-900/40 shadow-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>
                Masuk sebagai{" "}
                <strong className="text-emerald-700 dark:text-emerald-300 font-semibold">
                  {user.email}
                </strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Simpan laporan ke akun agar bisa diakses lagi dari dashboard.
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-emerald-300 hover:text-emerald-100 font-bold flex items-center gap-1 transition-colors"
                >
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => supabaseClient.auth.signOut()}
                  className="text-slate-400 hover:text-white text-xs border border-slate-600 hover:border-slate-500 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() =>
                  sessionStorage.setItem(
                    "wc_prev_path",
                    window.location.pathname,
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded-xl shadow-sm transition-colors text-xs sm:text-sm"
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </div>

      {!hasStarted ? (
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="text-center max-w-lg w-full p-8 sm:p-10 bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-xl">
            <div className="mx-auto w-16 h-16 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-3 tracking-tight">
              Dokumentasi Kasus
            </h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Asisten AI akan menuntun Anda mencatat kronologi, saksi, dan bukti
              secara terstruktur.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={startInterview}
              loading={loading}
              className="w-full font-bold gap-2 py-3.5 rounded-xl"
            >
              Mulai Wawancara <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col min-h-[min(640px,calc(100dvh-11rem))] lg:h-[calc(100dvh-11rem)] bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-800/40 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">
                  Sesi Wawancara
                </p>
                <p className="text-[10px] text-slate-400">
                  Jawab pertanyaan atau gunakan tombol aksi cepat di bawah
                </p>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/30"
            >
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              {aiThinking && <TypingIndicator status={aiThinkingStatus} />}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-800/80 p-4 bg-slate-900/80 backdrop-blur-sm">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
                Aksi Cepat
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  {
                    icon: FileText,
                    label: "Isi Formulir Kasus",
                    onClick: () => {
                      setInitialFormTab("info");
                      setShowCaseForm(true);
                    },
                  },
                  {
                    icon: Users,
                    label: "Tambah Saksi",
                    onClick: () => {
                      setInitialFormTab("witnesses");
                      setShowCaseForm(true);
                    },
                  },
                  {
                    icon: Paperclip,
                    label: "Unggah Bukti Fisik",
                    onClick: () => setShowEvidenceUpload(true),
                  },
                ].map(({ icon: Icon, label, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className="px-3 py-2 bg-slate-800 hover:bg-emerald-950/40 border border-slate-600 hover:border-emerald-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik jawaban Anda..."
                  disabled={loading || aiThinking}
                  className="flex-1 px-4 py-3 border border-slate-600 bg-slate-800 text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 placeholder:text-slate-500 transition-all"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || aiThinking || !inputValue.trim()}
                  loading={loading}
                  className="px-5 rounded-xl gap-2 font-bold shadow-md"
                >
                  Kirim <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Progress Tracker & Evidence List - Sidebar */}
          <div className="lg:col-span-1 h-fit sticky top-24 space-y-4 relative z-10">
            <ProgressTracker
              score={caseData.completeness_score || 0}
              hasReporterName={!!caseData.reporter_name}
              hasViolationType={!!caseData.violation_type}
              hasIncidentDate={!!caseData.incident_date}
              hasIncidentLocation={!!caseData.incident_location}
              hasDescription={
                !!(caseData.description && caseData.description.length > 20)
              }
              hasWitnesses={(caseData.witnesses?.length || 0) > 0}
              hasEvidence={(caseData.evidence?.length || 0) > 0}
              isThinking={aiThinking}
            />

            {/* Completeness / Document Generation Banner */}
            {caseData.completeness_score! >= 70 && (
              <div className="p-5 bg-gradient-to-br from-emerald-950/50 to-teal-950/30 border border-emerald-800/50 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 text-emerald-200 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold">Dokumen siap dibuat</span>
                </div>
                {/* ✅ FIX Bug #2: onClick mark session sebagai completed sebelum pindah halaman */}
                <Link
                  href={caseData.id ? `/result/${caseData.id}` : "#"}
                  onClick={caseData.id ? handleFinishCase : undefined}
                >
                  <Button
                    variant="primary"
                    disabled={!caseData.id}
                    className="w-full font-bold shadow-md hover:shadow-lg gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white border-0 disabled:opacity-50"
                  >
                    {caseData.id ? "Cek Detail Kasus" : "Menyimpan Dokumen..."}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Evidence List */}
            {caseData.evidence && caseData.evidence.length > 0 && (
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-sm space-y-3">
                <p className="text-sm font-extrabold text-slate-100 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <Paperclip className="w-4 h-4 text-emerald-400" />
                  Bukti Terunggah ({caseData.evidence.length})
                </p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {caseData.evidence.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-700/50 transition-colors"
                    >
                      <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400 shrink-0">
                        {evidence.type === "photo" ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : evidence.type === "video" ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-100 truncate">
                          {evidence.name ||
                            `${evidence.type === "photo" ? "Foto" : evidence.type === "video" ? "Video" : "Dokumen"} Kasus`}
                        </p>
                        {evidence.description && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 italic">
                            &ldquo;{evidence.description}&rdquo;
                          </p>
                        )}
                        <p className="text-[9px] text-slate-500 font-semibold mt-1">
                          {new Date(evidence.timestamp).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Form Modal */}
      {showCaseForm && (
        <CaseFormModal
          caseData={caseData}
          onSave={handleSaveCaseForm}
          onClose={() => setShowCaseForm(false)}
          initialTab={initialFormTab}
        />
      )}

      {/* Evidence Upload Modal */}
      {showEvidenceUpload && (
        <EvidenceUpload
          onUpload={handleEvidenceUpload}
          onClose={() => setShowEvidenceUpload(false)}
        />
      )}
    </div>
  );
}
