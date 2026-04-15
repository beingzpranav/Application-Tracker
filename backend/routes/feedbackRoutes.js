const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');

const router = express.Router();

// Public — no auth required
router.post('/', submitFeedback);

module.exports = router;
