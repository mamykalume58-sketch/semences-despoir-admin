import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Config Web Firebase : publique par nature, la protection vient des Security Rules.
const firebaseConfig = {
  apiKey: 'AIzaSyCdOGg8d7gLynrLNcpcDxzHA2LCxTIGGkI',
  authDomain: 'semences-despoir.firebaseapp.com',
  projectId: 'semences-despoir',
  storageBucket: 'semences-despoir.firebasestorage.app',
  messagingSenderId: '781672402025',
  appId: '1:781672402025:web:f32c48d29bc8a19279e6f8',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
