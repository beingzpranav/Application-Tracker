const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'No Response'],
      default: 'Applied',
    },
    dateApplied: {
      type: Date,
      required: [true, 'Date applied is required'],
    },
    followUpDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    notes: {
      type: String,
      default: '',
    },
    jobUrl: {
      type: String,
      default: '',
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeFileName: {
      type: String,
      default: '',
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware: auto-calculate followUpDate (dateApplied + 5 days)
applicationSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('dateApplied')) {
    const followUp = new Date(this.dateApplied);
    followUp.setDate(followUp.getDate() + 5);
    this.followUpDate = followUp;
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
