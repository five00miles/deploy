# NestJS + Prisma + MySQL Example

This project is a minimal NestJS REST API example backed by Prisma ORM and MySQL.

## Stack

- NestJS
- Prisma ORM
- MySQL via Docker Compose
- pnpm

## Endpoints

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `DELETE /users/:id`

## Quick Start

1. Copy `.env.example` to `.env`.
   The default development connection uses the Docker `root` account so `prisma migrate dev` can create its shadow database.
2. Start MySQL:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
pnpm install
```

4. Generate Prisma Client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate --name init
```

5. Start the application:

```bash
pnpm start:dev
```

The API runs on `http://localhost:3000`, and MySQL is exposed on `localhost:3307`.

## Example Requests

Create a user:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice"}'
```

List users:

```bash
curl http://localhost:3000/users
```

Get one user:

```bash
curl http://localhost:3000/users/1
```

Delete a user:

```bash
curl -X DELETE http://localhost:3000/users/1
```

## Testing

Run the e2e tests after the MySQL container and migration are ready:

```bash
pnpm test:e2e
```
