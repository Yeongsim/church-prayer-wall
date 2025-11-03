import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { translations, TranslationKey } from '../i18n/locales';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey, options?: Record<string, string>) => string;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => localStorage.getItem('appLanguage') || 'en');
    const [isTranslating, setIsTranslating] = useState(false);

    const setLanguage = (lang: string) => {
        localStorage.setItem('appLanguage', lang);
        setLanguageState(lang);
    };

    const t = (key: TranslationKey, options?: Record<string, string>): string => {
        let translation = translations[language]?.[key] || translations['en'][key];
        if (options && translation) {
            Object.keys(options).forEach(placeholder => {
                translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), options[placeholder]);
            });
        }
        return translation || key;
    };
    
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating, setIsTranslating }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
