import React from 'react';
import Link from 'next/link';
import GameCard from './GameCard';

const GamesCarousel: React.FC = () => {
    const games = [
        {
            imageSrc: 'https://placehold.co/400x250/2a2a40/a78bfa?text=ОБЛОЖКА+ИГРЫ+1',
            title: 'Фантастическая Сага',
            genre: 'RPG, Фэнтези',
            price: 'От 1000₸/час',
        },
        {
            imageSrc: 'https://placehold.co/400x250/2a2a40/a78b5fa?text=ОБЛОЖКА+ИГРЫ+2',
            title: 'Киберпанк 2077',
            genre: 'Экшен, Приключения',
            price: 'От 1200₸/час',
        },
        {
            imageSrc: 'https://placehold.co/400x250/2a2a40/a78bfa?text=ОБЛОЖКА+ИГРЫ+3',
            title: 'Космические Войны',
            genre: 'Стратегия, Sci-Fi',
            price: 'От 900₸/час',
        },
        {
            imageSrc: 'https://placehold.co/400x250/2a2a40/a78bfa?text=ОБЛОЖКА+ИГРЫ+4',
            title: 'Гонки Асфальта',
            genre: 'Гонки, Симулятор',
            price: 'От 800₸/час',
        },
    ];

    return (
        <section className="mb-12 pt-8">
            <h3 className="text-3xl font-bold mb-6">Игры</h3>
            <div className="carousel-container">
                {games.map((game, index) => (
                    <GameCard key={index} {...game} />
                ))}
                <Link href="/games" className="view-all-tile rounded-lg overflow-hidden carousel-item game-card-height flex items-center justify-center">
                    <span className="arrow-icon">→</span>
                </Link>
            </div>
        </section>
    );
};

export default GamesCarousel;
