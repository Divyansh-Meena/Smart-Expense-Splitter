import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Users, Receipt, TrendingUp, 
  Download, FileText, CheckCircle, ArrowRightLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ balances: {}, simplified: [] });
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/expenses/balances/${id}`)
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expenseRes.data.expenses);
      setBalances(balanceRes.data);
    } catch (error) {
      console.error('Failed to fetch group data');
    }
  };

  const exportPDF = () => window.open(`http://localhost:5000/api/export/pdf/${id}`, '_blank');
  const exportCSV = () => window.open(`http://localhost:5000/api/export/csv/${id}`, '_blank');

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const categoryData = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  if (!group) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Users className="w-4 h-4" />
            {group.members.length} members • Code: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{group.inviteCode}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">Rs.{group.totalExpenses?.toFixed(2)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">Your Balance</span>
          </div>
          <p className={`text-2xl font-bold ${balances.balances[group.members.find(m => m.user._id === group.createdBy?._id)?.user?._id] > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Rs.{(balances.balances[group.members.find(m => m.user._id === group.createdBy?._id)?.user?._id] || 0).toFixed(2)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-500">Pending Settlements</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{balances.simplified.length}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {['expenses', 'balances', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Expenses</h2>
              <div className="flex gap-2">
                <button onClick={exportPDF} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                  <FileText className="w-4 h-4" /> PDF
                </button>
                <button onClick={exportCSV} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <Receipt className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{expense.description}</h3>
                      <p className="text-sm text-slate-500">Paid by {expense.paidBy.name} • {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">Rs.{expense.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 capitalize">{expense.splitMethod} split</p>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-12 text-slate-400">No expenses yet. Add your first one!</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'balances' && (
          <motion.div
            key="balances"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Simplified Debts</h3>
              {balances.simplified.length === 0 ? (
                <p className="text-slate-500 text-center py-8">All settled up! 🎉</p>
              ) : (
                <div className="space-y-3">
                  {balances.simplified.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-900">{group.members.find(m => m.user._id === tx.from)?.user?.name || 'Unknown'}</span>
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{group.members.find(m => m.user._id === tx.to)?.user?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600">Rs.{tx.amount.toFixed(2)}</span>
                        <button className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition">
                          Settle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6">Spending by Category</h3>
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rs.${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-12">Add expenses to see analytics</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
