"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";
import GameCard from "@/components/GameCard";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import CreateGameButton from "@/components/CreateGameButton";
import DashboardButton from "@/components/DashboardButton";
import NavigationButtons from "@/components/NavigationButtons";

type Game = {
  id: string;
  title: string;
  htmlContent: string;
  imageUrl: string;
  userId: string;
};

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);

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
    };

    fetchGames();
  }, []);

  return (
    <main className="min-h-screen bg-black-100 relative px-8 py-12 max-w-6xl mx-auto">
      {/* Top-right Sign In Button */}
      <h1 className="text-3xl font-bold mb-4">Generate a New Game</h1>
      <div className="flex gap-4 mb-8">
        <CreateGameButton />
        <NavigationButtons />
      </div>

      <div className="absolute top-6 right-8 flex gap-4">
        <DashboardButton />
        <GoogleSignInButton />
      </div>

      {/* Centered Welcome Title */}
      <div className="flex items-center justify-center h-[50vh] mb-12">
        <h1 className="text-4xl font-bold text-center text-white">
          Welcome to Khelio Clone 🎮
        </h1>
      </div>

      {/* Games Gallery */}
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="text-2xl font-semibold mb-8 text-center text-white">
          Games Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
          {games.length === 0 ? (
            <p className="text-white text-center col-span-full">
              Loading games...
            </p>
          ) : (
            games.map((game) => <GameCard key={game.id} {...game} />)
          )}
        </div>
      </div>
    </main>
  );
}
