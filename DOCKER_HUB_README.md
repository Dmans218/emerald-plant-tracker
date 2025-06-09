# 🌿 Emerald Plant Tracker - Advanced Cannabis Cultivation Management


[![Docker Pulls](https://img.shields.io/docker/pulls/dmans218/emerald-plant-tracker?logo=docker)](https://hub.docker.com/r/dmans218/emerald-plant-tracker)
[![Docker Image Size](https://img.shields.io/docker/image-size/dmans218/emerald-plant-tracker/latest?logo=docker)](https://hub.docker.com/r/dmans218/emerald-plant-tracker)
[![GitHub](https://img.shields.io/badge/source-GitHub-181717?logo=github)](https://github.com/Dmans218/emerald-plant-tracker)
[![Buy Me a Coffee](https://img.shields.io/badge/donate-Ko--fi-29abe0?logo=ko-fi)](https://ko-fi.com/emeraldplantmanager)

A comprehensive, self-hosted web application for professional cannabis cultivation management. Features an advanced nutrient calculator supporting 10+ brands, environmental monitoring, plant tracking, and complete grow documentation.

## ✨ Key Features

### 🧪 Advanced Nutrient Calculator
- **10+ Professional Brands**: General Hydroponics, Advanced Nutrients, Fox Farm, Canna, Jack's 321, MegaCrop, and more
- **Smart Growth Stage Management**: Automatic feeding strength adjustments
- **Multi-Medium Support**: Hydroponic, Coco, Soil, and Inert media
- **Precise Mixing Ratios**: Calculate exact amounts for any tank size
- **Real-time PPM/EC Targets**: Brand-specific recommendations

### 🌱 Complete Plant Management
- **Growth Tracking**: Monitor from seed to harvest
- **Strain Information**: Store genetics and cultivation notes
- **Photo Documentation**: Visual progress tracking
- **Activity Logging**: Detailed cultivation timeline
- **Multi-Tent Support**: Manage multiple grow spaces

### 📊 Environmental Monitoring
- **Comprehensive Data**: Temperature, humidity, VPD, CO₂, PPFD
- **Statistical Analysis**: Trends and optimization insights
- **CSV Export**: Data portability for analysis

## 🚀 Quick Start

### Simple Run Command
```bash
docker run -d \
  --name emerald-plant-tracker \
  -p 420:420 \
  -v emerald_data:/app/backend/data \
  -v emerald_uploads:/app/backend/uploads \
  dmans218/emerald-plant-tracker:latest
```

### Docker Compose
```yaml
version: '3.8'
services:
  emerald-plant-tracker:
    image: dmans218/emerald-plant-tracker:latest
    container_name: emerald-plant-tracker
    ports:
      - "420:420"
    volumes:
      - emerald_data:/app/backend/data
      - emerald_uploads:/app/backend/uploads
    environment:
      - NODE_ENV=production
      - PORT=420
    restart: unless-stopped

volumes:
  emerald_data:
  emerald_uploads:
```

### Access Your Application
After container starts, visit: **http://localhost:420**

## 🏷️ Available Tags

- `latest` - Current stable release (v1.0.0)
- `v1.0.0` - Specific version
- `v1.0` - Minor version updates
- `v1` - Major version updates

## 📁 Volume Mounts

- `/app/backend/data` - SQLite database and persistent data
- `/app/backend/uploads` - Plant photos and uploaded files

## 🔧 Environment Variables

- `NODE_ENV` - Set to `production` for optimal performance
- `PORT` - Application port (default: 420)

## 🌐 Ports

- **420** - Web application and API

## 💾 Data Persistence

All cultivation data is stored in SQLite database with automatic migrations. Your data is preserved between container updates using Docker volumes.

## 🔄 Updates

```bash
# Pull latest image
docker pull dmans218/emerald-plant-tracker:latest

# Restart container
docker restart emerald-plant-tracker
```

## 📖 Full Documentation

Complete setup instructions, features, and API documentation: [GitHub Repository](https://github.com/Dmans218/emerald-plant-tracker)

## 🌿 Perfect For

- **Home Growers**: Personal cultivation tracking and optimization
- **Medical Patients**: Strain and dosage documentation
- **Small Operations**: Professional grow management
- **Privacy-Focused Users**: Self-hosted, no external dependencies

## ⚡ Technical Details

- **Frontend**: React 18 with modern UI/UX
- **Backend**: Express.js with SQLite database
- **Architecture**: Multi-stage Docker build (~175MB final image)
- **Database**: SQLite with automatic migrations
- **Storage**: Local file system with volume persistence

## 🔒 Privacy & Security

- **Self-hosted**: Your data never leaves your infrastructure
- **No external APIs**: Operates completely offline
- **Local database**: SQLite ensures data sovereignty
- **No tracking**: Zero analytics or data collection


## 💬 Support & Donations

- **Issues**: [GitHub Issues](https://github.com/Dmans218/emerald-plant-tracker/issues)
- **Documentation**: [GitHub Wiki](https://github.com/Dmans218/emerald-plant-tracker/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/Dmans218/emerald-plant-tracker/discussions)
- [![Buy Me a Coffee](https://img.shields.io/badge/donate-Ko--fi-29abe0?logo=ko-fi)](https://ko-fi.com/emeraldplantmanager)

If you find this project useful, please consider supporting its development—your donations help keep this project alive and free for everyone!

---

**Legal Notice**: This software is intended for legal cannabis cultivation only. Users are responsible for compliance with local laws and regulations.
