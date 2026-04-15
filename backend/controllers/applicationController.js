const Application = require('../models/Application');
const { uploadToR2, deleteFromR2 } = require('../config/cloudflare');

// @desc    Get all applications
// @route   GET /api/applications
const getApplications = async (req, res) => {
  try {
    const { status, priority, search, sort } = req.query;
    let query = { user: req.user._id };

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search by company or role
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption = { dateApplied: -1 }; // Default: newest first
    if (sort === 'oldest') sortOption = { dateApplied: 1 };
    if (sort === 'company') sortOption = { company: 1 };
    if (sort === 'priority') sortOption = { priority: 1 };

    const applications = await Application.find(query).sort(sortOption);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create application
// @route   POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { company, role, dateApplied, notes, priority, status, jobUrl } = req.body;

    let resumeUrl = '';
    let resumeFileName = '';

    // Handle resume upload if file is attached
    if (req.file) {
      const result = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
      resumeUrl = result.url;
      resumeFileName = req.file.originalname;
    }

    const application = new Application({
      user: req.user._id,
      company,
      role,
      dateApplied,
      notes: notes || '',
      priority: priority || 'Medium',
      status: status || 'Applied',
      jobUrl: jobUrl || '',
      resumeUrl,
      resumeFileName,
      activityLog: [
        {
          action: 'Applied',
          date: dateApplied || new Date(),
        },
      ],
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { company, role, status, notes, priority, dateApplied, jobUrl } = req.body;

    // Track status change in activity log
    if (status && status !== application.status) {
      application.activityLog.push({
        action: `Status changed to ${status}`,
        date: new Date(),
      });
    }

    // Track other updates
    if (
      (notes !== undefined && notes !== application.notes) ||
      (priority && priority !== application.priority)
    ) {
      application.activityLog.push({
        action: 'Updated',
        date: new Date(),
      });
    }

    // Update fields
    if (company) application.company = company;
    if (role) application.role = role;
    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    if (priority) application.priority = priority;
    if (jobUrl !== undefined) application.jobUrl = jobUrl;
    if (dateApplied) {
      application.dateApplied = dateApplied;
      // Recalculate follow-up date
      const followUp = new Date(dateApplied);
      followUp.setDate(followUp.getDate() + 5);
      application.followUpDate = followUp;
    }

    // Handle resume upload on update
    if (req.file) {
      // Delete old resume if exists
      if (application.resumeUrl) {
        try { await deleteFromR2(application.resumeUrl); } catch (e) { /* ignore */ }
      }
      const result = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
      application.resumeUrl = result.url;
      application.resumeFileName = req.file.originalname;
    }

    application.lastUpdated = new Date();

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Delete resume from R2 if exists
    if (application.resumeUrl) {
      try { await deleteFromR2(application.resumeUrl); } catch (e) { /* ignore */ }
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload/replace resume for an application
// @route   POST /api/applications/:id/resume
const uploadResume = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old resume if exists
    if (application.resumeUrl) {
      try { await deleteFromR2(application.resumeUrl); } catch (e) { /* ignore */ }
    }

    const result = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
    application.resumeUrl = result.url;
    application.resumeFileName = req.file.originalname;
    application.lastUpdated = new Date();
    application.activityLog.push({ action: 'Resume uploaded', date: new Date() });

    const updated = await application.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resume from an application
// @route   DELETE /api/applications/:id/resume
const deleteResume = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.resumeUrl) {
      try { await deleteFromR2(application.resumeUrl); } catch (e) { /* ignore */ }
    }

    application.resumeUrl = '';
    application.resumeFileName = '';
    application.lastUpdated = new Date();
    application.activityLog.push({ action: 'Resume removed', date: new Date() });

    const updated = await application.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/applications/stats
const getStats = async (req, res) => {
  try {
    const userFilter = { user: req.user._id };
    const total = await Application.countDocuments(userFilter);
    const applied = await Application.countDocuments({ ...userFilter, status: 'Applied' });
    const interviews = await Application.countDocuments({ ...userFilter, status: 'Interview' });
    const offers = await Application.countDocuments({ ...userFilter, status: 'Offer' });
    const rejections = await Application.countDocuments({ ...userFilter, status: 'Rejected' });
    const noResponse = await Application.countDocuments({ ...userFilter, status: 'No Response' });

    const responseRate = total > 0 ? (((interviews + offers + rejections) / total) * 100).toFixed(1) : 0;
    const offerRate = total > 0 ? ((offers / total) * 100).toFixed(1) : 0;

    // Follow-up alerts: applications where today >= followUpDate AND status is "Applied"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpAlerts = await Application.countDocuments({
      ...userFilter,
      followUpDate: { $lte: today },
      status: 'Applied',
    });

    // Stale warnings: no update for 10+ days and status is "Applied"
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const staleWarnings = await Application.countDocuments({
      ...userFilter,
      lastUpdated: { $lte: tenDaysAgo },
      status: { $in: ['Applied', 'No Response'] },
    });

    // Weekly data for chart (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const count = await Application.countDocuments({
        ...userFilter,
        dateApplied: { $gte: weekStart, $lte: weekEnd },
      });

      weeklyData.push({
        week: `Week ${4 - i}`,
        applications: count,
      });
    }

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Applied', value: applied, color: '#6366f1' },
      { name: 'Interview', value: interviews, color: '#f59e0b' },
      { name: 'Offer', value: offers, color: '#10b981' },
      { name: 'Rejected', value: rejections, color: '#ef4444' },
      { name: 'No Response', value: noResponse, color: '#6b7280' },
    ];

    res.json({
      total,
      applied,
      interviews,
      offers,
      rejections,
      noResponse,
      responseRate: Number(responseRate),
      offerRate: Number(offerRate),
      followUpAlerts,
      staleWarnings,
      weeklyData,
      statusDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notifications (follow-ups + stale warnings)
// @route   GET /api/applications/notifications
const getNotifications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Follow-up reminders
    const followUps = await Application.find({
      user: req.user._id,
      followUpDate: { $lte: today },
      status: 'Applied',
    }).select('company role followUpDate dateApplied');

    // Stale applications
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const stale = await Application.find({
      user: req.user._id,
      lastUpdated: { $lte: tenDaysAgo },
      status: { $in: ['Applied', 'No Response'] },
    }).select('company role lastUpdated status');

    const notifications = [];

    followUps.forEach((app) => {
      notifications.push({
        id: app._id,
        type: 'follow-up',
        company: app.company,
        role: app.role,
        message: `Follow up with ${app.company} for ${app.role} position`,
        date: app.followUpDate,
      });
    });

    stale.forEach((app) => {
      notifications.push({
        id: app._id,
        type: 'stale',
        company: app.company,
        role: app.role,
        message: `No updates from ${app.company} for ${app.role} in 10+ days`,
        date: app.lastUpdated,
      });
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats,
  getNotifications,
  uploadResume,
  deleteResume,
};
