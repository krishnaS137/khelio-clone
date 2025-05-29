"use client";

import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

export default function NavigationButtons() {
  const router = useRouter();
  const auth = getAuth();

  return (
    <div className="flex gap-4">
      <button
        onClick={() => router.push("/all-games")}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        All Games
      </button>
      {auth.currentUser && (
        <button
          onClick={() => router.push("/my-games")}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          My Games
        </button>
      )}
    </div>
  );
} 