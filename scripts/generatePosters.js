const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'frontend', 'public', 'posters');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const posters = [
  {
    fileName: 'leo.svg',
    title: 'LEO',
    tagline: 'BLOOD & SWEET',
    star: 'THALAPATHY VIJAY',
    director: 'A Lokesh Kanagaraj Film',
    genre: 'ACTION • THRILLER • CRIME',
    cert: 'UA',
    rating: '8.8 ★',
    gradStart: '#450a0a',
    gradMid: '#1c1917',
    gradEnd: '#09090b',
    accent: '#ef4444',
    symbol: '🦁'
  },
  {
    fileName: 'jailer.svg',
    title: 'JAILER',
    tagline: 'THE WARDEN RETURNS',
    star: 'SUPERSTAR RAJINIKANTH',
    director: 'A Nelson Dilipkumar Film',
    genre: 'ACTION • COMEDY • DRAMA',
    cert: 'UA',
    rating: '8.6 ★',
    gradStart: '#451a03',
    gradMid: '#1c1917',
    gradEnd: '#09090b',
    accent: '#f59e0b',
    symbol: '🕶️'
  },
  {
    fileName: 'vikram.svg',
    title: 'VIKRAM',
    tagline: 'HITLIST BEGUN',
    star: 'KAMAL HAASAN • FAHADH • SETHUPATHI',
    director: 'A Lokesh Kanagaraj Universe',
    genre: 'ACTION • MYSTERY • THRILLER',
    cert: 'UA',
    rating: '8.9 ★',
    gradStart: '#1e1b4b',
    gradMid: '#0f172a',
    gradEnd: '#020617',
    accent: '#6366f1',
    symbol: '🦅'
  },
  {
    fileName: 'ps1.svg',
    title: 'PONNIYIN SELVAN',
    tagline: 'PART I • THE CHOLA EMPIRE',
    star: 'VIKRAM • AISHWARYA • KARTHI',
    director: 'A Mani Ratnam Epic',
    genre: 'HISTORICAL • DRAMA • ADVENTURE',
    cert: 'UA',
    rating: '8.5 ★',
    gradStart: '#78350f',
    gradMid: '#292524',
    gradEnd: '#0c0a09',
    accent: '#fbbf24',
    symbol: '👑'
  },
  {
    fileName: 'ps2.svg',
    title: 'PONNIYIN SELVAN',
    tagline: 'PART II • THE CROWN UNVEILED',
    star: 'VIKRAM • AISHWARYA • JAYAM RAVI',
    director: 'A Mani Ratnam Epic',
    genre: 'HISTORICAL • DRAMA • ADVENTURE',
    cert: 'UA',
    rating: '8.4 ★',
    gradStart: '#713f12',
    gradMid: '#292524',
    gradEnd: '#0c0a09',
    accent: '#f59e0b',
    symbol: '⚔️'
  },
  {
    fileName: 'maharaja.svg',
    title: 'MAHARAJA',
    tagline: 'EVEN SILENCE HAS RETRIBUTION',
    star: 'VIJAY SETHUPATHI • ANURAG KASHYAP',
    director: 'Directed by Nithilan Saminathan',
    genre: 'THRILLER • MYSTERY • DRAMA',
    cert: 'UA',
    rating: '9.0 ★',
    gradStart: '#134e4a',
    gradMid: '#0f172a',
    gradEnd: '#020617',
    accent: '#14b8a6',
    symbol: '✂️'
  },
  {
    fileName: 'amaran.svg',
    title: 'AMARAN',
    tagline: 'VALOUR IN EVERY BREATH',
    star: 'SIVAKARTHIKEYAN • SAI PALLAVI',
    director: 'A Rajkumar Periasamy Film',
    genre: 'ACTION • BIOGRAPHY • WAR',
    cert: 'UA',
    rating: '8.7 ★',
    gradStart: '#365314',
    gradMid: '#18181b',
    gradEnd: '#09090b',
    accent: '#84cc16',
    symbol: '🎖️'
  },
  {
    fileName: 'dragon.svg',
    title: 'DRAGON',
    tagline: 'IGNITE THE STREETS',
    star: 'PRADEEP RANGANATHAN',
    director: 'An Ashwath Marimuthu Film',
    genre: 'ACTION • COMEDY • DRAMA',
    cert: 'UA',
    rating: '8.3 ★',
    gradStart: '#831843',
    gradMid: '#1c1917',
    gradEnd: '#09090b',
    accent: '#ec4899',
    symbol: '🐉'
  },
  {
    fileName: 'good_bad_ugly.svg',
    title: 'GOOD BAD UGLY',
    tagline: 'NO RULES • NO MERCY',
    star: 'AJITH KUMAR',
    director: 'An Adhik Ravichandran Film',
    genre: 'ACTION • HEIST • THRILLER',
    cert: 'UA',
    rating: '8.8 ★',
    gradStart: '#581c87',
    gradMid: '#18181b',
    gradEnd: '#020617',
    accent: '#a855f7',
    symbol: '♠️'
  },
  {
    fileName: 'viduthalai.svg',
    title: 'VIDUTHALAI',
    tagline: 'PART 1 • THE SEARCH FOR TRUTH',
    star: 'SOORI • VIJAY SETHUPATHI',
    director: 'A Vetrimaaran Craft',
    genre: 'CRIME • DRAMA • THRILLER',
    cert: 'A',
    rating: '8.7 ★',
    gradStart: '#431407',
    gradMid: '#1c1917',
    gradEnd: '#09090b',
    accent: '#ea580c',
    symbol: '⚖️'
  },
  {
    fileName: 'default_poster.svg',
    title: 'CINEVERSE',
    tagline: 'CINEMATIC SHOWCASE',
    star: 'PREMIUM CINEMA',
    director: 'Official CineVerse AI Selection',
    genre: 'CINEMA • EXPERIENCE',
    cert: 'UA',
    rating: '8.5 ★',
    gradStart: '#312e81',
    gradMid: '#0f172a',
    gradEnd: '#020617',
    accent: '#8b5cf6',
    symbol: '🎬'
  }
];

