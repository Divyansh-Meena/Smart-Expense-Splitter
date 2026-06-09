const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settlement = require('../models/Settlement');
const Activity = require('../models/Activity');

router.post('/', auth, async (req, res, next) => {
  try {
    const { groupId, from, to, amount, method, notes } = req.body;
    const settlement = await Settlement.create({ group: groupId, from, to, amount, method: method || 'cash', notes, status: 'completed' });
    await Activity.create({ group: groupId, user: req.user._id, type: 'settlement', message: `Rs.${amount} settled`, metadata: { settlementId: settlement._id } });
    res.status(201).json({ success: true, settlement });
  } catch (error) { next(error); }
});

router.get('/group/:groupId', auth, async (req, res, next) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId }).populate('from', 'name avatar').populate('to', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, settlements });
  } catch (error) { next(error); }
});

module.exports = router;