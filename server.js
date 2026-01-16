// Simple Express server for local development
// Run with: node server.js

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Process query with AI (simplified version)
function processQueryWithAI(query, userLocation) {
  const queryLower = query.toLowerCase()
  
  const categories = {
    cafe: ['cafe', 'coffee', 'café', 'coffee shop'],
    restaurant: ['restaurant', 'dining', 'eat', 'food', 'dinner', 'lunch'],
    park: ['park', 'parks', 'playground'],
    pharmacy: ['pharmacy', 'drugstore', 'pharmacies'],
    gas: ['gas', 'gas station', 'fuel'],
    hotel: ['hotel', 'hotels', 'lodging'],
    hospital: ['hospital', 'hospitals', 'medical'],
  }

  let category = null
  for (const [key, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => queryLower.includes(kw))) {
      category = key
      break
    }
  }

  let radius = 5000
  const radiusMatch = queryLower.match(/(\d+)\s*(mile|miles|km|kilometer|kilometers|meter|meters)/)
  if (radiusMatch) {
    const value = parseInt(radiusMatch[1])
    const unit = radiusMatch[2]
    if (unit.includes('mile')) {
      radius = value * 1609.34
    } else if (unit.includes('km') || unit.includes('kilometer')) {
      radius = value * 1000
    } else {
      radius = value
    }
  }

  return {
    category,
    radius,
    originalQuery: query,
  }
}

function getMockPlaces(searchParams, userLocation) {
  const baseLocation = userLocation || [-74.006, 40.7128]
  
  const mockPlaces = {
    cafe: [
      {
        id: 'cafe-1',
        name: 'Blue Bottle Coffee',
        address: '123 Main St, New York, NY',
        coordinates: [baseLocation[0] + 0.01, baseLocation[1] + 0.01],
        category: 'cafe',
        description: 'Artisan coffee shop serving specialty brews',
      },
      {
        id: 'cafe-2',
        name: 'Starbucks',
        address: '456 Broadway, New York, NY',
        coordinates: [baseLocation[0] - 0.01, baseLocation[1] + 0.01],
        category: 'cafe',
        description: 'Popular coffee chain',
      },
      {
        id: 'cafe-3',
        name: 'Local Coffee House',
        address: '789 Park Ave, New York, NY',
        coordinates: [baseLocation[0] + 0.005, baseLocation[1] - 0.015],
        category: 'cafe',
        description: 'Cozy neighborhood coffee shop',
      },
    ],
    restaurant: [
      {
        id: 'rest-1',
        name: 'The French Bistro',
        address: '789 Park Ave, New York, NY',
        coordinates: [baseLocation[0] + 0.015, baseLocation[1] - 0.01],
        category: 'restaurant',
        description: 'Fine dining French cuisine',
      },
      {
        id: 'rest-2',
        name: 'Joe\'s Pizza',
        address: '321 5th Ave, New York, NY',
        coordinates: [baseLocation[0] - 0.015, baseLocation[1] - 0.01],
        category: 'restaurant',
        description: 'Classic New York pizza',
      },
      {
        id: 'rest-3',
        name: 'Sushi Paradise',
        address: '555 Lexington Ave, New York, NY',
        coordinates: [baseLocation[0] + 0.02, baseLocation[1] + 0.005],
        category: 'restaurant',
        description: 'Fresh sushi and Japanese cuisine',
      },
    ],
    park: [
      {
        id: 'park-1',
        name: 'Central Park',
        address: 'Central Park, New York, NY',
        coordinates: [baseLocation[0] + 0.01, baseLocation[1] + 0.02],
        category: 'park',
        description: 'Iconic urban park',
      },
    ],
    pharmacy: [
      {
        id: 'pharm-1',
        name: 'CVS Pharmacy',
        address: '100 Main St, New York, NY',
        coordinates: [baseLocation[0] - 0.005, baseLocation[1] + 0.01],
        category: 'pharmacy',
        description: '24-hour pharmacy',
      },
    ],
  }

  const category = searchParams.category || 'cafe'
  return mockPlaces[category] || mockPlaces.cafe
}

async function searchPlaces(searchParams, userLocation) {
  const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
  
  if (!MAPBOX_TOKEN) {
    return getMockPlaces(searchParams, userLocation)
  }

  try {
    const { category, originalQuery } = searchParams
    
    let searchQuery = originalQuery
    if (category) {
      searchQuery = category + (userLocation ? ' near me' : '')
    }

    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: 10,
      types: 'poi',
    })

    if (userLocation) {
      params.append('proximity', `${userLocation[0]},${userLocation[1]}`)
    }

    const response = await fetch(`${geocodingUrl}?${params}`)
    const data = await response.json()

    return data.features.map((feature, index) => ({
      id: feature.id || `place-${index}`,
      name: feature.text || feature.place_name,
      address: feature.place_name,
      coordinates: feature.geometry.coordinates,
      category: category || feature.properties.category || 'place',
      description: feature.properties.description || '',
    }))
  } catch (error) {
    console.error('Mapbox API error:', error)
    return getMockPlaces(searchParams, userLocation)
  }
}

app.post('/api/search', async (req, res) => {
  try {
    const { query, location } = req.body
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const searchParams = processQueryWithAI(query, location)
    const places = await searchPlaces(searchParams, location)

    res.json({ places })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
