import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { UserAccount, Profile, LinkItem, LeadItem, Testimonial, SeoSettings, ChatMessage } from '../types';

// ==========================================
// 1. USERS COLLECTION SERVICE
// ==========================================
export const userService = {
  async getUser(uid: string): Promise<UserAccount | null> {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return null;
    }
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data() as UserAccount;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async saveUser(user: UserAccount): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== user.id) {
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        ...user,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  },

  async updateUserSeoSettings(uid: string, seoSettings: SeoSettings): Promise<boolean> {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return false;
    }
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        seoSettings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Also sync into user's bio document so public visitors receive matching OpenGraph metadata
      const bioDocRef = doc(db, 'bios', uid);
      await setDoc(bioDocRef, {
        seoSettings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      return false;
    }
  },
};

// ==========================================
// 2. BIOS COLLECTION SERVICE
// ==========================================
export const bioService = {
  async getBioByUserId(userId: string): Promise<Profile | null> {
    try {
      const bioDocRef = doc(db, 'bios', userId);
      const bioSnap = await getDoc(bioDocRef);
      if (bioSnap.exists()) {
        return bioSnap.data() as Profile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `bios/${userId}`);
      return null;
    }
  },

  async getBioByUsername(username: string): Promise<Profile | null> {
    try {
      const q = query(collection(db, 'bios'), where('username', '==', username.toLowerCase()), limit(1));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as Profile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'bios');
      return null;
    }
  },

  async saveBio(userId: string, bioData: Partial<Profile>): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return;
    }
    try {
      const bioDocRef = doc(db, 'bios', userId);
      await setDoc(bioDocRef, {
        ...bioData,
        userId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bios/${userId}`);
    }
  },

  async updateBioField(userId: string, updates: Partial<Profile>): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return;
    }
    try {
      const bioDocRef = doc(db, 'bios', userId);
      await updateDoc(bioDocRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bios/${userId}`);
    }
  },
};

// ==========================================
// 3. TESTIMONIALS COLLECTION SERVICE
// ==========================================
export const testimonialService = {
  async getTestimonialsByUserId(userId: string): Promise<Testimonial[]> {
    try {
      const q = query(
        collection(db, 'bios', userId, 'testimonials'),
        orderBy('rating', 'desc')
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Testimonial));
      }
      // Fallback: read embedded testimonials in bio document
      const bio = await bioService.getBioByUserId(userId);
      return (bio as any)?.testimonials || [];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `bios/${userId}/testimonials`);
      return [];
    }
  },

  async saveTestimonial(userId: string, testimonial: Testimonial): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return;
    }
    try {
      const testRef = doc(db, 'bios', userId, 'testimonials', testimonial.id);
      await setDoc(testRef, testimonial, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bios/${userId}/testimonials/${testimonial.id}`);
    }
  },

  async deleteTestimonial(userId: string, testimonialId: string): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return;
    }
    try {
      const testRef = doc(db, 'bios', userId, 'testimonials', testimonialId);
      await deleteDoc(testRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bios/${userId}/testimonials/${testimonialId}`);
    }
  },
};

// ==========================================
// 4. ANALYTICS COLLECTION SERVICE
// ==========================================
export interface AnalyticsEvent {
  id?: string;
  userId: string;
  profileUsername: string;
  linkId?: string;
  eventType: 'click' | 'view';
  device?: string;
  referrer?: string;
  createdAt: string;
}

export const analyticsService = {
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const analyticsCol = collection(db, 'analytics');
      await addDoc(analyticsCol, {
        ...event,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'analytics');
    }
  },

  async getUserAnalytics(userId: string): Promise<AnalyticsEvent[]> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return [];
    }
    try {
      const q = query(
        collection(db, 'analytics'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const querySnap = await getDocs(q);
      return querySnap.docs.map((d) => ({ id: d.id, ...d.data() } as AnalyticsEvent));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'analytics');
      return [];
    }
  },
};

// ==========================================
// 5. LEADS COLLECTION SERVICE
// ==========================================
export const leadService = {
  async addLead(userId: string, profileUsername: string, email: string, name?: string): Promise<boolean> {
    try {
      const leadsCol = collection(db, 'leads');
      await addDoc(leadsCol, {
        userId,
        profileUsername,
        email,
        name: name || 'Subscriber',
        createdAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
      return false;
    }
  },

  async getLeadsByUserId(userId: string): Promise<LeadItem[]> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return [];
    }
    try {
      const q = query(
        collection(db, 'leads'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnap = await getDocs(q);
      return querySnap.docs.map((d) => ({
        id: d.id,
        email: d.data().email,
        name: d.data().name,
        createdAt: d.data().createdAt,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'leads');
      return [];
    }
  },
};

// ==========================================
// 6. CHAT MESSAGES SERVICE (/users/{userId}/chats)
// ==========================================
export type ChatMessageDoc = ChatMessage;

export const chatService = {
  async getChatMessages(userId: string): Promise<ChatMessageDoc[]> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return [];
    }
    try {
      const q = query(
        collection(db, 'users', userId, 'chats'),
        orderBy('timestamp', 'asc'),
        limit(50)
      );
      const querySnap = await getDocs(q);
      return querySnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessageDoc, 'id'>),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/chats`);
      return [];
    }
  },

  async saveChatMessage(userId: string, message: ChatMessageDoc): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return;
    }
    try {
      const chatDocRef = doc(db, 'users', userId, 'chats', message.id);
      const cleanData: Record<string, any> = {
        sender: message.sender,
        text: message.text,
        timestamp: message.timestamp,
      };
      if (message.suggestions) cleanData.suggestions = message.suggestions;
      if (message.appliedChanges) cleanData.appliedChanges = message.appliedChanges;
      if (message.nextMissingField) cleanData.nextMissingField = message.nextMissingField;
      if (message.quickReplies) cleanData.quickReplies = message.quickReplies;
      if (message.stage) cleanData.stage = message.stage;

      await setDoc(chatDocRef, cleanData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/chats/${message.id}`);
    }
  },
};

