import { db } from './firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export async function createUserIfNotExists(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
      createdTimestamps: [], // Used for rolling quota
    });
  } else {
    const userData = docSnap.data();
    const updates: Record<string, any> = {};

    if (!Array.isArray(userData.createdTimestamps)) {
      updates.createdTimestamps = [];
    }

    if (Object.keys(updates).length > 0) {
      await setDoc(userRef, updates, { merge: true });
    }
  }
}
