# Frontend

React и Vite frontend для платформы автоматизированного развертывания.

## Назначение

- GitHub login flow.
- Список проектов и страница проекта.
- Создание проекта с валидацией GitHub HTTPS clone URL.
- Управление окружениями.
- Project и environment variables.
- Настройка deployment config.
- Ручной запуск deployments и история запусков.
- Ссылка на настройку GitHub App.

## Конфигурация

Vite variables встраиваются в JavaScript bundle во время сборки.

Основные переменные:

- `VITE_API_BASE_URL` - публичный URL `api-gateway`.
- `VITE_GH_APP_CONFIG_URL` - GitHub App configuration/install URL.

## Локальный запуск

```bash
npm install
npm run dev
```

Локально приложение запускается через Vite dev server. По умолчанию API-запросы идут на:

```text
http://localhost:8002
```

если `VITE_API_BASE_URL` не задан.

## Сборка

```bash
npm run build
```

## Тесты

```bash
npm test -- --run
```

## Деплой

Helm chart находится в `charts/frontend`. Dockerfile собирает static assets и отдает их через Nginx.

Публичный ingress host обычно:

```text
xn--d1acmhpe.tech
```
