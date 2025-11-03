import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AddPrayerFormProps {
  onAddPrayer: (text: string) => void;
  isAdmin: boolean;
}

const AddPrayerForm: React.FC<AddPrayerFormProps> = ({ onAddPrayer, isAdmin }) => {
  const [text, setText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddPrayer(text.trim());
      setText('');
      if (!isAdmin) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000); // Message disappears after 5 seconds
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <i className="fas fa-plus-circle text-sky-500 mr-3"></i>
        {t('addRequestTitle')}
      </h3>
      {showSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-4" role="alert">
          <p>{t('submissionSuccessMessage')}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prayerText" className="block text-sm font-medium text-gray-600 mb-1">
            {t('prayerRequestLabel')}
          </label>
          <textarea
            id="prayerText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('prayerRequestPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 ease-in-out flex items-center justify-center"
        >
          <i className="fas fa-paper-plane mr-2"></i>
          {isAdmin ? t('addDirectlyButton') : t('submitForApprovalButton')}
        </button>
      </form>
    </div>
  );
};

export default AddPrayerForm;