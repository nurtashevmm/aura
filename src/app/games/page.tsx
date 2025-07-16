"use client";

import Link from 'next/link';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const PageStyles = () => (
  <style jsx>{`
    .btn-primary {
        background-color: var(--accent-primary);
        color: var(--text-primary);
        transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out, filter 0.3s ease-in-out;
        font-weight: 600;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    }
    .btn-primary:hover {
        background-color: var(--accent-hover);
        transform: scale(1.02);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
        filter: brightness(1.1);
    }
    .card {
        background-color: var(--bg-secondary);
        transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out;
        border: 1px solid transparent;
        flex-shrink: 0;
        width: 280px;
        position: relative;
    }
    .card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 30px var(--shadow-color);
        border-color: var(--accent-primary);
        z-index: 10;
    }
    .game-card-height {
        height: 380px;
    }
    .input-field {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
    }
    .input-field:focus {
        border-color: var(--accent-primary);
        outline: none;
    }
  `}</style>
);

interface Game {
  id: string;
  title: string;
  genre: string;
  coverUrl: string;
  minPrice: number;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGames();
  }, []);

  return (
    <>
      <PageStyles />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Каталог игр</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-bg-secondary rounded-lg shadow-md">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Поиск по названию..." 
              className="input-field w-full p-3 pl-10 rounded-md"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>
          <div className="flex items-center gap-4">
            <select className="input-field p-3 rounded-md w-full md:w-auto">
              <option>Все жанры</option>
              <option>RPG</option>
              <option>Экшен</option>
              <option>Приключения</option>
              <option>Фэнтези</option>
            </select>
            <button className="btn-primary p-3 rounded-md flex items-center gap-2">
              <FaFilter />
              <span>Фильтры</span>
            </button>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {games.map(game => (
            <div key={game.id} className="card rounded-lg overflow-hidden shadow-md game-card-height">
              <Image src={game.coverUrl} alt={`Обложка игры ${game.title}`} width={280} height={192} className="w-full h-48 object-cover" />
              <div className="p-4 flex flex-col">
                <h4 className="text-xl font-semibold mb-2 text-text-primary flex-grow">{game.title}</h4>
                <p className="text-sm text-text-secondary">{game.genre}</p>
                <p className="text-sm font-bold mt-2 text-accent-primary">От {game.minPrice}₸/час</p>
                <Link href={`/games/${game.id}`} className="btn-primary w-full py-2 rounded-md font-medium text-sm mt-4 text-center">Играть</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination (static example) */}
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2">
            <button className="p-2 rounded-md bg-bg-secondary hover:bg-accent-primary transition-colors">«</button>
            <button className="p-2 px-4 rounded-md bg-accent-primary text-white">1</button>
            <button className="p-2 px-4 rounded-md bg-bg-secondary hover:bg-accent-primary transition-colors">2</button>
            <button className="p-2 px-4 rounded-md bg-bg-secondary hover:bg-accent-primary transition-colors">3</button>
            <span className="p-2">...</span>
            <button className="p-2 px-4 rounded-md bg-bg-secondary hover:bg-accent-primary transition-colors">10</button>
            <button className="p-2 rounded-md bg-bg-secondary hover:bg-accent-primary transition-colors">»</button>
          </nav>
        </div>
      </div>
    </>
  );
}
