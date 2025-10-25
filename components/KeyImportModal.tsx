import React, { useState, useEffect } from 'react';

interface KeyImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (keys: string[]) => void;
    numberOfQuestions: number;
}

const KeyImportModal: React.FC<KeyImportModalProps> = ({ isOpen, onClose, onImport, numberOfQuestions }) => {
    const [keysText, setKeysText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setKeysText('');
        }
    }, [isOpen]);

    const handleImport = () => {
        const keys = keysText.split('\n').map(k => k.trim()).filter(Boolean);
        if (keys.length > 0) {
            onImport(keys);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Impor Kunci Jawaban</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        Tempel kunci jawaban di sini, satu kunci per baris. Jumlah baris yang Anda tempel akan menyesuaikan jumlah soal.
                        Saat ini ada <strong>{numberOfQuestions}</strong> soal.
                    </p>
                    <textarea
                        value={keysText}
                        onChange={(e) => setKeysText(e.target.value)}
                        className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={"Contoh:\nA\nB\nC\nD,E\nBENAR"}
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Batal</button>
                    <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white rounded-md">Impor Kunci</button>
                </div>
            </div>
        </div>
    );
};

export default KeyImportModal;
