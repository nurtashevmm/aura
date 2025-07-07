'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    // Используем новые цвета для фона и тени
    <header className="bg-brand-surface/50 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-white/5">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Логотип и основные ссылки */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-white">
            <span className="text-brand-amber">AURA</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-brand-text hover:text-brand-amber transition-colors duration-300">
              Каталог
            </Link>
            {/* @ts-ignore */}
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-brand-text hover:text-brand-amber transition-colors duration-300">
                Админ-панель
              </Link>
            )}
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="flex items-center space-x-4">
          {status === 'authenticated' ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-medium">{session.user?.email}</p>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-brand-text hover:text-red-500 transition-colors duration-300"
                title="Выйти"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center space-x-2 text-brand-text hover:text-brand-amber transition-colors duration-300">
              <UserCircleIcon className="h-6 w-6" />
              <span className="font-medium">Войти</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}