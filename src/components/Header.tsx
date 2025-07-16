'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    const [mockUserLoggedIn, setMockUserLoggedIn] = useState(false); // Simulate user login state

    useEffect(() => {
        // This effect runs once on mount to simulate initial login state
        // In a real app, you'd fetch this from context, auth service, or local storage
        // For now, it's a static value
        setMockUserLoggedIn(false); // Change to true to see "Личный кабинет"
    }, []);

    return (
        <header className="p-4 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                {/* Логотип */}
                <div className="flex items-center mb-4 md:mb-0">
                    <Link href="/" className="flex items-center">
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold uppercase logo-text-gradient tracking-widest leading-none">AURA</h1>
                            <p className="text-sm uppercase tracking-widest -mt-1" style={{ color: 'var(--text-secondary)' }}>Play</p>
                        </div>
                    </Link>
                </div>

                {/* Правая часть: Навигация, Поиск, Кнопки */}
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 w-full md:w-auto">
                    {/* Навигация */}
                    <nav className="flex flex-wrap justify-center md:justify-start space-x-4 text-lg">
                        <Link href="/games" className="transition-colors duration-200">Игры</Link>
                        <Link href="/machines" className="transition-colors duration-200">Машины</Link>
                        <Link href="/support" className="transition-colors duration-200">Поддержка</Link>
                        <Link href="/become-merchant" className="transition-colors duration-200">Стать мерчантом</Link>
                    </nav>

                    {/* Поиск и Кнопки (динамически обновляются JS) */}
                    <div id="auth-buttons-container" className="flex items-center space-x-4 w-full md:w-auto">
                        
                        {mockUserLoggedIn ? (
                            <Link href="/profile" className="btn-primary px-4 py-2 rounded-md text-sm whitespace-nowrap">
                                Личный кабинет
                            </Link>
                        ) : (
                            <>
                                <button
                                    className="btn-secondary px-4 py-2 rounded-md text-sm whitespace-nowrap"
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Войти
                                </button>
                                <button
                                    className="btn-primary px-4 py-2 rounded-md text-sm whitespace-nowrap"
                                    onClick={() => window.location.href = '/register'}
                                >
                                    Регистрация
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;