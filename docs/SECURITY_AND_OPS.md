# Security & Operations Notes

## Optional API authentication

Set a shared token so LAN clients must authenticate:

```bash
export APP_AUTH_TOKEN=your-long-random-secret
```

Clients should send either:

- `X-API-Token: your-long-random-secret`
- `Authorization: Bearer your-long-random-secret`

With auth enabled, set `ENABLE_PUBLIC_HEALTH=true` so Docker/K8s probes can reach `/api/health` without a token (default in production Dockerfile).

## Integration webhooks (Spider Farmer)

`POST /api/environment/spider-farmer` is **disabled** until you set:

```bash
export INTEGRATION_SECRET=another-secret
```

Send header `X-Integration-Secret` (or the app token).

## CORS

Additional browser origins:

```bash
export CORS_ORIGINS=https://grow.example.com,http://192.168.1.50:8080
```

## Backups

- Download SQLite DB: `GET /api/backup` (respects `APP_AUTH_TOKEN` when set)
- Docker volumes: `emerald_data` (DB) and `emerald_uploads` (photos)

## Ports

| Mode | Frontend | API |
|------|----------|-----|
| Production Docker | served by Express on **420** | **420** |
| Local `npm run dev` | CRA on 3000 (proxy → API) | **420** (default) |

`REACT_APP_API_URL` can override the API base for the SPA when the frontend and API are split.

## Future: Vite

CRA (react-scripts + craco) is still used. A Vite migration would replace `react-scripts` / `craco` with `vite` + `@vitejs/plugin-react`, move `index.html` to project root, and use `import.meta.env.VITE_*` instead of `REACT_APP_*`. Prefer this when next modernizing the toolchain.
