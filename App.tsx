import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PrayerList from './components/PrayerList';
import AddPrayerForm from './components/AddPrayerForm';
import ReminderSettings from './components/ReminderSettings';
import usePrayerState from './hooks/usePrayerState';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppSettingsProvider, useAppSettings } from './contexts/AppSettingsContext';
import { PrayerRequest } from './types';
import { translateText } from './services/geminiService';
import { locales } from './i18n/locales';

const AppContent: React.FC = () => {
  const { 
    prayers, 
    pendingPrayers,
    addPrayer, 
    submitForApproval,
    approvePrayer,
    rejectPrayer,
    deletePrayer, 
    toggleMainPrayer,
    updatePrayer,
    incrementPrayedCount,
  } = usePrayerState();
  const [reminderTime, setReminderTime] = useState<string | null>(() => localStorage.getItem('prayerReminderTime'));
  const timeoutIdRef = useRef<number | null>(null);
  const { language, setLanguage, isTranslating, setIsTranslating, t } = useLanguage();
  const [prayerTranslations, setPrayerTranslations] = useState<Record<string, Record<string, string>>>({});
  const { isAdmin } = useAuth();
  const { cityName } = useAppSettings();

  // Effect for handling translations
  useEffect(() => {
    const translatePrayers = async () => {
      const allPrayers = [...prayers, ...pendingPrayers];
      if (language === 'en' || allPrayers.length === 0) {
        setIsTranslating(false);
        return;
      }

      const languageName = locales[language]?.name || 'English';
      const translationsToFetch: { prayer: PrayerRequest, index: number }[] = [];

      allPrayers.forEach((prayer, index) => {
        if (!prayerTranslations[language]?.[prayer.id]) {
          translationsToFetch.push({ prayer, index });
        }
      });
      
      if (translationsToFetch.length > 0) {
        setIsTranslating(true);
        const newTranslations = await Promise.all(
          translationsToFetch.map(item => translateText(item.prayer.text, languageName))
        );
        
        setPrayerTranslations(currentTranslations => {
            const updatedLangTranslations = { ...(currentTranslations[language] || {}) };
            translationsToFetch.forEach((item, i) => {
                updatedLangTranslations[item.prayer.id] = newTranslations[i];
            });
            return {
                ...currentTranslations,
                [language]: updatedLangTranslations
            };
        });

        setIsTranslating(false);
      }
    };
    translatePrayers();
  }, [language, prayers, pendingPrayers, prayerTranslations, setIsTranslating]);

  // Translate a single new prayer when an admin adds it
  const handleAddPrayer = async (text: string) => {
    const newPrayer = addPrayer(text);
    if (language !== 'en' && newPrayer) {
        const languageName = locales[language]?.name || 'English';
        const translatedText = await translateText(text, languageName);
        setPrayerTranslations(current => ({
            ...current,
            [language]: {
                ...current[language],
                [newPrayer.id]: translatedText,
            }
        }));
    }
  };

  const handleSubmitForApproval = (text: string) => {
    submitForApproval(text);
  };

  const handleUpdatePrayer = (id: string, newText: string) => {
    updatePrayer(id, newText);
    // Clear out old translations for the edited prayer
    setPrayerTranslations(current => {
      const newTranslations = { ...current };
      for (const lang in newTranslations) {
        if (newTranslations[lang]?.[id]) {
          delete newTranslations[lang][id];
        }
      }
      return newTranslations;
    });
  };

  const getTranslatedPrayers = (prayerList: PrayerRequest[]) => {
    if (language === 'en') return prayerList;
    return prayerList.map(p => ({
      ...p,
      text: prayerTranslations[language]?.[p.id] || p.text,
    }));
  };

  const displayedPrayers = getTranslatedPrayers(prayers);
  const displayedPendingPrayers = getTranslatedPrayers(pendingPrayers);

  useEffect(() => {
    const scheduleNotification = () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (!reminderTime || Notification.permission !== 'granted' || prayers.length === 0) {
        return;
      }

      const [hours, minutes] = reminderTime.split(':').map(Number);
      const now = new Date();
      const nextReminder = new Date();
      nextReminder.setHours(hours, minutes, 0, 0);

      if (now > nextReminder) {
        nextReminder.setDate(nextReminder.getDate() + 1);
      }
      
      const timeToReminder = nextReminder.getTime() - now.getTime();
      const prayerToShow = prayers[Math.floor(Math.random() * prayers.length)];

      timeoutIdRef.current = window.setTimeout(() => {
        new Notification("It's time to pray", {
          body: `Let's pray for: ${prayerToShow.text}`,
          icon: '/vite.svg' 
        });
        scheduleNotification(); // Reschedule for the next day
      }, timeToReminder);
    };
    
    scheduleNotification();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderTime, prayers]);

  const handleSetReminder = (time: string | null) => {
    if (time) {
      localStorage.setItem('prayerReminderTime', time);
      setReminderTime(time);
    } else {
      localStorage.removeItem('prayerReminderTime');
      setReminderTime(null);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="space-y-8">
          <AddPrayerForm 
            onAddPrayer={isAdmin ? handleAddPrayer : handleSubmitForApproval} 
            isAdmin={isAdmin}
          />
          <PrayerList 
            prayers={displayedPrayers} 
            pendingPrayers={displayedPendingPrayers}
            onDeletePrayer={deletePrayer} 
            onToggleMainPrayer={toggleMainPrayer}
            onApprovePrayer={approvePrayer}
            onRejectPrayer={rejectPrayer}
            onUpdatePrayer={handleUpdatePrayer}
            onIncrementPrayedCount={incrementPrayedCount}
          />
          <ReminderSettings onSetReminder={handleSetReminder} initialTime={reminderTime} />
        </div>
      </main>
       <footer className="text-center py-6 text-gray-500 text-sm">
        <p>{t('footerText', { cityName })}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <LanguageProvider>
        <AppSettingsProvider>
            <AppContent />
        </AppSettingsProvider>
    </LanguageProvider>
  </AuthProvider>
);

export default App;