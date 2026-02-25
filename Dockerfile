# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: bağımlılıkları yükle
# ──────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Sadece lock dosyalarını kopyala, npm ci ile kesin versiyon yüklemesi yap
COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder: üretim build'ini oluştur
# ──────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build sırasında Next.js'in env ihtiyacını karşıla (runtime'da gerçek değerler gelecek)
ENV NEXT_TELEMETRY_DISABLED=1
ENV ANTHROPIC_API_KEY=build-placeholder
ENV APP_USERNAME=admin
ENV APP_PASSWORD_HASH=build-placeholder
ENV JWT_SECRET=build-placeholder

RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner: minimal çalışma ortamı
# ──────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Güvenlik: root dışında çalış
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone çıktısını kopyala
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# Kullanıcı verisi için yazılabilir data dizini (volume mount noktası)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO /dev/null http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
