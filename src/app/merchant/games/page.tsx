"use client";
import { useEffect, useState } from "react";

interface Machine {
  id: string;
  name: string;
}
interface Game {
  id: string;
  title: string;
  minPrice: number;
  machines: Machine[];
}

export default function MerchantGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/merchant/games")
      .then((r) => r.json())
      .then((data) => setGames(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-neutral-900 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Игры</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-neutral-800">
              <th className="p-2">Название</th>
              <th className="p-2">Минимальная цена</th>
              <th className="p-2">Серверы</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center p-4">Загрузка...</td></tr>
            ) : games.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-4">Нет игр, привязанных к вашим серверам</td></tr>
            ) : (
              games.map(game => (
                <tr key={game.id} className="border-b border-neutral-800">
                  <td className="p-2 font-semibold">{game.title}</td>
                  <td className="p-2">{game.minPrice / 100}₸</td>
                  <td className="p-2">
                    {game.machines.map(m => m.name).join(', ')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
