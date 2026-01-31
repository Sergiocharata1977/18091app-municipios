'use client';

import { UserSyncNotification } from '@/components/auth/UserSyncNotification';
import { onAuthChange } from '@/firebase/auth';
import { auth } from '@/firebase/config';
import { UserService } from '@/services/auth/UserService';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async firebaseUser => {
      if (firebaseUser) {
        try {
          // First, ensure user exists in Firestore
          const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            }),
          });

          if (response.ok) {
            console.log(
              '[AuthContext] User record created/verified in Firestore'
            );
            // Show sync notification for new users
            const data = await response.json();
            if (data.message === 'Usuario creado exitosamente') {
              setShowSyncNotification(true);
            }
          } else if (response.status === 409) {
            // User already exists, this is fine
            console.log('[AuthContext] User already exists in Firestore');
          } else {
            console.error(
              '[AuthContext] Failed to create user record:',
              await response.text()
            );
          }

          // Fetch the full user data from Firestore
          const fullUser = await UserService.getById(firebaseUser.uid);
          setUser(fullUser);

          // Store organization_id in sessionStorage for components that need it
          if (fullUser?.organization_id) {
            sessionStorage.setItem('organization_id', fullUser.organization_id);
            console.log(
              '[AuthContext] Organization ID stored:',
              fullUser.organization_id
            );
          }

          // Set auth cookie for middleware protection
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${firebaseUser.uid}; path=/; max-age=604800; SameSite=Lax`;
            console.log(
              '[AuthContext] Auth cookie set for user:',
              firebaseUser.uid
            );
          }
        } catch (error) {
          console.error('[AuthContext] Error fetching user data:', error);
          setUser(null);
          // Clear cookie on error
          if (typeof document !== 'undefined') {
            document.cookie =
              'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
      } else {
        setUser(null);
        // Clear cookie and sessionStorage when user logs out
        if (typeof document !== 'undefined') {
          document.cookie =
            'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          sessionStorage.removeItem('organization_id');
          console.log('[AuthContext] Auth cookie and organization_id cleared');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      // Clear auth cookie and sessionStorage for middleware
      if (typeof document !== 'undefined') {
        document.cookie =
          'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        sessionStorage.removeItem('organization_id');
      }
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
      <UserSyncNotification
        show={showSyncNotification}
        onComplete={() => setShowSyncNotification(false)}
      />
    </AuthContext.Provider>
  );
};
