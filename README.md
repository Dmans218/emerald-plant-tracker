# Emerald Plant Tracker

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Docker Ready](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![GitHub Sponsors](https://img.shields.io/badge/sponsor-GitHub%20Sponsors-fc2967?logo=github)](https://github.com/sponsors/Dmans218)
[![Buy Me a Coffee](https://img.shields.io/badge/donate-Ko--fi-29abe0?logo=ko-fi)](https://ko-fi.com/emeraldplantmanager)

Self-hosted cannabis cultivation tracker for plants, environment, activity logs, archives, and a multi-brand nutrient calculator. Built with React, Express, and SQLite — one Docker container, data stays on your hardware.

**Live app after deploy:** [http://localhost:420](http://localhost:420)

---

## Features

### Plants & grow tents
- Track plants from seed through harvest (stage, strain, tent, notes)
- Multi-tent organization with per-tent environment snapshots on the plants home view
- Photo docs and activity history on plant detail
- Archive completed grows with yield / harvest metadata; unarchive when needed
- CSV export for archived plants and full tent datasets

### Activity logs
- Log watering, feeding, pruning, training, environmental checks, and observations
- Optional fields: pH, EC/TDS, temp/humidity, PPFD, CO₂, water amount, nutrients, height
- Photo uploads attached to log entries
- Filter and review history across plants

### Environment
- Multi-tent readings: temperature, humidity, pH, light hours, VPD, CO₂, PPFD
- Charts and weekly averages for trends
- Client-side CSV export of filtered readings
- Optional **Spider Farmer** webhook (`POST /api/environment/spider-farmer`) when `INTEGRATION_SECRET` is set

### Nutrient calculator
- **10 brands:** General Hydroponics FloraSeries, Advanced Nutrients, Fox Farm, Canna, Jack’s 321, MegaCrop, Botanicare, Dyna-Gro, House & Garden, Nectar for the Gods
- Weekly schedules and stage-aware mixing strength
- Tank size, medium, and watering-method adjustments
- PPM/EC targets and pH guidance; prefs in `localStorage`; copyable recipes

### Self-hosting
- Single production image: API + built React SPA on **port 420**
- SQLite + Docker volumes for DB and uploads
- Optional API token, rate limiting, Helmet headers, CORS for private LAN ranges
- Health check: `GET /api/health`
- DB backup download: `GET /api/backup`

---

## Quick start (Docker Hub)

### Docker Run

```bash
docker run -d \
  --name emerald-plant-tracker \
  -p 420:420 \
  -v emerald_data:/app/backend/data \
  -v emerald_uploads:/app/backend/uploads \
  dmans218/emerald-plant-tracker:latest
```

### Docker Compose

```bash
curl -O https://raw.githubusercontent.com/Dmans218/emerald-plant-tracker/main/docker-compose.yml
docker compose up -d
```

Or use this compose file:

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
      # Optional hardening (see docs/SECURITY_AND_OPS.md):
      # - APP_AUTH_TOKEN=change-me
      # - INTEGRATION_SECRET=change-me-for-spider-farmer
      # - CORS_ORIGINS=https://grow.example.com
    restart: unless-stopped
    user: "1000:1000"
volumes:
  emerald_data:
  emerald_uploads:
```

Open **http://localhost:420**. Persist data with the named volumes above.

### Build from source

```bash
git clone https://github.com/Dmans218/emerald-plant-tracker.git
cd emerald-plant-tracker
docker compose up -d --build
```

---

## Development

**Requirements:** Node.js ≥ 20, npm ≥ 10

```bash
git clone https://github.com/Dmans218/emerald-plant-tracker.git
cd emerald-plant-tracker

npm install
cd backend && npm install && cd ..
cd frontend && npm install --legacy-peer-deps && cd ..

# API on :420, CRA dev server on :3000 (proxies /api → backend)
npm run dev
```

| Script | Location | Purpose |
|--------|----------|---------|
| `npm run dev` | root | Backend (nodemon) + frontend (CRACO) together |
| `npm start` | root / backend | Production-style API only |
| `npm run build` | root | Build React app into `frontend/build` |
| `npm test` | backend | Node test suite (`backend/test`) |
| `npm test` | frontend | CRA/CRACO tests |
| `npm run lint` | frontend | ESLint on `src/` |

Default API port is **420** (`PORT`). Frontend dev uses **3000** with `"proxy": "http://localhost:420"`.

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `420` | HTTP listen port |
| `NODE_ENV` | — | `production` serves SPA from backend `public/` and tightens logging |
| `DATABASE_URL` | `backend/data/emerald-plant-tracker.db` | SQLite file path |
| `APP_AUTH_TOKEN` | unset | If set, require `X-API-Token` or `Authorization: Bearer` on API calls |
| `ENABLE_PUBLIC_HEALTH` | `true` in Docker image | Allow unauthenticated `GET /api/health` when token auth is on |
| `INTEGRATION_SECRET` | unset | Required (or app token) for Spider Farmer webhook |
| `CORS_ORIGINS` | — | Extra allowed origins (comma-separated) |
| `RATE_LIMIT_MAX` | `200` | Max requests per IP per minute |
| `REACT_APP_API_URL` | same origin / proxy | Frontend API base when SPA and API are split |

More detail: [docs/SECURITY_AND_OPS.md](docs/SECURITY_AND_OPS.md).

---

## Project structure

```text
emerald-plant-tracker/
├── backend/
│   ├── routes/           # plants, logs, environment, tents
│   ├── utils/            # CSV + DB helpers
│   ├── test/             # API smoke tests
│   ├── database.js       # SQLite schema & migrations
│   ├── server.js         # Express app (API + static SPA in production)
│   └── uploads/          # Photo storage (volume in Docker)
├── frontend/
│   ├── src/
│   │   ├── components/   # Header, PageHeader, ImageUpload
│   │   ├── pages/        # Plants, PlantDetail, Logs, Environment, Archive, Calculator
│   │   ├── data/         # Nutrient brand schedules
│   │   └── utils/        # API client, dates, OCR helper, stage colors
│   └── build/            # Production SPA (also copied into image as backend/public)
├── docs/                 # Ops & security notes
├── Dockerfile            # Multi-stage unified image
├── docker-compose.yml    # Production / Docker Hub
└── package.json          # Root scripts (concurrently)
```

**App routes (SPA):** `/` plants · `/plants/:id` · `/logs` · `/environment` · `/archived` · `/calculator`

---

## API overview

Base path: `/api`. When `APP_AUTH_TOKEN` is set, send the token on each request.

### Plants
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/plants` | List active plants |
| `POST` | `/plants` | Create plant |
| `GET` | `/plants/:id` | Plant detail |
| `PUT` | `/plants/:id` | Update plant |
| `DELETE` | `/plants/:id` | Delete plant |
| `POST` | `/plants/:id/archive` | Archive grow |
| `GET` | `/plants/archived` | List archived grows |
| `GET` | `/plants/archived/:id` | Archived grow detail |
| `POST` | `/plants/archived/:id/unarchive` | Restore plant |
| `GET` | `/plants/archived/:id/export` | CSV export (single grow) |
| `GET` | `/plants/archived/tent/:tentName/export` | CSV export (tent) |
| `GET` | `/plants/grow-tents` | Distinct tent names |
| `GET` | `/plants/tent/:tentName/summary` | Tent summary |

### Logs
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/logs` | List logs (query filters) |
| `GET` | `/logs/:id` | Single log |
| `POST` | `/logs` | Create log |
| `POST` | `/logs/photo` | Create log with photo (`multipart`) |
| `PUT` | `/logs/:id` | Update log |
| `DELETE` | `/logs/:id` | Delete log |
| `GET` | `/logs/stats/:plant_id` | Stats for a plant |

### Environment
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/environment` | List readings |
| `GET` | `/environment/latest` | Latest reading(s) |
| `GET` | `/environment/latest-per-tent` | Latest per tent |
| `GET` | `/environment/weekly` | Weekly averages |
| `GET` | `/environment/grow-tents` | Tents with env data |
| `POST` | `/environment` | Create reading |
| `POST` | `/environment/spider-farmer` | Integration webhook (secret required) |
| `PUT` | `/environment/:id` | Update reading |
| `DELETE` | `/environment/:id` | Delete reading |

### Tents & system
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tents` | Tent list / metadata |
| `GET` | `/tents/:tentName/summary` | Tent summary |
| `DELETE` | `/tents/:tentName/environment` | Clear env data for tent |
| `GET` | `/health` | Liveness + DB check |
| `GET` | `/backup` | Download SQLite file |

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, React Router 7, CRACO / react-scripts, axios, recharts, react-hook-form, lucide-react |
| Backend | Express 5, SQLite (`sqlite3`), Joi validation, multer, Helmet, express-rate-limit |
| Runtime | Node ≥ 20 (Docker image uses Node 22) |
| Deploy | Multi-stage Dockerfile, single process serves API + SPA |

---

## CI / CD

GitHub Actions on `main` / `develop`:

- **CI** — install, security audit (non-blocking), backend + frontend tests, frontend build
- **Lint** — frontend ESLint
- **Docker** — image build checks for Docker-related changes
- **CodeQL** — security analysis
- **Dependabot** — dependency PRs (auto-merge for safe minor/patch when configured)

---

## Security

Designed for **personal / private LAN** use. Do not expose it to the public internet without authentication, a reverse proxy, and network controls.

- Prefer setting `APP_AUTH_TOKEN` on trusted networks
- Use `INTEGRATION_SECRET` for device webhooks
- Back up volumes (`emerald_data`, `emerald_uploads`) and/or `GET /api/backup`
- Comply with local laws regarding cannabis cultivation

See [docs/SECURITY_AND_OPS.md](docs/SECURITY_AND_OPS.md).

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| App not reachable | `docker ps`, `docker logs emerald-plant-tracker`, port **420** free |
| Data lost after recreate | Mount `emerald_data` and `emerald_uploads` volumes |
| 401 on API | Token auth enabled — send `X-API-Token` / Bearer, or unset `APP_AUTH_TOKEN` |
| CORS errors | Access via allowed origin, or add host to `CORS_ORIGINS` |
| Calculator prefs reset | Allow `localStorage` for the app origin |
| Healthcheck failing | DB path writable; `GET /api/health` returns `status: OK` |

---

## Contributing

Issues and pull requests are welcome. Run backend tests and a frontend build before opening a PR:

```bash
cd backend && npm test
cd ../frontend && npm test && npm run build
```

---

## Support

Maintained by a Canadian developer. If Emerald is useful for your grow, sponsorships help keep it free and open source:

- [GitHub Sponsors](https://github.com/sponsors/Dmans218)
- [Ko-fi](https://ko-fi.com/emeraldplantmanager)

---

## License

This project is licensed under the [MIT License](LICENSE). Free to use, modify, and distribute. Donations are optional.

Happy growing.
