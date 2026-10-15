const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

// Calculate distance utility
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Intelligent Rule-Based Engine (Fallback when GEMINI_API_KEY is not set)
 * Parses query intent, language, genre, budget, time, location, amenities
 */
const ruleBasedAssistant = async (queryText, userContext = {}) => {
  const query = (queryText || '').toLowerCase().trim();
  const userCity = userContext.city || 'Chennai';
  const userLat = userContext.lat ? parseFloat(userContext.lat) : null;
  const userLng = userContext.lng ? parseFloat(userContext.lng) : null;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // 1. Language detection
  const detectedLanguages = [];
  if (query.includes('tamil')) detectedLanguages.push('Tamil');
  if (query.includes('english')) detectedLanguages.push('English');
  if (query.includes('hindi')) detectedLanguages.push('Hindi');
  if (query.includes('telugu')) detectedLanguages.push('Telugu');
  if (query.includes('malayalam')) detectedLanguages.push('Malayalam');

  // 2. Genre detection
  const detectedGenres = [];
  if (query.includes('action')) detectedGenres.push('Action');
  if (query.includes('thriller') || query.includes('suspense')) detectedGenres.push('Thriller');
  if (query.includes('family') || query.includes('kids') || query.includes('children')) detectedGenres.push('Family');
  if (query.includes('comedy') || query.includes('funny')) detectedGenres.push('Comedy');
  if (query.includes('romance') || query.includes('romantic') || query.includes('date')) detectedGenres.push('Romance');
  if (query.includes('sci-fi') || query.includes('scifi') || query.includes('science fiction')) detectedGenres.push('Sci-Fi');
  if (query.includes('drama')) detectedGenres.push('Drama');
  if (query.includes('animation') || query.includes('animated')) detectedGenres.push('Animation');

  // 3. Date detection
  let targetDate = todayStr;
  if (query.includes('tomorrow')) targetDate = tomorrowStr;
  if (query.includes('weekend')) {
    // Upcoming weekend date
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7; // Nearest Saturday
    d.setDate(d.getDate() + diff);
    targetDate = d.toISOString().split('T')[0];
  }

  // 4. Time filter
  const isNightOrTonight = query.includes('tonight') || query.includes('night') || query.includes('after 7') || query.includes('evening');
  const isRecliner = query.includes('recliner');
  const isCheapest = query.includes('cheap') || query.includes('lowest') || query.includes('budget') || query.includes('under');

  // Check if intent is Theatre-specific
  const isTheatreQuery = query.includes('theatre') || query.includes('closest') || query.includes('nearby') || query.includes('within');

  // BUILD DYNAMIC DATABASE QUERY
  const movieFilter = { status: 'now_showing' };
  if (detectedLanguages.length > 0) movieFilter.language = { $in: detectedLanguages };
  if (detectedGenres.length > 0) movieFilter.genre = { $in: detectedGenres };

  const matchedMovies = await Movie.find(movieFilter).sort({ rating: -1 }).limit(6);

  // If searching for nearest theatre
  if (isTheatreQuery && !query.includes('movie')) {
    let theatres = await Theatre.find({ isActive: true }).lean();
    if (userLat && userLng) {
      theatres = theatres.map((th) => ({
        ...th,
        distanceKm: calculateDistance(userLat, userLng, th.location.coordinates[1], th.location.coordinates[0]),
      })).sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      theatres = theatres.filter((th) => th.city.toLowerCase() === userCity.toLowerCase());
    }

    const topTheatres = theatres.slice(0, 4);

    return {
      message: `Here are the top theatres matching your request${userLat ? ' based on your detected location' : ' in ' + userCity}:`,
      actionCards: topTheatres.map((th) => ({
        type: 'theatre',
        id: th._id,
        title: th.name,
        subtitle: `${th.address}, ${th.city}`,
        badge: th.distanceKm !== undefined ? `${th.distanceKm} km away` : th.city,
        rating: `⭐ ${th.rating}`,
        link: `/theatres/${th._id}`,
        actionText: 'View Showtimes',
      })),
      reasoning: 'Filtered by verified cinema halls and proximity to your selected location.',
      isAiGenerated: false,
    };
  }

  // Find actual shows matching the criteria
  const showQuery = {
    date: targetDate,
    status: { $ne: 'cancelled' },
  };

  if (matchedMovies.length > 0) {
    showQuery.movieId = { $in: matchedMovies.map((m) => m._id) };
  }

  const realShows = await Show.find(showQuery)
    .populate('movieId')
    .populate('theatreId')
    .sort({ startTime: 1 })
    .limit(10);

  // Filter shows if night or recliner requested
  let filteredShows = realShows;
  if (isNightOrTonight) {
    filteredShows = filteredShows.filter((s) => {
      const time = s.startTime.toUpperCase();
      return time.includes('PM') && (time.startsWith('06') || time.startsWith('07') || time.startsWith('08') || time.startsWith('09') || time.startsWith('10'));
    });
    if (filteredShows.length === 0) filteredShows = realShows; // Fallback to all if none in window
  }

  if (isRecliner) {
    filteredShows = filteredShows.filter((s) => s.theatreId?.amenities?.includes('Recliner Seats'));
    if (filteredShows.length === 0) filteredShows = realShows;
  }

  if (isCheapest) {
    filteredShows.sort((a, b) => a.pricing.standard - b.pricing.standard);
  }

  // Create actionable recommendation cards
  const actionCards = [];

  if (filteredShows.length > 0) {
    filteredShows.slice(0, 4).forEach((s) => {
      actionCards.push({
        type: 'show',
        id: s._id,
        title: s.movieId.title,
        subtitle: `${s.theatreId.name} • ${s.startTime} (${s.format})`,
        badge: `₹${s.pricing.standard}`,
        rating: `⭐ ${s.movieId.rating}/10`,
        posterUrl: s.movieId.posterUrl,
        link: `/booking/${s._id}/seats`,
        actionText: 'Book Seats Now',
      });
    });
  } else if (matchedMovies.length > 0) {
    matchedMovies.slice(0, 4).forEach((m) => {
      actionCards.push({
        type: 'movie',
        id: m._id,
        title: m.title,
        subtitle: `${m.genre.join(', ')} • ${m.language.join(', ')}`,
        badge: `${m.duration} mins`,
        rating: `⭐ ${m.rating}/10`,
        posterUrl: m.posterUrl,
        link: `/movies/${m._id}`,
        actionText: 'View Movie & Shows',
      });
    });
  }

  // Craft dynamic, natural language conversational response
  let responseText = '';
  if (detectedGenres.length > 0 && detectedLanguages.length > 0) {
    responseText = `Found ${detectedLanguages.join(', ')} ${detectedGenres.join('/')} titles showing on ${targetDate}.`;
  } else if (isNightOrTonight) {
    responseText = `Here are prime evening and night shows showing on ${targetDate}.`;
  } else if (isCheapest) {
    responseText = `Here are the most affordable verified tickets starting as low as ₹${filteredShows[0]?.pricing?.standard || 160}.`;
  } else if (actionCards.length > 0) {
    responseText = `Here are top verified recommendations matching "${queryText}":`;
  } else {
    responseText = `I couldn't find an exact match for "${queryText}". Here are popular blockbuster movies currently showing:`;
    const popular = await Movie.find({ status: 'now_showing' }).limit(3);
    popular.forEach((m) => {
      actionCards.push({
        type: 'movie',
        id: m._id,
        title: m.title,
        subtitle: `${m.genre.join(', ')} • ${m.language.join(', ')}`,
        badge: `${m.certification}`,
        rating: `⭐ ${m.rating}/10`,
        posterUrl: m.posterUrl,
        link: `/movies/${m._id}`,
        actionText: 'Check Showtimes',
      });
    });
  }

  return {
    message: responseText,
    actionCards,
    reasoning: `Matched via CineVerse Smart Engine based on language: [${detectedLanguages.join(', ') || 'Any'}], genre: [${detectedGenres.join(', ') || 'Any'}], and verified database showtimes.`,
    isAiGenerated: false,
  };
};

