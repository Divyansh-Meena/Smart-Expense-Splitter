const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addExpense, getGroupExpenses, deleteExpense, getBalances } = require('../controllers/expenseController');

router.post('/', auth, addExpense);
router.get('/group/:groupId', auth, getGroupExpenses);
router.get('/balances/:groupId', auth, getBalances);
router.delete('/:id', auth, deleteExpense);

module.exports = router;