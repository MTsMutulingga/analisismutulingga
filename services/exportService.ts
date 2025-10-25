import type { AnalysisResult, AnalysisInput, DistractorAnalysis } from '../types.ts';

const formatDate = (dateString: string): string => {
    if (!dateString) return '....................................';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '....................................';
        // Add time zone offset to prevent off-by-one day errors
        const utcDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
        return utcDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return '....................................';
    }
};

const renderDistractorHtml = (distractors: DistractorAnalysis | undefined, key: string): string => {
    if (!distractors) return '<td>-</td>';

    let html = '<td style="font-size: 8pt; text-align: left; vertical-align: top;"><ul>';
    const options = Object.keys(distractors).sort();

    for (const option of options) {
        const detail = distractors[option];
        let style = '';
        let marker = '';

        if (option === key) {
            style = 'font-weight: bold; color: #166534;'; // Green-800
            marker = ' (Kunci)';
        } else {
            if (detail.lowerGroupCount > detail.upperGroupCount) {
                style = 'color: #15803d;'; // Green-700 - Good distractor
            } else {
                style = 'color: #b91c1c;'; // Red-700 - Bad distractor
            }
        }
        html += `<li style="margin: 0; padding: 1px 0; ${style}">${option}: ${detail.totalCount} (A: ${detail.upperGroupCount}, B: ${detail.lowerGroupCount})${marker}</li>`;
    }
    html += '</ul></td>';
    return html;
};


