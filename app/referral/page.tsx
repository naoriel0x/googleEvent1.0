"use client";

import { useState, useEffect, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { LBHCard } from "@/components/referral/LBHCard";
import { LBHMap } from "@/components/referral/LBHMap";
import type { LBH, ViolationType } from "@/types";
import { MapPin, Info, Check, AlertCircle, Compass, Users, ChevronLeft, ChevronRight } from "lucide-react";

const supabase = getSupabaseClient();

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const violationTypes: { value: ViolationType; label: string }[] = [
  { value: "penggusuran", label: "Penggusuran" },
  { value: "sengketa_lahan", label: "Sengketa Lahan" },
  { value: "pencemaran_lingkungan", label: "Pencemaran Lingkungan" },
  { value: "pelanggaran_hak", label: "Pelanggaran Hak" },
];

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };
const ITEMS_PER_PAGE = 10;

// =========================================================================
// KOMPONEN PAGINATION
// =========================================================================
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Logika untuk menampilkan nomor halaman yang relevan
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      {/* Tombol Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold
          bg-slate-800/60 border border-slate-700/60 text-slate-300
          hover:bg-slate-700 hover:border-slate-600 hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Nomor Halaman */}
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-slate-500 text-sm select-none">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`min-w-[2.25rem] h-9 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentPage === page
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                : "bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-white"
            }`}
            aria-label={`Halaman ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Tombol Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold
          bg-slate-800/60 border border-slate-700/60 text-slate-300
          hover:bg-slate-700 hover:border-slate-600 hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200"
        aria-label="Halaman berikutnya"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Info halaman */}
      <span className="w-full text-center text-xs text-slate-500 mt-1">
        Halaman {currentPage} dari {totalPages}
      </span>
    </div>
  );
}

