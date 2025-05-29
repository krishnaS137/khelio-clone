"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Link from "next/link";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      
      if (user) {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserInfo({ ...userDoc.data(), email: user.email });
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black-100 p-8">Loading...</div>;
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-black-100 p-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="bg-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {userInfo.email}</p>
            <p><span className="font-medium">Name:</span> {userInfo.name || 'Not set'}</p>
            <p><span className="font-medium">Games Created:</span> {userInfo.gamesCreated || 0}</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 