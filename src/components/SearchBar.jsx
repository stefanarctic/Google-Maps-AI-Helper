import React, { useState } from 'react'
import './SearchBar.css'

function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder="Ask AI: Find cafes near me, show restaurants within 2 miles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        {isLoading && <div className="loading-spinner"></div>}
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={() => setQuery('')}
          >
            ✕
          </button>
        )}
      </form>
    </div>
  )
}

export default SearchBar
