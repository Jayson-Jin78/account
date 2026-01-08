
function loadExpenseTable() {
    const table = document.getElementById('expense-table');
    const header = document.getElementById('expense-header');
    const body = document.getElementById('expense-body');

    const months = Object.keys(APP_DATA.expenses).sort().slice(-6);
    const categories = APP_DATA.expenseCategories;

    const categoryTotals = {};
    categories.forEach(cat => {
        categoryTotals[cat] = months.reduce((sum, month) => {
            return sum + (APP_DATA.expenses[month][cat] || 0);
        }, 0);
    });

    const sortedCategories = categories
        .slice()
        .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

    header.innerHTML = '<th>Category</th>' + 
        months.map(month => `<th>${month}</th>`).join('') + 
        '<th>Total</th>';

    body.innerHTML = '';
    
    sortedCategories.forEach(category => {
        const row = document.createElement('tr');
        
        const categoryCell = document.createElement('td');
        categoryCell.textContent = category;
        categoryCell.classList.add('total-col');
        row.appendChild(categoryCell);

        let rowTotal = 0;
        months.forEach(month => {
            const cell = document.createElement('td');
            const value = APP_DATA.expenses[month][category] || 0;
            cell.textContent = value > 0 ? formatNumber(value) : '-';
            cell.contentEditable = true;
            cell.dataset.month = month;
            cell.dataset.category = category;
            cell.addEventListener('blur', updateExpenseCell);
            row.appendChild(cell);
            rowTotal += value;
        });

        const totalCell = document.createElement('td');
        totalCell.textContent = formatNumber(rowTotal);
        totalCell.classList.add('total-col');
        row.appendChild(totalCell);

        body.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-row');
    totalRow.innerHTML = '<td>Total</td>';

    let grandTotal = 0;
    months.forEach(month => {
        const monthTotal = categories.reduce((sum, cat) => {
            return sum + (APP_DATA.expenses[month][cat] || 0);
        }, 0);
        totalRow.innerHTML += `<td>${formatNumber(monthTotal)}</td>`;
        grandTotal += monthTotal;
    });

    totalRow.innerHTML += `<td>${formatNumber(grandTotal)}</td>`;
    body.appendChild(totalRow);
}

function updateExpenseCell(e) {
    const cell = e.target;
    const month = cell.dataset.month;
    const category = cell.dataset.category;
    const value = parseFloat(cell.textContent.replace(/,/g, '')) || 0;

    APP_DATA.expenses[month][category] = value;
    loadExpenseTable();
    createExpenseChart();
    updateSummary();
    
    if (typeof saveTransactionsToSheet === 'function' && gapi.client.getToken()) {
        saveTransactionsToSheet();
    }
}


function addExpenseRow() {
    const newMonth = prompt('Add new month (YYYY-MM format):');
    if (!newMonth || !/^\d{4}-\d{2}$/.test(newMonth)) {
        alert('Invalid format. Please use YYYY-MM format.');
        return;
    }
    
    if (!APP_DATA.expenses[newMonth]) {
        APP_DATA.expenses[newMonth] = {};
        APP_DATA.expenseCategories.forEach(cat => {
            APP_DATA.expenses[newMonth][cat] = 0;
        });
        loadExpenseTable();
        createExpenseChart();
        updateSummary();
    } else {
        alert('This month already exists.');
    }
}

function deleteExpenseRow() {
    alert('To delete expense data, set all amounts to 0.');
}