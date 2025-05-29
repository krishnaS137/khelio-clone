import Link from "next/link";

type Game = {
  id: string;
  title: string;
  imageUrl: string;
  htmlContent?: string;
  userId?: string;
};

export default function GameCard({ id, title, imageUrl }: Game) {
  return (
    <Link href={`/games/${id}`}>
      <div className="w-64 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
        <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
        <div className="p-4">
          <h3 className="text-lg text-black font-semibold">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
