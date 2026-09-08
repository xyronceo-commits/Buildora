import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SavedItem } from '../types';
import { useAuth } from './AuthContext';

interface SavedContextType {
  savedItems: SavedItem[];
  isSaved: (referenceId: string) => boolean;
  toggleSave: (type: SavedItem['type'], referenceId: string) => Promise<void>;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const local = localStorage.getItem('buildora_saved_items');
    if (local) {
      try { return JSON.parse(local); } catch (e) { return []; }
    }
    return [];
  });

  // Fetch saved items from Firestore
  useEffect(() => {
    async function loadSaved() {
      if (!currentUser || currentUser.uid.startsWith('demo_')) return;
      try {
        const ref = collection(db, 'users', currentUser.uid, 'saved');
        const snap = await getDocs(ref);
        const items = snap.docs.map((d) => d.data() as SavedItem);
        setSavedItems(items);
        localStorage.setItem('buildora_saved_items', JSON.stringify(items));
      } catch (err) {
        console.warn('Could not load saved items from Firestore', err);
      }
    }
    loadSaved();
  }, [currentUser]);

  const isSaved = (referenceId: string) => {
    return savedItems.some((item) => item.referenceId === referenceId);
  };

  const toggleSave = async (type: SavedItem['type'], referenceId: string) => {
    const existing = savedItems.find((item) => item.referenceId === referenceId);

    if (existing) {
      const updated = savedItems.filter((item) => item.referenceId !== referenceId);
      setSavedItems(updated);
      localStorage.setItem('buildora_saved_items', JSON.stringify(updated));

      if (currentUser && !currentUser.uid.startsWith('demo_')) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'saved', existing.savedId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/saved/${existing.savedId}`);
        }
      }
    } else {
      const newItem: SavedItem = {
        savedId: `saved_${Date.now()}_${referenceId.slice(0, 8)}`,
        type,
        referenceId,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...savedItems];
      setSavedItems(updated);
      localStorage.setItem('buildora_saved_items', JSON.stringify(updated));

      if (currentUser && !currentUser.uid.startsWith('demo_')) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'saved', newItem.savedId), newItem);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/saved/${newItem.savedId}`);
        }
      }
    }
  };

  return (
    <SavedContext.Provider value={{ savedItems, isSaved, toggleSave }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSaved must be used within SavedProvider');
  return context;
};
