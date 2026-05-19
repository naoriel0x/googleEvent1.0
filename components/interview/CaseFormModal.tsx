'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  Users,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Case, Witness, ViolationType } from '@/types';

interface CaseFormModalProps {
  caseData: Partial<Case>;
  onSave: (updatedData: Partial<Case>) => void;
  onClose: () => void;
  initialTab?: 'info' | 'witnesses';
}

export function CaseFormModal({ caseData, onSave, onClose, initialTab = 'info' }: CaseFormModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'witnesses'>(initialTab);
  
  // Local state for basic fields
  const [reporterName, setReporterName] = useState<string>(caseData.reporter_name || '');
  const [involvedParties, setInvolvedParties] = useState<string>(caseData.involved_parties || '');
  const [violationType, setViolationType] = useState<ViolationType | ''>(caseData.violation_type || '');
  const [incidentDate, setIncidentDate] = useState<string>(caseData.incident_date || '');
  const [incidentLocation, setIncidentLocation] = useState<string>(caseData.incident_location || '');
  const [description, setDescription] = useState<string>(caseData.description || '');

  // Local state for witnesses — initialised once from props (no useEffect needed)
  const [witnesses, setWitnesses] = useState<Witness[]>(() =>
    Array.isArray(caseData.witnesses) ? [...caseData.witnesses] : []
  );

  const handleAddWitness = () => {
    setWitnesses([
      ...witnesses,
      { name: '', relationship: '', contact: '' }
    ]);
  };

  const handleRemoveWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const handleWitnessChange = (index: number, field: keyof Witness, value: string) => {
    const updated = [...witnesses];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setWitnesses(updated);
  };

  const handleSave = () => {
    // Filter out invalid/empty witnesses
    const cleanWitnesses = witnesses.filter(w => w.name && w.name.trim() !== '');

    const updatedData: Partial<Case> = {
      ...caseData,
      reporter_name: reporterName || undefined,
      involved_parties: involvedParties || undefined,
      violation_type: violationType || undefined,
      incident_date: incidentDate || undefined,
      incident_location: incidentLocation || undefined,
      description: description,
      witnesses: cleanWitnesses,
    };

    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 shadow-2xl animate-scaleUp">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500 rounded-lg text-slate-900">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Lengkapi Data Kasus</h2>
              <p className="text-xs text-slate-300">Isi formulir untuk melengkapi berkas secara instan</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Detail & Deskripsi Kasus
          </button>
          <button
            onClick={() => setActiveTab('witnesses')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === 'witnesses'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Saksi Kejadian ({witnesses.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Reporter Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nama Lengkap Pelapor / Korban
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Contoh: Josef Siahaan"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Violation Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  Jenis Kasus / Pelanggaran
                </label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value as ViolationType)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Pilih Jenis Pelanggaran --</option>
                  <option value="penggusuran">Penggusuran Lahan</option>
                  <option value="sengketa_lahan">Sengketa Lahan / Tanah</option>
                  <option value="pencemaran_lingkungan">Pencemaran Lingkungan</option>
                  <option value="pelanggaran_hak">Pelanggaran Hak Asasi Manusia</option>
                  <option value="lainnya">Lainnya / Belum Diketahui</option>
                </select>
              </div>

              {/* Date and Location (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal Kejadian
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {/* Location */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Lokasi Kejadian
                  </label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    placeholder="Contoh: Jl. Diponegoro No. 12, Surabaya"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Pihak Terlibat */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Pihak yang Terlibat / Pelaku / Instansi
                </label>
                <input
                  type="text"
                  value={involvedParties}
                  onChange={(e) => setInvolvedParties(e.target.value)}
                  placeholder="Contoh: PT. Developer Jaya, Oknum Satpol PP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Kronologi / Deskripsi Kejadian
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan secara rinci urutan kronologi kejadian..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-y"
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Daftar Saksi Kejadian</span>
                <button
                  type="button"
                  onClick={handleAddWitness}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Saksi
                </button>
              </div>

              {witnesses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">Belum ada saksi yang dicatat</p>
                  <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk menambahkan saksi kejadian</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {witnesses.map((witness, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-slate-100 rounded-xl bg-slate-50 relative group transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveWitness(index)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus saksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                        {/* Name */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Nama Saksi
                          </label>
                          <input
                            type="text"
                            value={witness.name}
                            onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                            placeholder="Nama Lengkap"
                            required
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        {/* Relationship */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Hubungan/Status
                          </label>
                          <input
                            type="text"
                            value={witness.relationship}
                            onChange={(e) => handleWitnessChange(index, 'relationship', e.target.value)}
                            placeholder="Contoh: Tetangga, Rekan Kerja"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        {/* Contact */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Kontak (No HP/WA)
                          </label>
                          <input
                            type="text"
                            value={witness.contact || ''}
                            onChange={(e) => handleWitnessChange(index, 'contact', e.target.value)}
                            placeholder="Contoh: 0812345..."
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex-1 gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
