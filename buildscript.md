# Build Script

This document describes how to build and run the `KIIT Route Triage & Logistics Intelligence Platform` project.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- MongoDB (running locally on port `27017`)

## Backend Setup

1. Open a terminal and navigate to the backend directory:

```bash
cd invoice-triage
```

2. Install backend dependencies:

```bash
python -m pip install -r requirements.txt
```

3. Run the Flask backend:

```bash
python server.py
```

The backend server launches at `http://127.0.0.1:5000`.

## Frontend Setup

1. Change to the frontend directory:

```bash
cd invoice-triage/frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Run the frontend development server:

```bash
npm run dev
```

The frontend development server runs locally, typically at `http://localhost:5173`.

## Optional

- Run the route triage engine script directly:

```bash
python invoice-triage/logistics_engine.py
```

## Notes

- The root `package.json` contains convenience scripts for frontend development only.
- The backend depends on MongoDB and may require a running local database instance.
