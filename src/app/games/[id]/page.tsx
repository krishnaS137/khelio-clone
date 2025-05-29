import { notFound } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";

type Game = {
  params: {
    id: string;
  };
};

export default async function GamePage({ params }: Game) {
  const id = params?.id; // ✅ Don't await this

  if (!id) {
    notFound();
  }

  const db = getFirestore(app);
  const docRef = doc(db, "games", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound(); // Show 404 if game not found
  }

  const gameData = docSnap.data();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{gameData.title || "Untitled Game"}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: gameData.htmlContent || "<p>No content available</p>" }}
      />
    </div>
  );
}
