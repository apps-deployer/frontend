FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# These are public URLs baked into the JS bundle, not secrets
# hadolint ignore=DL3040
ARG VITE_API_BASE_URL
ARG VITE_GH_APP_CONFIG_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
