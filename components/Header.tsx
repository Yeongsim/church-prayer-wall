import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppSettings } from '../contexts/AppSettingsContext';

const Header: React.FC = () => {
  const { t, isTranslating } = useLanguage();
  const { isAdmin, login, logout } = useAuth();
  const { cityName, setCityName } = useAppSettings();
  
  const [clickCount, setClickCount] = useState(0);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [editedCity, setEditedCity] = useState(cityName);
  const clickTimer = React.useRef<number | null>(null);

  const handleTitleClick = () => {
    if (isAdmin) return;

    if(clickTimer.current) {
        clearTimeout(clickTimer.current);
    }
    clickTimer.current = window.setTimeout(() => {
        setClickCount(0);
    }, 1500); // Reset after 1.5 seconds of inactivity

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      setClickCount(0);
      if(clickTimer.current) clearTimeout(clickTimer.current);
      const password = prompt('Enter admin password:');
      if (password !== null) {
        login(password);
      }
    }
  };

  const handleCityEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCityName(editedCity);
    setIsEditingCity(false);
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center justify-center text-center flex-grow">
            <i className="fas fa-dove text-3xl text-sky-500 mr-4"></i>
            <div className="relative">
              {isEditingCity ? (
                  <form onSubmit={handleCityEditSubmit}>
                      <input
                          type="text"
                          value={editedCity}
                          onChange={(e) => setEditedCity(e.target.value)}
                          onBlur={handleCityEditSubmit}
                          className="text-2xl md:text-3xl font-bold text-gray-800 bg-gray-100 border-b-2 border-sky-500 focus:outline-none text-center"
                          autoFocus
                      />
                  </form>
              ) : (
                <h1 onClick={handleTitleClick} className={`text-2xl md:text-3xl font-bold text-gray-800 ${!isAdmin ? 'cursor-pointer' : ''}`} title={!isAdmin ? 'Click 5 times for admin login' : ''}>
                    {t('appTitle', { cityName })}
                    {isAdmin && (
                        <button onClick={() => { setIsEditingCity(true); setEditedCity(cityName); }} className="ml-2 text-sm text-gray-400 hover:text-sky-500" title={t('editCityTooltip')}>
                            <i className="fas fa-pencil-alt"></i>
                        </button>
                    )}
                </h1>
              )}
            </div>
        </div>
        <div className="flex items-center space-x-4">
            {isAdmin && (
              <>
                <span className="hidden sm:inline text-xs font-bold uppercase text-sky-600 bg-sky-100 px-2 py-1 rounded">{t('adminMode')}</span>
                <button onClick={logout} className="text-gray-500 hover:text-red-600" title={t('logoutTooltip')}>
                  <i className="fas fa-sign-out-alt text-lg"></i>
                </button>
              </>
            )}
            {isTranslating && <i className="fas fa-spinner fa-spin text-sky-500"></i>}
            <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
