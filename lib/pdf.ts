import jsPDF from 'jspdf';
import type { Case } from '@/types';

const PRIMARY_COLOR: [number, number, number] = [15, 23, 42]; // slate-900
const ACCENT_COLOR: [number, number, number] = [5, 150, 105]; // emerald-600
const NEUTRAL_COLOR: [number, number, number] = [71, 85, 105]; // slate-600
const DANGER_COLOR: [number, number, number] = [220, 38, 38]; // red-600

export async function generateCasePDF(caseData: Case): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  const addSection = (title: string) => {
    if (yPosition + 10 > pageHeight - 10) {
      doc.addPage();
      yPosition = margin;
    }
    yPosition += 5;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(title, margin, yPosition);
    yPosition += 7;
    doc.setDrawColor(...ACCENT_COLOR);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 3;
  };

  const addLine = () => {
    yPosition += 3;
    if (yPosition + 10 > pageHeight - 10) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const getColorByScore = (score: number): [number, number, number] => {
    if (score < 50) return DANGER_COLOR;
    if (score < 80) return [217, 119, 6]; // amber-600
    return ACCENT_COLOR;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Belum ditentukan';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Header
  yPosition += 3;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('WITNESSCHAIN', margin, yPosition);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...NEUTRAL_COLOR);
  doc.text('Platform Dokumentasi Bukti Digital', margin, yPosition + 5);
  yPosition += 12;

  // Document info
  const docDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(9);
  doc.setTextColor(...NEUTRAL_COLOR);
  doc.text(`Nomor Kasus: ${caseData.id}`, pageWidth - margin - 50, yPosition);
  doc.text(`Tanggal: ${docDate}`, pageWidth - margin - 50, yPosition + 5);
  yPosition += 12;

  // Score badge
  const scoreColor = getColorByScore(caseData.completeness_score);
  doc.setFillColor(...scoreColor);
  doc.rect(margin, yPosition, 30, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${caseData.completeness_score}%`, margin + 15, yPosition + 5.5, { align: 'center' });
  yPosition += 12;

  // Section 1: Identitas Pelapor
  addSection('1. IDENTITAS PELAPOR');
  const reporterName = caseData.reporter_name || '(Anonim)';
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`Nama Pelapor / Korban: ${reporterName}`, margin, yPosition);
  addLine();

  // Section 2: Detail Kejadian
  addSection('2. DETAIL KEJADIAN');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Jenis Pelanggaran:', margin, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(...NEUTRAL_COLOR);
  const violationType = caseData.violation_type
    ?.replace(/_/g, ' ')
    .toUpperCase() || 'Belum ditentukan';
  doc.text(violationType, margin + 5, yPosition);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Tanggal Kejadian:', margin, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(...NEUTRAL_COLOR);
  doc.text(formatDate(caseData.incident_date), margin + 5, yPosition);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Lokasi Kejadian:', margin, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(...NEUTRAL_COLOR);
  doc.text(caseData.incident_location || 'Belum ditentukan', margin + 5, yPosition, { maxWidth: maxWidth - 10 });
  yPosition += 5;

  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Pihak Terlibat / Pelaku / Instansi:', margin, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(...NEUTRAL_COLOR);
  doc.text(caseData.involved_parties || 'Belum diisi', margin + 5, yPosition, { maxWidth: maxWidth - 10 });
  yPosition += 5;
  addLine();

  // Section 3: Kronologi
  addSection('3. KRONOLOGI KEJADIAN');
  doc.setFontSize(9);
  doc.setTextColor(...NEUTRAL_COLOR);
  const splitDescription = doc.splitTextToSize(caseData.description || 'Tidak ada deskripsi', maxWidth - 5);
  doc.text(splitDescription, margin + 2, yPosition);
  yPosition += splitDescription.length * 4.5 + 2;
  addLine();

  // Section 4: Daftar Saksi
  addSection('4. DAFTAR SAKSI');
  if (caseData.witnesses.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...NEUTRAL_COLOR);
    doc.text('Belum ada saksi yang dicatat.', margin, yPosition);
  } else {
    caseData.witnesses.forEach((witness, index) => {
      if (yPosition + 12 > pageHeight - 10) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(`${index + 1}. ${witness.name}`, margin, yPosition);
      yPosition += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...NEUTRAL_COLOR);
      doc.text(`Hubungan: ${witness.relationship}`, margin + 2, yPosition);
      yPosition += 4;
      if (witness.contact) {
        doc.text(`Kontak: ${witness.contact}`, margin + 2, yPosition);
        yPosition += 4;
      }
      yPosition += 2;
    });
  }
  addLine();

  // Section 5: Daftar Bukti
  addSection('5. DAFTAR BUKTI');
  if (caseData.evidence.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...NEUTRAL_COLOR);
    doc.text('Belum ada bukti yang diupload.', margin, yPosition);
  } else {
    caseData.evidence.forEach((evidence, index) => {
      if (yPosition + 12 > pageHeight - 10) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(`${index + 1}. ${evidence.type.toUpperCase()}`, margin, yPosition);
      yPosition += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...NEUTRAL_COLOR);
      doc.text(`Waktu: ${formatDate(evidence.timestamp)}`, margin + 2, yPosition);
      yPosition += 4.5;
      doc.setFontSize(8);
      if (evidence.description) {
        doc.text(`Keterangan: ${evidence.description}`, margin + 2, yPosition, { maxWidth: maxWidth - 10 });
        yPosition += 3.5;
      }
      
      // Render photo preview inside PDF if url is a Base64 data URL
      if (evidence.type === 'photo' && evidence.url && evidence.url.startsWith('data:image/')) {
        const photoHeight = 35; // 35mm height
        const photoWidth = 50;  // 50mm width
        
        if (yPosition + photoHeight + 5 > pageHeight - 15) {
          doc.addPage();
          yPosition = margin;
        }
        
        try {
          doc.addImage(evidence.url, 'JPEG', margin + 2, yPosition, photoWidth, photoHeight);
          yPosition += photoHeight + 4;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          doc.setFontSize(8);
          doc.setTextColor('#dc2626');
          doc.text('[Gagal memuat pratinjau gambar]', margin + 2, yPosition);
          yPosition += 4;
          doc.setTextColor(...NEUTRAL_COLOR);
        }
      }
      yPosition += 2;
    });
  }
  addLine();

  // Section 6: Catatan Hukum
  addSection('6. CATATAN HUKUM YANG RELEVAN');
  doc.setFontSize(8);
  doc.setTextColor(...NEUTRAL_COLOR);
  const legalNotes = [
    'UUD 1945 Pasal 28D - Hak Perlindungan Data Pribadi',
    'UU No. 39 Tahun 1999 - HAM Indonesia',
    'UU No. 8 Tahun 1997 - Dokumen Perusahaan',
    'Peraturan Kepemiluan dan Regulasi Lokal yang berlaku',
  ];
  legalNotes.forEach((note) => {
    if (yPosition + 5 > pageHeight - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(`• ${note}`, margin + 2, yPosition, { maxWidth: maxWidth - 5 });
    yPosition += 4;
  });
  addLine();

  // Footer
  yPosition = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(...NEUTRAL_COLOR);
  doc.setDrawColor(...ACCENT_COLOR);
  doc.line(margin, yPosition, doc.internal.pageSize.getWidth() - margin, yPosition);
  yPosition += 4;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('DISCLAIMER', margin, yPosition);
  yPosition += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...NEUTRAL_COLOR);
  const disclaimerText = doc.splitTextToSize(
    'Dokumen ini adalah hasil dokumentasi dari platform WitnessChain dan dapat digunakan sebagai bukti pendukung di pengadilan atau lembaga hak asasi manusia. Namun, dokumen ini bukan merupakan pengganti dari konsultasi hukum profesional. Untuk kasus-kasus serius, disarankan untuk menghubungi LBH atau advokat yang berpengalaman. WitnessChain tidak bertanggung jawab atas akurasi atau konsekuensi hukum dari informasi yang terdapat dalam dokumen ini.',
    maxWidth - 5
  );
  doc.text(disclaimerText, margin, yPosition);

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
