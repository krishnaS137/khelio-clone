import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";
import { RATE_LIMIT } from "@/config/rateLimit";

const WINDOW_MS = {
  daily: 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  minute: 60 * 1000,
}[RATE_LIMIT.type];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Invalid auth" });

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = adminDB.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const now = Date.now();
    let createdTimestamps: number[] = userData?.createdTimestamps || [];
    createdTimestamps = createdTimestamps.filter(ts => now - ts < WINDOW_MS);

    const used = createdTimestamps.length;
    const retryAt = used >= RATE_LIMIT.maxGames ? createdTimestamps[0] + WINDOW_MS : null;

    return res.status(200).json({
      maxGames: RATE_LIMIT.maxGames,
      used,
      retryAt,
      type: RATE_LIMIT.type,
    });
  } catch (error) {
    console.error("Error in /api/game-quota:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
