import React from 'react'
import './MapError.css'

function MapError() {
  return (
    <div className="map-error">
      <div className="map-error-content">
        <h2>🗺️ Map Not Loading</h2>
        <p>Please check the following:</p>
        <ul>
          <li>✅ Mapbox token is set in <code>.env</code> file</li>
          <li>✅ Token starts with <code>pk.</code></li>
          <li>✅ Browser console for errors</li>
        </ul>
        <p className="map-error-link">
          Get a free token at:{' '}
          <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer">
            mapbox.com/access-tokens
          </a>
        </p>
      </div>
    </div>
  )
}

export default MapError
