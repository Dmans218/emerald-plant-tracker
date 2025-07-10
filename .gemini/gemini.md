# Gemini Project Information: Emerald Plant Tracker

This document provides instructions for the Gemini agent to work with the Emerald Plant Tracker project.

## About the project

Emerald Plant Tracker is a self-hosted web application for managing cannabis cultivation. It features an advanced nutrient calculator, environmental monitoring, and complete grow tracking.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js with Express
- **Database:** SQLite
- **Deployment:** Docker

## Running the project

### Development (from Source)

To run the application in a development environment:

1.  **Install dependencies for both frontend and backend:**
    ```bash
    cd backend && npm install && cd ../frontend && npm install && cd ..
    ```
2.  **Start the development servers using Docker Compose:**
    ```bash
    docker-compose -f docker-compose.dev.yml up
    ```
    Alternatively, you can run the frontend and backend servers manually in separate terminals:
    -   **Backend:** `cd backend && npm run dev`
    -   **Frontend:** `cd frontend && npm start`

The application will be available at `http://localhost:420`.

### Production (Docker)

To run the application in a production environment, use the following Docker command:

```bash
docker run -d --name emerald-plant-tracker -p 420:420 \
  -v emerald_data:/app/backend/data \
  -v emerald_uploads:/app/backend/uploads \
  dmans218/emerald-plant-tracker:latest
```

## Building the project

To build the project from source, use the following Docker Compose command:

```bash
docker-compose up -d --build
```

## Relevant Files

-   `README.md`: Project overview and setup instructions.
-   `docker-compose.yml`: Docker Compose file for production.
-   `docker-compose.dev.yml`: Docker Compose file for development.
-   `backend/`: Contains the Node.js backend code.
    -   `backend/server.js`: The main Express server file.
    -   `backend/database.js`: SQLite database setup.
    -   `backend/routes/`: API routes.
-   `frontend/`: Contains the React frontend code.
    -   `frontend/src/App.js`: The main React application component.
    -   `frontend/src/pages/`: Application pages.
    -   `frontend/src/components/`: Reusable React components.
-   `docs/`: Project documentation.
