const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const simplifyDebts = require('../utils/simplifyDebts');

// @desc    Add expense
// @route   POST /api/expenses
exports.addExpense = async (req, res, next) => {
  try {
    const { groupId, description, amount, paidBy, splitMethod, splits, category, date } = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404);
      throw new Error('Group not found');
    }
    
    // Calculate owed amounts based on split method
    let calculatedSplits = [];
    const numMembers = splits.length;
    const totalAmount = parseFloat(amount);
    
    if (splitMethod === 'equal') {
      const share = totalAmount / numMembers;
      calculatedSplits = splits.map(s => ({
        user: s.userId,
        owedAmount: parseFloat(share.toFixed(2))
      }));
      // Fix rounding issues
      const diff = totalAmount - calculatedSplits.reduce((sum, s) => sum + s.owedAmount, 0);
      if (Math.abs(diff) > 0) {
        calculatedSplits[0].owedAmount = parseFloat((calculatedSplits[0].owedAmount + diff).toFixed(2));
      }
    } else if (splitMethod === 'exact') {
      calculatedSplits = splits.map(s => ({
        user: s.userId,
        amount: s.amount,
        owedAmount: parseFloat(s.amount.toFixed(2))
      }));
    } else if (splitMethod === 'percentage') {
      calculatedSplits = splits.map(s => ({
        user: s.userId,
        percentage: s.percentage,
        owedAmount: parseFloat(((totalAmount * s.percentage) / 100).toFixed(2))
      }));
    } else if (splitMethod === 'shares') {
      const totalShares = splits.reduce((sum, s) => sum + s.shares, 0);
      calculatedSplits = splits.map(s => ({
        user: s.userId,
        shares: s.shares,
        owedAmount: parseFloat(((totalAmount * s.shares) / totalShares).toFixed(2))
      }));
    }
    
    const expense = await Expense.create({
      group: groupId,
      description,
      amount: totalAmount,
      paidBy,
      splitMethod,
      splits: calculatedSplits,
      category: category || 'other',
      date: date || new Date(),
      createdBy: req.user._id
    });
    
    // Update group total
    group.totalExpenses += totalAmount;
    await group.save();
    
    // Log activity
    await Activity.create({
      group: groupId,
      user: req.user._id,
      type: 'expense_added',
      message: `${req.user.name} added ${description} for ₹${totalAmount}`,
      metadata: { expenseId: expense._id }
    });
    
    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group expenses
// @route   GET /api/expenses/group/:groupId
exports.getGroupExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name avatar')
      .populate('splits.user', 'name avatar')
      .sort({ date: -1 });
    
    res.json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }
    
    const group = await Group.findById(expense.group);
    group.totalExpenses -= expense.amount;
    await group.save();
    
    await expense.deleteOne();
    
    await Activity.create({
      group: expense.group,
      user: req.user._id,
      type: 'expense_deleted',
      message: `${req.user.name} deleted an expense`
    });
    
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group balances
// @route   GET /api/expenses/balances/:groupId
exports.getBalances = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId });
    const settlements = await require('../models/Settlement').find({ 
      group: req.params.groupId,
      status: 'completed'
    });
    
    const balances = {};
    
    // Calculate from expenses
    expenses.forEach(expense => {
      const paidBy = expense.paidBy.toString();
      if (!balances[paidBy]) balances[paidBy] = 0;
      balances[paidBy] += expense.amount;
      
      expense.splits.forEach(split => {
        const userId = split.user.toString();
        if (!balances[userId]) balances[userId] = 0;
        balances[userId] -= split.owedAmount;
      });
    });
    
    // Adjust for settlements
    settlements.forEach(settlement => {
      const from = settlement.from.toString();
      const to = settlement.to.toString();
      if (!balances[from]) balances[from] = 0;
      if (!balances[to]) balances[to] = 0;
      balances[from] += settlement.amount;
      balances[to] -= settlement.amount;
    });
    
    // Round to 2 decimals
    Object.keys(balances).forEach(key => {
      balances[key] = parseFloat(balances[key].toFixed(2));
    });
    
    const simplified = simplifyDebts(balances);
    
    res.json({ success: true, balances, simplified });
  } catch (error) {
    next(error);
  }
};
