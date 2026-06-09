const Group = require('../models/Group');
const User = require('../models/User');
const Activity = require('../models/Activity');

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

// @desc    Create group
// @route   POST /api/groups
exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    
    const group = await Group.create({
      name,
      description,
      category: category || 'other',
      createdBy: req.user._id,
      members: [{ user: req.user._id }],
      inviteCode: generateInviteCode()
    });
    
    await Activity.create({
      group: group._id,
      user: req.user._id,
      type: 'group_created',
      message: `${req.user.name} created the group`
    });
    
    res.status(201).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's groups
// @route   GET /api/groups
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, groups });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar upiId')
      .populate('createdBy', 'name email');
    
    if (!group) {
      res.status(404);
      throw new Error('Group not found');
    }
    
    const isMember = group.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to view this group');
    }
    
    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Join group via invite code
// @route   POST /api/groups/join
exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    
    const group = await Group.findOne({ inviteCode });
    if (!group) {
      res.status(404);
      throw new Error('Invalid invite code');
    }
    
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      res.status(400);
      throw new Error('Already a member of this group');
    }
    
    group.members.push({ user: req.user._id });
    await group.save();
    
    await Activity.create({
      group: group._id,
      user: req.user._id,
      type: 'member_joined',
      message: `${req.user.name} joined the group`
    });
    
    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
exports.leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      res.status(404);
      throw new Error('Group not found');
    }
    
    group.members = group.members.filter(m => m.user.toString() !== req.user._id.toString());
    await group.save();
    
    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    next(error);
  }
};