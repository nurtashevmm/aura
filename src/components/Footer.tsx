import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="p-6 text-center text-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p>&copy; {new Date().getFullYear()} Aura Play. Все права защищены.</p>
            <div className="flex justify-center space-x-6 mt-4">
                <a href="https://instagram.com/auraplaykz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a href="https://tiktok.com/@auraplaykz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <i className="fab fa-tiktok text-2xl"></i>
                </a>
                <a href="https://t.me/auraplaykz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <i className="fab fa-telegram-plane text-2xl"></i>
                </a>
            </div>
            <p className="mt-4">
                <Link href="/privacy-policy" className="transition-colors duration-200">Политика конфиденциальности</Link> |
                <Link href="/terms" className="transition-colors duration-200">Условия использования</Link>
            </p>
        </footer>
    );
};

export default Footer;