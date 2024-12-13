const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { year, month, totalBudget, categoryBudgets } = req.body;

    // Find existing budget or create new
    let budget = await Budget.findOneAndUpdate(
      { year, month },
      { 
        totalBudget, 
        categoryBudgets 
      },
      { upsert: true, new: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBudgetStatus = async (req, res) => {
  try {
    const { year, month } = req.params;

    // Find budget
    const budget = await Budget.findOne({ year, month });

    if (!budget) {
      return res.status(404).json({ message: 'No budget found for this period' });
    }

    // Get expenses for this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: '$category',
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate budget status
    const budgetStatus = {
      totalBudget: budget.totalBudget,
      totalExpenses: monthExpenses.reduce((sum, exp) => sum + exp.totalExpenses, 0),
      categoryBudgets: budget.categoryBudgets.map(catBudget => {
        const categoryExpenses = monthExpenses.find(exp => exp._id === catBudget.category);
        return {
          category: catBudget.category,
          budgetedAmount: catBudget.budget,
          actualExpenses: categoryExpenses ? categoryExpenses.totalExpenses : 0
        };
      })
    };

    res.status(200).json(budgetStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};