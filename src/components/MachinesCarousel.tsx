import React from 'react';
import Link from 'next/link';
import MachineCard from './MachineCard';

const MachinesCarousel: React.FC = () => {
    const machines = [
        {
            icon: '💻',
            title: 'Игровой ПК #1',
            processor: 'AMD Ryzen 9 5950X 16-Core Processor',
            gpu: 'NVIDIA GeForce RTX 3060 Ti 8038 Mb',
            ram: '32 Gb',
            price: 'От 1500₸/час',
        },
        {
            icon: '🎮',
            title: 'Игровая Консоль #1',
            processor: 'AMD Custom Zen 2 CPU',
            gpu: 'AMD Custom RDNA 2 GPU',
            ram: '16 Gb GDDR6',
            price: 'От 1000₸/час',
        },
        {
            icon: '💻',
            title: 'Игровой ПК #2',
            processor: 'Intel Core i9-12900K',
            gpu: 'NVIDIA GeForce RTX 3080 10240 Mb',
            ram: '64 Gb',
            price: 'От 2000₸/час',
        },
    ];

    return (
        <section className="mb-12 pt-8">
            <h3 className="text-3xl font-bold mb-6">Машины</h3>
            <div className="carousel-container">
                {machines.map((machine, index) => (
                    <MachineCard key={index} {...machine} />
                ))}
                <Link href="/machines" className="view-all-tile rounded-lg overflow-hidden shadow-md carousel-item machine-card-height flex items-center justify-center">
                    <i className="fas fa-arrow-right arrow-icon"></i>
                </Link>
            </div>
        </section>
    );
};

export default MachinesCarousel;
