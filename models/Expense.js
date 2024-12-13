const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Entertainment', 'Utilities', 'Groceries', 'Transportation', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
