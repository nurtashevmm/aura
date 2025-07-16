'use client';

import React from 'react';

const FAQSection: React.FC = () => {
    const toggleFaq = (event: React.MouseEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const answer = element.querySelector('.faq-answer') as HTMLElement;
        const icon = element.querySelector('svg') as SVGSVGElement;

        if (answer.classList.contains('open')) {
            answer.classList.remove('open');
            icon.style.transform = 'rotate(0deg)';
        } else {
            document.querySelectorAll('.faq-answer.open').forEach(item => {
                item.classList.remove('open');
                (item.closest('.faq-item')?.querySelector('svg') as SVGSVGElement).style.transform = 'rotate(0deg)';
            });
            answer.classList.add('open');
            icon.style.transform = 'rotate(180deg)';
        }
    };

    return (
        <section className="mb-12">
            <h3 className="text-3xl font-bold mb-6">Часто задаваемые вопросы (FAQ)</h3>
            <div className="space-y-4">
                <div className="faq-item" onClick={toggleFaq}>
                    <div className="faq-question">
                        Как начать играть?
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="faq-answer">
                        Для начала игры вам необходимо зарегистрироваться, выбрать желаемую игру и доступную &quot;машину&quot; (ПК или консоль) для аренды. После этого вы сможете подключиться и начать играть.
                    </div>
                </div>
                <div className="faq-item" onClick={toggleFaq}>
                    <div className="faq-question">
                        Какое оборудование мне нужно?
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="faq-answer">
                        Вам потребуется только стабильное интернет-соединение и устройство с браузером (ноутбук, ПК, Mac, смартфон, планшет или Smart TV). Мощное игровое оборудование не требуется, так как вы арендуете его у других пользователей.
                    </div>
                </div>
                <div className="faq-item" onClick={toggleFaq}>
                    <div className="faq-question">
                        Как стать мерчантом?
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="faq-answer">
                        Если у вас есть мощный игровой ПК или консоль, вы можете зарегистрироваться как мерчант. Наша платформа предоставит вам инструменты для управления арендой вашего оборудования и получения дохода.
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
