# 🌿 Emerald Plant Tracker - Cannabis Cultivation Tracker

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Dockerized](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![GitHub Sponsors](https://img.shields.io/badge/sponsor-GitHub%20Sponsors-fc2967?logo=github)](https://github.com/sponsors/Dmans218)
[![Donate with PayPal](https://img.shields.io/badge/donate-PayPal-00457C?logo=paypal)](https://paypal.me/Emeraldplanttracker?country.x=CA&locale.x=en_US)

A modern, self-hosted web application for tracking cannabis plant growth, activities, and progress. Built with React, Express, and SQLite, and fully Dockerized for easy deployment. Perfect for personal cultivation management and privacy-focused growers.

---

## Features

### 🌿 Plant Management
- Add and manage multiple cannabis plants
- Track growth stages (seedling → vegetative → flowering → harvest → cured)
- Store strain information and cultivation notes
- Monitor planted dates and expected harvest times

### 📊 Activity & Environment Logging
- Log activities: watering, feeding, pruning, training, observations
- Record environmental data: temperature, humidity, VPD, CO₂, PPFD, pH, light hours, growth stage, grow tent, notes
- Upload photos to track visual progress
- Maintain a detailed cultivation timeline

### 📈 Dashboard Overview
- View all plants at a glance
- Track cultivation and environment statistics
- Quick access to plant and environment details
- Export environment data to CSV

### 🐳 Self-Hosted & Docker Ready
- Single-container Docker setup for easy deployment
- SQLite database for simplicity and persistence
- No external dependencies required
- Runs entirely on your own hardware

---

## 🚀 Quick Start (Docker Hub)

You can run Emerald Plant Tracker directly from Docker Hub—no need to clone the repo!

### **Option 1: Docker Run**

```bash
sudo docker run -d \
  --name emerald-plant-tracker \
  -p 420:420 \
  -v emerald_data:/app/backend/data \
  -v $(pwd)/backend/uploads:/app/backend/uploads \
  dmans218/emerald-plant-tracker:latest
```
- App will be available at [http://localhost:420](http://localhost:420)
- Data is persisted in the `emerald_data` Docker volume

### **Option 2: Docker Compose**

The repository comes with a pre-configured docker-compose.yml file.

Run the setup script:
```bash
./setup-prod.sh
```

Then start the container:
```bash
sudo docker-compose up -d
```

Access the application at [http://localhost:420](http://localhost:420)

---

## 🛠️ Development Setup (from Source)

If you want to contribute or run the app in development mode:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dmans218/emerald-plant-tracker.git
   cd emerald-plant-tracker
   ```

2. **Run the setup script:**
   ```bash
   ./setup-dev.sh
   ```
   This will install all dependencies and create necessary directories.

3. **Start development servers:**
   ```bash
   # From project root:
   npm run dev
   ```
   This starts both frontend and backend. The app will be available at [http://localhost:420](http://localhost:420).

---

## ⚙️ Configuration & Environment Variables

- **PORT**: The backend and frontend both use port `420` by default. You can override this by setting the `PORT` environment variable, but all examples and Docker configs assume 420.
- **NODE_ENV**: Set to `production` or `development` as needed (default is `production` in Docker).
- No other required environment variables by default.

---

## File Structure

```
Growlogger/
├── backend/                 # Node.js API server
│   ├── data/               # SQLite database files
│   ├── routes/             # API routes
│   ├── services/           # Business logic and services
│   ├── uploads/            # Uploaded images
│   ├── database.js         # SQLite database setup
│   ├── server.js           # Express server
│   └── Dockerfile
├── frontend/               # React web application
│   ├── public/             # Static files
│   ├── src/                # Source code (components, pages, utils)
│   └── Dockerfile
├── docs/                   # Documentation files
├── docker-compose.yml      # Docker orchestration
├── setup-dev.sh            # Development setup script
├── setup-prod.sh           # Production setup script
├── .dockerignore           # Docker build context exclusions
├── .gitignore              # Git exclusions
└── README.md
```

---

## API Endpoints

### Plants
- `GET /api/plants` - List all plants
- `POST /api/plants` - Create new plant
- `GET /api/plants/:id` - Get plant details
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Logs
- `GET /api/logs` - List activity logs
- `POST /api/logs` - Create new log
- `POST /api/logs/photo` - Upload photo log
- `DELETE /api/logs/:id` - Delete log
- `GET /api/logs/stats/:plantId` - Get plant statistics

### Environment
- `GET /api/environment` - List environment logs
- `POST /api/environment` - Create new environment log
- `GET /api/environment/weekly` - Get weekly environment averages
- `GET /api/environment/grow-tents` - List available grow tents

---

## Security Notes

- This application is designed for **personal/private use only**
- **Do not expose to the public internet** without proper security measures (VPN, firewall, etc.)
- Data is stored locally in SQLite and Docker volumes
- `.env` files and local SQLite DBs are excluded from Docker images by `.dockerignore`
- Regular backups are recommended
- Understand your local laws regarding cannabis cultivation

---

## Production & Build Context

- The `.dockerignore` file ensures that development files, local node_modules, logs, test images, and other non-production files are **not** included in your Docker images.
- The `.gitignore` file keeps your repository clean by ignoring dependencies, build output, logs, and local environment files.
- Only production-ready code and configuration are shipped in your Docker images.

---

## Troubleshooting

**Cannot connect to backend:**
- Ensure the container is running: `docker ps`
- Check logs: `docker logs emerald_plant_tracker`

**Database persistence:**
- The SQLite database is stored in a Docker volume (`emerald_data`) and will persist across container rebuilds.

**Port conflicts:**
- Make sure port 420 is not in use by another application.

---

## Contributing

Pull requests and suggestions are welcome! Please open an issue or PR on GitHub.

### Continuous Integration / Continuous Deployment

This project uses GitHub Actions for CI/CD:

- **CI Workflow**: Automatically tests and builds the application on every push and pull request.
- **CodeQL Analysis**: Security scanning to detect vulnerabilities in the codebase.
- **Docker Workflow**: Builds and tests Docker images when changes are made to Docker-related files.
- **Dependabot**: Automatically submits PRs for dependency updates with the following schedule:
  - NPM dependencies: Weekly updates
  - Docker dependencies: Monthly updates
  - GitHub Actions: Monthly updates

Minor and patch updates from Dependabot will be automatically merged if all tests pass.

---

## Support & Donations

Emerald Plant Tracker is built and maintained by a Canadian developer. If you find this project useful, please consider supporting its development—your donations help pay my bills and keep this project alive!

- [![GitHub Sponsors](https://img.shields.io/badge/sponsor-GitHub%20Sponsors-fc2967?logo=github)](https://github.com/sponsors/Dmans218)
- [![Donate with PayPal](https://img.shields.io/badge/donate-PayPal-00457C?logo=paypal)](https://paypal.me/Emeraldplanttracker?country.x=CA&locale.x=en_US)

*Your support means a lot and helps keep this project free and open source for everyone!*

---

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute it, including for commercial purposes. Donations are welcome but not required.

---

**Happy Growing! 🌱** 