const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

router.get('/:groupId', auth, async (req, res, next) => {
  try {
    const activities = await Activity.find({ group: req.params.groupId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, activities });
  } catch (error) { next(error); }
});

router.put('/read', auth, async (req, res, next) => {
  try {
    await Activity.updateMany(
      { group: req.body.groupId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;