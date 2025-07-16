# AURA Play — Облачный гейминг маркетплейс

## Быстрый старт

1. Клонируйте репозиторий и установите зависимости:
   ```sh
   git clone <repo-url>
   cd aura
   npm install
   ```
2. Настройте переменные окружения в `.env`:
   ```env
   DATABASE_URL=postgres://... (Neon/Vercel Postgres)
   NEXTAUTH_SECRET=... (случайная строка)
   CLOUDINARY_CLOUD_NAME=... (для загрузки скриншотов)
   CLOUDINARY_UPLOAD_PRESET=...
   ```
3. Примените миграции и сгенерируйте Prisma Client:
   ```sh
   npx prisma migrate deploy
   npx prisma generate
   ```
4. Запустите проект:
   ```sh
   npm run dev
   ```

## Архитектура проекта

### Основные компоненты
1. **Слой P2P-связи** (Tailscale/WebRTC)
2. **Ядро производительности** (Rust)
3. **Фронтенд** (Next.js 14)
4. **Система монетизации**
5. **Инфраструктура автомасштабирования**

### Технологический стек
- **Фронтенд**: Next.js 14, Tailwind CSS, Framer Motion
- **Бэкенд**: Rust (производительность), Node.js (API)
- **Сеть**: Tailscale, WebRTC
- **База данных**: CockroachDB (бесплатный тариф)
- **Инфраструктура**: Vercel, Cloudflare, Neon DB

## Основные сценарии
- Регистрация с выбором роли (игрок/мерчант)
- Добавление серверов и загрузка скриншота (мерчант)
- Модерация серверов (админ)
- Каталоги игр и серверов с фильтрами
- Аренда: старт/завершение сессии, списание баланса
- Управление балансом и ролями (админ)
- CMS: редактирование баннеров, инструкций, текстовых блоков через админку

## WASM Integration

1. Build WASM module:
```bash
cd aura-wasm && wasm-pack build --target web --out-dir ../next-app/public/wasm
```

2. Import in Next.js:
```javascript
import init, { add } from '/wasm/aura_wasm';
```

3. Initialize:
```javascript
await init();
```

## Deployment

1. Build release version:
```bash
cargo build --release
```

2. Copy configs:
```bash
mkdir -p /opt/aura/config
cp config/prod.toml config/tls.toml /opt/aura/config/
```

3. Setup systemd service:
```bash
sudo cp deploy/aura-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now aura-backend
```

## Деплой
- Рекомендуется деплой на Vercel (frontend+backend) и Neon (Postgres)
- Не забудьте указать все переменные окружения в настройках Vercel
- Для Cloudinary: настройте cloud_name и upload_preset в компоненте MachineForm

## Поддержка и обслуживание
- Все инструкции для игроков, мерчантов и админа доступны и редактируются через CMS
- Для обновления платформы: pull + npm install + prisma migrate deploy
- Для резервного копирования: используйте экспорт базы данных Postgres
- Для мониторинга: используйте логи Vercel/Neon

## Безопасность
- Пароли хранятся в виде хеша (bcryptjs)
- Все API защищены через next-auth и middleware
- Для production обязательно используйте HTTPS и уникальные секреты

## Smoke-тесты (чек-лист для ручной проверки)

- [ ] Регистрация игрока и мерчанта (разные роли)
- [ ] Вход под разными ролями, редиректы в кабинеты
- [ ] Добавление сервера мерчантом, загрузка скриншота
- [ ] Модерация сервера админом (approve/reject)
- [ ] Каталог игр и серверов, фильтры
- [ ] Старт аренды (кнопка "Играть"), списание баланса
- [ ] Завершение аренды (кнопка "Завершить сессию")
- [ ] История сессий игрока
- [ ] Статистика и доходы мерчанта
- [ ] Управление балансом и ролями через админку
- [ ] Редактирование CMS-блоков (баннеры, инструкции)
- [ ] Инструкции для всех ролей доступны и редактируются
- [ ] Проверка безопасности: нельзя попасть в чужой кабинет, нельзя стартовать аренду без баланса

---

AURA Play — open-source альтернатива облачным игровым платформам. Все вопросы и баги — через Issues на GitHub.
