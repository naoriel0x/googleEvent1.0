'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Eye, Download, Share2, Trash2, Plus, Filter, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Document {
  id: string
  violation_type: string
  location?: string
  date_created: string
  status: 'draft' | 'completed'
  score?: number
  document_url?: string
}

export default function MyDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'completed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const storedCases = localStorage.getItem('wc_cases')
    if (storedCases) {
      try {
        const cases = JSON.parse(storedCases) as Document[]
        setDocuments(cases)
        filterDocuments(cases, filter)
      } catch (error) {
        console.error('Error loading documents:', error)
      }
    }
    setLoading(false)
  }, [filter])

  const filterDocuments = (docs: Document[], filterType: typeof filter) => {
    if (filterType === 'all') {
      setFilteredDocuments(docs)
    } else {
      setFilteredDocuments(docs.filter(d => d.status === filterType))
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      const updated = documents.filter(d => d.id !== id)
      setDocuments(updated)
      localStorage.setItem('wc_cases', JSON.stringify(updated))
      filterDocuments(updated, filter)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
              Dokumen Saya
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Semua dokumentasi yang pernah kamu buat
            </p>
          </div>
          <Link href="/interview">
            <Button className="bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-md">
              <Plus className="w-5 h-5" />
              Buat Dokumentasi Baru
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
          {(['all', 'draft', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                filterDocuments(documents, f)
              }}
              className={`px-4 py-2 font-bold text-sm rounded-md transition-all ${
                filter === f
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'draft' ? 'Draft' : 'Selesai'} ({documents.filter(d => f === 'all' || d.status === f).length})
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-600 rounded-full" />
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {filter === 'all' ? 'Belum ada dokumentasi' : `Tidak ada dokumen ${filter === 'draft' ? 'draft' : 'selesai'}`}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
              {filter === 'all'
                ? 'Mulai dokumentasi pertama Anda sekarang untuk melindungi hak Anda'
                : `Tidak ada dokumen dengan status ${filter === 'draft' ? 'draft' : 'selesai'} saat ini`}
            </p>
            {filter === 'all' && (
              <Link href="/interview">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Mulai Dokumentasi Pertama
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-emerald-900/20 transition-all group"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-slate-50 dark:to-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                        {doc.violation_type?.replace(/_/g, ' ').toUpperCase() || 'Dokumentasi'}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                        doc.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {doc.status === 'completed' ? 'Selesai' : 'Draft'}
                    </span>
                  </div>
                  {doc.location && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      📍 {doc.location}
                    </p>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Tanggal Dibuat</span>
                    <span className="font-bold">
                      {new Date(doc.date_created).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  {doc.status === 'completed' && doc.score !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Score Kelengkapan</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{doc.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: `${doc.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center gap-2">
                  <Link
                    href={`/result/${doc.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat
                  </Link>
                  {doc.status === 'completed' && doc.document_url && (
                    <button
                      onClick={() => window.open(doc.document_url, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 transition-colors rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
