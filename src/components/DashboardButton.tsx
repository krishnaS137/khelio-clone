"use client";

import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

export default function DashboardButton() {
  const router = useRouter();
  const auth = getAuth();

  const handleClick = () => {
    if (auth.currentUser) {
      router.push("/dashboard");
    }
  };

  if (!auth.currentUser) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
    >
      Dashboard
    </button>
  );
} 