# The Last of Guss

Бэкенд для браузерной игры, где выжившие соревнуются, кто быстрее и больше натапает по виртуальному гусю.

## Стек

- Node.js + Fastify
- TypeScript
- Prisma + PostgreSQL
- Redis для счётчиков

## Запуск

```bash
npm install
npx prisma generate
npm run build
node dist/index.js
```

Переменные окружения:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379
ROUND_DURATION=60
COOLDOWN_DURATION=30
```
