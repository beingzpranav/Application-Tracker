const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats,
  getNotifications,
  uploadResume,
  deleteResume,
} = require('../controllers/applicationController');

// All routes require authentication
router.use(protect);

// Stats & notifications routes (must be before :id routes)
router.get('/stats', getStats);
router.get('/notifications', getNotifications);

// CRUD routes (with optional file upload on create/update)
router.route('/').get(getApplications).post(upload.single('resume'), createApplication);
router.route('/:id').get(getApplication).put(upload.single('resume'), updateApplication).delete(deleteApplication);

// Resume-specific routes
router.post('/:id/resume', upload.single('resume'), uploadResume);
router.delete('/:id/resume', deleteResume);

module.exports = router;
