'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LBHCard } from '@/components/referral/LBHCard';
import { getAllLBH, getNearbyLBH, filterLBHBySpecialization } from '@/lib/maps';
import type { LBH, ViolationType } from '@/types';
import { Shield, MapPin, Info, Check, AlertCircle, Compass, Users } from 'lucide-react';

const violationTypes: { value: ViolationType; label: string }[] = [
  { value: 'penggusuran', label: 'Penggusuran' },
  { value: 'sengketa_lahan', label: 'Sengketa Lahan' },
  { value: 'pencemaran_lingkungan', label: 'Pencemaran Lingkungan' },
  { value: 'pelanggaran_hak', label: 'Pelanggaran Hak' },
];

export default function ReferralPage() {
  const [lbhList, setLbhList] = useState<LBH[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<ViolationType | ''>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get user location on mount
  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      // schedule outside the synchronous effect body
      const t = setTimeout(() => { if (!cancelled) setLbhList(getAllLBH()); }, 0);
      return () => { cancelled = true; clearTimeout(t); };
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
        if (nearby.length === 0) {
          nearby = getAllLBH();
        }
        setLbhList(nearby);
        setLocationLoading(false);
      },
      () => {
        clearTimeout(timeoutId);
        setLbhList(getAllLBH());
        setLocationLoading(false);
      }
    );

    return () => { cancelled = true; clearTimeout(timeoutId); };
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
        filtered = filtered.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(userLocation.lat - a.lat, 2) + Math.pow(userLocation.lng - a.lng, 2)) * 111;
          const distB = Math.sqrt(Math.pow(userLocation.lat - b.lat, 2) + Math.pow(userLocation.lng - b.lng, 2)) * 111;
          return distA - distB;
        });
      }
      setLbhList(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">


      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">
            Temukan LBH Terdekat
          </h1>
          <p className="text-slate-600">
            Hubungi Lembaga Bantuan Hukum untuk konsultasi lanjutan tentang kasusmu.
          </p>
        </div>

        {/* Emergency Hotline */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex flex-col gap-3">
          <p className="text-sm text-red-900 flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Keadaan darurat atau butuh bantuan segera?
          </p>
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
              <p className="text-red-700">Komnas HAM: <strong className="text-red-900">119 ext 6</strong></p>
            </div>
            <div className="bg-white px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
              <p className="text-red-700">Panggilan Polisi: <strong className="text-red-900">110</strong></p>
            </div>
          </div>
        </div>

        {/* Map and List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-96 shadow-sm">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${userLocation?.lat || -6.2088},${userLocation?.lng || 106.8456}&zoom=11`}
                allowFullScreen
              />
            </div>
          </div>

          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                Filter Spesialisasi
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSpecializationChange('')}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    selectedSpecialization === ''
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
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
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {locationLoading && (
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Mencari lokasi Anda...
                </p>
              )}

              {userLocation && (
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Lokasi Anda aktif
                </p>
              )}
            </div>
          </div>
        </div>

        {/* LBH List */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            {lbhList.length} Lembaga Bantuan Hukum Tersedia
          </h2>

          {lbhList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-medium">Belum ada LBH dengan spesialisasi yang dipilih</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lbhList.map((lbh) => (
                <LBHCard
                  key={lbh.id}
                  lbh={lbh}
                  distance={
                    userLocation
                      ? Math.sqrt(Math.pow(userLocation.lat - lbh.lat, 2) + Math.pow(userLocation.lng - lbh.lng, 2)) * 111
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <section className="mt-16 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-emerald-900 mb-5 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            Tips Mengunjungi LBH
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-800 font-medium">
            <li className="flex gap-3 items-start bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
              <div className="p-1 bg-emerald-100 rounded-full text-emerald-700">
                <Check className="w-4 h-4" />
              </div>
              <span>Bawa berkas PDF dokumentasi resmi dari WitnessChain.</span>
            </li>
            <li className="flex gap-3 items-start bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
              <div className="p-1 bg-emerald-100 rounded-full text-emerald-700">
                <Check className="w-4 h-4" />
              </div>
              <span>Siapkan semua bukti fisik pendukung (foto asli, dokumen, percakapan).</span>
            </li>
            <li className="flex gap-3 items-start bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
              <div className="p-1 bg-emerald-100 rounded-full text-emerald-700">
                <Check className="w-4 h-4" />
              </div>
              <span>Bawa identitas resmi (KTP/KK) untuk validasi administrasi.</span>
            </li>
            <li className="flex gap-3 items-start bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
              <div className="p-1 bg-emerald-100 rounded-full text-emerald-700">
                <Check className="w-4 h-4" />
              </div>
              <span>Catat nama, nomor kontak, serta mintalah timeline penanganan kasus.</span>
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 border-t border-slate-800 mt-16">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>© 2024 WitnessChain. Melayani keadilan untuk semua.</p>
        </div>
      </footer>
    </div>
  );
}
