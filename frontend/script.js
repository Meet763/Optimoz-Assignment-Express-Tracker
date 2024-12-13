 // Global Variables
// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global Variables
let expenses = [];
let monthlyBudget = 0;

// Expense Addition Function
async function addExpense(event) {
    event.preventDefault();

   const date = document.getElementById('expenseDate').value;
   const category = document.getElementById('expenseCategory').value;
   const amount = parseFloat(document.getElementById('expenseAmount').value);
   const description = document.getElementById('expenseDescription').value;

   try {
       const response = await fetch(`${API_BASE_URL}/expenses`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({ date, category, amount, description })
           });

        const result = await response.json();

       if (response.ok) {
           expenses.push(result);
           event.target.reset();
           await updateBudgetStatus();
           alert('Expense added successfully!');
           returnToMainMenu();
       } else {
           alert(result.message || 'Failed to add expense');
       }
   } catch (error) {
           console.error('Error:', error);
           alert('Failed to add expense');
   }
}

// View Expenses Function
async function viewExpenses() {
    try {
       const response = await fetch(`${API_BASE_URL}/expenses`);
       expenses = await response.json();
               
       const expenseList = document.getElementById('expenseList');
       expenseList.innerHTML = '<h2>Expense List</h2>';

       if (expenses.length === 0) {
           expenseList.innerHTML += '<p>No expenses recorded.</p>';
       } else {
           expenses.forEach((expense) => {
               const expenseItem = document.createElement('div');
                expenseItem.classList.add('expense-item');
                expenseItem.innerHTML = `
                   <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
                   <p class="category"><strong>Category:</strong> ${expense.category}</p>
                   <p><strong>Amount:</strong> Rs.${expense.amount.toFixed(2)}</p>
                   <p><strong>Description:</strong> ${expense.description}</p>
                   <button class="btn btn-secondary" onclick="deleteExpense('${expense._id}')">Delete</button>
               `;
               expenseList.appendChild(expenseItem);
           });
       }

       expenseList.innerHTML += `
              <button class="btn btn-secondary" onclick="returnToMainMenu()">Back to Menu</button>
       `;
   } catch (error) {
       console.error('Error fetching expenses:', error);
       alert('Failed to fetch expenses');
   }
}


