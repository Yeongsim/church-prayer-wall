import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { locales } from '../i18n/locales';

const LanguageSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectLanguage = (langCode: string) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <i className="fas fa-globe text-gray-600"></i>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-30 ring-1 ring-black ring-opacity-5">
                    <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {Object.entries(locales).map(([code, { name, flag }]) => (
                            <li key={code}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSelectLanguage(code);
                                    }}
                                    className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${language === code ? 'font-bold' : ''}`}
                                    role="menuitem"
                                >
                                    <span className="mr-3 text-lg">{flag}</span>
                                    {name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
