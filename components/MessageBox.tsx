import React, { useEffect, useState } from 'react';
import type { Message } from '../types.ts';

interface MessageBoxProps {
    message: Message | null;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [message]);

    if (!message) return null;

    const bgColor = message.type === 'error' ? 'bg-red-600' : 'bg-blue-600';

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-opacity duration-300 no-print ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`${bgColor} text-white p-3 rounded-lg shadow-xl flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{message.text}</span>
            </div>
        </div>
    );
};

export default MessageBox;