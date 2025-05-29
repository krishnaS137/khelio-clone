"use client";

import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserIfNotExists } from "@/lib/createUserIfNotExists"; // ✅ ADD THIS

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Use helper to avoid overwriting data
    await createUserIfNotExists(user);

    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out Error:", error);
  }
};