posters.forEach((p) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.gradStart}" />
      <stop offset="50%" stop-color="${p.gradMid}" />
      <stop offset="100%" stop-color="${p.gradEnd}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3" />
      <stop offset="50%" stop-color="#000000" stop-opacity="0.1" />
      <stop offset="80%" stop-color="#000000" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.95" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="600" height="900" fill="url(#bgGrad)" />
  <circle cx="300" cy="380" r="320" fill="url(#glow)" />

  <!-- Geometric Architectural Frame Accents -->
  <rect x="24" y="24" width="552" height="852" rx="16" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.3" />
  <rect x="34" y="34" width="532" height="832" rx="12" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.1" />

  <!-- Top Badges -->
  <rect x="44" y="44" width="64" height="28" rx="6" fill="#000000" fill-opacity="0.6" stroke="${p.accent}" stroke-width="1" />
  <text x="76" y="63" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${p.cert}</text>

  <rect x="466" y="44" width="90" height="28" rx="6" fill="#000000" fill-opacity="0.6" stroke="#fbbf24" stroke-width="1" />
  <text x="511" y="63" fill="#fbbf24" font-family="'Outfit', sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${p.rating}</text>

  <!-- Central Visual Symbol & Motif -->
  <circle cx="300" cy="380" r="160" fill="#000000" fill-opacity="0.4" stroke="${p.accent}" stroke-width="2" stroke-dasharray="8 6" />
  <circle cx="300" cy="380" r="120" fill="#000000" fill-opacity="0.5" stroke="#ffffff" stroke-width="1" stroke-opacity="0.2" />
  <text x="300" y="420" font-size="96" text-anchor="middle">${p.symbol}</text>

  <!-- Vignette Overlay -->
  <rect width="600" height="900" fill="url(#vignette)" />

  <!-- Lower Branding & Typography -->
  <text x="300" y="660" fill="${p.accent}" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" letter-spacing="4" text-anchor="middle">${p.star}</text>
  
  <text x="300" y="730" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="44" font-weight="900" letter-spacing="2" text-anchor="middle">${p.title}</text>
  
  <text x="300" y="765" fill="#e2e8f0" font-family="'Outfit', sans-serif" font-size="14" font-weight="600" letter-spacing="3" text-anchor="middle">${p.tagline}</text>
  
  <line x1="160" y1="785" x2="440" y2="785" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.6" />

  <text x="300" y="810" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" letter-spacing="2" text-anchor="middle">${p.genre}</text>

  <text x="300" y="835" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500" letter-spacing="1" text-anchor="middle">${p.director}</text>

  <!-- CineVerse AI Badge Footer -->
  <rect x="220" y="855" width="160" height="20" rx="4" fill="#000000" fill-opacity="0.7" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.2" />
  <text x="300" y="869" fill="#a78bfa" font-family="'Outfit', sans-serif" font-size="9" font-weight="bold" letter-spacing="1" text-anchor="middle">TAMIL • CINEVERSE AI</text>
</svg>`;

  const outPath = path.join(targetDir, p.fileName);
  fs.writeFileSync(outPath, svg);
  console.log('Generated:', p.fileName);
});

console.log('All 11 local movie posters created successfully in frontend/public/posters!');
