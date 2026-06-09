const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  inviteCode: { type: String, unique: true, required: true },
  category: { type: String, enum: ['trip', 'home', 'office', 'other'], default: 'other' },
  totalExpenses: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);