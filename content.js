// Content script that injects AI assistant into Google Maps

(function() {
  'use strict';

  let aiSearchBar = null;
  let isAIActive = false;

  // Create AI Search Bar
  function createAISearchBar() {
    // Remove existing bar if present
    const existing = document.getElementById('ai-map-helper-search');
    if (existing) {
      existing.remove();
    }

    const searchBar = document.createElement('div');
    searchBar.id = 'ai-map-helper-search';
    searchBar.innerHTML = `
      <div class="ai-search-container">
        <div class="ai-search-icon">🤖</div>
        <input 
          type="text" 
          id="ai-search-input" 
          placeholder="Ask AI: Find cafes near me, show restaurants within 2 miles..."
          autocomplete="off"
        />
        <button id="ai-search-button" class="ai-search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button id="ai-toggle-btn" class="ai-toggle-btn" title="Toggle AI Assistant">
          AI
        </button>
      </div>
      <div id="ai-results-container" class="ai-results-container"></div>
    `;

    // Insert at the top of the page
    const mapsContainer = document.querySelector('#app-container') || document.body;
    mapsContainer.insertBefore(searchBar, mapsContainer.firstChild);

    // Add event listeners
    setupEventListeners();
    
    return searchBar;
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('ai-search-input');
    const searchButton = document.getElementById('ai-search-button');
    const toggleButton = document.getElementById('ai-toggle-btn');

    // Search on button click
    if (searchButton) {
      searchButton.addEventListener('click', handleAISearch);
    }

    // Search on Enter key
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleAISearch();
        }
      });

      // Show suggestions on focus
      searchInput.addEventListener('focus', () => {
        showAISuggestions();
      });
    }

    // Toggle AI
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleAI);
    }
  }

  async function handleAISearch() {
    const input = document.getElementById('ai-search-input');
    const query = input?.value.trim();
    
    if (!query) return;

    const resultsContainer = document.getElementById('ai-results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="ai-loading">🤖 AI is thinking...</div>';
    }

    try {
      // Send query to background script for AI processing
      const response = await chrome.runtime.sendMessage({
        action: 'aiSearch',
        query: query,
        location: await getCurrentLocation()
      });

      if (response.success) {
        displayResults(response.results);
        // Also search on Google Maps
        searchOnGoogleMaps(response.searchQuery);
      } else {
        showError(response.error || 'Failed to process search');
      }
    } catch (error) {
      console.error('AI Search error:', error);
      showError('Error processing your request');
    }
  }

  function displayResults(results) {
    const resultsContainer = document.getElementById('ai-results-container');
    if (!resultsContainer) return;

    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<div class="ai-no-results">No results found. Try a different search.</div>';
      return;
    }

    let html = '<div class="ai-results-list">';
    results.forEach((result, index) => {
      html += `
        <div class="ai-result-item" data-place-id="${result.placeId || index}">
          <div class="ai-result-name">${result.name}</div>
          ${result.address ? `<div class="ai-result-address">📍 ${result.address}</div>` : ''}
          ${result.distance ? `<div class="ai-result-distance">${result.distance} away</div>` : ''}
          ${result.rating ? `<div class="ai-result-rating">⭐ ${result.rating} ${result.reviews ? `(${result.reviews} reviews)` : ''}</div>` : ''}
          <button class="ai-result-action" onclick="selectPlace('${result.placeId || index}')">View on Map</button>
        </div>
      `;
    });
    html += '</div>';
    
    resultsContainer.innerHTML = html;
  }

  function showError(message) {
    const resultsContainer = document.getElementById('ai-results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = `<div class="ai-error">❌ ${message}</div>`;
    }
  }

  function showAISuggestions() {
    const suggestions = [
      'Find cafes near me',
      'Show restaurants within 2 miles',
      'Best pizza places nearby',
      'Hotels with parking',
      'Gas stations on my route'
    ];

    const resultsContainer = document.getElementById('ai-results-container');
    if (resultsContainer && !resultsContainer.querySelector('.ai-results-list')) {
      let html = '<div class="ai-suggestions">';
      suggestions.forEach(suggestion => {
        html += `<div class="ai-suggestion-item" onclick="useSuggestion('${suggestion}')">${suggestion}</div>`;
      });
      html += '</div>';
      resultsContainer.innerHTML = html;
    }
  }

  // Helper functions
  async function getCurrentLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  }

  function searchOnGoogleMaps(query) {
    // Use Google Maps search
    const searchBox = document.querySelector('input[aria-label*="Search"], input[placeholder*="Search"]');
    if (searchBox) {
      searchBox.value = query;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  }

  function toggleAI() {
    isAIActive = !isAIActive;
    const container = document.getElementById('ai-map-helper-search');
    if (container) {
      container.style.display = isAIActive ? 'block' : 'none';
    }
  }

  // Make functions globally available
  window.selectPlace = function(placeId) {
    chrome.runtime.sendMessage({
      action: 'selectPlace',
      placeId: placeId
    });
  };

  window.useSuggestion = function(suggestion) {
    const input = document.getElementById('ai-search-input');
    if (input) {
      input.value = suggestion;
      handleAISearch();
    }
  };

  // Initialize when page loads
  function init() {
    // Wait for Google Maps to load
    const checkInterval = setInterval(() => {
      if (document.querySelector('input[aria-label*="Search"]') || document.body) {
        clearInterval(checkInterval);
        aiSearchBar = createAISearchBar();
      }
    }, 500);

    // Re-initialize if page changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          if (!document.getElementById('ai-map-helper-search')) {
            aiSearchBar = createAISearchBar();
          }
        }, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
