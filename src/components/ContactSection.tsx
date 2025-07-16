import React from 'react';

const ContactSection: React.FC = () => {
    return (
        <section className="mb-12">
            <h3 className="text-3xl font-bold mb-6">Контакты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent-primary)' }}>Служба поддержки</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Если у вас возникли вопросы или проблемы, свяжитесь с нашей службой поддержки.
                    </p>
                    <p className="text-lg font-bold mt-4" style={{ color: 'var(--text-primary)' }}>Email: support@auraplay.kz</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Телефон: +7 (777) 123-45-67</p>
                </div>
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent-primary)' }}>Наш адрес</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Мы находимся в самом сердце Казахстана.
                    </p>
                    <p className="text-lg font-bold mt-4" style={{ color: 'var(--text-primary)' }}>Казахстан, г. Астана, ул. Примерная, 1</p>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
