const Expense = require('../models/Expense');
const Group = require('../models/Group');
const jsPDF = require('jspdf');
const autoTable = require('jspdf-autotable');
const Papa = require('papaparse');

// @desc    Export expenses as PDF
// @route   GET /api/export/pdf/:groupId
exports.exportPDF = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name')
      .populate('splits.user', 'name')
      .sort({ date: -1 });
    
    const group = await Group.findById(req.params.groupId);
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Expense Report: ${group.name}`, 14, 22);
    
    const tableData = expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.description,
      e.category,
      `Rs.${e.amount.toFixed(2)}`,
      e.paidBy.name,
      e.splitMethod
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Split']],
      body: tableData,
      startY: 30,
    });
    
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${group.name}-expenses.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

// @desc    Export expenses as CSV
// @route   GET /api/export/csv/:groupId
exports.exportCSV = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name')
      .populate('splits.user', 'name')
      .lean();
    
    const flatData = expenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Description: e.description,
      Category: e.category,
      Amount: e.amount,
      PaidBy: e.paidBy.name,
      SplitMethod: e.splitMethod,
      Members: e.splits.map(s => `${s.user.name}: Rs.${s.owedAmount}`).join('; ')
    }));
    
    const csv = Papa.unparse(flatData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expenses.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};