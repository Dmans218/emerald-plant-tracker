# 🌿 Emerald Plant Tracker - Cannabis Cultivation Tracker

A self-hosted web application for tracking cannabis plant growth, activities, and progress. Perfect for personal cultivation management.

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
- Monitor recent activities
- Track cultivation statistics
- Quick access to plant details

### 🐳 Self-Hosted & Docker Ready
- Complete Docker setup for easy deployment
- SQLite database for simplicity
- No external dependencies required
- Runs entirely on your own hardware

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB of available RAM
- 1GB of free disk space

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Emerald-Plant-Tracker
   ```

2. **Start the application:**
   ```bash
   npm run docker:up
   ```

3. **Access the application:**
   - Open your browser to `http://localhost:3000`
   - The API is available at `http://localhost:5000`

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start development servers:**
   ```bash
   # From project root
   npm run dev
   ```

   This starts both frontend (port 3000) and backend (port 5000) in development mode.

## Usage Guide

### Adding Your First Plant

1. Navigate to the **Plants** page
2. Click **"Add Plant"**
3. Fill in the plant details:
   - **Name**: A unique identifier (e.g., "Plant #1", "Blue Dream")
   - **Strain**: The cannabis strain you're growing
   - **Stage**: Current growth stage
   - **Planted Date**: When you started growing
   - **Expected Harvest**: Estimated harvest date
   - **Notes**: Any additional information

### Logging Activities

1. Go to **Activity Logs** page
2. Click **"Add Log"**
3. Select the plant and activity type:
   - **Watering**: Track watering sessions
   - **Feeding**: Record nutrient feeding
   - **Pruning**: Log trimming and pruning
   - **Training**: Document LST, topping, etc.
   - **Observation**: General notes and observations
   - **Harvest**: Record harvest activities

### Tracking Progress

- Use the **Dashboard** for a quick overview
- Check individual **Plant Details** for specific plant timelines
- Upload photos to visually document growth progress
- Add measurements with values and units for detailed tracking

## File Structure

```
Emerald-Plant-Tracker/
├── backend/                 # Node.js API server
│   ├── routes/             # API routes
│   ├── database.js         # SQLite database setup
│   ├── server.js           # Express server
│   └── Dockerfile
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utilities and API calls
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
└── README.md
```

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

## Configuration

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - SQLite database path
- `NODE_ENV` - Environment (development/production)

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL

### Docker Compose Override

Create `docker-compose.override.yml` for custom configuration:

```yaml
version: '3.8'
services:
  frontend:
    ports:
      - "8080:3000"  # Custom port
  backend:
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data  # Persistent data
```

## Data Management

### Backup
Your cultivation data is stored in SQLite database. To backup:

```bash
# Copy the database file
docker cp growlogger_backend_1:/app/data/growlogger.db ./backup.db
```

### Restore
```bash
# Restore from backup
docker cp ./backup.db growlogger_backend_1:/app/data/growlogger.db
docker restart growlogger_backend_1
```

## Security Notes

- This application is designed for **personal use only**
- Run behind a VPN or on a private network
- Do not expose to the public internet without proper security measures
- Regular backups are recommended
- Understand your local laws regarding cannabis cultivation

## Troubleshooting

### Common Issues

**Cannot connect to backend:**
- Ensure both containers are running: `docker ps`
- Check backend logs: `docker logs growlogger_backend_1`

**Database errors:**
- Verify data directory permissions
- Check available disk space
- Restart backend container

**Frontend not loading:**
- Clear browser cache
- Check frontend logs: `docker logs growlogger_frontend_1`
- Verify API URL configuration

### Development Issues

**Port conflicts:**
- Backend: Change port in `backend/package.json` and `docker-compose.yml`
- Frontend: Modify `frontend/package.json` start script

**Database reset:**
```bash
docker-compose down -v  # Removes volumes
docker-compose up --build
```

## Contributing

This is a personal cultivation tracking tool. Feel free to fork and modify for your own needs.

## License

MIT License - see LICENSE file for details.

## Disclaimer

This software is for educational and personal use only. Users are responsible for complying with all applicable local, state, and federal laws regarding cannabis cultivation. The developers assume no responsibility for any illegal activities.

---

**Happy Growing! 🌱** 