import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const AuthContext = createContext(null);

const ALLOWED_ROLES = ['superadmin', 'admin', 'editeur'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
        return;
      }
      try {
        const uid = firebaseUser.uid;
        const snap = await getDoc(doc(db, 'users', uid));

        if (!snap.exists()) {
          let details = '';
          try {
            const allSnap = await getDocs(collection(db, 'users'));
            const ids = allSnap.docs.map((d) => `"${d.id}" (longueur ${d.id.length})`);
            details = ids.length
              ? `Documents présents dans /users : ${ids.join(', ')}`
              : 'La collection /users est vide ou inaccessible.';
          } catch (listError) {
            details = `Impossible de lister /users : ${listError.code || listError.message}`;
          }
          setAuthError(
            `UID connecté : "${uid}" (longueur ${uid.length}). Aucun document ne correspond. ${details}`
          );
          await fbSignOut(auth);
          setUser(null);
          setProfile(null);
          setStatus('unauthorized');
          return;
        }

        const data = snap.data();
        if (!ALLOWED_ROLES.includes(data.role)) {
          setAuthError(
            `Document trouvé mais champ "role" = ${JSON.stringify(data.role)}, non autorisé (attendu : ${ALLOWED_ROLES.join(', ')}).`
          );
          await fbSignOut(auth);
          setUser(null);
          setProfile(null);
          setStatus('unauthorized');
          return;
        }

        setAuthError('');
        setUser(firebaseUser);
        setProfile({ id: snap.id, ...data });
        setStatus('authenticated');
      } catch (error) {
        console.error('Erreur de vérification du rôle administrateur :', error);
        setAuthError(`Erreur Firestore : ${error.code || ''} ${error.message || error}`);
        await fbSignOut(auth);
        setUser(null);
        setProfile(null);
        setStatus('unauthorized');
      }
    });
    return unsubscribe;
  }, []);

  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, status, authError, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