export const generateReportHtml = (result: AnalysisResult, inputs: AnalysisInput): string => {
    const { students, itemAnalysis, totalQuestions } = result;
    if (students.length === 0) return '';

    const { guruMapel, nipGuru, mataPelajaran, tahunAjaran, kelasSemester, kktp, kepalaMadrasah, nipKepala, assessmentDate, analysisDate, assessmentType, capaianPembelajaran } = inputs;
    const formattedAssessmentDate = formatDate(assessmentDate);
    const formattedAnalysisDate = formatDate(analysisDate);
    
    // Use custom logo from localStorage, with a placeholder as default for branding.
    const customLogo = localStorage.getItem('customLogoUrl');
    const defaultLogo = "https://placehold.co/600x100/eeeeee/999999?text=Logo+Madrasah";
    const logoUrl = customLogo || defaultLogo;
    
    const reportTitle = `LAPORAN ANALISIS NILAI HASIL ${assessmentType ? assessmentType.toUpperCase() : 'PENILAIAN HARIAN'}`;
    const nipKepalaText = nipKepala ? `NIP/NBM. ${nipKepala}` : `NIP/NBM. ....................................`;
    const nipGuruText = nipGuru ? `NIP/NBM. ${nipGuru}` : `NIP/NBM. ....................................`;


    const summaryTableHtml = `
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Nama Siswa</th>
                    <th>Skor</th>
                    <th>Persen (%)</th>
                    <th>Jml. Benar</th>
                    <th>Status</th>
                    <th>Kelompok</th>
                    <th>RTL</th>
                    <th>Soal Salah (No.)</th>
                </tr>
            </thead>
            <tbody>
                ${students.map((student, index) => `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td class="text-left">${student.name}</td>
                        <td class="text-right">${student.rawScore}</td>
                        <td class="text-right">${student.percentage}%</td>
                        <td class="text-center">${student.correctAnswersCount} / ${totalQuestions}</td>
                        <td class="text-center">${student.status}</td>
                        <td class="text-center">${student.group}</td>
                        <td class="text-center">${student.rtl}</td>
                        <td class="text-left">${student.incorrectQuestionNumbers.join(', ') || '-'}</td>
                    </tr>`).join('')}
            </tbody>
        </table>`;

    const itemAnalysisTableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Soal</th>
                    <th>Jenis</th>
                    <th>Kunci</th>
                    <th>Respon (B/S/K)</th>
                    <th>Tingkat Kesulitan (P)</th>
                    <th>Kriteria P</th>
                    <th>Daya Pembeda (D)</th>
                    <th>Kriteria D</th>
                    <th>Analisis Pengecoh</th>
                </tr>
            </thead>
            <tbody>
                ${itemAnalysis.map(item => {
                    const wrongCount = item.numStudents - item.R - item.unansweredCount;
                    return `
                    <tr>
                        <td class="text-center">${item.questionId}</td>
                        <td class="text-center">${item.type}</td>
                        <td class="text-center">${item.key}</td>
                        <td class="text-center">${item.R} / ${wrongCount} / ${item.unansweredCount}</td>
                        <td class="text-center">${item.P}</td>
                        <td class="text-center">${item.P_criteria_plain}</td>
                        <td class="text-center">${item.D}</td>
                        <td class="text-center">${item.D_criteria_plain}</td>
                        ${renderDistractorHtml(item.distractorAnalysis, item.key)}
                    </tr>`;
                }).join('')}
            </tbody>
        </table>`;
    
    const chartContainer = document.getElementById('score-distribution-chart');
    let chartImage = '';
    if (chartContainer) {
        const svgElement = chartContainer.querySelector('svg');
        if (svgElement) {
            // Add a white background to the SVG for better printing
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "100%");
            rect.setAttribute("height", "100%");
            rect.setAttribute("fill", "#ffffff"); // white background
            svgElement.insertBefore(rect, svgElement.firstChild);

            const svgData = new XMLSerializer().serializeToString(svgElement);
            // Clean up by removing the added background
            svgElement.removeChild(rect);

            // btoa can fail on UTF-8 strings. Use this trick to encode properly.
            chartImage = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
    }


    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Laporan Analisis Nilai - ${mataPelajaran} ${kelasSemester}</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 2cm;
                }
                body { 
                    font-family: 'Arial', sans-serif; 
                    line-height: 1.4; 
                    font-size: 10pt;
                    color: #333;
                }
                .report-header { 
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 2rem; 
                    border-bottom: 2px solid #333;
                    padding-bottom: 1rem;
                }
                .report-header img { 
                    max-height: 80px;
                    width: auto;
                    max-width: 450px;
                    object-fit: contain;
                }
                .header-text { 
                    text-align: left;
                }
                .header-text h1 {
                    font-size: 16pt; 
                    font-weight: bold;
                    margin: 0;
                    line-height: 1.2;
                }
                .header-text p {
                    font-size: 12pt;
                    margin: 0;
                }
                .report-main-title {
                    text-align: center;
                    font-size: 14pt;
                    font-weight: bold;
                    margin-bottom: 2rem;
                    text-transform: uppercase;
                }
                .identity-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 2rem; 
                    font-size: 9pt;
                }
                .identity-table td { 
                    padding: 4px 0; 
                }
                h2 { 
                    font-size: 13pt; 
                    border-bottom: 2px solid #444; 
                    padding-bottom: 6px; 
                    margin-top: 2.5rem; 
                    margin-bottom: 1rem; 
                    page-break-after: avoid;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 1.5rem; 
                    font-size: 9pt; 
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                thead {
                    display: table-header-group;
                }
                th, td { 
                    border: 1px solid #ccc; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #e9e9e9; 
                    font-weight: bold;
                    text-align: center; 
                }
                td ul {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                }
                .chart-container { 
                    text-align: center; 
                    margin: 2rem 0; 
                    page-break-inside: avoid;
                }
                .chart-container img { 
                    max-width: 70%;
                    height: auto; 
                }
                .signature-box { 
                    width: 100%; 
                    margin-top: 5rem; 
                    font-size: 10pt; 
                    page-break-inside: avoid;
                }
                .signature-item { 
                    display: inline-block;
                    width: 48%;
                    text-align: center; 
                    line-height: 1.5;
                    vertical-align: top;
                }
                .signature-name { 
                    margin-top: 70px;
                    font-weight: bold;
                    border-bottom: 1px solid #333;
                    display: inline-block;
                    padding: 0 10px;
                }
                .text-right { text-align: right !important; }
                .text-center { text-align: center !important; }
                .text-left { text-align: left !important; }
            </style>
        </head>
        <body>
            <div class="report-header">
                <img src="${logoUrl}" alt="Logo Madrasah">
                <div class="header-text">
                    <h1>Laporan Analisis Hasil Belajar</h1>
                    <p>Tahun Ajaran ${tahunAjaran}</p>
                </div>
            </div>
            <h2 class="report-main-title">${reportTitle}</h2>
            <table class="identity-table">
                <tr><td style="width:25%;">Mata Pelajaran</td><td style="width:2%;">:</td><td style="width:33%;">${mataPelajaran}</td><td style="width:20%;">Tanggal Penilaian</td><td style="width:2%;">:</td><td style="width:18%;">${formattedAssessmentDate}</td></tr>
                <tr><td>Guru Mata Pelajaran</td><td>:</td><td>${guruMapel}</td><td>Tanggal Analisis</td><td>:</td><td>${formattedAnalysisDate}</td></tr>
                <tr><td>NIP/NBM Guru</td><td>:</td><td>${nipGuru}</td><td>Kelas / Semester</td><td>:</td><td>${kelasSemester}</td></tr>
                <tr><td>Tahun Ajaran</td><td>:</td><td>${tahunAjaran}</td><td>KKTP</td><td>:</td><td>${kktp}</td></tr>
                <tr><td style="vertical-align: top;">Capaian Pembelajaran</td><td style="vertical-align: top;">:</td><td colspan="4" style="text-align: left;">${capaianPembelajaran || '....................................'}</td></tr>
            </table>
            <div class="chart-container">
                <h2>Visualisasi Distribusi Skor Siswa</h2>
                ${chartImage ? `<img src="${chartImage}" alt="Grafik Distribusi Skor">` : '<p>Grafik tidak tersedia.</p>'}
                <p style="font-size: 9pt; margin-top: 10px;">Grafik menunjukkan sebaran perolehan skor siswa.</p>
            </div>
            <h2>Ringkasan Skor Siswa dan Rencana Tindak Lanjut (RTL)</h2>
            ${summaryTableHtml}
            <p style="font-size: 8pt;">Kelompok: KA (Pengayaan), KT (Reguler), KB (Remidi).</p>
            <h2>Analisis Butir Soal</h2>
            ${itemAnalysisTableHtml}
            <p style="font-size: 8pt;">* Respon (B/S/K): Jumlah jawaban Benar / Salah / Kosong.<br>P: Mudah (>0.70), Sedang (0.30-0.70), Sukar (<0.30).<br>D: Sangat Baik (>0.40), Baik (0.30-0.39), Cukup (0.20-0.29), Buruk (<0.20).<br>Pengecoh: A (Atas), B (Bawah). Pengecoh baik jika pemilih B > A.</p>
            <div class="signature-box">
                <div class="signature-item">
                    <span>Purbalingga, ${formattedAnalysisDate}</span>
                    <br>
                    <span>Mengetahui,<br>Kepala Madrasah</span>
                    <br><br><br>
                    <span class="signature-name">${kepalaMadrasah}</span>
                    <br>
                    <span>${nipKepalaText}</span>
                </div>
                <div class="signature-item">
                    <span>Purbalingga, ${formattedAnalysisDate}</span>
                    <br>
                    <span>Guru Mata Pelajaran</span>
                    <br><br><br>
                    <span class="signature-name">${guruMapel}</span>
                    <br>
                    <span>${nipGuruText}</span>
                </div>
            </div>
        </body>
        </html>`;
};

