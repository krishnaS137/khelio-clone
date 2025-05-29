"use client";

import { useRouter } from "next/navigation";

export default function CreateGameButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/create")}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Create Game
    </button>
  );
}
