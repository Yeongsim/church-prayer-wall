import { useState, useEffect } from 'react';
import { PrayerRequest } from '../types';

const initialPrayers: Omit<PrayerRequest, 'id'>[] = [
  { text: 'A great gospel movement in our city, Halifax.', isMain: true, prayedCount: 15 },
  { text: 'For our sister Jane, who is battling sickness.', isMain: false, prayedCount: 27 },
  { text: 'Guidance and favor for John\'s visa application process.', isMain: false, prayedCount: 8 },
  { text: 'Strength and unity for a new marriage in our community.', isMain: false, prayedCount: 12 },
];

const usePrayerState = () => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => {
    try {
      const storedPrayers = localStorage.getItem('prayerList');
      if (storedPrayers) {
        return JSON.parse(storedPrayers).map((p: any) => ({ ...p, prayedCount: p.prayedCount || 0 }));
      }
      return initialPrayers.map((p, i) => ({ ...p, id: `initial-${i}` }));
    } catch (error) {
      console.error('Error reading prayers from localStorage', error);
      return initialPrayers.map((p, i) => ({ ...p, id: `initial-${i}` }));
    }
  });

  const [pendingPrayers, setPendingPrayers] = useState<PrayerRequest[]>(() => {
    try {
      const storedPending = localStorage.getItem('pendingPrayerList');
      if (storedPending) {
        return JSON.parse(storedPending).map((p: any) => ({ ...p, prayedCount: p.prayedCount || 0 }));
      }
      return [];
    } catch (error) {
      console.error('Error reading pending prayers from localStorage', error);
      return [];
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem('prayerList', JSON.stringify(prayers));
    } catch (error) {
      console.error('Error writing prayers to localStorage', error);
    }
  }, [prayers]);

  useEffect(() => {
    try {
      localStorage.setItem('pendingPrayerList', JSON.stringify(pendingPrayers));
    } catch (error) {
      console.error('Error writing pending prayers to localStorage', error);
    }
  }, [pendingPrayers]);


  const addPrayer = (text: string): PrayerRequest => {
    const newPrayer: PrayerRequest = {
      id: new Date().toISOString(),
      text,
      isMain: false,
      prayedCount: 0,
    };
    setPrayers(prevPrayers => [...prevPrayers, newPrayer]);
    return newPrayer;
  };

  const submitForApproval = (text: string): void => {
    const newPrayer: PrayerRequest = {
        id: new Date().toISOString(),
        text,
        isMain: false,
        prayedCount: 0,
    };
    setPendingPrayers(prev => [...prev, newPrayer]);
  };

  const approvePrayer = (id: string): void => {
    const prayerToApprove = pendingPrayers.find(p => p.id === id);
    if (prayerToApprove) {
        setPendingPrayers(prev => prev.filter(p => p.id !== id));
        setPrayers(prev => [...prev, { ...prayerToApprove, prayedCount: prayerToApprove.prayedCount || 0 }]);
    }
  };

  const rejectPrayer = (id: string): void => {
    setPendingPrayers(prev => prev.filter(p => p.id !== id));
  }

  const deletePrayer = (id: string) => {
    setPrayers(prevPrayers => prevPrayers.filter(prayer => prayer.id !== id));
  };

  const toggleMainPrayer = (id: string) => {
    setPrayers(prevPrayers =>
      prevPrayers.map(prayer =>
        prayer.id === id ? { ...prayer, isMain: !prayer.isMain } : prayer
      )
    );
  };

  const updatePrayer = (id: string, newText: string) => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, text: newText } : p));
    setPendingPrayers(prev => prev.map(p => p.id === id ? { ...p, text: newText } : p));
  };

  const incrementPrayedCount = (id: string) => {
    setPrayers(prevPrayers =>
      prevPrayers.map(prayer =>
        prayer.id === id ? { ...prayer, prayedCount: (prayer.prayedCount || 0) + 1 } : prayer
      )
    );
  };

  return { prayers, pendingPrayers, addPrayer, submitForApproval, approvePrayer, rejectPrayer, deletePrayer, toggleMainPrayer, updatePrayer, incrementPrayedCount };
};

export default usePrayerState;