import React from 'react'
import './PlaceCard.css'

function PlaceCard({ place, userLocation, onClose }) {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(1)
  }

  const distance = userLocation
    ? calculateDistance(
        userLocation[1],
        userLocation[0],
        place.coordinates[1],
        place.coordinates[0]
      )
    : null

  const renderStars = (rating) => {
    if (!rating) return null
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>)
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>)
    }
    
    return stars
  }

  return (
    <div className="place-card">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      
      <div className="place-header">
        <h2 className="place-name">{place.name}</h2>
        {place.rating && (
          <div className="place-rating">
            <div className="stars">{renderStars(place.rating)}</div>
            <span className="rating-value">{place.rating.toFixed(1)}</span>
            {place.reviews && (
              <span className="reviews-count">({place.reviews} {place.reviews === 1 ? 'review' : 'reviews'})</span>
            )}
          </div>
        )}
        {place.priceRange && (
          <div className="price-range">{place.priceRange}</div>
        )}
      </div>

      {place.category && (
        <p className="place-category">{place.category}</p>
      )}

      {place.address && (
        <div className="place-address-section">
          <p className="place-address">📍 {place.address}</p>
          {distance && (
            <p className="place-distance">
              {distance} miles away
            </p>
          )}
        </div>
      )}

      {(place.phone || place.website) && (
        <div className="place-contact">
          {place.phone && (
            <a href={`tel:${place.phone}`} className="contact-link">
              📞 {place.phone}
            </a>
          )}
          {place.website && (
            <a 
              href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              🌐 Website
            </a>
          )}
        </div>
      )}

      {place.description && (
        <div className="place-description-section">
          <p className="place-description">{place.description}</p>
        </div>
      )}

      <div className="place-actions">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[1]},${place.coordinates[0]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="action-button directions"
        >
          🧭 Directions
        </a>
      </div>
    </div>
  )
}

export default PlaceCard
