# SoloRPG

Node.js, Express, Vue, and local Postgres scaffold.

## Prerequisites

- Node.js 20+
- Docker Desktop or Docker Engine

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run dev
```

The Vue app runs at `http://localhost:5173`.
The Express API runs at `http://localhost:3000`.

## Useful Commands

```bash
npm run dev
npm run build
npm start
docker compose up -d
docker compose down
```
