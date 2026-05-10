# Clinic Management System

Full-stack clinic attendance and payroll management app.

## Stack

- React + Vite frontend
- Node.js + Express backend
- Supabase database/auth
- Face recognition with `face-api.js`

## Local Development

Install dependencies:

```bash
npm run install:all
```

Create environment files from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Run the backend:

```bash
npm run dev:server
```

Run the frontend in a second terminal:

```bash
npm run dev:client
```

The client runs on `http://localhost:3000` and proxies `/api` plus `/uploads` to the backend on `http://localhost:5000`.

## Production Build

Build the frontend:

```bash
npm run build
```

Start the production server:

```bash
NODE_ENV=production npm start
```

In production, Express serves the built React app from `client/dist` and keeps the API under `/api`.

Health check:

```bash
GET /api/health
```

## Docker Deploy

Build and run the single production container:

```bash
docker compose up --build
```

The app is exposed on `http://localhost:5000`.

## Required Server Environment

- `PORT`
- `NODE_ENV`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN` for comma-separated allowed origins in non-same-origin deployments

## Client Environment

- `VITE_API_URL` for separate frontend/backend deployments. Leave empty for same-origin production.
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
