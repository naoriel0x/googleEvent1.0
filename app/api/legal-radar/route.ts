import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { Case } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caseData } = body as { caseData: Partial<Case> };

    if (!caseData || !caseData.description) {
      return NextResponse.json(
        { error: 'Data kasus tidak lengkap untuk dianalisis.' },
        { status: 400 }
      );
    }

    const witnessesCount = caseData.witnesses?.length || 0;
    const evidenceCount = caseData.evidence?.length || 0;

    const systemPrompt = `Kamu adalah analis hukum Indonesia senior yang berpengalaman dalam kasus hak warga, penggusuran paksa, sengketa lahan, pencemaran lingkungan, dan pelanggaran HAM.`;

    const userPrompt = `Analisis kasus berikut dan berikan respons dalam format JSON yang diminta.

Data kasus:
- Jenis pelanggaran: ${caseData.violation_type || 'Tidak disebutkan'}
- Tanggal kejadian: ${caseData.incident_date || 'Tidak disebutkan'}
- Lokasi: ${caseData.incident_location || 'Tidak disebutkan'}
- Deskripsi: ${caseData.description}
- Jumlah saksi: ${witnessesCount}
- Jumlah bukti: ${evidenceCount}

Berikan analisis:
1. Pasal-pasal hukum Indonesia yang potentially dilanggar dengan referensi spesifik
2. Kekuatan kasus 1-5 berdasarkan kelengkapan bukti
3. Langkah hukum yang direkomendasikan secara berurutan dan konkret
4. Risiko yang perlu diantisipasi
5. Estimasi waktu penyelesaian realistis

Gunakan Bahasa Indonesia yang mudah dipahami orang awam.
Berikan referensi pasal yang spesifik dan akurat.
Jujur tentang kekuatan dan kelemahan kasus.

Jawab HANYA dalam format JSON ini, tanpa teks lain (jangan gunakan blok markdown atau tulisan lain di luar JSON):
{
  "kekuatan_kasus": 1-5,
  "pasal_dilanggar": [{"pasal": "", "nama": "", "penjelasan": ""}],
  "rekomendasi": [{"urutan": 1, "langkah": "", "detail": ""}],
  "risiko": [""],
  "estimasi_timeline": "",
  "disclaimer": "Analisis ini bukan pengganti konsultasi pengacara profesional."
}`;

    let responseText = await generateContent(userPrompt, systemPrompt);
    
    // Clean up potential markdown formatting
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }
    
    const analysisResult = JSON.parse(responseText);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error generating legal analysis:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses analisis hukum.' },
      { status: 500 }
    );
  }
}
