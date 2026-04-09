import { db, doc, collection, setDoc, addDoc, onSnapshot, query, orderBy, OperationType, handleFirestoreError } from './firebase';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

interface UserProfile {
  name?: string;
  preferences?: {
    voice?: string;
    theme?: string;
    personality?: string;
    useElevenLabs?: boolean;
    elevenLabsVoice?: string;
    visualStyle?: string;
    focusMode?: boolean;
    soundscape?: string;
    showAR?: boolean;
    selectedModel?: string;
  };
  facts?: string[];
}

export const memoryService = {
  syncProfile: (userId: string, onUpdate: (profile: UserProfile) => void) => {
    const userDoc = doc(db, 'users', userId);
    return onSnapshot(userDoc, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${userId}`));
  },

  saveProfile: async (userId: string, profile: Partial<UserProfile>) => {
    try {
      const userDoc = doc(db, 'users', userId);
      await setDoc(userDoc, {
        ...profile,
        uid: userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  syncFacts: (userId: string, onUpdate: (facts: string[]) => void) => {
    const factsCol = collection(db, 'users', userId, 'facts');
    const q = query(factsCol, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const facts = snapshot.docs.map(doc => doc.data().content);
      onUpdate(facts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/facts`));
  },

  addFact: async (userId: string, fact: string, isShared: boolean = false) => {
    try {
      const factsCol = collection(db, 'users', userId, 'facts');
      await addDoc(factsCol, {
        userId,
        content: fact,
        isShared,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/facts`);
    }
  },

  saveVisualMemory: async (userId: string, description: string) => {
    try {
      const col = collection(db, 'users', userId, 'visual_memories');
      await addDoc(col, {
        description,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/visual_memories`);
    }
  },

  saveExpense: async (userId: string, expense: { amount: number, merchant: string, category?: string }) => {
    try {
      const col = collection(db, 'users', userId, 'expenses');
      await addDoc(col, {
        ...expense,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/expenses`);
    }
  },

  syncVisualMemories: (userId: string, onUpdate: (mems: any[]) => void) => {
    const col = collection(db, 'users', userId, 'visual_memories');
    const q = query(col, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const mems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(mems);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/visual_memories`));
  },

  syncExpenses: (userId: string, onUpdate: (expenses: any[]) => void) => {
    const col = collection(db, 'users', userId, 'expenses');
    const q = query(col, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(expenses);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/expenses`));
  }
};
