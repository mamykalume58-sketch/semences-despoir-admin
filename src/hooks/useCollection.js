import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase.js';

export function useCollection(name, orderField) {
  const [state, setState] = useState({ status: 'loading', docs: [] });

  useEffect(() => {
    const ref = orderField ? query(collection(db, name), orderBy(orderField, 'desc')) : collection(db, name);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => setState({ status: 'ready', docs: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }),
      (error) => {
        console.error(`Erreur Firestore (${name}) :`, error);
        setState({ status: 'error', docs: [] });
      }
    );
    return unsubscribe;
  }, [name, orderField]);

  return state;
}

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}
