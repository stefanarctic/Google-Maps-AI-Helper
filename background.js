// Background service worker for AI Map Helper

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'aiSearch') {
    handleAISearch(request.query, request.location)
      .then(results => {
        sendResponse({ success: true, results });
      })
      .catch(error => {
        console.error('AI Search error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (request.action === 'selectPlace') {
    // Handle place selection
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'selectPlace',
        placeId: request.placeId
      });
    });
  }
});

async function handleAISearch(query, userLocation) {
  // Process natural language query with AI
  const processedQuery = await processQueryWithAI(query, userLocation);
  
  // Search Google Maps Places API
  const results = await searchGooglePlaces(processedQuery, userLocation);
  
  return results;
}

async function processQueryWithAI(query, userLocation) {
  // Extract intent from natural language query
  const queryLower = query.toLowerCase();
  
  // Category detection
  const categories = {
    cafe: ['cafe', 'coffee', 'café', 'coffee shop', 'latte'],
    restaurant: ['restaurant', 'dining', 'eat', 'food', 'dinner', 'lunch', 'pizza', 'burger'],
    hotel: ['hotel', 'lodging', 'accommodation', 'stay'],
    gas: ['gas', 'gas station', 'fuel', 'petrol'],
    pharmacy: ['pharmacy', 'drugstore', 'pharmacies'],
    park: ['park', 'parks', 'playground', 'garden'],
    hospital: ['hospital', 'medical', 'clinic', 'doctor'],
    bank: ['bank', 'atm', 'cash'],
    shopping: ['shop', 'store', 'mall', 'shopping'],
  };

  let category = null;
  for (const [key, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      category = key;
      break;
    }
  }

  // Distance extraction
  let radius = null;
  const radiusMatch = queryLower.match(/(\d+)\s*(mile|miles|km|kilometer|kilometers|meter|meters|m|mi)/);
  if (radiusMatch) {
    const value = parseInt(radiusMatch[1]);
    const unit = radiusMatch[2].toLowerCase();
    if (unit.includes('mile') || unit === 'mi') {
      radius = value * 1609.34; // Convert to meters
    } else if (unit.includes('km') || unit.includes('kilometer')) {
      radius = value * 1000;
    } else if (unit === 'm' || unit.includes('meter')) {
      radius = value;
    }
  }

  // Check for "near me" or "nearby"
  const isNearby = queryLower.includes('near me') || 
                   queryLower.includes('nearby') || 
                   queryLower.includes('close') ||
                   queryLower.includes('around');

  // Build search query
  let searchQuery = query;
  if (category && !queryLower.includes(category)) {
    searchQuery = `${category} ${isNearby ? 'near me' : ''}`;
  }

  return {
    originalQuery: query,
    searchQuery: searchQuery,
    category: category,
    radius: radius,
    isNearby: isNearby,
    location: userLocation
  };
}

async function searchGooglePlaces(processedQuery, userLocation) {
  // Note: This requires Google Places API key
  // For now, return mock data structure
  // In production, you'd call Google Places API
  
  const API_KEY = await getAPIKey();
  
  if (!API_KEY) {
    // Return mock results for demonstration
    return getMockResults(processedQuery, userLocation);
  }

  try {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const params = new URLSearchParams({
      query: processedQuery.searchQuery,
      key: API_KEY,
      type: processedQuery.category || '',
    });

    if (userLocation && processedQuery.isNearby) {
      params.append('location', `${userLocation.lat},${userLocation.lng}`);
      if (processedQuery.radius) {
        params.append('radius', processedQuery.radius.toString());
      } else {
        params.append('radius', '5000'); // Default 5km
      }
    }

    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();

    if (data.results) {
      return data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        reviews: place.user_ratings_total,
        location: place.geometry.location,
        distance: calculateDistance(
          userLocation?.lat,
          userLocation?.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        )
      }));
    }
  } catch (error) {
    console.error('Google Places API error:', error);
    return getMockResults(processedQuery, userLocation);
  }

  return [];
}

function getMockResults(processedQuery, userLocation) {
  // Mock results for demonstration
  const mockPlaces = {
    cafe: [
      { name: 'Blue Bottle Coffee', address: '123 Main St', rating: 4.5, reviews: 234 },
      { name: 'Starbucks', address: '456 Broadway', rating: 4.2, reviews: 567 },
    ],
    restaurant: [
      { name: 'The French Bistro', address: '789 Park Ave', rating: 4.7, reviews: 890 },
      { name: 'Joe\'s Pizza', address: '321 5th Ave', rating: 4.4, reviews: 1234 },
    ],
  };

  const category = processedQuery.category || 'cafe';
  const places = mockPlaces[category] || mockPlaces.cafe;

  return places.map((place, index) => ({
    placeId: `mock-${index}`,
    name: place.name,
    address: place.address,
    rating: place.rating,
    reviews: place.reviews,
    distance: userLocation ? '0.5 miles' : null
  }));
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = (R * c).toFixed(1);
  
  return `${distance} miles`;
}

async function getAPIKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['googlePlacesAPIKey'], (result) => {
      resolve(result.googlePlacesAPIKey || null);
    });
  });
}

// Install/Update handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Map Helper installed');
});
