# ---- Estágio de desenvolvimento ----
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# ---- Estágio de produção ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---- Imagem final ----
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/.output /app/.output

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
