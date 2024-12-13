const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0
    },
    categoryBudgets: [{
      category: {
        type: String,
        required: true,
        enum: ['Food', 'Travel', 'Entertainment', 'Utilities', 'Groceries', 'Transportation', 'Other']
      },
      budget: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  }, { timestamps: true });
  
module.exports = mongoose.model('Budget', BudgetSchema);