# Emerald Plant Tracker

[![Docker Pulls](https://img.shields.io/docker/pulls/dmans218/emerald-plant-tracker?logo=docker)](https://hub.docker.com/r/dmans218/emerald-plant-tracker)
[![Docker Image Size](https://img.shields.io/docker/image-size/dmans218/emerald-plant-tracker/latest?logo=docker)](https://hub.docker.com/r/dmans218/emerald-plant-tracker)
[![GitHub](https://img.shields.io/badge/source-GitHub-181717?logo=github)](https://github.com/Dmans218/emerald-plant-tracker)
[![Buy Me a Coffee](https://img.shields.io/badge/donate-Ko--fi-29abe0?logo=ko-fi)](https://ko-fi.com/emeraldplantmanager)

Self-hosted cannabis cultivation tracker: plants, multi-tent environment, activity logs, archives, and a multi-brand nutrient calculator. Single container — React SPA + Express API + SQLite.

**Docs:** [GitHub repository](https://github.com/Dmans218/emerald-plant-tracker)

---

## Quick start

```bash
docker run -d \
  --name emerald-plant-tracker \
  -p 420:420 \
  -v emerald_data:/app/backend/data \
  -v emerald_uploads:/app/backend/uploads \
  dmans218/emerald-plant-tracker:latest
```

Open **http://localhost:420**

### Docker Compose

```yaml
services:
  emerald-plant-tracker:
    image: dmans218/emerald-plant-tracker:latest
    container_name: emerald-plant-tracker
    ports:
      - 420:420
    volumes:
      - emerald_data:/app/backend/data
      - emerald_uploads:/app/backend/uploads
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/app/backend/data/emerald-plant-tracker.db
      - ENABLE_PUBLIC_HEALTH=true
      # Optional:
      # - APP_AUTH_TOKEN=change-me
      # - INTEGRATION_SECRET=change-me-for-spider-farmer
      # - CORS_ORIGINS=https://grow.example.com
    restart: unless-stopped
    user: "1000:1000"
volumes:
  emerald_data:
  emerald_uploads:
```

Or pull the compose file from GitHub:

```bash
curl -O https://raw.githubusercontent.com/Dmans218/emerald-plant-tracker/main/docker-compose.yml
docker compose up -d
```

---

## Features

- **Plants & tents** — stage, strain, multi-tent layout, photos, archive/unarchive, CSV export
- **Logs** — watering, feeding, training, env checks; optional pH/EC, VPD metrics, photos
- **Environment** — temp, humidity, pH, light hours, VPD, CO₂, PPFD; charts and weekly averages
- **Nutrient calculator** — 10 brands (GH, Advanced Nutrients, Fox Farm, Canna, Jack’s, MegaCrop, and more)
- **Privacy** — SQLite on your volumes; optional API token auth

---

## Tags

| Tag | Description |
|-----|-------------|
| `latest` | Current stable image (recommended) |
| `v1.1.0` | 2026 release — security hardening, UI refresh, archive/export, auth options |
| `v1.0.x` | Earlier releases |

Always prefer `latest` or a pinned version tag for production.

---

## Volumes

| Path | Purpose |
|------|---------|
| `/app/backend/data` | SQLite database |
| `/app/backend/uploads` | Photos |

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `420` | HTTP port |
| `NODE_ENV` | `production` | Production mode in this image |
| `DATABASE_URL` | `/app/backend/data/emerald-plant-tracker.db` | SQLite path |
| `APP_AUTH_TOKEN` | unset | If set, require `X-API-Token` / Bearer on API |
| `ENABLE_PUBLIC_HEALTH` | `true` | Allow unauthenticated `/api/health` when token is set |
| `INTEGRATION_SECRET` | unset | Enables Spider Farmer webhook |
| `CORS_ORIGINS` | — | Extra allowed browser origins (comma-separated) |
| `RATE_LIMIT_MAX` | `200` | Max requests per IP per minute |

More detail: [docs/SECURITY_AND_OPS.md](https://github.com/Dmans218/emerald-plant-tracker/blob/main/docs/SECURITY_AND_OPS.md)

---

## Health & backup

- Health: `GET /api/health`
- DB download: `GET /api/backup` (honors `APP_AUTH_TOKEN` when set)

---

## Security notes

Designed for **private LAN / self-host** use. Do not expose to the public internet without authentication, a reverse proxy, and network controls. Use `APP_AUTH_TOKEN` when practical.

---

## Support

- [GitHub Issues](https://github.com/Dmans218/emerald-plant-tracker/issues)
- [GitHub Sponsors](https://github.com/sponsors/Dmans218)
- [Ko-fi](https://ko-fi.com/emeraldplantmanager)

MIT License — see the GitHub repo.