/**
 * Main Assistant Entry point
 */
const processAssistantQuery = async (queryText, userContext = {}) => {
  const geminiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key is available, we can augment with generative text while maintaining strict database facts
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      // Fetch relevant DB context first to ground the LLM
      const movies = await Movie.find({ status: 'now_showing' }).select('title genre language rating duration certification').limit(10);
      const theatres = await Theatre.find({ isActive: true }).select('name city amenities').limit(5);

      const promptContext = `Available Movies: ${JSON.stringify(movies)}. Available Theatres: ${JSON.stringify(theatres)}. User Location: ${userContext.city || 'Chennai'}. User Query: "${queryText}".`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are CineMate AI, the premium movie concierge for CineVerse AI. Ground your answer ONLY in this provided database context: ${promptContext}. Be enthusiastic, cinematic, and concise. Explain why the options match the user's intent. Do not invent non-existent movies or showtimes.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiMessage) {
          // Combine AI text with structured actionable DB cards
          const structuredData = await ruleBasedAssistant(queryText, userContext);
          return {
            message: aiMessage,
            actionCards: structuredData.actionCards,
            reasoning: 'Generated by Google Gemini AI and grounded in live CineVerse database showtimes.',
            isAiGenerated: true,
          };
        }
      }
    } catch (apiErr) {
      console.warn('[Gemini AI Provider Error]: Fallback to rule engine:', apiErr.message);
    }
  }

  // Default to robust, instant rule-based assistant
  return await ruleBasedAssistant(queryText, userContext);
};

module.exports = {
  processAssistantQuery,
  ruleBasedAssistant,
};
