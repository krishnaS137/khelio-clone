"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";
import GameCard from "@/components/GameCard";
import Link from "next/link";

type Game = {
  id: string;
  title: string;
  htmlContent: string;
  imageUrl: string;
  userId: string;
};

export default function AllGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const db = getFirestore(app);
      const gamesCollection = collection(db, "games");
      const querySnapshot = await getDocs(gamesCollection);
      const gameData: Game[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          htmlContent: data.htmlContent,
          imageUrl: data.imageUrl,
          userId: data.userId,
        };
      });
      setGames(gameData);
      setLoading(false);
    };

    fetchGames();
  }, []);

  return (
    <main className="min-h-screen bg-black-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Games</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
        </div>

        {loading ? (
          <p className="text-white text-center">Loading games...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {games.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 