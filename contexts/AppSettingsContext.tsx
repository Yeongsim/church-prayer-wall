import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

interface AppSettingsContextType {
  cityName: string;
  setCityName: (name: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [cityName, setCityNameState] = useState<string>(() => {
        return localStorage.getItem('cityName') || 'Halifax';
    });

    const setCityName = (name: string) => {
        const trimmedName = name.trim();
        if (trimmedName) {
            localStorage.setItem('cityName', trimmedName);
            setCityNameState(trimmedName);
        }
    };
    
    return (
        <AppSettingsContext.Provider value={{ cityName, setCityName }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = (): AppSettingsContextType => {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
};
