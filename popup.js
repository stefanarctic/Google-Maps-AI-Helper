// Popup script for settings

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveBtn = document.getElementById('save-btn');

  // Load saved settings
  chrome.storage.sync.get(['googlePlacesAPIKey'], (result) => {
    if (result.googlePlacesAPIKey) {
      apiKeyInput.value = result.googlePlacesAPIKey;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    chrome.storage.sync.set({ googlePlacesAPIKey: apiKey }, () => {
      alert('Settings saved!');
    });
  });
});
