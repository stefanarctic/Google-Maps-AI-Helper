import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapError from './MapError'
import './Map.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE'

function Map({
  onMapLoad,
  userLocation,
  onLocationFound,
  searchResults,
  selectedPlace,
  onPlaceSelect,
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const mapLoadedRef = useRef(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (map.current) return

    const initializeMap = () => {
      const token = import.meta.env.VITE_MAPBOX_TOKEN
      if (!token || token === 'YOUR_MAPBOX_TOKEN_HERE') {
        console.error('❌ Mapbox token not configured! Please set VITE_MAPBOX_TOKEN in your .env file')
        console.error('Get a free token at: https://account.mapbox.com/access-tokens/')
        setMapError(true)
        return
      }

      if (!mapContainer.current) {
        console.error('Map container not found')
        return
      }

      // Ensure container has dimensions
      const container = mapContainer.current
      if (container.offsetHeight === 0 || container.offsetWidth === 0) {
        console.warn('Map container has no dimensions, retrying...')
        setTimeout(initializeMap, 100)
        return
      }

      console.log('✅ Initializing map with container:', {
        width: container.offsetWidth,
        height: container.offsetHeight,
        token: token ? `${token.substring(0, 10)}...` : 'missing'
      })

      try {
        map.current = new mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.5, 40],
          zoom: 10,
          antialias: true,
        })

        map.current.on('load', () => {
          console.log('✅ Map loaded successfully')
          mapLoadedRef.current = true
          onMapLoad(map.current)
          
          // Helper function to get place info from clicked feature
          const getPlaceInfo = async (feature, coordinates) => {
            const properties = feature.properties || {}
            const name = properties.name || properties.name_en || properties.name_ro || 'Unknown Location'
            
            // Try to get more details via reverse geocoding
            const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
            if (mapboxToken && mapboxToken !== 'YOUR_MAPBOX_TOKEN_HERE') {
              try {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json`
                const response = await fetch(`${url}?access_token=${mapboxToken}&limit=1&types=poi,address`)
                const data = await response.json()
                
                if (data.features && data.features.length > 0) {
                  const geoFeature = data.features[0]
                  const geoProps = geoFeature.properties || {}
                  
                  return {
                    id: feature.id || geoFeature.id || `place-${Date.now()}`,
                    name: name || geoFeature.text || geoProps.name || geoFeature.place_name,
                    address: geoFeature.place_name || properties.address || properties.full_address || '',
                    coordinates: coordinates,
                    category: geoProps.category || properties.category || properties.type || 'place',
                    description: geoProps.description || properties.description || properties.wikidata || '',
                    phone: geoProps.tel || geoProps.phone || properties.phone || '',
                    website: geoProps.website || geoProps.url || properties.website || '',
                    rating: geoProps.rating || properties.rating || null,
                    reviews: geoProps.reviews || properties.reviews || null,
                    priceRange: geoProps.price || properties.price || null,
                  }
                }
              } catch (error) {
                console.error('Error getting detailed place info:', error)
              }
            }
            
            return {
              id: feature.id || `place-${Date.now()}`,
              name: name,
              address: properties.address || properties.full_address || '',
              coordinates: coordinates,
              category: properties.category || properties.type || 'place',
              description: properties.description || properties.wikidata || '',
              phone: properties.phone || '',
              website: properties.website || '',
              rating: properties.rating || null,
              reviews: properties.reviews || null,
              priceRange: properties.price || null,
            }
          }

          // Reverse geocode coordinates to get place info with more details
          const reverseGeocode = async (coordinates) => {
            const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
            if (!mapboxToken || mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE') {
              return null
            }

            try {
              const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json`
              const response = await fetch(`${url}?access_token=${mapboxToken}&limit=1&types=poi,address`)
              const data = await response.json()
              
              if (data.features && data.features.length > 0) {
                const feature = data.features[0]
                const props = feature.properties || {}
                
                return {
                  id: feature.id || `place-${Date.now()}`,
                  name: feature.text || props.name || feature.place_name || 'Location',
                  address: feature.place_name || props.address || '',
                  coordinates: coordinates,
                  category: props.category || props.type || 'place',
                  description: props.description || props.wikidata || '',
                  phone: props.tel || props.phone || '',
                  website: props.website || props.url || '',
                  rating: props.rating || null,
                  reviews: props.reviews || null,
                  priceRange: props.price || null,
                }
              }
            } catch (error) {
              console.error('Reverse geocoding error:', error)
            }
            
            return null
          }
          
          // Add click handler for locations on the map
          map.current.on('click', async (e) => {
            // Query all layers for features at click point
            const features = map.current.queryRenderedFeatures(e.point)
            
            // Filter for POI and place features
            const poiFeatures = features.filter(f => 
              f.layer?.id?.includes('poi') || 
              f.layer?.id?.includes('place') ||
              f.properties?.name
            )
            
            if (poiFeatures.length > 0) {
              const feature = poiFeatures[0]
              const coordinates = e.lngLat.toArray()
              
              // Get place information
              try {
                const placeInfo = await getPlaceInfo(feature, coordinates)
                if (placeInfo) {
                  onPlaceSelect(placeInfo)
                }
              } catch (error) {
                console.error('Error getting place info:', error)
              }
            } else {
              // If no POI clicked, try reverse geocoding
              try {
                const placeInfo = await reverseGeocode(e.lngLat.toArray())
                if (placeInfo) {
                  onPlaceSelect(placeInfo)
                }
              } catch (error) {
                console.error('Error reverse geocoding:', error)
              }
            }
          })
          
          // Change cursor on hover
          map.current.getCanvas().style.cursor = 'default'
        })

        map.current.on('error', (e) => {
          console.error('❌ Mapbox error:', e.error)
          if (e.error && e.error.message) {
            console.error('Error message:', e.error.message)
          }
          setMapError(true)
        })

        map.current.on('style.load', () => {
          console.log('✅ Map style loaded')
        })

        map.current.on('render', () => {
          // Map is rendering
          if (!mapLoadedRef.current) {
            console.log('✅ Map is rendering')
          }
        })

        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = [position.coords.longitude, position.coords.latitude]
              onLocationFound(location)
              if (map.current && mapLoadedRef.current) {
                map.current.flyTo({
                  center: location,
                  zoom: 14,
                  duration: 2000,
                })
              }
            },
            (error) => {
              console.error('Geolocation error:', error)
            }
          )
        }
      } catch (error) {
        console.error('❌ Failed to initialize map:', error)
        setMapError(true)
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 50)

    return () => {
      clearTimeout(timer)
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current || !userLocation) return

    // Remove existing marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    // Add new marker
    try {
      userMarkerRef.current = new mapboxgl.Marker({
        color: '#4285F4',
        scale: 1.2,
      })
        .setLngLat(userLocation)
        .setPopup(
          new mapboxgl.Popup().setHTML('<div class="user-marker-popup">Your Location</div>')
        )
        .addTo(map.current)
    } catch (error) {
      console.error('Error adding user location marker:', error)
    }
  }, [userLocation])

  // Update search result markers
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    // Remove existing markers
    markersRef.current.forEach((marker) => {
      try {
        marker.remove()
      } catch (error) {
        // Marker might already be removed
      }
    })
    markersRef.current = []

    // Add new markers
    searchResults.forEach((place) => {
      if (!place.coordinates) return

      try {
        const el = document.createElement('div')
        el.className = 'place-marker'
        const isSelected = selectedPlace?.id === place.id
        const baseSize = isSelected ? 45 : 30
        
        el.style.width = `${baseSize}px`
        el.style.height = `${baseSize}px`
        el.style.borderRadius = '50%'
        el.style.backgroundColor = isSelected ? '#FF6B6B' : '#34A853'
        el.style.border = isSelected ? '4px solid white' : '3px solid white'
        el.style.cursor = 'pointer'
        el.style.boxShadow = isSelected ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.3)'
        el.style.transition = 'all 0.3s ease'
        el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)'
        el.style.zIndex = isSelected ? '1000' : 'auto'
        el.dataset.placeId = place.id

        // Hover effect
        el.addEventListener('mouseenter', () => {
          if (!isSelected) {
            el.style.transform = 'scale(1.3)'
            el.style.zIndex = '1000'
            el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
          }
        })

        el.addEventListener('mouseleave', () => {
          if (!isSelected) {
            el.style.transform = 'scale(1)'
            el.style.zIndex = 'auto'
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
          }
        })

        const marker = new mapboxgl.Marker(el)
          .setLngLat(place.coordinates)
          .addTo(map.current)

        el.addEventListener('click', () => {
          onPlaceSelect(place)
        })

        markersRef.current.push(marker)
      } catch (error) {
        console.error('Error adding place marker:', error)
      }
    })
  }, [searchResults, selectedPlace, onPlaceSelect])

  // Highlight selected place
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current || !selectedPlace?.coordinates) return

    try {
      map.current.flyTo({
        center: selectedPlace.coordinates,
        zoom: 15,
        duration: 1000,
      })
    } catch (error) {
      console.error('Error flying to selected place:', error)
    }
  }, [selectedPlace])

  const token = import.meta.env.VITE_MAPBOX_TOKEN
  const hasValidToken = token && token !== 'YOUR_MAPBOX_TOKEN_HERE' && (token.startsWith('pk.') || token.startsWith('sk.'))

  return (
    <>
      {mapError && <MapError />}
      <div 
        ref={mapContainer} 
        className="map-container"
        data-testid="map-container"
      />
    </>
  )
}

export default Map
