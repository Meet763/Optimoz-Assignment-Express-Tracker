const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.createExpense = async (req, res) => {
  try {
    const { date, category, amount, description } = req.body;
    const newExpense = new Expense({
      date,
      category,
      amount,
      description
    });

    const savedExpense = await newExpense.save();

    // Check budget for this expense
    const expenseDate = new Date(date);
    const budget = await Budget.findOne({
      year: expenseDate.getFullYear(),
      month: expenseDate.getMonth() + 1
    });

    if (budget) {
      // Check total and category budget
      const monthExpenses = await Expense.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1),
              $lt: new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: '$amount' },
            categoryExpenses: {
              $push: {
                category: '$category',
                amount: '$amount'
              }
            }
          }
        }
      ]);

      const totalExpenses = monthExpenses[0]?.totalExpenses || 0;
      const categoryExpenses = monthExpenses[0]?.categoryExpenses || [];

      // Validate total budget
      if (totalExpenses > budget.totalBudget) {
        return res.status(400).json({ 
          message: 'Monthly budget exceeded', 
          totalBudget: budget.totalBudget, 
          totalExpenses 
        });
      }

      // Validate category budget
      const categoryBudgetCheck = budget.categoryBudgets.some(catBudget => {
        const categoryTotal = categoryExpenses
          .filter(exp => exp.category === catBudget.category)
          .reduce((sum, exp) => sum + exp.amount, 0);
        
        return categoryTotal + amount > catBudget.budget;
      });

      if (categoryBudgetCheck) {
        return res.status(400).json({ 
          message: 'Category budget exceeded', 
          budgets: budget.categoryBudgets 
        });
      }
    }

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyExpenses = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthlyExpenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const totalExpenses = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);

    res.status(200).json({
      expenses: monthlyExpenses,
      total: totalExpenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /expenses/:id - Delete an expense by ID
exports.deleteExpence = async (req, res) => {
  try {
      const expenseId = req.params.id;
      const result = await Expense.findByIdAndDelete(expenseId);

      if (!result) {
          return res.status(404).json({ message: 'Expense not found' });
      }

      res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ message: 'Failed to delete expense' });
  }
};
