'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ChatBubble } from '@/components/interview/ChatBubble';
import { TypingIndicator } from '@/components/interview/TypingIndicator';
import { ProgressTracker } from '@/components/interview/ProgressTracker';
import { EvidenceUpload } from '@/components/interview/EvidenceUpload';
import { CaseFormModal } from '@/components/interview/CaseFormModal';
import type { Case, Message, Evidence } from '@/types';
import { supabaseClient } from '@/lib/supabase';
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
} from 'lucide-react';

export default function InterviewPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);

  const [caseData, setCaseData] = useState<Partial<Case>>({
    status: 'draft',
    description: '',
    witnesses: [],
    evidence: [],
    messages: [],
    completeness_score: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThinkingStatus, setAiThinkingStatus] = useState('Asisten sedang memikirkan respons...');
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [initialFormTab, setInitialFormTab] = useState<'info' | 'witnesses'>('info');
  const [hasStarted, setHasStarted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize user session on mount
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initialize sessionId on mount — use ref to avoid setState-in-effect lint error
  useEffect(() => {
    const t = setTimeout(() => {
      const id = sessionStorage.getItem('sessionId') || `session-${Date.now()}`;
      sessionStorage.setItem('sessionId', id);
      setSessionId(id);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
  };

  // Load case from API on mount
  useEffect(() => {
    if (!sessionId) return;
    const loadCase = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`/api/cases?session_id=${sessionId}`, {
          headers: authHeaders
        });
        const data = await response.json();
        if (data && data.id) {
          setCaseData(data);
          setMessages(data.messages || []);
          if ((data.messages || []).length > 0) {
            setHasStarted(true);
          }
        } else {
          setCaseData((prev) => ({ ...prev, session_id: sessionId }));
        }
      } catch (error) {
        console.error('Load case error:', error);
      }
    };

    loadCase();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setAiThinkingStatus('Asisten sedang mempersiapkan sesi wawancara...');
    setAiThinking(true);
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Halo, saya ingin memulai dokumentasi kasus saya', timestamp: new Date().toISOString() }],
          caseData,
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        role: 'ai',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const userMessage: Message = {
        role: 'user',
        content: 'Halo, saya ingin memulai dokumentasi kasus saya',
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

      // Save to database
      const authHeaders = await getAuthHeaders();
      await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error('Start interview error:', error);
      setToast({ message: 'Gagal memulai interview. Silahkan coba lagi.', type: 'error' });
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || aiThinking) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);
    setAiThinkingStatus('Asisten sedang mencerna pesan Anda...');
    setAiThinking(true);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          caseData,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: 'ai',
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

      // Save to database
      const authHeaders = await getAuthHeaders();
      const dbResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ 
          ...updated, 
          session_id: updated.session_id || sessionId || sessionStorage.getItem('sessionId') || undefined,
          document_url: null 
        }),
      });
      const dbData = await dbResponse.json();
      
      if (dbData && dbData.id) {
        setCaseData(dbData);
      } else {
        setCaseData(updated);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setToast({ message: 'Gagal mengirim pesan. Silahkan coba lagi.', type: 'error' });
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
      // 1. Save to database
      const authHeaders = await getAuthHeaders();
      await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updated),
      });

      // Show toast
      setToast({ 
        message: `Bukti "${evidence.type === 'photo' ? 'Foto' : evidence.type === 'video' ? 'Video' : 'Dokumen'}" berhasil diunggah!`, 
        type: 'success' 
      });

      // 2. Automatically notify the AI so it reacts to the upload
      const userMessage: Message = {
        role: 'user',
        content: `Saya baru saja mengunggah bukti baru: ${evidence.type === 'photo' ? 'Foto' : evidence.type === 'video' ? 'Video' : 'Dokumen'} (${evidence.description || 'Tanpa keterangan'}).`,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setLoading(true);
      setAiThinkingStatus('Asisten sedang memverifikasi berkas bukti...');
      setAiThinking(true);

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          caseData: updated,
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        role: 'ai',
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

      const dbResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ 
          ...finalCase, 
          session_id: finalCase.session_id || sessionId || sessionStorage.getItem('sessionId') || undefined,
          document_url: null 
        }),
      });
      const dbData = await dbResponse.json();

      if (dbData && dbData.id) {
        setCaseData(dbData);
      } else {
        setCaseData(finalCase);
      }

    } catch (error) {
      console.error('Evidence upload callback error:', error);
      setToast({ message: 'Gagal memproses unggahan bukti.', type: 'error' });
    } finally {
      setLoading(false);
      setAiThinking(false);
      setShowEvidenceUpload(false);
    }
  };

  const handleSaveCaseForm = async (updatedData: Partial<Case>) => {
    setLoading(true);
    setAiThinkingStatus('Asisten sedang memperbarui draf kasus Anda...');
    setAiThinking(true);
    setShowCaseForm(false);
    
    try {
      setCaseData({ ...updatedData, document_url: undefined });

      // Create system/user trigger message
      const userMessage: Message = {
        role: 'user',
        content: `Saya baru saja memperbarui informasi kasus melalui formulir interaktif (Nama Pelapor: ${updatedData.reporter_name || '-'}, Pihak Terlibat/Pelaku: ${updatedData.involved_parties || '-'}, Jenis Pelanggaran: ${updatedData.violation_type || '-'}, Tanggal: ${updatedData.incident_date || '-'}, Lokasi: ${updatedData.incident_location || '-'}, Deskripsi/Kronologi: ${updatedData.description ? 'Ada' : 'Belum'}, Jumlah Saksi: ${updatedData.witnesses?.length || 0} orang).`,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // 1. Save state and message to cases DB
      const authHeaders = await getAuthHeaders();
      const dbResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ 
          ...updatedData, 
          session_id: updatedData.session_id || sessionId || sessionStorage.getItem('sessionId') || undefined,
          document_url: null, 
          messages: updatedMessages 
        }),
      });
      const dbData = await dbResponse.json();

      // 2. Fetch AI feedback
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          caseData: { ...updatedData, id: dbData.id, document_url: undefined },
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        role: 'ai',
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

      // Save final state back to DB
      await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          ...finalCase,
          session_id: finalCase.session_id || sessionId || sessionStorage.getItem('sessionId') || undefined,
        }),
      });

      setToast({ message: 'Data kasus berhasil diperbarui!', type: 'success' });
    } catch (error) {
      console.error('Save case form error:', error);
      setToast({ message: 'Gagal memperbarui formulir.', type: 'error' });
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all duration-300 transform translate-y-0 animate-slideIn ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <CheckCircle className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}


      {/* Premium Auth Banner */}
      <div className="bg-linear-to-r from-slate-950 via-emerald-950 to-slate-950 text-white py-3 px-6 shadow-lg border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-medium">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Anda masuk sebagai: <strong className="text-emerald-300 font-semibold">{user.email}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>Simpan laporan secara permanen ke akun Anda untuk diunduh kembali nanti.</span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-emerald-300 hover:text-emerald-100 font-bold transition-all underline decoration-emerald-500/50 underline-offset-4 flex items-center gap-1">
                  Dashboard Kasus <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => supabaseClient.auth.signOut()}
                  className="text-slate-400 hover:text-white transition-all text-xs border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded-md"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded-xl shadow-sm transition-all duration-200">
                  Masuk / Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-linear-to-b from-slate-50/50 to-emerald-50/10">
          <div className="text-center max-w-md w-full p-8 bg-white border border-slate-200/80 rounded-3xl shadow-xl animate-scaleUp">
            <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Shield className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Selamat datang di WitnessChain
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
              Kami siap membantu Anda mendokumentasikan fakta kasus dengan struktur hukum yang jelas, kredibel, dan profesional secara aman.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={startInterview}
              loading={loading}
              className="w-full font-bold gap-2 shadow-md hover:shadow-lg transition-all py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              Mulai Wawancara <ArrowRight className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto w-full">
          {/* Chat Area - Main */}
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-linear-to-b from-white to-slate-50 scrollbar-thin">
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

            {/* Quick Actions & Input Area */}
            <div className="border-t border-slate-200 p-4 bg-slate-50/80 backdrop-blur-sm">
              
              {/* Quick Actions Container */}
              <div className="flex flex-wrap gap-2.5 mb-3.5">
                <button
                  type="button"
                  onClick={() => { setInitialFormTab('info'); setShowCaseForm(true); }}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Isi Formulir Kasus
                </button>
                <button
                  type="button"
                  onClick={() => { setInitialFormTab('witnesses'); setShowCaseForm(true); }}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Tambah Saksi
                </button>
                <button
                  type="button"
                  onClick={() => setShowEvidenceUpload(true)}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200"
                >
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  Unggah Bukti Fisik
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={sendMessage} className="flex gap-2.5">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik jawaban Anda di sini atau gunakan formulir cepat di atas..."
                  disabled={loading || aiThinking}
                  className="flex-1 px-4.5 py-3 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 placeholder-slate-400 transition-all shadow-inner"
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
          <div className="lg:col-span-1 h-fit sticky top-24 space-y-4">
            <ProgressTracker
              score={caseData.completeness_score || 0}
              hasReporterName={!!caseData.reporter_name}
              hasViolationType={!!caseData.violation_type}
              hasIncidentDate={!!caseData.incident_date}
              hasIncidentLocation={!!caseData.incident_location}
              hasDescription={!!(caseData.description && caseData.description.length > 20)}
              hasWitnesses={(caseData.witnesses?.length || 0) > 0}
              hasEvidence={(caseData.evidence?.length || 0) > 0}
              isThinking={aiThinking}
            />

            {/* Completeness / Document Generation Banner */}
            {caseData.completeness_score! >= 70 && (
              <div className="p-5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-sm transition-all duration-300 transform translate-y-0 scale-100 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-950 mb-3.5">
                  <CheckCircle className="w-5.5 h-5.5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-bold">Dokumen Siap Dibuat!</span>
                </div>
                <Link href={caseData.id ? `/result/${caseData.id}` : '#'} className="block">
                  <Button 
                    variant="primary" 
                    disabled={!caseData.id}
                    className="w-full font-bold shadow-md hover:shadow-lg gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white border-0 disabled:opacity-50"
                  >
                    {caseData.id ? 'Cek Detail Kasus' : 'Menyimpan Dokumen...'} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Redesigned Premium Uploaded Evidence List */}
            {caseData.evidence && caseData.evidence.length > 0 && (
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <p className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <Paperclip className="w-4.5 h-4.5 text-emerald-600" />
                    Bukti Terunggah ({caseData.evidence.length})
                  </p>
                </div>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {caseData.evidence.map((evidence) => (
                    <div 
                      key={evidence.id} 
                      className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all duration-200"
                    >
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                        {evidence.type === 'photo' ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : evidence.type === 'video' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {evidence.name || `${evidence.type === 'photo' ? 'Foto' : evidence.type === 'video' ? 'Video' : 'Dokumen'} Kasus`}
                        </p>
                        {evidence.description && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium italic">
                            &ldquo;{evidence.description}&rdquo;
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">
                          {new Date(evidence.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
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
