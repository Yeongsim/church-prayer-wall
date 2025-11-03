import React from 'react';
import { PrayerRequest } from '../types';
import PrayerItem from './PrayerItem';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface PrayerListProps {
  prayers: PrayerRequest[];
  pendingPrayers: PrayerRequest[];
  onDeletePrayer: (id: string) => void;
  onToggleMainPrayer: (id: string) => void;
  onApprovePrayer: (id: string) => void;
  onRejectPrayer: (id: string) => void;
  onUpdatePrayer: (id: string, newText: string) => void;
  onIncrementPrayedCount: (id: string) => void;
}

const PrayerList: React.FC<PrayerListProps> = ({ prayers, pendingPrayers, onDeletePrayer, onToggleMainPrayer, onApprovePrayer, onRejectPrayer, onUpdatePrayer, onIncrementPrayedCount }) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const mainPrayers = prayers.filter(p => p.isMain);
  const secondaryPrayers = prayers.filter(p => !p.isMain);

  return (
    <div className="space-y-8">
      {isAdmin && pendingPrayers.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-amber-300 flex items-center">
              <i className="fas fa-inbox text-amber-500 mr-3"></i>
              {t('pendingApprovalTitle')} ({pendingPrayers.length})
          </h3>
          <div className="space-y-3">
            {pendingPrayers.map(prayer => (
              <PrayerItem
                key={prayer.id}
                prayer={prayer}
                onApprove={() => onApprovePrayer(prayer.id)}
                onReject={() => onRejectPrayer(prayer.id)}
                onDeletePrayer={() => {}} // Not applicable
                onUpdatePrayer={onUpdatePrayer}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-sky-200 flex items-center">
              <i className="fas fa-cross text-sky-500 mr-3"></i>
              {t('mainPrayerTitle')}
          </h3>
          <div className="space-y-3">
            {mainPrayers.length > 0 ? (
              mainPrayers.map(prayer => (
                <PrayerItem 
                  key={prayer.id} 
                  prayer={prayer} 
                  onDeletePrayer={onDeletePrayer}
                  onDemote={() => onToggleMainPrayer(prayer.id)}
                  onUpdatePrayer={onUpdatePrayer}
                  onIncrementPrayedCount={onIncrementPrayedCount}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-gray-100 rounded-lg h-full flex flex-col justify-center">
                  <p className="text-gray-500">{t('noMainPrayer')}</p>
                  <p className="text-gray-400 text-sm">{t('promoteOne')}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-sky-200 flex items-center">
              <i className="fas fa-users text-sky-500 mr-3"></i>
              {t('communityRequestsTitle')}
          </h3>
          {secondaryPrayers.length > 0 ? (
              <div className="space-y-3">
              {secondaryPrayers.map(prayer => (
                  <PrayerItem 
                    key={prayer.id} 
                    prayer={prayer} 
                    onDeletePrayer={onDeletePrayer}
                    onPromote={() => onToggleMainPrayer(prayer.id)}
                    onUpdatePrayer={onUpdatePrayer}
                    onIncrementPrayedCount={onIncrementPrayedCount}
                  />
              ))}
              </div>
          ) : (
              <div className="text-center py-8 bg-gray-100 rounded-lg h-full flex flex-col justify-center">
                  <p className="text-gray-500">{t('noCommunityRequests')}</p>
                  <p className="text-gray-400 text-sm">{t('beTheFirst')}</p>
              </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PrayerList;