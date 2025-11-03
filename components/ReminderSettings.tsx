import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ReminderSettingsProps {
  onSetReminder: (time: string | null) => void;
  initialTime: string | null;
}

const ReminderSettings: React.FC<ReminderSettingsProps> = ({ onSetReminder, initialTime }) => {
  const [time, setTime] = useState(initialTime || '');
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const { t } = useLanguage();

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted' && time) {
      onSetReminder(time);
    }
  };
  
  const handleSetTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (newTime && notificationPermission === 'granted') {
      onSetReminder(newTime);
    }
  };

  const handleClearReminder = () => {
    setTime('');
    onSetReminder(null);
  };
  
  if (notificationPermission === 'denied') {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm" role="alert">
        <p className="font-bold">{t('notificationsBlockedTitle')}</p>
        <p>{t('notificationsBlockedBody')}</p>
      </div>
    );
  }
  
  if (notificationPermission !== 'granted') {
    return (
      <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 rounded-md shadow-sm flex flex-col sm:flex-row items-center justify-between">
        <div>
          <p className="font-bold">{t('reminderPromptTitle')}</p>
          <p className="text-sm">{t('reminderPromptBody')}</p>
        </div>
        <button
          onClick={requestNotificationPermission}
          className="mt-3 sm:mt-0 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          <i className="fas fa-bell mr-2"></i>{t('enableReminders')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
        <i className="fas fa-clock text-sky-500 mr-3"></i>
        {t('reminderSettingsTitle')}
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <p className="text-gray-600">{t('remindMeAt')}</p>
        <input
          type="time"
          value={time}
          onChange={handleSetTime}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {time && (
            <button
                onClick={handleClearReminder}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                title={t('clearReminderTooltip')}
            >
                <i className="fas fa-times-circle mr-1"></i> {t('clear')}
            </button>
        )}
      </div>
    </div>
  );
};

export default ReminderSettings;