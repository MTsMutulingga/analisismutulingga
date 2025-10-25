import React, { useState, useRef, useEffect } from 'react';

// The default logo is now a landscape placeholder to guide the user.
const DEFAULT_LOGO = "https://placehold.co/672x120/3b82f6/ffffff?text=LOGO+MADRASAH+ANDA";
const LOGO_STORAGE_KEY = 'customLogoUrl';

const Header: React.FC = () => {
    const [logoUrl, setLogoUrl] = useState(''); // Start with empty to trigger useEffect loading
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
        // Set default logo only if there's no saved logo
        setLogoUrl(savedLogo || DEFAULT_LOGO);
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                try {
                    // Basic validation for image size to avoid filling up localStorage
                    if (result.length > 2 * 1024 * 1024) { // 2MB limit
                        alert("Ukuran gambar terlalu besar (maks 2MB). Silakan pilih gambar yang lebih kecil.");
                        return;
                    }
                    localStorage.setItem(LOGO_STORAGE_KEY, result);
                    setLogoUrl(result);
                } catch (e) {
                    alert("Gagal menyimpan logo. Penyimpanan browser mungkin penuh.");
                    console.error("Error saving logo to localStorage", e);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleResetLogo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Apakah Anda yakin ingin menghapus logo kustom dan mengembalikan ke default?")) {
            localStorage.removeItem(LOGO_STORAGE_KEY);
            setLogoUrl(DEFAULT_LOGO);
        }
    };

    return (
        <header className="flex flex-col items-center justify-center text-center gap-3 mb-8">
            <div 
                className="group relative w-full max-w-xl cursor-pointer rounded-lg bg-gray-100/75 shadow-inner flex items-center justify-center min-h-[120px] p-2"
                onClick={handleUploadClick} 
                title="Klik untuk mengubah logo"
                aria-label="Unggah logo kustom"
            >
                <img 
                    src={logoUrl} 
                    alt="Logo Madrasah" 
                    className="max-h-28 max-w-full object-contain transition-opacity duration-300 group-hover:opacity-75"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = DEFAULT_LOGO; // Fallback to default placeholder on error
                    }}
                />
                <div className="no-print absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-3">
                        <button className="text-white text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md shadow-lg">Ubah Logo</button>
                        {logoUrl !== DEFAULT_LOGO && localStorage.getItem(LOGO_STORAGE_KEY) && (
                             <button onClick={handleResetLogo} className="text-white text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md shadow-lg">Reset</button>
                        )}
                    </div>
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
            />
            
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 tracking-tight">
                    ANALISIS BUTIR SOAL
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Aplikasi Analisis Penilaian Hasil Belajar</p>
            </div>
        </header>
    );
};

export default Header;