import jsPDF from 'jspdf';
import type { Case } from '@/types';

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  black:      [10, 10, 10]   as [number,number,number],
  darkSlate:  [15, 23, 42]   as [number,number,number],
  slate:      [51, 65, 85]   as [number,number,number],
  slateLight: [100,116,139]  as [number,number,number],
  border:     [203,213,225]  as [number,number,number],
  bgLight:    [248,250,252]  as [number,number,number],
  bgSection:  [241,245,249]  as [number,number,number],
  emerald:    [5, 150, 105]  as [number,number,number],
  emeraldBg:  [209,250,229]  as [number,number,number],
  amber:      [180, 83,  9]  as [number,number,number],
  amberBg:    [254,243,199]  as [number,number,number],
  red:        [185, 28, 28]  as [number,number,number],
  redBg:      [254,226,226]  as [number,number,number],
  white:      [255,255,255]  as [number,number,number],
};

export async function generateCasePDF(caseData: Case): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = doc.internal.pageSize.width;   // 210
  const PH = doc.internal.pageSize.height;  // 297
  const ML = 18, MR = 18, MT = 0;
  const CW = PW - ML - MR; // content width = 174

  let y = MT;
  let pageNum = 1;

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const rgb = (c: [number,number,number]) => ({ r: c[0], g: c[1], b: c[2] });

  const newPage = () => {
    // Footer on current page
    drawFooter();
    doc.addPage();
    pageNum++;
    y = 0;
    drawPageHeader();
  };

  const guard = (needed: number) => {
    if (y + needed > PH - 22) newPage();
  };

  const setFont = (size: number, style: 'normal'|'bold'|'italic' = 'normal', color = C.darkSlate) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
  };

  const drawRect = (x: number, ry: number, w: number, h: number, fill: [number,number,number], stroke?: [number,number,number]) => {
    doc.setFillColor(...fill);
    if (stroke) {
      doc.setDrawColor(...stroke);
      doc.rect(x, ry, w, h, 'FD');
    } else {
      doc.rect(x, ry, w, h, 'F');
    }
  };

  const txt = (text: string, x: number, ty: number, opts?: Parameters<typeof doc.text>[3]) => {
    doc.text(text, x, ty, opts);
  };

  const multiLine = (text: string, x: number, ty: number, maxW: number, lineH = 4.8): number => {
    const lines = doc.splitTextToSize(text || '—', maxW);
    doc.text(lines, x, ty);
    return lines.length * lineH;
  };

  const formatDate = (d?: string) => {
    if (!d) return 'Belum ditentukan';
    try {
      return new Intl.DateTimeFormat('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(d));
    } catch { return d; }
  };

  // ─── Cover Header (first page only) ─────────────────────────────────────────
  const drawCoverHeader = () => {
    // Dark header bar
    drawRect(0, 0, PW, 42, C.darkSlate);

    // Green accent stripe
    drawRect(0, 42, PW, 1.5, C.emerald);

    // Logo area
    drawRect(ML, 10, 10, 10, C.emerald);
    setFont(7, 'bold', C.white);
    txt('WC', ML + 5, 16.5, { align: 'center' });

    // Title
    setFont(18, 'bold', C.white);
    txt('WITNESSCHAIN', ML + 14, 17);

    setFont(8, 'normal', [148,163,184]);
    txt('Platform Dokumentasi Hak Warga Indonesia', ML + 14, 23);

    // Doc type badge
    drawRect(PW - MR - 52, 12, 52, 8, C.emerald);
    setFont(7, 'bold', C.white);
    txt('DOKUMEN RESMI KASUS', PW - MR - 26, 17.2, { align: 'center' });

    // Meta info row
    setFont(7.5, 'normal', [148,163,184]);
    const docDate = new Date().toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
    txt(`Tanggal Cetak: ${docDate}`, ML + 14, 30);
    txt(`ID Kasus: ${caseData.id}`, ML + 14, 35.5);

    // Status badge
    const score = caseData.completeness_score ?? 0;
    const [badgeBg, badgeTxt, badgeLabel] =
      score >= 80 ? [C.emerald, C.white, `LENGKAP ${score}%`] :
      score >= 50 ? [C.amber,   C.white, `SEDANG ${score}%`] :
                   [C.red,     C.white, `KURANG ${score}%`];
    drawRect(PW - MR - 30, 28, 30, 9, badgeBg);
    setFont(8, 'bold', badgeTxt);
    txt(badgeLabel, PW - MR - 15, 33.5, { align: 'center' });

    y = 50;
  };

  // ─── Subsequent page header ──────────────────────────────────────────────────
  const drawPageHeader = () => {
    drawRect(0, 0, PW, 12, C.darkSlate);
    setFont(7, 'bold', C.white);
    txt('WITNESSCHAIN — Dokumen Resmi Kasus', ML, 7.5);
    setFont(7, 'normal', [148,163,184]);
    txt(`ID: ${caseData.id.substring(0,8).toUpperCase()}`, PW - MR, 7.5, { align: 'right' });
    drawRect(0, 12, PW, 1, C.emerald);
    y = 18;
  };

  // ─── Footer ─────────────────────────────────────────────────────────────────
  const drawFooter = () => {
    const fy = PH - 12;
    doc.setDrawColor(...C.border);
    doc.line(ML, fy, PW - MR, fy);
    setFont(6.5, 'normal', C.slateLight);
    txt('WitnessChain · Platform Dokumentasi Hak Warga · Dokumen ini bukan pengganti konsultasi hukum profesional', ML, fy + 4);
    txt(`Hal. ${pageNum}`, PW - MR, fy + 4, { align: 'right' });
  };

  // ─── Section heading ─────────────────────────────────────────────────────────
  const sectionHead = (num: string, title: string) => {
    guard(14);
    y += 5;
    drawRect(ML, y, CW, 9, C.bgSection);
    drawRect(ML, y, 3, 9, C.emerald);
    setFont(9, 'bold', C.darkSlate);
    txt(`${num}  ${title}`, ML + 7, y + 6);
    y += 13;
  };

  // ─── Key-value row ───────────────────────────────────────────────────────────
  const kvRow = (label: string, value: string, fullWidth = false) => {
    const valStr = value || '—';
    const valLines = doc.splitTextToSize(valStr, fullWidth ? CW - 35 : CW / 2 - 5);
    const rowH = Math.max(valLines.length * 4.8 + 5, 9);
    guard(rowH + 2);

    // Row bg alternating handled by caller or just draw border
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(ML, y, ML + CW, y);

    setFont(7.5, 'bold', C.slateLight);
    txt(label.toUpperCase(), ML + 3, y + 5.5);

    setFont(8.5, 'normal', C.darkSlate);
    if (fullWidth) {
      doc.text(valLines, ML + 35, y + 5.5);
    } else {
      doc.text(valLines, ML + 3, y + 5.5 + 4.5);
    }

    y += rowH;
  };

  // ─── Info box (2-col) ────────────────────────────────────────────────────────
  const infoBox2Col = (items: {label:string, value:string}[]) => {
    const colW = CW / 2 - 2;
    const rows = Math.ceil(items.length / 2);
    for (let r = 0; r < rows; r++) {
      const left  = items[r * 2];
      const right = items[r * 2 + 1];
      const lLines = doc.splitTextToSize(left?.value || '—', colW - 6);
      const rLines = right ? doc.splitTextToSize(right?.value || '—', colW - 6) : [];
      const rowH = Math.max(lLines.length, rLines.length) * 4.8 + 9;
      guard(rowH);

      // Left cell
      drawRect(ML, y, colW, rowH, C.bgLight, C.border);
      setFont(7, 'bold', C.slateLight);
      txt(left.label.toUpperCase(), ML + 3, y + 5);
      setFont(8.5, 'normal', C.darkSlate);
      doc.text(lLines, ML + 3, y + 9.5);

      // Right cell
      if (right) {
        drawRect(ML + colW + 2, y, colW, rowH, C.bgLight, C.border);
        setFont(7, 'bold', C.slateLight);
        txt(right.label.toUpperCase(), ML + colW + 5, y + 5);
        setFont(8.5, 'normal', C.darkSlate);
        doc.text(rLines, ML + colW + 5, y + 9.5);
      }
      y += rowH + 1;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD PDF
  // ═══════════════════════════════════════════════════════════════════════════
  drawCoverHeader();

  // ── SECTION 1: Identitas Pelapor ───────────────────────────────────────────
  sectionHead('01', 'IDENTITAS PELAPOR');
  infoBox2Col([
    { label: 'Nama Pelapor / Korban', value: caseData.reporter_name || '(Anonim)' },
    { label: 'Status', value: caseData.status === 'completed' ? 'Dokumen Terkunci (Permanen)' : 'Draf Aktif' },
  ]);
  y += 2;

  // ── SECTION 2: Detail Kejadian ─────────────────────────────────────────────
  sectionHead('02', 'DETAIL KEJADIAN');
  infoBox2Col([
    { label: 'Jenis Pelanggaran', value: caseData.violation_type?.replace(/_/g,' ').toUpperCase() || '—' },
    { label: 'Tanggal Kejadian',  value: formatDate(caseData.incident_date) },
    { label: 'Lokasi Kejadian',   value: caseData.incident_location || '—' },
    { label: 'Pihak Terlibat / Pelaku', value: caseData.involved_parties || '—' },
  ]);
  y += 2;

  // ── SECTION 3: Kronologi ───────────────────────────────────────────────────
  sectionHead('03', 'KRONOLOGI KEJADIAN');
  guard(20);
  drawRect(ML, y, CW, 6, C.bgSection);
  setFont(7.5, 'bold', C.slateLight);
  txt('NARASI KRONOLOGI', ML + 3, y + 4.2);
  y += 7;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  // Left bar accent
  drawRect(ML, y, 2, 0, C.emerald); // placeholder, drawn after text
  const descLines = doc.splitTextToSize(caseData.description || 'Tidak ada deskripsi yang dicatat.', CW - 10);
  const descH = descLines.length * 5 + 6;
  guard(descH);
  drawRect(ML, y, CW, descH, C.bgLight, C.border);
  drawRect(ML, y, 2.5, descH, C.emerald);
  setFont(9, 'normal', C.darkSlate);
  doc.text(descLines, ML + 7, y + 5.5);
  y += descH + 4;

  // ── SECTION 4: Saksi ───────────────────────────────────────────────────────
  sectionHead('04', 'DAFTAR SAKSI');
  if (!caseData.witnesses || caseData.witnesses.length === 0) {
    guard(10);
    drawRect(ML, y, CW, 10, C.bgLight, C.border);
    setFont(8.5, 'italic', C.slateLight);
    txt('Belum ada saksi yang dicatat.', ML + CW/2, y + 6.5, { align: 'center' });
    y += 14;
  } else {
    caseData.witnesses.forEach((w, i) => {
      guard(18);
      const wH = 18;
      drawRect(ML, y, CW, wH, C.bgLight, C.border);
      // Index badge
      drawRect(ML, y, 8, wH, C.emerald);
      setFont(9, 'bold', C.white);
      txt(`${i+1}`, ML + 4, y + wH/2 + 1.5, { align: 'center' });
      // Content
      setFont(9, 'bold', C.darkSlate);
      txt(w.name || '—', ML + 12, y + 6);
      setFont(8, 'normal', C.slateLight);
      txt(`Hubungan: ${w.relationship || '—'}`, ML + 12, y + 11);
      if (w.contact) {
        txt(`Kontak: ${w.contact}`, ML + 12, y + 15.5);
      }
      y += wH + 2;
    });
  }
  y += 2;

  // ── SECTION 5: Bukti ───────────────────────────────────────────────────────
  sectionHead('05', 'DAFTAR BUKTI DIGITAL');
  if (!caseData.evidence || caseData.evidence.length === 0) {
    guard(10);
    drawRect(ML, y, CW, 10, C.bgLight, C.border);
    setFont(8.5, 'italic', C.slateLight);
    txt('Belum ada bukti yang diupload.', ML + CW/2, y + 6.5, { align: 'center' });
    y += 14;
  } else {
    caseData.evidence.forEach((ev, i) => {
      // Only show photos in PDF (videos/documents show as text only)
      const isPhoto = ev.type === 'photo' && ev.url?.startsWith('data:image/');
      const photoH = isPhoto ? 52 : 0;
      const cardH = 22 + photoH + (ev.description ? 6 : 0);
      guard(cardH + 4);

      drawRect(ML, y, CW, cardH, C.bgLight, C.border);

      // Type badge
      const typeColor = ev.type === 'photo' ? C.emerald : ev.type === 'video' ? C.amber : C.slate;
      drawRect(ML + 3, y + 3, 22, 7, typeColor);
      setFont(6.5, 'bold', C.white);
      txt(ev.type.toUpperCase(), ML + 14, y + 7.5, { align: 'center' });

      // Index
      setFont(7, 'bold', C.slateLight);
      txt(`#${i+1}`, ML + CW - 6, y + 7.5, { align: 'right' });

      // Timestamp
      setFont(8, 'normal', C.darkSlate);
      txt(`Waktu: ${formatDate(ev.timestamp)}`, ML + 28, y + 7.5);

      // Description
      if (ev.description) {
        setFont(7.5, 'normal', C.slateLight);
        const dLines = doc.splitTextToSize(`Keterangan: ${ev.description}`, CW - 10);
        doc.text(dLines, ML + 3, y + 15);
      }

      // Hash
      if (ev.hash) {
        setFont(6.5, 'normal', C.slateLight);
        txt(`SHA-256: ${ev.hash.substring(0, 40)}...`, ML + 3, y + (ev.description ? 21 : 15));
      }

      // Photo preview (only for photos, with border)
      if (isPhoto) {
        const imgFormat = ev.url.includes('image/png') ? 'PNG' : 'JPEG';
        const imgY = y + 23;
        const imgW = 55;
        const imgH = photoH - 4;
        try {
          doc.addImage(ev.url, imgFormat, ML + 3, imgY, imgW, imgH);
          // Border around image
          doc.setDrawColor(...C.border);
          doc.setLineWidth(0.3);
          doc.rect(ML + 3, imgY, imgW, imgH);

          // Caption
          setFont(6.5, 'italic', C.slateLight);
          txt(`Foto Bukti #${i+1} — ${formatDate(ev.timestamp)}`, ML + 3, imgY + imgH + 3.5);
        } catch {
          setFont(7.5, 'italic', C.slateLight);
          txt('[Pratinjau foto tidak tersedia]', ML + 3, imgY + 5);
        }
      }

      y += cardH + 3;
    });
  }
  y += 2;

  // ── SECTION 6: Catatan Hukum ───────────────────────────────────────────────
  sectionHead('06', 'REFERENSI HUKUM YANG RELEVAN');
  const laws = [
    { pasal: 'UUD 1945 Pasal 28D', desc: 'Hak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil' },
    { pasal: 'UUD 1945 Pasal 28G', desc: 'Hak atas perlindungan diri pribadi, keluarga, kehormatan, martabat, dan harta benda' },
    { pasal: 'UU No. 39 Tahun 1999', desc: 'Hak Asasi Manusia — Perlindungan hak dasar warga negara Indonesia' },
    { pasal: 'UU No. 11 Tahun 2008', desc: 'Informasi dan Transaksi Elektronik — Keabsahan dokumen elektronik sebagai alat bukti' },
  ];
  laws.forEach((law, i) => {
    guard(14);
    const lH = 13;
    drawRect(ML, y, CW, lH, i % 2 === 0 ? C.bgLight : C.white, C.border);
    drawRect(ML, y, 2, lH, C.slateLight);
    setFont(8, 'bold', C.darkSlate);
    txt(law.pasal, ML + 6, y + 5);
    setFont(7.5, 'normal', C.slateLight);
    txt(law.desc, ML + 6, y + 10);
    y += lH;
  });
  y += 4;

  // ── SECTION 7: Disclaimer ──────────────────────────────────────────────────
  guard(28);
  drawRect(ML, y, CW, 28, C.amberBg, C.amber);
  drawRect(ML, y, 2.5, 28, C.amber);
  setFont(8, 'bold', C.amber);
  txt('⚠  DISCLAIMER PENTING', ML + 7, y + 6);
  setFont(7.5, 'normal', C.darkSlate);
  const disc = doc.splitTextToSize(
    'Dokumen ini dihasilkan secara otomatis oleh platform WitnessChain dan dapat dijadikan bukti pendukung di pengadilan atau lembaga hak asasi manusia. Namun, dokumen ini BUKAN pengganti konsultasi hukum profesional. Untuk kasus-kasus serius, sangat disarankan untuk menghubungi LBH atau advokat yang berpengalaman di bidangnya. WitnessChain tidak bertanggung jawab atas akurasi atau konsekuensi hukum dari informasi dalam dokumen ini.',
    CW - 12
  );
  doc.text(disc, ML + 7, y + 12);
  y += 32;

  // ── Signature block ────────────────────────────────────────────────────────
  guard(30);
  y += 4;
  drawRect(ML, y, CW, 28, C.bgLight, C.border);
  setFont(8, 'bold', C.darkSlate);
  txt('TANDA TANGAN & VERIFIKASI', ML + CW/2, y + 7, { align: 'center' });
  setFont(7.5, 'normal', C.slateLight);
  txt('Dokumen ini digenerate otomatis pada:', ML + CW/2, y + 13, { align: 'center' });
  setFont(8.5, 'bold', C.darkSlate);
  txt(new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }), ML + CW/2, y + 19, { align: 'center' });
  // Divider lines for signature
  doc.setDrawColor(...C.border);
  doc.line(ML + 10, y + 26, ML + 65, y + 26);
  doc.line(ML + CW - 65, y + 26, ML + CW - 10, y + 26);
  setFont(7, 'normal', C.slateLight);
  txt('Pelapor / Korban', ML + 37, y + 29, { align: 'center' });
  txt('Pendamping / Saksi', ML + CW - 37, y + 29, { align: 'center' });
  y += 32;

  // Footer on last page
  drawFooter();

  return Buffer.from(doc.output('arraybuffer'));
}