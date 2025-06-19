# Changelog

All notable changes to the Emerald Plant Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-06-19

### Added

- `.nvmrc` file specifying Node.js 22 for consistent local development
- Alpine Linux base images for smaller, more secure Docker containers

### Changed

- **BREAKING**: Upgraded Node.js requirement from 18.x to 22.x across all environments
- **BREAKING**: Upgraded Express from 4.19.2 to 5.1.0 (major version upgrade)
- Upgraded React Router from 6.30.1 to 7.6.2 (major version upgrade)
- Updated Chart.js from 4.4.9 to 4.5.0
- Updated Axios from 1.7.9 to 1.10.0
- Updated Nodemon from 3.1.7 to 3.1.10
- All Docker images now use `node:22-alpine` instead of `node:20` or `node:18`
- Development Docker images upgraded from `node:24` to `node:22-alpine`

### Updated

- **Frontend Dependencies**:
  - React Router DOM: 6.30.1 → 7.6.2
  - Chart.js: 4.4.9 → 4.5.0
  - Axios: 1.7.9 → 1.10.0
  - All testing libraries to latest versions
  
- **Backend Dependencies**:
  - Express.js: 4.19.2 → 5.1.0
  - Axios: 1.7.9 → 1.10.0
  - Nodemon: 3.1.7 → 3.1.10
  - All supporting packages to latest compatible versions

- **Docker Configuration**:
  - Main Dockerfile: `node:20` → `node:22-alpine`
  - Backend Dockerfile: `node:18` → `node:22-alpine`
  - Development Dockerfiles: `node:24` → `node:22-alpine`

- **Documentation & Rules**:
  - Updated `.cursor/rules/deployment/500-docker.mdc` to reference Node.js 22 Alpine
  - Updated `.cursor/rules/001-project-overview.mdc` with latest dependency versions
  - Updated `.cursor/rules/backend/200-nodejs-api.mdc` to reference Express.js 5.1

### Technical Details

- **Node.js Engine**: Now requires `>=22.0.0` (previously `>=18.0.0`)
- **NPM Engine**: Now requires `>=10.0.0` (previously `>=9.0.0`)
- **Docker Images**: ~70% smaller due to Alpine Linux base images
- **Performance**: Improved performance from Node.js 22 and Express 5 optimizations
- **Security**: Latest security patches in all dependencies

### Migration Notes

- **Local Development**: Install Node.js 22 using nvm or package manager
- **Docker**: All containers now use Alpine Linux for improved security
- **Express 5**: Review any custom middleware for compatibility changes
- **React Router 7**: Check routing configuration for breaking changes

### Breaking Changes

- Node.js 18 is no longer supported - minimum version is now 22.0.0
- Express 5.x may have middleware compatibility changes from 4.x
- React Router 7.x has API changes from 6.x (consult migration guide)

---

## Previous Versions

### [1.0.0] - 2024-XX-XX

- Initial release of Emerald Plant Tracker
- Cannabis cultivation tracking system
- Nutrient calculator with major brand support
- Environmental monitoring and logging
- Multi-tent cultivation management
- OCR integration for nutrient label scanning
- Docker-based deployment
- React 19.1 frontend with Express.js backend
- SQLite database for data persistence
