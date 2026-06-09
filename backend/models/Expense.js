const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitMethod: { 
    type: String, 
    enum: ['equal', 'exact', 'percentage', 'shares'], 
    default: 'equal' 
  },
  splits: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    owedAmount: { type: Number, required: true }
  }],
  category: { 
    type: String, 
    enum: ['food', 'travel', 'shopping', 'entertainment', 'bills', 'other'], 
    default: 'other' 
  },
  receiptImage: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
