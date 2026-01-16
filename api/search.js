// Edge function for handling AI-powered search queries
// This would typically run on a serverless platform like Vercel, Netlify, or Cloudflare Workers

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { query, location } = await request.json()

    // Extract location intent from query using AI
    const searchParams = await processQueryWithAI(query, location)

    // Search for places using Mapbox Geocoding API
    const places = await searchPlaces(searchParams, location)

    return new Response(JSON.stringify({ places }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Search error:', error)
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function processQueryWithAI(query, userLocation) {
  // This function processes natural language queries
  // You can integrate with OpenAI, Anthropic, or other AI services
  
  const queryLower = query.toLowerCase()
  
  // Extract category/keywords
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

  // Extract distance/radius
  let radius = 5000 // default 5km in meters
  const radiusMatch = queryLower.match(/(\d+)\s*(mile|miles|km|kilometer|kilometers|meter|meters)/)
  if (radiusMatch) {
    const value = parseInt(radiusMatch[1])
    const unit = radiusMatch[2]
    if (unit.includes('mile')) {
      radius = value * 1609.34 // convert miles to meters
    } else if (unit.includes('km') || unit.includes('kilometer')) {
      radius = value * 1000
    } else {
      radius = value
    }
  }

  // Check for "near me" or "nearby"
  const isNearby = queryLower.includes('near me') || queryLower.includes('nearby') || queryLower.includes('close')

  return {
    category,
    radius,
    isNearby,
    originalQuery: query,
  }
}

async function searchPlaces(searchParams, userLocation) {
  const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN'
  
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN') {
    // Fallback: return mock data for development
    return getMockPlaces(searchParams, userLocation)
  }

  try {
    // Use Mapbox Geocoding API
    const { category, radius, originalQuery } = searchParams
    
    // Build search query
    let searchQuery = originalQuery
    if (category) {
      searchQuery = category + ' ' + (userLocation ? 'near me' : '')
    }

    // Mapbox Geocoding API
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: 10,
      types: 'poi', // point of interest
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
    // Fallback to mock data
    return getMockPlaces(searchParams, userLocation)
  }
}

function getMockPlaces(searchParams, userLocation) {
  // Mock data for development/testing
  const baseLocation = userLocation || [-74.006, 40.7128] // Default to NYC
  
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
    ],
  }

  const category = searchParams.category || 'cafe'
  return mockPlaces[category] || mockPlaces.cafe
}
