"use client"; // needed for App Router to access window

import { loginWithGoogle, logout } from "@/auth/firebaseAuth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function GoogleSignInButton() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded ml-30">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={loginWithGoogle} className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign in with Google
        </button>
      )}
    </div>
  );
}
