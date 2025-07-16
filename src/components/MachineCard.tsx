import React from 'react';

interface MachineCardProps {
    icon: string;
    title: string;
    processor: string;
    gpu: string;
    ram: string;
    price: string;
}

const MachineCard: React.FC<MachineCardProps> = ({ icon, title, processor, gpu, ram, price }) => {
    return (
        <div className="card rounded-lg overflow-hidden shadow-md carousel-item machine-card-height">
            <div className="p-4">
                <div className="text-4xl mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>{icon}</div>
                <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>**Процессор:** {processor}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>**Видеокарта:** {gpu}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>**ОЗУ:** {ram}</p>
                <p className="text-sm font-bold mt-2" style={{ color: 'var(--accent-primary)' }}>{price}</p>
                <button className="btn-primary w-full py-2 rounded-md font-medium text-sm mt-4">Список игр</button>
            </div>
        </div>
    );
};

export default MachineCard;