// Delete Expense Function
async function deleteExpense(expenseId) {
       if (confirm('Are you sure you want to delete this expense?')) {
           try {
               const response = await fetch(`${API_BASE_URL}/expenses/delete/${expenseId}`, {
                   method: 'DELETE',
               });
               if (response.ok) {
                   // Remove the deleted expense from the `expenses` array
                   expenses = expenses.filter(expense => expense._id !== expenseId);
                       // Update the expense list
                   viewExpenses();
                       alert('Expense deleted successfully!');
               } else {
                   const errorData = await response.json();
                   }
           } catch (error) {
               console.error('Error deleting expense:', error);
               alert('Failed to delete expense');
           }
       }
   }


       // Budget Management Functions
       async function setBudget() {
           const budgetInput = document.getElementById('monthlyBudget');
           const budget = parseFloat(budgetInput.value);

           if (budget > 0) {
               try {
                   const currentDate = new Date();
                   const response = await fetch(`${API_BASE_URL}/budget`, {
                       method: 'POST',
                       headers: {
                           'Content-Type': 'application/json',
                       },
                       body: JSON.stringify({
                           year: currentDate.getFullYear(),
                           month: currentDate.getMonth() + 1,
                           totalBudget: budget,
                           categoryBudgets: [
                               { category: 'Food', budget: budget },
                               { category: 'Travel', budget: budget },
                               { category: 'Entertainment', budget: budget },
                               { category: 'Utilities', budget: budget },
                               { category: 'Groceries', budget: budget },
                               { category: 'Transportation', budget: budget },
                               { category: 'Other', budget: budget }
                           ]
                       })
                   });

                   if (response.ok) {
                       monthlyBudget = budget;
                       await updateBudgetStatus();
                       alert('Monthly budget set successfully!');
                       returnToMainMenu();
                   } else {
                       const errorData = await response.json();
                       alert(errorData.message || 'Failed to set budget');
                   }
               } catch (error) {
                   console.error('Error setting budget:', error);
                   alert('Failed to set budget');
               }
           } else {
               alert('Please enter a valid budget amount.');
           }
       }

       async function updateBudgetStatus() {
           const budgetStatus = document.getElementById('budgetStatus');
           
           try {
               const currentDate = new Date();
               const response = await fetch(`${API_BASE_URL}/budget/status/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`);
               
               if (response.ok) {
                   const budgetData = await response.json();
                   
                   monthlyBudget = budgetData.totalBudget;

                   if (monthlyBudget > 0) {
                       const remainingBalance = monthlyBudget - budgetData.totalExpenses;

                       if (budgetData.totalExpenses > monthlyBudget) {
                           budgetStatus.innerHTML = `
                               <p class="warning">🚨 Budget Exceeded!</p>
                               <p class="warning">Total Expenses: Rs.${budgetData.totalExpenses.toFixed(2)}</p>
                               <p class="warning">Overspent by: Rs.${Math.abs(remainingBalance).toFixed(2)}</p>
                               <h3>Category Budgets:</h3>
                               ${budgetData.categoryBudgets.map(cat => `
                                   <p class="warning">${cat.category}: 
                                       Rs.${cat.actualExpenses.toFixed(2)} / Rs.${cat.budgetedAmount.toFixed(2)}
                                       ${cat.actualExpenses > cat.budgetedAmount ? '⚠️ Exceeded' : ''}
                                   </p>
                               `).join('')}
                           `;
                       } else {
                           budgetStatus.innerHTML = `
                               <p class="success">✅ Budget Status</p>
                               <p class="success">Total Expenses: Rs.${budgetData.totalExpenses.toFixed(2)}</p>
                               <p class="success">Remaining Balance: Rs.${remainingBalance.toFixed(2)}</p>
                               <h3>Category Budgets:</h3>
                               ${budgetData.categoryBudgets.map(cat => `
                                   <p class="success">${cat.category}: 
                                       Rs.${cat.actualExpenses.toFixed(2)} / Rs.${cat.budgetedAmount.toFixed(2)}
                                   </p>
                               `).join('')}
                           `;
                       }
                   }
               } else {
                   const errorData = await response.json();
                   budgetStatus.innerHTML = `<p class="warning">${errorData.message}</p>`;
               }
           } catch (error) {
               console.error('Error fetching budget status:', error);
               budgetStatus.innerHTML = '<p class="warning">Failed to retrieve budget status</p>';
           }
       }

       function exportToCSV() {
           if (expenses.length === 0) {
               alert('No expenses to export.');
               return;
           }

           const csvContent = [
               ['Date', 'Category', 'Amount', 'Description'].join(','),
               ...expenses.map(expense => [
                   new Date(expense.date).toLocaleDateString(),
                   expense.category,
                   expense.amount.toFixed(2),
                   expense.description
               ].join(','))
           ].join('\n');

           const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
           const link = document.createElement('a');
           link.href = URL.createObjectURL(blob);
           link.download = 'expenses.csv';
           link.click();
       } 


       // CSV Import Function
       function importCSV() {
           const input = document.createElement('input');
           input.type = 'file';
           input.accept = '.csv';
           input.onchange = handleFileImport;
           input.click();
       }

       async function handleFileImport(event) {
           const file = event.target.files[0];
           if (!file) return;

           const reader = new FileReader();
           reader.onload = async function(e) {
               const content = e.target.result;
               const rows = content.split('\n');
               
               expenses = [];

               for (let i = 1; i < rows.length; i++) {
                   const columns = rows[i].split(',');
                   
                   if (columns.length === 4) {
                       const expense = {
                           date: columns[0].replace(/"/g, ''),
                           category: columns[1].replace(/"/g, ''),
                           amount: parseFloat(columns[2].replace(/"/g, '')),
                           description: columns[3].replace(/"/g, '')
                       };

                       if (!isNaN(expense.amount)) {
                           try {
                               const response = await fetch(`${API_BASE_URL}/expenses`, {
                                   method: 'POST',
                                   headers: {
                                       'Content-Type': 'application/json',
                                   },
                                   body: JSON.stringify(expense)
                               });

                               if (response.ok) {
                                   const savedExpense = await response.json();
                                   expenses.push(savedExpense);
                               }
                           } catch (error) {
                               console.error('Error importing expense:', error);
                           }
                       }
                   }
               }

               await viewExpenses();
               await updateBudgetStatus();
               alert(`Imported ${expenses.length} expenses`);
           };
           reader.readAsText(file);
       }

       // Navigation and UI Management Functions
       function showAddExpenseForm() {
           document.getElementById('mainMenu').style.display = 'none';
           document.getElementById('expenseForm').style.display = 'block';
           document.getElementById('budgetSection').style.display = 'none';
           document.getElementById('expenseList').innerHTML = '';
       }

       function showBudgetSection() {
           document.getElementById('mainMenu').style.display = 'none';
           document.getElementById('expenseForm').style.display = 'none';
           document.getElementById('budgetSection').style.display = 'block';
           document.getElementById('expenseList').innerHTML = '';
           updateBudgetStatus();
       }

       function returnToMainMenu() {
           document.getElementById('mainMenu').style.display = 'block';
           document.getElementById('expenseForm').style.display = 'none';
           document.getElementById('budgetSection').style.display = 'none';
           document.getElementById('expenseList').innerHTML = '';
       }

       function exitApplication() {
           if (confirm('Are you sure you want to exit?')) {
               alert('Thank you for using the Expense Tracker!');
               window.close(); // This might not work in all browsers
           }
       }

       // Event Listeners and Initialization
       document.getElementById('addExpenseForm').addEventListener('submit', addExpense);

       // Load budget status on page load
       window.onload = async function() {
           try {
               await updateBudgetStatus();
           } catch (error) {
               console.error('Error loading initial budget status:', error);
           }
       };