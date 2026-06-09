const Settlement = require('../models/Settlement');
const Activity = require('../models/Activity');

// @desc    Record settlement
// @route   POST /api/settlements
exports.recordSettlement = async (req, res, next) => {
  try {
    const { groupId, from, to, amount, method, notes } = req.body;
    
    const settlement = await Settlement.create({
      group: groupId,
      from,
      to,
      amount,
      method: method || 'cash',
      notes,
      status: 'completed'
    });
    
    await Activity.create({
      group: groupId,
      user: req.user._id,
      type: 'settlement',
      message: `₹${amount} settled between members`,
      metadata: { settlementId: settlement._id }
    });
    
    res.status(201).json({ success: true, settlement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group settlements
// @route   GET /api/settlements/group/:groupId
exports.getSettlements = async (req, res, next) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, settlements });
  } catch (error) {
    next(error);
  }
};