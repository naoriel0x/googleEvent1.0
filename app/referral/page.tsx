'use client';

import { useState, useEffect, useMemo } from 'react';
import { LBHCard } from '@/components/referral/LBHCard';
import { LBHMap } from '@/components/referral/LBHMap';
import {
  getAllLBH,
  getNearbyLBH,
  filterLBHBySpecialization,
  calculateDistance,
} from '@/lib/maps';
import type { LBH, ViolationType } from '@/types';
import { MapPin, Info, Check, AlertCircle, Compass, Users } from 'lucide-react';

const violationTypes: { value: ViolationType; label: string }[] = [
  { value: 'penggusuran', label: 'Penggusuran' },
  { value: 'sengketa_lahan', label: 'Sengketa Lahan' },
  { value: 'pencemaran_lingkungan', label: 'Pencemaran Lingkungan' },
  { value: 'pelanggaran_hak', label: 'Pelanggaran Hak' },
];

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };

export default function ReferralPage() {
  const [lbhList, setLbhList] = useState<LBH[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<ViolationType | ''>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      const t = setTimeout(() => {
        if (!cancelled) setLbhList(getAllLBH());
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }

    const timeoutId = setTimeout(() => setLocationLoading(true), 0);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);

        let nearby = getNearbyLBH(loc.lat, loc.lng);
        if (nearby.length === 0) nearby = getAllLBH();
        setLbhList(nearby);
        setLocationLoading(false);
      },
      () => {
        clearTimeout(timeoutId);
        setLbhList(getAllLBH());
        setLocationLoading(false);
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSpecializationChange = (spec: ViolationType | '') => {
    setSelectedSpecialization(spec);
    if (spec === '') {
      if (userLocation) {
        setLbhList(getNearbyLBH(userLocation.lat, userLocation.lng));
      } else {
        setLbhList(getAllLBH());
      }
    } else {
      let filtered = filterLBHBySpecialization(spec);
      if (userLocation) {
        filtered = filtered.sort(
          (a, b) =>
            calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
            calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
        );
      }
      setLbhList(filtered);
    }
  };

  const mapCenter = userLocation ?? DEFAULT_CENTER;

  const lbhWithDistance = useMemo(() => {
    if (!userLocation) return lbhList.map((lbh) => ({ lbh, distance: undefined as number | undefined }));
    return lbhList.map((lbh) => ({
      lbh,
      distance: calculateDistance(userLocation.lat, userLocation.lng, lbh.lat, lbh.lng),
    }));
  }, [lbhList, userLocation]);

  return (
    <div className="flex-1 flex flex-col min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8 space-y-10">
        {/* Title */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Temukan LBH Terdekat
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Hubungi Lembaga Bantuan Hukum untuk konsultasi lanjutan tentang kasusmu.
          </p>
        </div>

        {/* Emergency Hotline */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
          <p className="text-sm text-red-900 flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            Keadaan darurat atau butuh bantuan segera?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
              <p className="text-red-700">
                Komnas HAM: <strong className="text-red-900">119 ext 6</strong>
              </p>
            </div>
            <div className="bg-white px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
              <p className="text-red-700">
                Panggilan Polisi: <strong className="text-red-900">110</strong>
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
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4 h-full">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                Filter Spesialisasi
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSpecializationChange('')}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    selectedSpecialization === ''
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  Semua LBH
                </button>
                {violationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleSpecializationChange(type.value)}
                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      selectedSpecialization === type.value
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {locationLoading && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Mencari lokasi Anda...
                </p>
              )}

              {userLocation && !locationLoading && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Lokasi Anda aktif — LBH diurutkan dari yang terdekat
                </p>
              )}
            </div>
          </div>
        </div>

        {/* LBH List */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            {lbhList.length} Lembaga Bantuan Hukum Tersedia
          </h2>

          {lbhList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-medium">
                Belum ada LBH dengan spesialisasi yang dipilih
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {lbhWithDistance.map(({ lbh, distance }) => (
                <LBHCard key={lbh.id} lbh={lbh} distance={distance} />
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-5 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            Tips Mengunjungi LBH
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {[
              'Bawa berkas PDF dokumentasi resmi dari WitnessChain.',
              'Siapkan semua bukti fisik pendukung (foto asli, dokumen, percakapan).',
              'Bawa identitas resmi (KTP/KK) untuk validasi administrasi.',
              'Catat nama, nomor kontak, serta mintalah timeline penanganan kasus.',
            ].map((tip) => (
              <li
                key={tip}
                className="flex gap-3 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
              >
                <div className="p-1 bg-emerald-100 rounded-full text-emerald-700 shrink-0">
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
