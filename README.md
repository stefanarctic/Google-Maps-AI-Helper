# AI Map Helper

A Google Maps clone with an AI-powered search assistant that understands natural language queries like "find cafes near me" or "show restaurants within 2 miles."

## Features

- 🗺️ **Interactive Map**: Full-screen map view using Mapbox GL JS with smooth pan, zoom, and navigation
- 🤖 **AI-Powered Search**: Natural language understanding for queries like:
  - "Cafes near me"
  - "Best restaurants within walking distance"
  - "Find a pharmacy open now"
- 📍 **Location Services**: Automatic location detection and "My Location" button
- 🎯 **Place Information**: Click markers to see place details, address, and distance

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get a Mapbox Access Token:**
   - Sign up at [mapbox.com](https://www.mapbox.com)
   - Get your access token from the account page
   - Create a `.env` file in the root directory:
     ```
     VITE_MAPBOX_TOKEN=your_mapbox_token_here
     MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
     ```

3. **Run the development servers:**
   
   **Option 1: Run both frontend and API server together:**
   ```bash
   npm run dev:all
   ```
   
   **Option 2: Run separately:**
   ```bash
   # Terminal 1: Start API server
   npm run server
   
   # Terminal 2: Start frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API Server: http://localhost:3001

**Note:** The app works with mock data if you don't have a Mapbox token, but you'll need one for production use.

## Configuration

### Environment Variables

- `VITE_MAPBOX_TOKEN`: Your Mapbox access token (required)
- `MAPBOX_ACCESS_TOKEN`: For the API endpoint (optional, falls back to mock data)

### API Endpoint

The search API endpoint (`/api/search`) handles:
- Natural language query processing
- Place search using Mapbox Geocoding API
- Distance calculations

For production, deploy `api/search.js` to your preferred serverless platform.

## Development

The app uses:
- **React** for the UI
- **Mapbox GL JS** for map rendering
- **Vite** for development and building

## License

MIT
"# Google-Maps-AI-Helper" 
