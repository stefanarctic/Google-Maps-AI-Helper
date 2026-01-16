# AI Map Helper - Chrome Extension

O extensie Chrome care adaugă un asistent AI la Google Maps, permițând căutări în limbaj natural și funcționalități avansate.

## Funcționalități

- 🤖 **AI Assistant** - Căutări în limbaj natural (ex: "Find cafes near me")
- 🗺️ **Integrare completă Google Maps** - Toate funcționalitățile Google Maps
- 📍 **Rezultate inteligente** - AI-ul procesează interogările și returnează locații relevante
- ⭐ **Informații complete** - Rating, recenzii, adresă, distanță
- 🎯 **Căutare contextuală** - Înțelege "near me", "within X miles", etc.

## Instalare

### Pentru dezvoltare:

1. **Clonează repository-ul:**
   ```bash
   git clone <repository-url>
   cd "AI Map Helper"
   ```

2. **Deschide Chrome și mergi la:**
   ```
   chrome://extensions/
   ```

3. **Activează "Developer mode"** (în colțul din dreapta sus)

4. **Click "Load unpacked"** și selectează folderul extensiei

5. **Mergi pe Google Maps** - ar trebui să vezi bara de căutare AI în partea de sus

## Configurare

1. **Click pe iconița extensiei** în toolbar-ul Chrome
2. **Adaugă Google Places API Key** (opțional, pentru rezultate reale)
   - Obține cheia de la [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Activează "Places API" în consolă
3. **Salvează setările**

## Utilizare

1. Deschide [Google Maps](https://www.google.com/maps)
2. Vei vedea bara de căutare AI în partea de sus
3. Întreabă AI-ul:
   - "Find cafes near me"
   - "Show restaurants within 2 miles"
   - "Best pizza places nearby"
   - "Hotels with parking"
   - "Gas stations on my route"

4. AI-ul va procesa interogarea și va afișa rezultatele
5. Click pe un rezultat pentru a-l vedea pe hartă

## Structura Proiectului

```
AI Map Helper/
├── manifest.json          # Configurație extensie Chrome
├── content.js            # Script injectat în Google Maps
├── content.css           # Stiluri pentru UI
├── background.js         # Service worker pentru procesare AI
├── popup.html            # Interfață setări
├── popup.js              # Script pentru popup
└── icons/                # Iconițe extensie
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Dezvoltare

### Adăugare funcționalități noi:

1. **Modifică `content.js`** pentru UI nou
2. **Modifică `background.js`** pentru logică AI
3. **Actualizează `manifest.json`** dacă ai nevoie de permisiuni noi

### Testare:

1. Reload extensia în `chrome://extensions/`
2. Refresh pagina Google Maps
3. Testează funcționalitățile

## API Keys

### Google Places API (Opțional):

1. Creează un proiect în [Google Cloud Console](https://console.cloud.google.com)
2. Activează "Places API"
3. Creează o cheie API
4. Adaugă cheia în popup-ul extensiei

**Notă:** Fără API key, extensia va folosi date mock pentru demonstrație.

## Permisiuni

Extensia necesită:
- `activeTab` - Pentru a accesa Google Maps
- `storage` - Pentru salvarea setărilor
- `geolocation` - Pentru "near me" searches
- `host_permissions` - Pentru acces la Google Maps și API-uri

## Suport

Pentru probleme sau sugestii, deschide un issue în repository.

## Licență

MIT
