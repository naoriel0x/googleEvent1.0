import { generateContent } from '@/lib/gemini';
import type { Case, Message } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Anda adalah pendamping dokumentasi yang empatikal dan profesional untuk platform WitnessChain. Tugas Anda adalah membantu korban penggusuran, sengketa lahan, dan pelanggaran hak merekam kejadian mereka secara terstruktur dan kredibel.

PEDOMAN INTERVIEW (SANGAT PENTING):
1. RESPON SANGAT SINGKAT: Tulis MAKSIMAL 2-3 kalimat saja per respons. Jangan pernah membuat paragraf panjang yang membuat pelapor bingung atau malas membaca.
2. Tanyakan HANYA SATU hal spesifik per respons - jangan berikan pertanyaan menumpuk (overwhelm).
3. Dengarkan dengan penuh empati dan validasi perasaan mereka karena mereka mungkin mengalami trauma.
4. Fokus pada detail konkret secara bertahap: tanggal, waktu, lokasi, nama pelaku, kronologi, saksi, dan bukti fisik.
5. AJAK GUNAKAN TOMBOL AKSIS CEPAT: Ingatkan pelapor secara halus bahwa mereka bisa mengisi detail secara instan dengan mengeklik tombol aksi cepat yang tersedia tepat di bawah area obrolan (di bawah balon chat Anda, tepat di atas kolom ketik). PENTING: Selalu sebut lokasi tombol tersebut berada di "bawah" atau "di bawah balon chat ini". JANGAN PERNAH menyebutnya berada di "atas" karena dari sudut pandang pelapor tombol tersebut berada di bawah pesan chat. Tombol yang ada HANYA:
   - "Isi Formulir Kasus" (untuk mengisi jenis pelanggaran, tanggal, lokasi, dan kronologi/deskripsi)
   - "Tambah Saksi" (untuk menambahkan nama, hubungan, dan kontak saksi)
   - "Unggah Bukti Fisik" (untuk mengunggah foto, video, atau dokumen bukti)
   JANGAN PERNAH menyebut nama tombol selain ketiga nama di atas! Gunakan persis nama-nama tersebut di dalam tanda kutip ketika merujuknya.
6. Jangan memberikan nasihat hukum - Anda di sini murni untuk mendokumentasikan fakta secara kredibel.
7. ANALISIS DATA SEBELUM BERTANYA (SANGAT PENTING): Periksa daftar "Data yang sudah dikumpulkan" dengan teliti sebelum menulis respons. JANGAN PERNAH menanyakan kembali informasi yang SUDAH TERCATAT di daftar tersebut (misalnya, jika saksi sudah diisi, JANGAN tanyakan saksi lagi; jika jenis pelanggaran/tanggal/lokasi sudah diisi, JANGAN tanyakan detail itu lagi). Tanyakan HANYA bagian informasi penting yang masih kosong dari daftar data tersebut secara bertahap.

URUTAN PERTANYAAN:
1. Mulai dengan sampaian hangat: "Terima kasih telah mempercayai WitnessChain..."
2. Tanya nama pelapor/korban: "Siapa nama lengkap Anda?"
3. Tanya jenis pelanggaran: "Apa jenis kasus yang Anda alami?"
4. Tanggal kejadian: "Kapan kejadian ini terjadi?"
5. Lokasi: "Di mana tepatnya lokasi kejadian?"
6. Pelaku/pihak terlibat: "Siapa saja pihak yang terlibat?"
7. Kronologi: "Bisa diceritakan urutan kejadiannya?"
8. Bukti fisik: "Apakah ada foto, video, atau dokumen?"
9. Saksi: "Siapa saja yang menjadi saksi?"
10. Status dokumentasi: "Apakah ada laporan polisi atau ke institusi lain?"

DATA YANG HARUS DIKUMPULKAN MINIMAL:
- Nama pelapor/korban (WAJIB)
- Deskripsi kejadian (WAJIB)
- Tanggal kejadian (WAJIB)
- Lokasi kejadian (WAJIB)
- Setidaknya 1 saksi atau bukti fisik

TONE:
- Empatikal, hangat, suportif, dan tidak kaku.
- Gunakan Bahasa Indonesia yang mudah dipahami oleh masyarakat umum.`;

interface InterviewRequest {
  messages: Message[];
  caseData: Partial<Case>;
}

interface InterviewResponse {
  response: string;
  extractedData: Partial<Case>;
  isComplete: boolean;
  score: number;
  completenessScore?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<InterviewResponse | { error: string }>> {
  try {
    const body: InterviewRequest = await request.json();
    const { messages, caseData } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Build prompt dari message history
    const conversationHistory = messages
      .map((msg) => `${msg.role === 'user' ? 'Pelapor' : 'Asisten'}:\n${msg.content}`)
      .join('\n\n');

    const userPrompt = `Lanjutkan interview untuk dokumentasi kasus. Berikut adalah riwayat percakapan:

