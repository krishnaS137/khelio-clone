// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Toaster } from "react-hot-toast"; // ✅ Add this
import "@/app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(
            userRef,
            {
              id: user.uid,
              name: user.displayName || "",
              email: user.email || "",
              photoURL: user.photoURL || "",
              createdAt: serverTimestamp(),
              gameCountToday: 0,
              lastGameCreatedAt: null,
            },
            { merge: true }
          );
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Toast support */}
      <Component {...pageProps} />
    </>
  );
}