export const exportToCSV = (result: AnalysisResult, inputs: AnalysisInput) => {
    const { students, totalQuestions } = result;
    const { kktp, guruMapel, nipGuru, mataPelajaran, tahunAjaran, kelasSemester, assessmentType, capaianPembelajaran, assessmentDate, analysisDate } = inputs;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `ANALISIS HASIL ${assessmentType.toUpperCase()}\n`;
    csvContent += `Mata Pelajaran:,${mataPelajaran}\n`;
    csvContent += `Capaian Pembelajaran:,"${capaianPembelajaran.replace(/"/g, '""')}"\n`;
    csvContent += `Tahun Ajaran:,${tahunAjaran}\n`;
    csvContent += `Kelas / Semester:,${kelasSemester}\n`;
    csvContent += `Guru Mata Pelajaran:,${guruMapel}\n`;
    csvContent += `NIP/NBM Guru:,${nipGuru}\n`;
    csvContent += `KKTP:,${kktp}\n`;
    csvContent += `Tanggal Penilaian:,${assessmentDate}\n`;
    csvContent += `Tanggal Analisis:,${analysisDate}\n\n`;


    csvContent += "RINGKASAN SKOR SISWA\n";
    csvContent += "No,Nama Siswa,Skor,Skor Maks,Persentase (%),Jumlah Benar,Total Soal,Status,Kelompok,Rencana Tindak Lanjut,Nomor Soal Salah\n";
    students.forEach((student, index) => {
        const cleanName = `"${student.name.replace(/"/g, '""')}"`;
        const incorrectNos = `"${student.incorrectQuestionNumbers.join(', ')}"`;
        csvContent += `${index + 1},${cleanName},${student.rawScore},${student.maxScore},${student.percentage}%,${student.correctAnswersCount},${totalQuestions},${student.status},${student.group},${student.rtl},${incorrectNos}\n`;
    });
    csvContent += "\n";
    
    csvContent += "ANALISIS BUTIR SOAL\n";
    csvContent += `Total Siswa:,${students.length}\n`;
    const distractorHeaders = "Pilihan A (Total),Pilihan A (Atas),Pilihan A (Bawah),Pilihan B (Total),Pilihan B (Atas),Pilihan B (Bawah),Pilihan C (Total),Pilihan C (Atas),Pilihan C (Bawah),Pilihan D (Total),Pilihan D (Atas),Pilihan D (Bawah),Pilihan E (Total),Pilihan E (Atas),Pilihan E (Bawah)\n";
    csvContent += "Soal,Jenis,Kunci,Jml Benar,Jml Salah,Jml Kosong,Tingkat Kesulitan (P),Kriteria P,Daya Pembeda (D),Kriteria D," + distractorHeaders;
    result.itemAnalysis.forEach(item => {
        const wrongCount = item.numStudents - item.R - item.unansweredCount;
        let distractorRow = '';
        if (item.type === 'Pilihan Ganda' && item.distractorAnalysis) {
            const options = ['A', 'B', 'C', 'D', 'E'];
            options.forEach(opt => {
                const data = item.distractorAnalysis?.[opt];
                distractorRow += `${data?.totalCount ?? 0},${data?.upperGroupCount ?? 0},${data?.lowerGroupCount ?? 0},`;
            });
        } else {
             distractorRow = ',,,,,,,,,,,,,,,'; // 15 commas for empty distractor columns
        }

        csvContent += `${item.questionId},${item.type},${item.key},${item.R},${wrongCount},${item.unansweredCount},${item.P},${item.P_criteria_plain},${item.D},${item.D_criteria_plain},${distractorRow}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Analisis_Nilai_${mataPelajaran.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};