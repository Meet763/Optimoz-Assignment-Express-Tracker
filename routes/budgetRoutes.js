const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

router.post('/', budgetController.createOrUpdateBudget);
router.get('/status/:year/:month', budgetController.getBudgetStatus);

module.exports = router;