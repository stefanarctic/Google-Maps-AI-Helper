import React, { useState, useEffect, useRef } from 'react'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import LocationButton from './components/LocationButton'
import PlaceCard from './components/PlaceCard'
import './App.css'

function App() {
  const [map, setMap] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location: userLocation,
        }),
      })
      const data = await response.json()
      setSearchResults(data.places || [])
      setSelectedPlace(null)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
    if (map && place.coordinates) {
      map.flyTo({
        center: place.coordinates,
        zoom: 15,
        duration: 1000,
      })
    }
  }

  const handleLocationClick = () => {
    if (map && userLocation) {
      map.flyTo({
        center: userLocation,
        zoom: 15,
        duration: 1000,
      })
    }
  }

  return (
    <div className="app">
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      <Map
        onMapLoad={setMap}
        userLocation={userLocation}
        onLocationFound={setUserLocation}
        searchResults={searchResults}
        selectedPlace={selectedPlace}
        onPlaceSelect={handlePlaceSelect}
      />
      <LocationButton onClick={handleLocationClick} />
      {selectedPlace && (
        <PlaceCard
          place={selectedPlace}
          userLocation={userLocation}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  )
}

export default App
