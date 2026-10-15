const { processAssistantQuery } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const askAssistant = async (req, res, next) => {
  try {
    const { query, city, lat, lng } = req.body;

    if (!query || typeof query !== 'string') {
      return errorResponse(res, 'Please provide a valid question or query text.', 400);
    }

    const userContext = {
      city: city || req.user?.preferences?.city || 'Chennai',
      lat: lat || null,
      lng: lng || null,
      userId: req.user?._id || null,
    };

    const result = await processAssistantQuery(query, userContext);
    return successResponse(res, 'Assistant response generated', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askAssistant,
};
