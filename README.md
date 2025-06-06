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

### 📊 Activity Logging
- Log various activities: watering, feeding, pruning, training, observations
- Record measurements with values and units
- Upload photos to track visual progress
- Maintain detailed cultivation timeline

### 📈 Dashboard Overview
- View all plants at a glance
- Track cultivation statistics
- Quick access to plant details

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
  -p 420:5000 \
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
   This starts both frontend (port 3000) and backend (port 5000) in development mode.

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

## File Structure

```
Emerald-Plant-Tracker/
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
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utilities and API calls
│   └── Dockerfile
├── docs/                   # Documentation files
├── .github/                # GitHub Actions and templates
├── docker-compose.yml      # Docker orchestration
├── setup-dev.sh            # Development setup script
├── setup-prod.sh           # Production setup script
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

---

## Security Notes

- This application is designed for **personal use only**
- Run behind a VPN or on a private network
- Do not expose to the public internet without proper security measures
- Regular backups are recommended
- Understand your local laws regarding cannabis cultivation

---

## Troubleshooting

**Cannot connect to backend:**
- Ensure the container is running: `docker ps`
- Check logs: `docker logs emerald_plant_tracker`

**Database persistence:**
- The SQLite database is stored in a Docker volume (`emerald_data`) and will persist across container rebuilds.

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

### Development Resources

The project contains a `dev-resources/` directory that is not included in the releases but is useful for development:

- **test_images/**: Sample controller images for OCR testing
- **db-backups/**: Development database backups
- **Log files**: Build logs and Docker build output for debugging

These resources are excluded from the .gitignore file and should not be committed to the repository.

## Disclaimer

This software is for educational and personal use only. Users are responsible for complying with all applicable local, state, and federal laws regarding cannabis cultivation. The developers assume no responsibility for any illegal activities.

---

**Happy Growing! 🌱** 