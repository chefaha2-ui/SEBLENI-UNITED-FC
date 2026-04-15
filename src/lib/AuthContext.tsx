import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  unlockAdmin: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  unlockAdmin: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    const savedAdminStatus = localStorage.getItem('admin_unlocked') === 'true';
    setAdminUnlocked(savedAdminStatus);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // Create default profile if not exists
          const newProfile = {
            uid: user.uid,
            name: user.displayName || 'Fan',
            email: user.email,
            role: 'fan',
            profileImage: user.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProfile);
          await setDoc(doc(db, 'users_public', user.uid), {
            uid: user.uid,
            name: newProfile.name,
            profileImage: newProfile.profileImage,
            role: newProfile.role,
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const unlockAdmin = (password: string) => {
    const correctPassword = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === correctPassword) {
      setAdminUnlocked(true);
      localStorage.setItem('admin_unlocked', 'true');
      return true;
    }
    return false;
  };

  const isAdmin = adminUnlocked && (profile?.role === 'admin' || user?.email === 'chefaha2@gmail.com');

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, unlockAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
