const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getAllExpenses);
router.get('/monthly/:year/:month', expenseController.getMonthlyExpenses);
router.delete('/delete/:id', expenseController.deleteExpence);


module.exports = router;