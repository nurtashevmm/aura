import React from 'react';

const HowItWorksSection: React.FC = () => {
    return (
        <section className="mb-12">
            <h3 className="text-3xl font-bold mb-6">Как это работает</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Играй в свои игры</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Подключай свои аккаунты Steam, Epic Games Store и других лаунчеров. Запускай игры из собственной коллекции на мощных компьютерах нашего сообщества.
                    </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Твой гейминг на любом устройстве</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Преврати свой ноутбук, старый ПК, MacBook или Android-устройство в игровую станцию. Все, что нужно — стабильный интернет.
                    </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Выбери свою мощность</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Получи доступ к разнообразному железу: от проверенных сборок на GeForce и Radeon до игровых консолей PlayStation. Подбери конфигурацию, которая подходит под твои задачи и бюджет.
                    </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Без скачиваний</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Забудь про долгое ожидание. Игры на компьютерах нашего сообщества уже установлены. Выбирай машину и погружайся в игру за считанные минуты.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
