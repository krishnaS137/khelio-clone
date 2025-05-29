import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { RATE_LIMIT } from "@/config/rateLimit";

const WINDOW_MS = {
  daily: 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  minute: 60 * 1000,
}[RATE_LIMIT.type];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Invalid token" });

  const idToken = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const userId = decodedToken.uid;
  const { title, htmlContent, imageUrl } = req.body;
  if (!title || !htmlContent || !imageUrl) return res.status(400).json({ message: "Missing fields" });

  const userRef = adminDB.collection("users").doc(userId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return res.status(404).json({ message: "User not found" });

  const userData = userSnap.data()!;
  const now = Date.now();

  let createdTimestamps: number[] = userData.createdTimestamps || [];

  // Filter to keep only timestamps within rolling window
  createdTimestamps = createdTimestamps.filter(ts => now - ts < WINDOW_MS);

  if (createdTimestamps.length >= RATE_LIMIT.maxGames) {
    const retryAt = new Date(createdTimestamps[0] + WINDOW_MS);
    const msUntilReset = retryAt.getTime() - now;
    const minutes = Math.floor(msUntilReset / 60000);
    const seconds = Math.floor((msUntilReset % 60000) / 1000);

    return res.status(429).json({
      message: `Rate limit exceeded. Try again in ${minutes}m ${seconds}s.`,
      retryAt: retryAt.toISOString(),
    });
  }

  const newGameRef = adminDB.collection("games").doc();
  const gameData = {
    id: newGameRef.id,
    title,
    htmlContent,
    imageUrl,
    userId,
    createdAt: new Date().toISOString(),
  };
  await newGameRef.set(gameData);

  createdTimestamps.push(now);
  await userRef.update({
    createdTimestamps,
  });

  return res.status(201).json({ message: "Game created successfully", gameData });
}
