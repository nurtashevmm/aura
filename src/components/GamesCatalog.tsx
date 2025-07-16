import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export type Game = {
  id: string;
  title: string;
  coverUrl: string;
  minPrice: number;
};

export default function GamesCatalog() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка игр...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {games.map(game => (
        <div key={game.id} className="bg-zinc-900 rounded-lg shadow p-4 flex flex-col items-center">
          <Image src={game.coverUrl} alt={game.title} width={128} height={128} className="w-32 h-32 object-cover rounded mb-2" />
          <div className="font-bold text-lg text-white mb-1">{game.title}</div>
          <div className="text-sm text-zinc-400 mb-2">от {game.minPrice} ₸/час</div>
          
        </div>
      ))}
    </div>
  );
}
