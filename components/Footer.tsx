import React from 'react';

interface FooterProps {
    onOpenDeveloperInfo: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenDeveloperInfo }) => {
    return (
        <footer className="text-center py-6 mt-8 no-print">
            <p className="text-sm text-gray-500">
                Dibuat dengan ❤️ oleh <button onClick={onOpenDeveloperInfo} className="font-semibold text-blue-600 hover:underline focus:outline-none bg-transparent border-none p-0 cursor-pointer transition-colors">Siswogo</button>.
            </p>
        </footer>
    );
};

export default Footer;