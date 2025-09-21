
"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useEffect, 
  useCallback, 
  useMemo
} from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase"; 
import { googleSignIn } from "@/ai/flows/google-sign-in";
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const createUserDocument = useCallback(async (user: User, fullName?: string) => {
      const db = getFirestore(app);
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || fullName,
            photoURL: user.photoURL,
            createdAt: new Date(),
        });
      }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        await createUserDocument(userCredential.user, fullName);
    } catch (error: any) {
        console.error("Error during email sign-up:", error);
        throw new Error(error.message || 'An unknown error occurred.');
    }
  }, [auth, createUserDocument]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        console.error("Error during email sign-in:", error);
        throw new Error(error.message || 'An unknown error occurred.');
    }
  }, [auth]);


  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, [auth]);

  const signInWithGoogle = useCallback(async () => {
    const googleProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const { customToken } = await googleSignIn({ idToken });
      
      const userCredential = await signInWithCustomToken(auth, customToken);
      await createUserDocument(userCredential.user);

    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message || 'An unknown error occurred.',
      });
      throw error;
    }
  }, [auth, toast, createUserDocument]);


  const value = useMemo(() => ({
    isAuthenticated: !loading && !!user,
    user,
    logout,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
  }), [loading, user, logout, signInWithGoogle, signUpWithEmail, signInWithEmail]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
