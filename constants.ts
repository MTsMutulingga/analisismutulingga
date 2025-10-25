import type { AnalysisInput } from './types.ts';

export const DEFAULT_INPUTS: AnalysisInput = {
    guruMapel: '',
    nipGuru: '',
    mataPelajaran: '',
    tahunAjaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    kelasSemester: '',
    assessmentType: 'Penilaian Harian',
    assessmentDate: new Date().toISOString().split('T')[0],
    analysisDate: new Date().toISOString().split('T')[0],
    kktp: 70,
    kepalaMadrasah: '',
    nipKepala: '',
    questions: Array.from({ length: 10 }, () => ({ key: '', score: 10, type: 'Pilihan Ganda' })),
    studentData: [],
    capaianPembelajaran: '',
};