FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Baked into the static bundle at build time — set this to the deployed
# backend's URL via Dokploy's Build-time Arguments, e.g.
# https://rvrssb.aticaraga.tech (see src/api/api.ts).
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npx expo export -p web


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
