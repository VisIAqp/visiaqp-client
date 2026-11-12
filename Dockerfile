FROM node:24-bookworm-slim AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY angular.json tsconfig*.json .postcssrc.json ./
COPY public/ public/
COPY src/ src/
RUN pnpm build --configuration production,docker --output-path dist/docker

FROM nginx:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/docker/browser/ /usr/share/nginx/html/
EXPOSE 8080