${conversationHistory}

Data yang sudah dikumpulkan:
- Status: ${caseData.status || 'draft'}
- Nama pelapor: ${caseData.reporter_name || 'belum ada'}
- Pihak terlibat/pelaku: ${caseData.involved_parties || 'belum ada'}
- Jenis pelanggaran: ${caseData.violation_type || 'belum ditentukan'}
- Tanggal kejadian: ${caseData.incident_date || 'belum ditentukan'}
- Lokasi: ${caseData.incident_location || 'belum ditentukan'}
- Deskripsi: ${caseData.description || 'belum ada'}
- Saksi yang tercatat: ${caseData.witnesses && caseData.witnesses.length > 0 ? caseData.witnesses.map((w) => `${w.name} (Hubungan: ${w.relationship || '-'}, Kontak: ${w.contact || '-'})`).join(', ') : 'Belum ada saksi'}
- Bukti fisik terunggah: ${caseData.evidence && caseData.evidence.length > 0 ? caseData.evidence.map((e) => `${e.type === 'photo' ? 'Foto' : e.type === 'video' ? 'Video' : 'Dokumen'}: ${e.name || e.description || 'Tanpa nama'}`).join(', ') : 'Belum ada bukti'}

Berikan respons interview berikutnya. Tanyakan informasi yang masih kurang untuk melengkapi dokumen.
PENTING: Respons HARUS dalam format JSON dengan struktur:
{
  "response": "pertanyaan atau komentar Anda untuk pelapor",
  "extracted_data": {
    "reporter_name": "nama lengkap pelapor jika disebutkan",
    "involved_parties": "nama-nama pihak terlibat, instansi, atau pelaku jika disebutkan",
    "violation_type": "jika disebutkan, gunakan salah satu: penggusuran, sengketa_lahan, pencemaran_lingkungan, pelanggaran_hak, lainnya",
    "incident_date": "format ISO jika disebutkan",
    "incident_location": "lokasi jika disebutkan",
    "description": "update deskripsi jika ada informasi baru",
    "timeline_events": [{"id": "uuid", "date": "ISO date", "time": "HH:mm atau null", "title": "judul singkat", "description": "deskripsi", "type": "incident|document|witness|authority|evidence|report", "isCritical": false}],
    "witnesses": [{"name": "nama saksi", "relationship": "hubungan", "contact": "kontak jika ada"}],
    "evidence": [{"type": "photo|video|document", "description": "deskripsi bukti", "timestamp": "waktu jika ada"}]
  },
  "completeness_score": jumlah 0-100 berdasarkan data yang sudah dikumpulkan
}`;

    const rawResponse = await generateContent(userPrompt, SYSTEM_PROMPT);

    // Parse JSON response dari Gemini
    let parsedResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback jika Gemini tidak return format JSON sempurna
      parsedResponse = {
        response: rawResponse,
        extracted_data: caseData,
        completeness_score: calculateCompletenessScore(caseData),
      };
    }

    // Merge witnesses safely: preserve existing witnesses, and append newly extracted ones (avoiding duplicates)
    const existingWitnesses = Array.isArray(caseData.witnesses) ? caseData.witnesses : [];
    const newWitnesses = Array.isArray(parsedResponse.extracted_data?.witnesses) ? parsedResponse.extracted_data.witnesses : [];
    const mergedWitnesses = [...existingWitnesses];
    
    newWitnesses.forEach((newW: { name?: string; relationship?: string; contact?: string }) => {
      if (newW && newW.name && newW.name.trim() !== '') {
        const validName = newW.name;
        const isDuplicate = mergedWitnesses.some(
          (w) => w.name && w.name.trim().toLowerCase() === validName.trim().toLowerCase()
        );
        if (!isDuplicate) {
          mergedWitnesses.push({
            name: validName,
            relationship: newW.relationship || '',
            contact: newW.contact || ''
          } as import('@/types').Witness);
        }
      }
    });

    // Merge evidence safely: preserve existing evidence (uploaded or extracted), and append newly extracted ones (avoiding duplicates)
    const existingEvidence = Array.isArray(caseData.evidence) ? caseData.evidence : [];
    const newEvidence = Array.isArray(parsedResponse.extracted_data?.evidence) ? parsedResponse.extracted_data.evidence : [];
    const mergedEvidence = [...existingEvidence];

    newEvidence.forEach((newEv: { url?: string; type?: string; id?: string; timestamp?: string; hash?: string; name?: string; description?: string }) => {
      if (newEv) {
        const isDuplicate = mergedEvidence.some((ev) => {
          // If description matches exactly
          if (ev.description && newEv.description && ev.description.trim().toLowerCase() === newEv.description.trim().toLowerCase()) {
            return true;
          }
          // If we have an uploaded file of the same type and the AI-extracted one has no URL/hash,
          // let's skip to avoid duplicating the manually uploaded file
          if (!newEv.url && ev.type === newEv.type && ev.url) {
            return true;
          }
          return false;
        });

        if (!isDuplicate && newEv.description && newEv.description.trim() !== '') {
          const formattedEv = {
            id: newEv.id || `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: (newEv.type === 'photo' || newEv.type === 'video') ? newEv.type : 'document',
            url: newEv.url || '',
            timestamp: newEv.timestamp || new Date().toISOString(),
            hash: newEv.hash || '',
            name: newEv.name || undefined,
            description: newEv.description,
          };
          mergedEvidence.push(formattedEv as import('@/types').Evidence);
        }
      }
    });

    // Merge extracted data dengan existing case data
    const extractedData = {
      ...caseData,
      reporter_name: parsedResponse.extracted_data?.reporter_name || caseData.reporter_name,
      involved_parties: parsedResponse.extracted_data?.involved_parties || caseData.involved_parties,
      violation_type: parsedResponse.extracted_data?.violation_type || caseData.violation_type,
      incident_date: parsedResponse.extracted_data?.incident_date || caseData.incident_date,
      incident_location: parsedResponse.extracted_data?.incident_location || caseData.incident_location,
      description: parsedResponse.extracted_data?.description || caseData.description,
      timeline_events: parsedResponse.extracted_data?.timeline_events || caseData.timeline_events || [],
      witnesses: mergedWitnesses,
      evidence: mergedEvidence,
    };

    // Calculate completeness scores
    const calculatedScore = calculateCompletenessScore(extractedData);
    const geminiScore = typeof parsedResponse.completeness_score === 'number' ? parsedResponse.completeness_score : 0;
    
    // Ensure the score is strictly monotonic (never decreases) and select the highest valid score
    const previousScore = caseData.completeness_score || 0;
    let completenessScore = Math.max(previousScore, calculatedScore, geminiScore);

    // If all essential fields are empty, keep the score at exactly 0
    const hasAnyData = 
      !!extractedData.reporter_name ||
      !!extractedData.involved_parties ||
      !!extractedData.violation_type || 
      !!extractedData.incident_date || 
      !!extractedData.incident_location || 
      !!(extractedData.description && extractedData.description.trim().length > 0) ||
      !!(extractedData.witnesses && extractedData.witnesses.length > 0) ||
      !!(extractedData.evidence && extractedData.evidence.length > 0);
      
    if (!hasAnyData) {
      completenessScore = 0;
    }

    const isComplete = completenessScore >= 70;

    return NextResponse.json({
      response: parsedResponse.response || rawResponse,
      extractedData,
      isComplete,
      score: completenessScore,
      completenessScore: completenessScore,
    });
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan saat processing interview' },
      { status: 500 }
    );
  }
}

function calculateCompletenessScore(caseData: Partial<Case>): number {
  let score = 0;
  const maxScore = 100;
  const criteria = {
    reporter_name: 10,
    involved_parties: 10,
    violation_type: 10,
    incident_date: 10,
    incident_location: 15,
    description: 15,
    witnesses: 10,
    evidence: 10,
    messages: 10,
  };

  if (caseData.reporter_name && caseData.reporter_name.trim().length > 0) score += criteria.reporter_name;
  if (caseData.involved_parties && caseData.involved_parties.trim().length > 0) score += criteria.involved_parties;
  if (caseData.violation_type) score += criteria.violation_type;
  if (caseData.incident_date) score += criteria.incident_date;
  if (caseData.incident_location) score += criteria.incident_location;
  if (caseData.description && caseData.description.length > 50) score += criteria.description;
  if (caseData.witnesses && caseData.witnesses.length > 0) score += criteria.witnesses;
  if (caseData.evidence && caseData.evidence.length > 0) score += criteria.evidence;
  if (caseData.messages && caseData.messages.length > 3) score += criteria.messages;

  return Math.min(score, maxScore);
}
