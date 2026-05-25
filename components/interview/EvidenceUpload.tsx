'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Evidence } from '@/types';
import { Camera, Video, FileText, X, UploadCloud } from 'lucide-react';

interface EvidenceUploadProps {
  onUpload: (evidence: Evidence) => void;
  onClose: () => void;
}

export function EvidenceUpload({ onUpload, onClose }: EvidenceUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'photo' | 'video' | 'document'>('photo');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const calculateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    let hashBuffer: ArrayBuffer;
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    } else {
      hashBuffer = buffer;
    }
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const hash = await calculateHash(file);
      
      let url = '';
      if (type === 'photo' && preview) {
        url = preview;
      } else {
        url = await toBase64(file);
      }

      const evidence: Evidence = {
        id: `evidence-${Date.now()}`,
        type,
        url,
        timestamp: new Date().toISOString(),
        hash,
        name: file.name,
        description: description || undefined,
      };

      onUpload(evidence);
      setFile(null);
      setDescription('');
      setPreview('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload bukti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 shadow-2xl animate-scaleUp">
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Unggah Bukti Fisik</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Jenis Bukti
            </label>
            <div className="flex gap-2">
              {(['photo', 'video', 'document'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`
                    flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                    ${
                      type === t
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  {t === 'photo' ? (
                    <Camera className="w-3.5 h-3.5" />
                  ) : t === 'video' ? (
                    <Video className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  {t === 'photo' ? 'Foto' : t === 'video' ? 'Video' : 'Dokumen'}
                </button>
              ))}
            </div>
          </div>

          {/* File input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pilih File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept={
                type === 'photo'
                  ? 'image/*'
                  : type === 'video'
                    ? 'video/*'
                    : '.pdf,.doc,.docx,.txt'
              }
              className="block w-full text-xs text-slate-500 border border-slate-200 rounded-xl bg-slate-50/50 p-2
                file:mr-4 file:py-1.5 file:px-3.5
                file:rounded-lg file:border-0
                file:text-xs file:font-bold
                file:bg-emerald-50 file:text-emerald-700
                hover:file:bg-emerald-100 file:transition-all"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">Preview</p>
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {file && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-600">
                <strong>File:</strong> {file.name}
              </p>
              <p className="text-xs text-slate-600">
                <strong>Ukuran:</strong> {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Keterangan (Opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan konteks bukti ini..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={loading}
              disabled={!file}
              className="flex-1"
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
