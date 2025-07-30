# Blog CRUD

## Стек

- NestJS (Fastify)
- TypeORM + PostgreSQL
- ioredis (кэш)
- Swagger (API docs)

---

## Установка

```bash
npm i
```

## Описание .env для проекта
```bash
# PostgreSQL
POSTGRES_HOST=localhost             # Хост базы данных
POSTGRES_PORT=5432                  # Порт PostgreSQL
POSTGRES_USER=postgres              # Логин БД
POSTGRES_PASSWORD=postgres          # Пароль БД
POSTGRES_DB=blog                    # Название базы данных

# Redis
REDIS_HOST=localhost                # Хост Redis
REDIS_PORT=6379                     # Порт Redis
```
