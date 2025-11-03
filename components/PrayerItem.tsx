import React, { useState, useRef, useEffect } from 'react';
import { PrayerRequest } from '../types';
import { generateSamplePrayer } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { locales } from '../i18n/locales';


interface PrayerItemProps {
  prayer: PrayerRequest;
  onDeletePrayer: (id: string) => void;
  onPromote?: () => void;
  onDemote?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onUpdatePrayer?: (id: string, newText: string) => void;
  onIncrementPrayedCount?: (id: string) => void;
}

const PrayerItem: React.FC<PrayerItemProps> = ({ prayer, onDeletePrayer, onPromote, onDemote, onApprove, onReject, onUpdatePrayer, onIncrementPrayedCount }) => {
  const [samplePrayer, setSamplePrayer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(prayer.text);
  const [isEditingSample, setIsEditingSample] = useState(false);
  const [editedSampleText, setEditedSampleText] = useState("");
  
  const confirmTimeoutRef = useRef<number | null>(null);
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleGeneratePrayer = async () => {
    setIsLoading(true);
    setSamplePrayer(null);
    const languageName = locales[language]?.name || 'English';
    const generated = await generateSamplePrayer(prayer.text, languageName);
    setSamplePrayer(generated);
    setEditedSampleText(generated);
    setIsLoading(false);
  };

  const handleHidePrayer = () => {
    setSamplePrayer(null);
    setIsEditingSample(false);
  }

  const startDeleteConfirmation = () => {
    setIsConfirmingDelete(true);
    confirmTimeoutRef.current = window.setTimeout(() => {
      setIsConfirmingDelete(false);
    }, 5000); // 5 seconds to confirm
  };

  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
    }
  };

  const confirmDelete = () => {
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
    }
    onDeletePrayer(prayer.id);
  };
  
  const handleSaveEdit = () => {
    if (editedText.trim() && onUpdatePrayer) {
      onUpdatePrayer(prayer.id, editedText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(prayer.text);
    setIsEditing(false);
  }

  const handleSaveSampleEdit = () => {
    setSamplePrayer(editedSampleText);
    setIsEditingSample(false);
  };
  
  const handleCancelSampleEdit = () => {
    setEditedSampleText(samplePrayer || '');
    setIsEditingSample(false);
  };

  const handleAmenClick = () => {
    if (onIncrementPrayedCount) {
        onIncrementPrayedCount(prayer.id);
    }
  };

  const isPending = !!(onApprove && onReject);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${isPending ? 'border-amber-300' : 'border-gray-200'} transition-all duration-300 ease-in-out hover:shadow-md ${!isPending && !isEditing && 'hover:-translate-y-px'} group`}>
      <div className="flex justify-between items-start gap-4">
        {isEditing ? (
          <div className="flex-grow">
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full px-2 py-1 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-sm font-medium"
              rows={2}
            />
            <div className="flex items-center gap-2 mt-2">
              <button onClick={handleSaveEdit} className="text-sm bg-sky-500 text-white font-bold py-1 px-3 rounded-md hover:bg-sky-600">{t('saveButton')}</button>
              <button onClick={handleCancelEdit} className="text-sm text-gray-600 hover:text-gray-800">{t('cancelButton')}</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-800 flex-grow pt-1">
              {prayer.text}
            </p>
            <div className="flex items-center space-x-3 flex-shrink-0">
                {isAdmin && onUpdatePrayer && (
                  <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-sky-600 transition-colors" title={t('editTooltip')}>
                    <i className="fas fa-pencil-alt text-xs"></i>
                  </button>
                )}
                {!isPending && isAdmin && prayer.isMain && onDemote && (
                    <button onClick={onDemote} className="text-gray-400 hover:text-sky-600 transition-colors" title={t('demoteTooltip')}>
                        <i className="fas fa-arrow-down"></i>
                    </button>
                )}
                {!isPending && !prayer.isMain && (
                    <>
                    {isAdmin && onPromote && (
                        <button onClick={onPromote} className="text-gray-400 hover:text-amber-500 transition-colors" title={t('promoteTooltip')}>
                            <i className="fas fa-crown"></i>
                        </button>
                    )}
                    {isAdmin && 
                        <div className="relative h-5 w-5 flex items-center justify-center">
                            {isConfirmingDelete ? (
                                <div className="flex items-center gap-2 text-xs absolute right-0 bg-white z-10 p-1 rounded shadow">
                                    <span className="text-gray-600">{t('deleteConfirm')}</span>
                                    <button onClick={confirmDelete} className="font-bold text-red-600 hover:text-red-800">{t('yes')}</button>
                                    <button onClick={cancelDelete} className="text-gray-500 hover:text-gray-800">{t('no')}</button>
                                </div>
                            ) : (
                                <button
                                    onClick={startDeleteConfirmation}
                                    className="absolute inset-0 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title={t('deleteTooltip')}
                                    aria-label={`Delete prayer for ${prayer.text}`}
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            )}
                        </div>
                    }
                    </>
                )}
            </div>
          </>
        )}
      </div>
      
      {!isPending && !isEditing && (
        <div className="mt-3">
            <div className="flex items-center justify-between">
                <div>
                    {!samplePrayer && !isLoading && (
                        <button
                            onClick={handleGeneratePrayer}
                            className="text-sm text-sky-600 hover:text-sky-800 font-semibold transition-colors"
                        >
                            <i className="fas fa-comment-dots mr-2"></i>
                            {t('samplePrayerButton')}
                        </button>
                    )}
                </div>

                {onIncrementPrayedCount && (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleAmenClick}
                            className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-800 font-semibold transition-colors bg-pink-100 hover:bg-pink-200 px-3 py-1 rounded-full"
                            title={t('prayedTooltip')}
                        >
                            <i className="fas fa-heart text-xs"></i>
                            <span>{t('amenButton')}</span>
                        </button>
                        {prayer.prayedCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500" title={`${prayer.prayedCount} prayers`}>
                                <i className="fas fa-hands-praying"></i>
                                <span>{prayer.prayedCount}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {isLoading && (
            <div className="flex items-center text-sm text-gray-500 mt-2">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t('composingPrayer')}
            </div>
            )}
            <div className={`transition-all duration-500 ease-in-out ${samplePrayer ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            {samplePrayer && (
                <div className="bg-sky-50 p-3 rounded-md border border-sky-200 mt-2">
                  {isAdmin && isEditingSample ? (
                    <div>
                      <textarea
                        value={editedSampleText}
                        onChange={(e) => setEditedSampleText(e.target.value)}
                        className="w-full px-2 py-1 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-sm text-gray-600 italic"
                        rows={3}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={handleSaveSampleEdit} className="text-xs bg-sky-500 text-white font-bold py-1 px-2 rounded-md hover:bg-sky-600">{t('saveButton')}</button>
                        <button onClick={handleCancelSampleEdit} className="text-xs text-gray-500 hover:text-gray-700">{t('cancelButton')}</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 italic">"{samplePrayer}"</p>
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={handleHidePrayer} className="text-xs text-gray-400 hover:text-gray-600">
                            {t('hide')}
                        </button>
                        {isAdmin && (
                            <button onClick={() => setIsEditingSample(true)} className="text-xs text-gray-400 hover:text-sky-600" title={t('editSamplePrayerButton')}>
                                <i className="fas fa-pencil-alt text-xs"></i>
                            </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            )}
            </div>
        </div>
      )}

      {isPending && !isEditing && (
        <div className="mt-4 flex items-center justify-end gap-3">
            <button onClick={onReject} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors flex items-center gap-2">
                <i className="fas fa-times-circle"></i>{t('rejectButton')}
            </button>
            <button onClick={onApprove} className="text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors px-3 py-1 rounded-md flex items-center gap-2">
                <i className="fas fa-check-circle"></i>{t('approveButton')}
            </button>
        </div>
      )}
    </div>
  );
};

export default PrayerItem;