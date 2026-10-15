# Tamil Nadu Cinema Theatre & Multiplex Directory

## 1. Overview
The CineVerse AI Tamil Nadu Theatre Directory provides a comprehensive, legitimate, and verifiable directory of cinema halls and multiplexes spanning all **38 administrative districts** of Tamil Nadu, India.

It bridges real-world geographical cinema locations with CineVerse AI's real-time movie scheduling, atomic seat locking, and ticketing architecture while strictly upholding data integrity:
- **No invented theatres or fake showtimes**: Venues, coordinates, and operating statuses reflect real-world registries.
- **Strict separation of verified vs unverified records**: Verified theatres from authenticated public directories are clearly distinguished from raw OpenStreetMap directory records.
- **Dynamic showtimes**: Live bookings are only allowed against valid, configured showtime and seat inventory records.
- **Admin & Theatre Staff Show Scheduling**: Admins and theatre staff can configure screens, formats, and show schedules for any theatre in the directory.
- **Admin Booking Restriction**: Administrators are strictly blocked from booking tickets, ensuring proper segregation of duties.

---

## 2. District Coverage & Completeness Audit
The directory spans all 38 official revenue districts of Tamil Nadu. In accordance with honesty principles, coverage is categorized based on verified records:

| District Tier | Criteria | Districts Included | Status & Action |
|---|---|---|---|
| **Tier 1: High Density** | ≥ 10 Theatres | Chennai (79), Coimbatore (109), Krishnagiri / Hosur (118), Theni (54), Tenkasi (78), Nilgiris (66), Erode (20), Tiruppur (18), Cuddalore (16), Thanjavur (15), Vellore (13), Tiruchirappalli (12), Madurai (11), Salem (11), Chengalpattu (11), Virudhunagar (11), Tirunelveli (10) | Comprehensive coverage of major chains and landmark single-screens. |
| **Tier 2: Moderate Density** | 3 to 9 Theatres | Dindigul (7), Villupuram (7), Nagapattinam (7), Tiruvallur (7), Pudukkottai (6), Thoothukudi (5), Kanyakumari (5), Dharmapuri (5), Karur (5), Kancheepuram (5), Namakkal (4), Ramanathapuram (4), Ranipet (4), Perambalur (3), Mayiladuthurai (3), Tiruvannamalai (3), Tirupathur (3) | Established regional hubs with verified landmark cinemas. |
| **Tier 3: Minimal / Expanding** | 1 to 2 Theatres | Ariyalur (2), Tiruvarur (2), Kallakurichi (2), Sivaganga (2) | Initial verified landmark cinemas present; incremental verified imports welcomed. |

> **Directory Totals in Database:**
> - **Total Venues:** 744
> - **Verified Real Theatres:** 135
> - **Imported Directory Records (OSM):** 609
> - **Districts Covered:** 38 of 38 (100% of Tamil Nadu districts)

---

## 3. Major Chains & Notable Theatres Included

### A. Multiplex Chains
- **PVR INOX**: PVR Grand Galada (Pallavaram), PVR VR Chennai (Anna Nagar), PVR Express Avenue (Royapettah), PVR Ampa Skywalk (Aminjikarai), INOX Chennai Citi Centre (Mylapore), INOX Prozone Mall (Saravanampatti, Coimbatore), PVR The Cinema (Brookefields, Coimbatore).
- **AGS Cinemas**: AGS Villivakkam, AGS OMR Navallur, AGS T. Nagar, AGS Maduravoyal.
- **SPI / Sathyam Heritage Cinemas**: SPI Sathyam Cinemas (Royapettah), SPI Escape (Express Avenue), SPI Palazzo (Nexus Vijaya Mall, Vadapalani), SPI Le Rêve.
- **Cinepolis & Fun Cinemas**: Cinepolis Bhuvaneshwari (Coimbatore), Cinepolis Grand Square (Velachery).
- **Regional Multiplex Pioneers**: Mayajaal Multiplex (ECR, 16 screens), Rohini Silver Screens (Koyambedu, 6 screens), Kamala Cinemas (Vadapalani), Sangam Multiplex (Kilpauk), Kasi Theatre (Jafferkhanpet), ARRS Multiplex (Salem), Solamalai Cinemas (Madurai), LA Cinema (Trichy), V Vetrivel (Coimbatore), Ganga Cinemas (Kolathur).

### B. Landmark District Theatres
- **Madurai**: Solamalai Cinemas, INOX Milan Emall, Cine Priya Complex, Guru Theatre, Thangam Theatre, Jazz Cinemas.
- **Coimbatore**: KG Cinemas, Baba Cinemas, Miraj Cinemas, Sree Sakthi Cinemas, Karpagam Theatres.
- **Salem**: ARRS Multiplex, Kailash Prakash Theatres, Mini Apsara, Sapna Theatre.
- **Tiruchirappalli**: LA Cinema (Mariam), Sona Mina Theatres, Megastar Theatre, Palace Theatre.
- **Tirunelveli**: Ram Muthuram Cinemas, Bombay Theatre, Royal Cinema, Perinba Vilas.
- **Vellore**: Venus Theatre, Vishnu Theatre, Big Cinemas, Lakshmi Theatre.
- **Thanjavur**: GV Studio, Yagappa Theatre, Jupiter Theatre, Shanthi Complex.
- **Hosur (Krishnagiri)**: Sri Balaji Talkies, Manjunatha Theatre, Ranga Theatre.
- **Kanyakumari / Nagercoil**: Chakravarthy Cinema, Pioneer Muthu, Vasantham Cinemas.

