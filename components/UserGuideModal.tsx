import React from 'react';
import jsPDF from 'jspdf';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const contentElement = document.getElementById('guide-content');
        if (contentElement) {
            // Split the text into lines to handle formatting better in the PDF
            const textLines = contentElement.innerText.split('\n');
            
            let y = 15;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 10;
            const lineHeight = 7;
            
            doc.setFontSize(16);
            doc.text("Petunjuk Kerja Aplikasi Analisis Nilai", margin, y);
            y += lineHeight * 2;
            doc.setFontSize(10);

            textLines.forEach(line => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                
                // Add a little extra space for headings
                if (line.startsWith("Langkah") || line.startsWith("Lampiran") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
                    y += lineHeight / 2;
                }
                
                const splitText = doc.splitTextToSize(line, doc.internal.pageSize.width - margin * 2);
                doc.text(splitText, margin, y);
                y += splitText.length * lineHeight;

                if (line.startsWith("Langkah") || line.startsWith("Lampiran")) {
                    y += lineHeight / 2;
                }
            });

            doc.save('petunjuk_kerja_analisis_nilai.pdf');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold">Petunjuk Kerja Aplikasi</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div id="guide-content" className="flex-grow overflow-y-auto pr-4 space-y-6 text-gray-700 leading-relaxed">
                    <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Alur Kerja Aplikasi</h4>
                        <ol className="list-decimal list-inside space-y-3">
                            <li>
                                <strong>Langkah 1: Mengisi Identitas Laporan</strong>
                                <p className="pl-6 text-sm">
                                    Isi semua informasi yang diperlukan pada bagian "1. Identitas Laporan". Data ini akan digunakan untuk kop laporan yang akan dicetak/diekspor. Anda dapat menyimpan data identitas ini (kecuali tanggal) di browser dengan tombol "Simpan Identitas Saja" agar tidak perlu mengisi ulang di kemudian hari.
                                </p>
                            </li>
                            <li>
                                <strong>Langkah 2: Mengisi Butir Soal dan Kunci Jawaban</strong>
                                <p className="pl-6 text-sm">
                                    Pada bagian "2. Butir Soal dan Kunci Jawaban", masukkan kunci, skor per soal, dan jenis soal.
                                    <br/>- Gunakan tombol "Tambah Soal" untuk menambah jumlah butir soal.
                                    <br/>- Untuk Pilihan Ganda Kompleks, tulis kunci jawaban tanpa spasi, contoh: `AB` atau `ACD`.
                                    <br/>- Untuk mempercepat, Anda bisa menggunakan "Impor Kunci Jawaban" dan menempel daftar kunci dari spreadsheet.
                                </p>
                            </li>
                            <li>
                                <strong>Langkah 3: Mengisi Jawaban Siswa</strong>
                                <p className="pl-6 text-sm">
                                    Ada tiga cara untuk memasukkan jawaban siswa di bagian "3. Jawaban Siswa":
                                    <br/>- **Tempel dari Spreadsheet (Disarankan):** Salin data dari Excel/Sheets (Kolom pertama nama, kolom berikutnya jawaban). Lalu tempel ke area teks besar.
                                    <br/>- **Pindai LJK dengan AI:** Gunakan kamera atau unggah foto LJK untuk mengekstrak nama dan jawaban secara otomatis.
                                    <br/>- **Input Manual:** Isi nama dan jawaban siswa satu per satu pada tabel di bagian bawah.
                                </p>
                            </li>
                            <li>
                                <strong>Langkah 4: Lakukan Analisis dan Ekspor</strong>
                                <p className="pl-6 text-sm">
                                    Setelah semua data terisi, klik tombol "Lakukan Analisis". Hasil akan muncul di bawah. Anda bisa menyimpan hasil analisis dalam format CSV (Excel), HTML, atau mencetaknya langsung sebagai PDF.
                                </p>
                            </li>
                        </ol>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Lampiran: Detail Perhitungan Analisis</h4>
                        <div className="space-y-4 text-sm">
                             <p className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <strong>Sumber dan Landasan Teori:</strong> Rumus-rumus yang digunakan dalam aplikasi ini adalah metode standar yang mapan dalam bidang evaluasi pendidikan dan psikometri, yang berakar pada <strong>Teori Tes Klasik (Classical Test Theory - CTT)</strong>. Metodologi ini umum digunakan oleh guru dan lembaga pendidikan untuk analisis butir soal.
                            </p>
                            <p>
                                <strong>1. Pengelompokan Siswa (27% Atas & Bawah):</strong>
                                <br />
                                Metode ini dipopulerkan oleh Truman Lee Kelley (1939) yang menemukan bahwa 27% adalah angka optimal untuk memaksimalkan perbedaan antar kelompok sambil menjaga ukuran sampel tetap stabil secara statistik. Kelompok ini digunakan untuk menghitung Daya Pembeda.
                            </p>
                            <p>
                                <strong>2. Tingkat Kesulitan (P - Proporsi):</strong>
                                <br />
                                Ini adalah formula paling dasar dalam CTT untuk mengukur proporsi siswa yang menjawab soal dengan benar. Rumusnya: `P = Jumlah Jawaban Benar (R) / Jumlah Seluruh Siswa (N)`.
                                <br />- **Sukar:** P &lt; 0.30
                                <br />- **Sedang:** 0.30 ≤ P ≤ 0.70
                                <br />- **Mudah:** P &gt; 0.70
                            </p>
                            <p>
                                <strong>3. Daya Pembeda (D - Diskriminasi):</strong>
                                <br />
                                Ini mengukur kemampuan soal untuk membedakan antara siswa "pintar" (Kelompok Atas) dan siswa "kurang pintar" (Kelompok Bawah). Soal yang baik akan lebih banyak dijawab benar oleh Kelompok Atas. Rumusnya: `D = (Benar di Kelompok Atas (RU) - Benar di Kelompok Bawah (RL)) / Jumlah Siswa di Satu Kelompok (n)`.
                                <br />- **Sangat Baik:** D &gt; 0.40
                                <br />- **Baik:** 0.30 ≤ D &lt; 0.40
                                <br />- **Cukup:** 0.20 ≤ D &lt; 0.30
                                <br />- **Buruk:** D &lt; 0.20 (Soal ini perlu direvisi atau diganti)
                            </p>
                            <p>
                                <strong>4. Analisis Efektivitas Pengecoh (Distraktor):</strong>
                                <br />
                                Fitur ini (khusus soal Pilihan Ganda) menganalisis seberapa baik pilihan jawaban yang salah (pengecoh) berfungsi. Pengecoh yang **baik (✔️)** adalah yang dipilih oleh lebih banyak siswa dari Kelompok Bawah daripada Kelompok Atas. Ini menunjukkan bahwa pengecoh tersebut masuk akal namun salah, sehingga efektif menjebak siswa yang belum sepenuhnya paham materi. Pengecoh yang **buruk (❌)** adalah kebalikannya dan perlu ditinjau.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                    <button onClick={handleDownloadPdf} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">Unduh sebagai PDF</button>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default UserGuideModal;