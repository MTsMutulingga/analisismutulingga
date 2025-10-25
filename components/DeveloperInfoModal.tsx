import React from 'react';

interface DeveloperInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DeveloperInfoModal: React.FC<DeveloperInfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Info Pengembang</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Tutup">&times;</button>
                </div>
                <div className="space-y-3 text-gray-700">
                    <p className="font-semibold text-lg text-gray-900">Siswogo</p>
                    <p>Seorang guru di MTs Muhammadiyah 01 Purbalingga.</p>
                    <p>
                        CP: <a href="tel:+6285225400579" className="text-blue-600 hover:underline">085225400579</a>
                    </p>
                     <p>
                        Kunjungi di <a href="https://github.com/siswogo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a> untuk melihat proyek lainnya.
                    </p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default DeveloperInfoModal;