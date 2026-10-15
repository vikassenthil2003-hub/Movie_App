# CineVerse AI — Automatic Location Detection & Geospatial Search

## 1. Overview

CineVerse AI provides an automatic location detection and nearby-theatre discovery system modeled after modern cinema-booking applications, with fallback reliability:

```
[User Arrives] 
      |
      +---> User Clicks "Detect My Location"
      |            |
      |            +---> Browser Geolocation API Prompts Permission
      |            |           |
      |            |           +--> GRANTED: Returns [lat, lng]
      |            |           |        |
      |            |           |        +--> OpenStreetMap Nominatim Reverse Geocoding
      |            |           |        |        |
      |            |           |        |        +--> Resolves City & Area Name in Navbar
      |            |           |
      |            |           +--> DENIED: Sets permissionDenied=true
      |            |
      |            +---> Fallback: One-Click Manual City Selector
      |                  (Chennai, Salem, Coimbatore, Madurai, Bengaluru)
      |
      v
[Navbar Displays Current City & Coordinates Saved to localStorage]
      |
      v
[Nearby Theatres Query: GET /api/v1/theatres/nearby?lat=...&lng=...&radius=10]
      |
      +--> MongoDB $near Geospatial Query (2dsphere index)
      |
      +--> Radius Expansion: If 0 theatres found within 10 km, auto-expands to 25 km & 50 km.
```

---

## 2. Browser Geolocation & Permission Model

1. **Explicit User Intent:** Geolocation is only requested upon user interaction (clicking the location selector in the navbar or modal), preventing unsolicited browser prompts.
2. **Reverse Geocoding:**
   - Provider: OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}`).
   - Responsible rate limiting with custom User-Agent headers.
3. **Graceful Degradation:** If permission is denied or geocoding fails, the application never crashes or blocks browsing. The manual city selector is immediately displayed with initial popular hubs:
   - **Chennai** (Default: 13.0827° N, 80.2707° E)
   - **Salem** (11.6643° N, 78.1460° E)
   - **Coimbatore** (11.0168° N, 76.9558° E)
   - **Madurai** (9.9252° N, 78.1198° E)
   - **Bengaluru** (12.9716° N, 77.5946° E)

---

## 3. Geospatial Database Engine

### 3.1 MongoDB 2dsphere Query
The `Theatre` collection maintains a GeoJSON Point property:
```javascript
location: {
  type: 'Point',
  coordinates: [longitude, latitude] // Note: GeoJSON stores Longitude first, then Latitude
}
```
With a geospatial index:
```javascript
TheatreSchema.index({ location: '2dsphere' });
```

### 3.2 Dynamic Search & Distance Calculation
In `theatreController.js`:
```javascript
const maxDistanceMeters = radiusKm * 1000;

let theatres = await Theatre.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      $maxDistance: maxDistanceMeters,
    },
  },
});
```

### 3.3 Haversine Fallback & Accurate Formatting
For each retrieved theatre, accurate distance is computed in kilometers:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
Where $R = 6371\text{ km}$.
The resulting distance is displayed directly on the UI (e.g. `2.4 km away`).
