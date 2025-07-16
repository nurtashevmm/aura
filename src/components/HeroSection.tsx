'use client';

import React from 'react';
import Link from 'next/link';

const HeroSection: React.FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-section-overlay"></div>
            <div className="relative z-10 text-white p-4">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">Играй в любые игры, где бы ты ни был!</h2>
                <p className="text-xl md:text-2xl mb-8">Мощные игровые ПК и консоли в облаке, доступные по часам.</p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link href="/machines" className="btn-primary px-8 py-4 rounded-lg text-xl shadow-lg hover:shadow-xl">Начать играть</Link>
                    <Link href="/become-merchant" className="btn-secondary px-8 py-4 rounded-lg text-xl shadow-lg hover:shadow-xl">Стать мерчантом</Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
