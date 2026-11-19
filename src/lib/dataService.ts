import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { auth, firestore, signInWithGoogle as firebaseSignInWithGoogle } from './firebase';

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  isGoogleUser?: boolean;
}

export interface SavedDesign {
  id: string;
  userId: string;
  name: string;
  material: string;
  data: any;
  productType?: 'card' | 'board';
  orientation?: string;
  previewFront?: string;
  previewBack?: string;
  createdAt: number;
  updatedAt: number;
}

// Alias for existing Project interface
export type Project = SavedDesign;

export interface ImageAsset {
  id: string;
  userId: string;
  url: string;
  createdAt: number;
}

export interface OrderRequest {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  quantity: number;
  notes?: string;
  material: string;
  designData: any;
  previewFront?: string;
  previewBack?: string;
  createdAt: number;
  status: string;
}

export type CRMClientStatus = 'Emailed' | 'In Negotiation' | 'Rejected' | 'Buying';

export interface CRMClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CRMClientStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Clean up any legacy mock data from browser localStorage
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('mock_users');
    window.localStorage.removeItem('mock_current_user');
    window.localStorage.removeItem('mock_projects');
    window.localStorage.removeItem('mock_images');
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

function mapFirebaseUser(user: FirebaseUser | null): User | null {
  if (!user) return null;
  const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
  return {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'User',
    emailVerified: user.emailVerified,
    isGoogleUser: isGoogle
  };
}

class DataService {
  // --- AUTHENTICATION ---

