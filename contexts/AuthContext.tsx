import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password check. In a real app, this should be a secure auth flow.
const ADMIN_PASSWORD = 'admin123';

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        return sessionStorage.getItem('isAdmin') === 'true';
    });

    const login = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('isAdmin', 'true');
            setIsAdmin(true);
            return true;
        }
        alert('Incorrect password.');
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('isAdmin');
        setIsAdmin(false);
    };
    
    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
