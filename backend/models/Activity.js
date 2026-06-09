const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['expense_added', 'expense_deleted', 'settlement', 'member_joined', 'group_created'], 
    required: true 
  },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);