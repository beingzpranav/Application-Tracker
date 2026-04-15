const validateApplication = (req, res, next) => {
  const { company, role, dateApplied } = req.body;
  const errors = [];

  if (!company || company.trim() === '') {
    errors.push('Company name is required');
  }

  if (!role || role.trim() === '') {
    errors.push('Role is required');
  }

  if (!dateApplied) {
    errors.push('Date applied is required');
  } else {
    const date = new Date(dateApplied);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'No Response'];
  if (req.body.status && !validStatuses.includes(req.body.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const validPriorities = ['High', 'Medium', 'Low'];
  if (req.body.priority && !validPriorities.includes(req.body.priority)) {
    errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  next();
};

const validateUpdate = (req, res, next) => {
  const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'No Response'];
  if (req.body.status && !validStatuses.includes(req.body.status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const validPriorities = ['High', 'Medium', 'Low'];
  if (req.body.priority && !validPriorities.includes(req.body.priority)) {
    return res.status(400).json({
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
    });
  }

  next();
};

module.exports = { validateApplication, validateUpdate };