---

## 4. Legitimate Data Sources & Terms of Use Compliance

1. **OpenStreetMap Overpass API**:
   - Queries `node["amenity"="cinema"]` and `way["amenity"="cinema"]` within the bounding box of Tamil Nadu `[8.0, 76.1, 13.6, 80.4]`.
   - Adheres strictly to OSM Acceptable Use Policies: custom User-Agent identifying CineVerse AI, rate limiting, and an authentic pre-bundled snapshot fallback to prevent API strain.
2. **Public Theatre Registries**:
   - Curated from verifiable district cinema licensing registries and municipal directories.
   - Zero private scraping or access control bypassing.
3. **OpenStreetMap Nominatim Geocoding**:
   - Reverse geocoding for GPS coordinate resolution with a 24-hour in-memory cache and 1.1s request throttling.
   - No paid API key required for basic location features.

---

## 5. Database Schema & Indexing

The `Theatre` model (`backend/src/models/Theatre.js`) stores:
- `name`: String, required, indexed
- `normalizedName`: Lowercase alphanumeric string for duplicate detection
- `brand`: Multiplex chain or independent brand
- `category`: 'Multiplex' | 'Single Screen' | 'Drive-in'
- `screensCount`: Verified screen count (default 1)
- `address`, `locality`, `town`, `city`, `district`, `state` ('Tamil Nadu'), `pinCode`
- `location`: GeoJSON Point `[longitude, latitude]`, indexed with `2dsphere`
- `amenities`: Array of strings (e.g. `['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Parking']`)
- `rating`, `reviewCount`, `contactPhone`
- `source`: `'verified_directory'` | `'osm'` | `'manual_admin'` | `'curated_osm'`
- `osmId`: OpenStreetMap node/way identifier, sparse indexed
- `verificationStatus`: `'verified'` | `'unverified'` | `'pending_review'` | `'inactive'`
- `verificationNotes`: Audit rationale
- `lastVerifiedAt`: Date
- `isActive`: Boolean flag to mark open vs closed/inactive cinemas

### Indexes:
- `location: '2dsphere'` for `$near` proximity sorting and radius filtering
- `district: 1, city: 1, verificationStatus: 1` for district-level filtering
- `name: 'text', address: 'text', district: 'text', city: 'text'` for full-text search

---

## 6. Duplicate Detection & Repeatable Imports

The duplicate prevention engine (`backend/src/services/theatreImportService.js`):
1. **Spatial Proximity**: Computes Haversine distance. Records within **400 meters** are flagged as candidate duplicates.
2. **Normalized Name Matching**: Strips generic noise words (`theatre`, `cinemas`, `talkies`, `multiplex`, `screen`) and compares normalized alphanumeric strings.
3. **Idempotence**: Re-running imports updates existing records with verified metadata without generating duplicates or altering existing bookings.
4. **Admin Duplicate Scanner**: Administrators can trigger a scan from `/admin/theatres`, inspect suspected clusters, review distances and matching reasons, and delete redundant entries or mark them inactive.

---

## 7. Connecting Theatres to Movie Booking

1. **Dynamic Dates**: `Today`, `Tomorrow`, and upcoming dates are dynamically calculated based on current time (no hardcoded dates).
2. **Real Showtimes**: External listings do not fake live inventory. The frontend clearly shows when showtimes are scheduled vs when a theatre is in directory-only mode.
3. **Admin / Theatre Staff Scheduling**:
   - Admins can schedule shows for any theatre at `/admin/shows`.
   - If a theatre does not have an existing screen layout, Screen 1 (120-seat Laser screen with Standard, Premium, and Recliner rows) is auto-provisioned seamlessly.
4. **Valid Booking Only**:
   - Customers can only book against active, valid showtimes with unexpired seat locks.
   - Admins attempting to book receive an HTTP 403 Forbidden with: *"Admins are not allowed to book movie tickets. Please use a customer account."*

---

## 8. CLI Commands & Verification Scripts

### Run Comprehensive Tamil Nadu Test Suite
```bash
node backend/src/scripts/comprehensiveTamilNaduTest.js
```
*Validates 38 districts API, multi-district querying, geospatial proximity sorting, reverse geocoding, forward search, showtime linking, and duplicate prevention.*

### Test RBAC Permissions & Booking Restrictions
```bash
node backend/src/scripts/testPermissionsAndWorkflows.js
```
*Verifies customer access control, admin duplicate scanning, admin ticket booking block, and dynamic date showtimes.*

### Inspect District Breakdown
```bash
node backend/src/scripts/checkDistrictBreakdown.js
```
*Outputs detailed count of total, verified, unverified, and inactive theatres across each of the 38 districts.*

### Seed Database
```bash
node backend/src/scripts/seedTamilNaduTheatres.js
```
*Safely seeds verified theatres and configures screens and showtimes across regional district hubs.*
