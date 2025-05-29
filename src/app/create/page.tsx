"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { RATE_LIMIT } from "@/config/rateLimit";

export default function CreateGamePage() {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const [gameCount, setGameCount] = useState(0);
  const [maxGames, setMaxGames] = useState(RATE_LIMIT.maxGames);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const router = useRouter();

  // Fetch game quota data from backend
  useEffect(() => {
    const fetchQuota = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch("/api/game-quota", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch quota info");
        return;
      }

      const data = await res.json();
      setGameCount(data.used || 0);
      setMaxGames(data.maxGames || RATE_LIMIT.maxGames);
      if (data.retryAt) {
        const retryTime = Number(data.retryAt);
        const timeLeft = retryTime - Date.now();
        setRetryAt(retryTime);
        setTimeLeftMs(timeLeft > 0 ? timeLeft : 0);
      }
    };

    fetchQuota();

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Countdown modal + quota reset behavior
  useEffect(() => {
    if (!retryAt) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((retryAt - Date.now()) / 1000));
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      setCountdown(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        setRetryAt(null);
        setGameCount(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in.");
      return;
    }

    // Prevent form submission if rate limited
    if (retryAt && Date.now() < retryAt) {
      setShowModal(true);
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();

      const res = await fetch("/api/create-game", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, htmlContent, imageUrl }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const retryTimestamp = new Date(data.retryAt).getTime();
        setRetryAt(retryTimestamp);
        setShowModal(true);
        return;
      }

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      const newGameId = data.id ?? data.gameId ?? data.gameData?.id;
      if (!newGameId) {
        alert("Created, but couldn’t get game ID.");
        return;
      }

      router.push(`/games/${newGameId}`);
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const attemptsLeft = maxGames - gameCount;
  const progressPercentage = Math.min(100, (gameCount / maxGames) * 100);

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <div className={`w-full max-w-xl ${showModal ? "blur-sm pointer-events-none" : ""}`}>
        {/* Attempts Info */}
        <div className="mb-2 text-lg text-orange-400 font-semibold">
          Attempts left: {attemptsLeft} / {maxGames}
        </div>

        {/* Quota progress bar */}
        <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="mb-6 text-sm text-gray-400">
          Time until reset: {retryAt ? formatTimeLeft(timeLeftMs) : "N/A"}
        </p>

        {/* Form */}
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-orange-500">
          <h1 className="text-2xl font-bold mb-4 text-orange-400">Create a New Game</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-black border border-orange-400 text-white placeholder:text-gray-500"
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 rounded bg-black border border-orange-400 text-white placeholder:text-gray-500"
              required
            />
            <textarea
              placeholder="HTML Content"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full p-2 rounded bg-black border border-orange-400 text-white placeholder:text-gray-500"
              rows={5}
              required
            />
            <button
              type="submit"
              disabled={loading || attemptsLeft <= 0}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create Game"}
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-violet-700 text-white p-6 rounded-2xl shadow-xl max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-white text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Rate Limit Reached</h2>
            <p className="mb-2">Sorry, you’ve reached your game creation limit.</p>
            {retryAt && countdown && (
              <p className="text-sm opacity-70">
                Please try again in <span className="font-semibold">{countdown}</span>.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
