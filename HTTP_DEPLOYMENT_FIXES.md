# 🌿 HTTP Deployment Fixes - Emerald Plant Tracker

## Problem Summary
The application worked fine during local development but broke when deployed on the server from Docker Hub. The issue was related to security headers that forced HTTPS/SSL which is incompatible with HTTP-only deployments.

## Root Cause
The application was using Helmet.js with default security settings that include:
1. `upgrade-insecure-requests` directive in Content Security Policy (CSP)
2. `Strict-Transport-Security` header (HSTS)
3. `Origin-Agent-Cluster: ?1` header

These headers are designed for HTTPS environments and cause browsers to automatically redirect HTTP requests to HTTPS, breaking HTTP-only deployments.

## Solution Applied

### 1. Fixed Helmet.js Configuration (`backend/server.js`)
- **Disabled Helmet's default CSP** to prevent automatic `upgrade-insecure-requests` injection
- **Added custom CSP** without the problematic directive
- **Disabled HSTS** completely (`hsts: false`)
- **Disabled Origin-Agent-Cluster** (`originAgentCluster: false`)
- **Disabled COOP and COEP** for better compatibility

### 2. Custom Content Security Policy
```javascript
// Custom CSP without upgrade-insecure-requests
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    // ... other directives ...
    // NOTE: upgrade-insecure-requests is deliberately EXCLUDED
  );
  next();
});
```

## Headers Before vs After

### Before (Problematic):
```
Strict-Transport-Security: max-age=15552000; includeSubDomains
Content-Security-Policy: ...; upgrade-insecure-requests
Origin-Agent-Cluster: ?1
```

### After (HTTP-Compatible):
```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; ...
Origin-Agent-Cluster: ?0
```
✅ No `Strict-Transport-Security` header  
✅ No `upgrade-insecure-requests` in CSP  
✅ `Origin-Agent-Cluster` disabled (`?0`)  

## Deployment Process

### 1. Updated Docker Hub Image
```bash
# Build the fixed image
docker build -t emerald-plant-tracker-http:latest .

# Tag for Docker Hub
docker tag emerald-plant-tracker-http:latest dmans218/emerald-plant-tracker:latest

# Push to Docker Hub
docker push dmans218/emerald-plant-tracker:latest
```

### 2. Server Deployment
On your server, simply pull and restart:
```bash
# Pull the updated image
docker pull dmans218/emerald-plant-tracker:latest

# Restart with the new image
docker compose down
docker compose up -d
```

## Scripts Provided

### `docker-build-and-push.sh`
- Builds Docker image locally
- Tags it for Docker Hub
- Pushes to `dmans218/emerald-plant-tracker:latest`

### `deploy-to-server.sh`
- For running on your production server
- Pulls latest image from Docker Hub
- Stops old container and starts new one
- Maintains data persistence
- Test HTTP headers

## Verification

The application now works correctly over HTTP with these confirmed fixes:
- ✅ No automatic HTTP → HTTPS redirects
- ✅ No SSL/TLS certificate requirements
- ✅ Compatible with reverse proxies like Nginx
- ✅ Maintains security for HTTP environments
- ✅ All functionality preserved

## Next Steps

1. **Deploy on your server** by running:
   ```bash
   docker pull dmans218/emerald-plant-tracker:latest
   docker compose down
   docker compose up -d
   ```

2. **Test the deployment** by accessing your server's IP:420

3. **Monitor logs** if needed:
   ```bash
   docker logs emerald-plant-tracker
   ```

The Docker Hub image `dmans218/emerald-plant-tracker:latest` now contains all the HTTP compatibility fixes and is ready for production deployment.
