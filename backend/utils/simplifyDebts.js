/**
 * Greedy debt simplification algorithm
 * Input: { userId: netBalance }  (positive = owed to them, negative = they owe)
 * Output: [ { from, to, amount } ]
 */
const simplifyDebts = (balances) => {
  const creditors = [];
  const debtors = [];
  
  Object.entries(balances).forEach(([userId, amount]) => {
    if (amount > 0.01) creditors.push({ userId, amount: parseFloat(amount.toFixed(2)) });
    else if (amount < -0.01) debtors.push({ userId, amount: parseFloat(Math.abs(amount).toFixed(2)) });
  });
  
  // Sort: largest first
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  const transactions = [];
  
  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const minAmount = Math.min(creditor.amount, debtor.amount);
    
    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(minAmount.toFixed(2))
    });
    
    creditor.amount -= minAmount;
    debtor.amount -= minAmount;
    
    if (creditor.amount < 0.01) creditors.shift();
    else creditors.sort((a, b) => b.amount - a.amount);
    
    if (debtor.amount < 0.01) debtors.shift();
    else debtors.sort((a, b) => b.amount - a.amount);
  }
  
  return transactions;
};

module.exports = simplifyDebts;