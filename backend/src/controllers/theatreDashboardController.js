const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const AuditEvent = require('../models/AuditEvent');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get Theatre Dashboard Overview
 */
const getTheatreOverview = async (req, res, next) => {
  try {
    const user = req.user;
    let theatreId = user.assignedTheatre;

    // If admin is viewing, allow query param theatreId or fallback to first theatre
    if (user.role === 'admin' && req.query.theatreId) {
      theatreId = req.query.theatreId;
    }

    if (!theatreId) {
      // Find first theatre as fallback for admin demo
      const firstTheatre = await Theatre.findOne();
      theatreId = firstTheatre?._id;
    }

    if (!theatreId) {
      return errorResponse(res, 'No theatre assigned to this account', 400);
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return errorResponse(res, 'Theatre record not found', 404);
    }

    // Today's shows for this theatre
    const todayStr = new Date().toISOString().split('T')[0];
    const todayShows = await Show.find({ theatreId, date: todayStr })
      .populate('movieId', 'title posterUrl duration')
      .populate('screenId', 'name totalCapacity');

    // Total tickets admitted today
    const admittedToday = await Booking.countDocuments({
      theatreId,
      isAdmitted: true,
      admittedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const recentAdmissions = await Booking.find({
      theatreId,
      isAdmitted: true,
    })
      .populate('movieId', 'title')
      .populate('showId', 'startTime date')
      .sort({ admittedAt: -1 })
      .limit(10);

    return successResponse(res, 'Theatre overview loaded', {
      theatre,
      todayShows,
      metrics: {
        totalShowsToday: todayShows.length,
        admittedToday,
      },
      recentAdmissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatreOverview,
};
