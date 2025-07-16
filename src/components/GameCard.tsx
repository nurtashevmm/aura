import React from 'react';
import Image from 'next/image';

interface GameCardProps {
    imageSrc: string;
    title: string;
    genre: string;
    price: string;
}

const GameCard: React.FC<GameCardProps> = ({ imageSrc, title, genre, price }) => {
    return (
        <div className="card rounded-lg overflow-hidden shadow-md carousel-item game-card-height">
            <Image src={imageSrc} alt={title} width={300} height={192} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Жанр: {genre}</p>
                <p className="text-sm font-bold mt-2" style={{ color: 'var(--accent-primary)' }}>{price}</p>
                <button className="btn-primary w-full py-2 rounded-md font-medium text-sm mt-4">Играть</button>
            </div>
        </div>
    );
};

export default GameCard;
