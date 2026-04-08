FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
COPY .env.staging ./.env.staging
COPY .env.production ./.env.production

ARG APP_ENV=prod

RUN APP_ENV=${APP_ENV} pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env.staging ./.env.staging
COPY --from=builder /app/.env.production ./.env.production

ARG APP_ENV=prod
ENV APP_ENV=${APP_ENV}

EXPOSE 3000

CMD ["node", "dist/main.js"]
