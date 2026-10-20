const express = require('express');
const { generateItinerary } = require('../controllers/aiController');

const router = express.Router();

/**
 * @route   POST /api/ai/generate-itinerary
 * @desc    Generate personalized travel itinerary using Gemini 3.8 Flash
 * @access  Public
 */
router.post('/generate-itinerary', generateItinerary);

module.exports = router;
