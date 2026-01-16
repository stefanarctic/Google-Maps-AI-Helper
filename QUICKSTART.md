# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- A Mapbox account (free tier available)

## Setup Steps

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Get Mapbox Token:**
   - Go to https://account.mapbox.com/access-tokens/
   - Copy your default public token (or create a new one)
   - Create a `.env` file in the project root:
     ```
     VITE_MAPBOX_TOKEN=pk.your_token_here
     MAPBOX_ACCESS_TOKEN=pk.your_token_here
     ```

3. **Start the application:**
   ```bash
   npm run dev:all
   ```
   
   This starts both the frontend (port 3000) and API server (port 3001).

4. **Open your browser:**
   - Navigate to http://localhost:3000
   - Allow location access when prompted
   - Try searching: "find cafes near me" or "show restaurants within 2 miles"

## Features to Try

- **Natural Language Search:**
  - "Cafes near me"
  - "Restaurants within 1 mile"
  - "Find a pharmacy"
  - "Show parks nearby"

- **Map Interactions:**
  - Click on place markers to see details
  - Use the location button to re-center on your position
  - Pan and zoom the map

## Troubleshooting

**Map not loading?**
- Check that your Mapbox token is set correctly in `.env`
- Make sure the token starts with `pk.`

**Search not working?**
- Ensure the API server is running (port 3001)
- Check browser console for errors
- The app will use mock data if Mapbox API is unavailable

**Location not detected?**
- Make sure you've allowed location access in your browser
- Check browser console for geolocation errors