// =========================================================================
// HALAMAN UTAMA
// =========================================================================
export default function ReferralPage() {
  const [masterLbhList, setMasterLbhList] = useState<LBH[]>([]);
  const [lbhList, setLbhList] = useState<LBH[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<ViolationType | "">("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // ✅ STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // -------------------------------------------------------------------------
  // EFFEK 1: Ambil Data dari Supabase
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function fetchLBHFromSupabase() {
      try {
        setDbLoading(true);
        const { data, error } = await supabase.from("direktori_lbh").select("*");
        if (error) throw error;
        if (data) {
          setMasterLbhList(data as LBH[]);
          setLbhList(data as LBH[]);
        }
      } catch (err) {
        console.error("Gagal memuat database LBH dari Supabase:", err);
      } finally {
        setDbLoading(false);
      }
    }
    fetchLBHFromSupabase();
  }, []);

  // -------------------------------------------------------------------------
  // EFFEK 2: GPS setelah data master selesai
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (masterLbhList.length === 0) return;
    let cancelled = false;
    if (!navigator.geolocation) return;

    const timeoutId = setTimeout(() => setLocationLoading(true), 0);
    const geoOptions: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const handleGPSSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      if (cancelled) return;
      const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
      setUserLocation(loc);
      const sortedByDistance = [...masterLbhList].sort(
        (a, b) =>
          calculateDistance(loc.lat, loc.lng, a.lat, a.lng) -
          calculateDistance(loc.lat, loc.lng, b.lat, b.lng)
      );
      setLbhList(sortedByDistance);
      setLocationLoading(false);
    };

    const handleGPSError = () => {
      clearTimeout(timeoutId);
      setLocationLoading(false);
    };

    if (navigator.permissions && (navigator.permissions as any).query) {
      try {
        (navigator.permissions as any).query({ name: "geolocation" }).then((permStatus: any) => {
          if (permStatus.state === "denied") {
            clearTimeout(timeoutId);
            setLocationLoading(false);
            return;
          }
          navigator.geolocation.getCurrentPosition(handleGPSSuccess, handleGPSError, geoOptions);
        });
      } catch {
        navigator.geolocation.getCurrentPosition(handleGPSSuccess, handleGPSError, geoOptions);
      }
    } else {
      navigator.geolocation.getCurrentPosition(handleGPSSuccess, handleGPSError, geoOptions);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [masterLbhList]);

  // -------------------------------------------------------------------------
  // FUNGSI: Filter + reset ke halaman 1 setiap kali filter berubah
  // -------------------------------------------------------------------------
  const handleSpecializationChange = (spec: ViolationType | "") => {
    setSelectedSpecialization(spec);
    setCurrentPage(1); // ✅ Reset ke halaman 1 saat filter berubah

    let filteredResults = [...masterLbhList];
    if (spec !== "") {
      filteredResults = filteredResults.filter(
        (lbh) => lbh.specialization && lbh.specialization.includes(spec)
      );
    }
    if (userLocation) {
      filteredResults = filteredResults.sort(
        (a, b) =>
          calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
          calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
      );
    }
    setLbhList(filteredResults);
  };

  const mapCenter = userLocation ?? DEFAULT_CENTER;

  // ✅ Semua data dengan jarak
  const lbhWithDistance = useMemo(() => {
    if (!userLocation) return lbhList.map((lbh) => ({ lbh, distance: undefined as number | undefined }));
    return lbhList.map((lbh) => ({
      lbh,
      distance: calculateDistance(userLocation.lat, userLocation.lng, lbh.lat, lbh.lng),
    }));
  }, [lbhList, userLocation]);

  // ✅ Hitung total halaman & slice data untuk halaman aktif
  const totalPages = Math.ceil(lbhWithDistance.length / ITEMS_PER_PAGE);
  const paginatedLbh = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return lbhWithDistance.slice(start, start + ITEMS_PER_PAGE);
  }, [lbhWithDistance, currentPage]);

  // ✅ Fungsi ganti halaman + scroll ke atas section LBH
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("lbh-list-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 transition-colors duration-500 flex-1 flex flex-col relative">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8 space-y-10 relative z-10">
        {/* Title */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            Temukan LBH Terdekat
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Hubungi Lembaga Bantuan Hukum untuk konsultasi lanjutan tentang kasusmu.
          </p>
        </div>

        {/* Emergency Hotline */}
        <div className="bg-red-950/40 border border-red-900/50 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
          <p className="text-sm text-red-200 flex items-center gap-3 font-extrabold">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            Keadaan darurat atau butuh bantuan segera?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <div className="bg-slate-900 px-4 py-3 rounded-2xl border border-red-900/50 shadow">
              <p className="text-red-200">
                Komnas HAM: <strong className="text-red-100">119 ext 6</strong>
              </p>
            </div>
            <div className="bg-slate-900 px-4 py-3 rounded-2xl border border-red-900/50 shadow">
              <p className="text-red-200">
                Panggilan Polisi: <strong className="text-red-100">110</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Map and Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LBHMap center={mapCenter} lbhList={lbhList} />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4 h-full">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                Filter Spesialisasi
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSpecializationChange("")}
                  disabled={dbLoading}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    selectedSpecialization === ""
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-300 hover:bg-slate-800 border border-transparent hover:border-slate-700"
                  } disabled:opacity-50`}
                >
                  Semua LBH
                </button>
                {violationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleSpecializationChange(type.value)}
                    disabled={dbLoading}
                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      selectedSpecialization === type.value
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-slate-300 hover:bg-slate-800 border border-transparent hover:border-slate-700"
                    } disabled:opacity-50`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {dbLoading && (
                <p className="text-xs text-blue-400 flex items-center gap-1.5 font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Menghubungkan ke database Supabase...
                </p>
              )}
              {locationLoading && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Mencari lokasi Anda...
                </p>
              )}
              {userLocation && !locationLoading && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Lokasi Anda aktif — LBH diurutkan dari yang terdekat
                </p>
              )}
            </div>
          </div>
        </div>

        {/* LBH List */}
        <section id="lbh-list-section">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            {dbLoading
              ? "Menghitung..."
              : `${lbhList.length} Lembaga Bantuan Hukum Tersedia`}
          </h2>

          {dbLoading ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <p className="text-slate-400 font-medium animate-pulse">
                Sinkronisasi data dengan server...
              </p>
            </div>
          ) : lbhList.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <p className="text-slate-400 font-medium">
                Belum ada LBH dengan spesialisasi yang dipilih
              </p>
            </div>
          ) : (
            <>
              {/* ✅ Info halaman aktif */}
              <p className="text-xs text-slate-500 mb-4">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, lbhList.length)} dari {lbhList.length} LBH
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedLbh.map(({ lbh, distance }) => (
                  <LBHCard key={lbh.id} lbh={lbh} distance={distance} />
                ))}
              </div>

              {/* ✅ Komponen Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>

        {/* Tips */}
        <section className="bg-slate-900/40 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-300 mb-5 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            Tips Mengunjungi LBH
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300 font-medium">
            {[
              "Bawa berkas PDF dokumentasi resmi dari WitnessChain.",
              "Siapkan semua bukti fisik pendukung (foto asli, dokumen, percakapan).",
              "Bawa identitas resmi (KTP/KK) untuk validasi administrasi.",
              "Catat nama, nomor kontak, serta mintalah timeline penanganan kasus.",
            ].map((tip) => (
              <li
                key={tip}
                className="flex gap-3 items-start p-4 rounded-xl bg-slate-800/50 border border-slate-700"
              >
                <div className="p-1 bg-emerald-500/15 rounded-full text-emerald-400 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}