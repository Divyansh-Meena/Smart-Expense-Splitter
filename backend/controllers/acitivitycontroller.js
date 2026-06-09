const Activity = require('../models/Activity');

// @desc    Get group activity
// @route   GET /api/activity/:groupId
exports.getActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ group: req.params.groupId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark activities as read
// @route   PUT /api/activity/read
exports.markAsRead = async (req, res, next) => {
  try {
    await Activity.updateMany(
      { group: req.body.groupId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};