  getCurrentUser(): User | null {
    return mapFirebaseUser(auth.currentUser);
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(mapFirebaseUser(firebaseUser));
    });
  }

  async signIn(email: string, password?: string): Promise<User> {
    if (!password) {
      // Google popup auth
      const cred = await firebaseSignInWithGoogle();
      const mapped = mapFirebaseUser(cred.user);
      if (!mapped) throw new Error('Sign in failed.');
      return mapped;
    }
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const mapped = mapFirebaseUser(cred.user);
    if (!mapped) throw new Error('Invalid email or password.');
    return mapped;
  }

  async signUp(email: string, password?: string, name?: string): Promise<User> {
    if (!password) {
      return this.signIn(email);
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name?.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    const mapped = mapFirebaseUser(cred.user);
    if (!mapped) throw new Error('Sign up failed.');
    return mapped;
  }

  async signInWithGoogle(): Promise<User> {
    const cred = await firebaseSignInWithGoogle();
    const mapped = mapFirebaseUser(cred.user);
    if (!mapped) throw new Error('Google sign-in failed.');
    return mapped;
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async updateUserName(userId: string, newName: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await updatePassword(auth.currentUser, newPassword);
    }
  }

  // --- FIRESTORE DESIGNS: users/{userId}/designs/{designId} ---

  async saveDesign(
    userId: string,
    designInput: {
      name: string;
      material: string;
      data: any;
      productType?: 'card' | 'board';
      orientation?: string;
      previewFront?: string;
      previewBack?: string;
      id?: string;
    }
  ): Promise<SavedDesign> {
    const designId = designInput.id || crypto.randomUUID();
    const now = Date.now();
    const designDocRef = doc(firestore, 'users', userId, 'designs', designId);

    const design: SavedDesign = {
      id: designId,
      userId,
      name: designInput.name.trim() || 'Untitled Design',
      material: designInput.material || 'plastic-white',
      data: designInput.data,
      productType: designInput.productType || 'card',
      orientation: designInput.orientation || 'horizontal',
      previewFront: designInput.previewFront || '',
      previewBack: designInput.previewBack || '',
      createdAt: now,
      updatedAt: now
    };

    await setDoc(designDocRef, design);
    return design;
  }

  // Backwards compatibility alias for saveProject
  async saveProject(
    userId: string,
    name: string,
    data: any,
    previewUrl?: string,
    productType?: 'card' | 'board'
  ): Promise<SavedDesign> {
    return this.saveDesign(userId, {
      name,
      material: data?.front?.material || 'plastic',
      data,
      previewFront: previewUrl,
      productType
    });
  }

  async updateDesign(
    userId: string,
    designId: string,
    updates: Partial<Omit<SavedDesign, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    const designDocRef = doc(firestore, 'users', userId, 'designs', designId);
    await updateDoc(designDocRef, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  // Backwards compatibility alias for updateProject
  async updateProject(
    userId: string,
    projectId: string,
    name: string,
    data: any,
    previewUrl?: string,
    productType?: 'card' | 'board'
  ): Promise<SavedDesign> {
    await this.updateDesign(userId, projectId, {
      name,
      data,
      previewFront: previewUrl,
      productType
    });
    const updated = await this.getDesignById(userId, projectId);
    if (!updated) throw new Error('Design not found after update');
    return updated;
  }

  async renameDesign(userId: string, designId: string, newName: string): Promise<void> {
    const designDocRef = doc(firestore, 'users', userId, 'designs', designId);
    await updateDoc(designDocRef, {
      name: newName.trim(),
      updatedAt: Date.now()
    });
  }

  async deleteDesign(userId: string, designId: string): Promise<void> {
    const designDocRef = doc(firestore, 'users', userId, 'designs', designId);
    await deleteDoc(designDocRef);
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    return this.deleteDesign(userId, projectId);
  }

  async getDesignById(userId: string, designId: string): Promise<SavedDesign | null> {
    const designDocRef = doc(firestore, 'users', userId, 'designs', designId);
    const snap = await getDoc(designDocRef);
    if (!snap.exists()) return null;
    return snap.data() as SavedDesign;
  }

  async getProjectById(userId: string, projectId: string): Promise<SavedDesign | null> {
    return this.getDesignById(userId, projectId);
  }

  async getDesignsByUser(userId: string): Promise<SavedDesign[]> {
    const designsColRef = collection(firestore, 'users', userId, 'designs');
    const snapshot = await getDocs(designsColRef);
    const designs: SavedDesign[] = [];
    snapshot.forEach((d) => {
      designs.push(d.data() as SavedDesign);
    });
    // Sort client-side by updatedAt descending
    return designs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async getProjectsByUser(userId: string): Promise<SavedDesign[]> {
    return this.getDesignsByUser(userId);
  }

  // --- FIRESTORE ORDERS: orders/{orderId} ---

  async createOrder(orderInput: {
    id?: string;
    name: string;
    businessName?: string;
    email: string;
    phone?: string;
    quantity: number;
    notes?: string;
    material: string;
    designData: any;
    previewFront?: string;
    previewBack?: string;
  }): Promise<OrderRequest> {
    const orderId = orderInput.id || crypto.randomUUID().slice(0, 12);
    const orderDocRef = doc(firestore, 'orders', orderId);

    const order: OrderRequest = {
      id: orderId,
      name: orderInput.name.trim(),
      businessName: orderInput.businessName?.trim() || '',
      email: orderInput.email.trim().toLowerCase(),
      phone: orderInput.phone?.trim() || '',
      quantity: Number(orderInput.quantity),
      notes: orderInput.notes?.trim() || '',
      material: orderInput.material,
      designData: orderInput.designData,
      previewFront: orderInput.previewFront || '',
      previewBack: orderInput.previewBack || '',
      createdAt: Date.now(),
      status: 'pending'
    };

    await setDoc(orderDocRef, order);
    return order;
  }

  async getOrderById(orderId: string): Promise<OrderRequest | null> {
    const orderDocRef = doc(firestore, 'orders', orderId);
    const snap = await getDoc(orderDocRef);
    if (!snap.exists()) return null;
    return snap.data() as OrderRequest;
  }

  // --- AI DAILY USAGE LIMIT (10 generations per day) ---
  async getDailyAiUsage(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('AUTH_ERROR: Missing userId for daily quota check');
    }
    const dateKey = new Date().toISOString().slice(0, 10);
    const usageDocRef = doc(firestore, 'users', userId, 'usage', dateKey);
    const snap = await getDoc(usageDocRef);
    if (!snap.exists()) return 0;
    return Number(snap.data()?.count) || 0;
  }

  async incrementDailyAiUsage(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('AUTH_ERROR: Missing userId for daily quota increment');
    }
    const dateKey = new Date().toISOString().slice(0, 10);
    const usageDocRef = doc(firestore, 'users', userId, 'usage', dateKey);
    const snap = await getDoc(usageDocRef);
    if (!snap.exists()) {
      await setDoc(usageDocRef, { count: 1, date: dateKey, updatedAt: Date.now() });
      return 1;
    }
    const current = Number(snap.data()?.count) || 0;
    if (current >= DAILY_AI_LIMIT) {
      throw new Error("You've reached today's limit. Come back tomorrow.");
    }
    await updateDoc(usageDocRef, { count: increment(1), updatedAt: Date.now() });
    return current + 1;
  }

  // --- AI EDIT DAILY USAGE LIMIT (30 edits per day) ---
  async getDailyAiEditUsage(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('AUTH_ERROR: Missing userId for daily edit quota check');
    }
    const dateKey = new Date().toISOString().slice(0, 10);
    const usageDocRef = doc(firestore, 'users', userId, 'editUsage', dateKey);
    const snap = await getDoc(usageDocRef);
    if (!snap.exists()) return 0;
    return Number(snap.data()?.count) || 0;
  }

  async incrementDailyAiEditUsage(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('AUTH_ERROR: Missing userId for daily edit quota increment');
    }
    const dateKey = new Date().toISOString().slice(0, 10);
    const usageDocRef = doc(firestore, 'users', userId, 'editUsage', dateKey);
    const snap = await getDoc(usageDocRef);
    if (!snap.exists()) {
      await setDoc(usageDocRef, { count: 1, date: dateKey, updatedAt: Date.now() });
      return 1;
    }
    const current = Number(snap.data()?.count) || 0;
    if (current >= DAILY_AI_EDIT_LIMIT) {
      throw new Error("You've reached today's edit limit. Come back tomorrow.");
    }
    await updateDoc(usageDocRef, { count: increment(1), updatedAt: Date.now() });
    return current + 1;
  }

  // --- IMAGES & ASSETS ---
  async saveImage(userId: string, dataUrl: string): Promise<ImageAsset> {
    // In-memory / temporary asset object so local uploads can be displayed immediately
    return {
      id: crypto.randomUUID(),
      userId,
      url: dataUrl,
      createdAt: Date.now()
    };
  }

  async getImagesByUser(_userId: string): Promise<ImageAsset[]> {
    return [];
  }

  // --- ADMIN STUBS FOR COMPILATION ---
  async getAllUsers(): Promise<User[]> {
    return [];
  }

  async getUserStats(_userId: string): Promise<{ projectsCount: number; imagesCount: number }> {
    return { projectsCount: 0, imagesCount: 0 };
  }

  async getCRMClients(): Promise<CRMClient[]> {
    return [];
  }

  async addCRMClient(clientData: Omit<CRMClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMClient> {
    return {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  async updateCRMClientStatus(_id: string, _status: CRMClientStatus): Promise<void> {}
}

export const DAILY_AI_LIMIT = 10;
export const DAILY_AI_EDIT_LIMIT = 30;

export const dataService = new DataService();
export const db = dataService;
export default dataService;
