
function loadIncomeTable() {
    const table = document.getElementById('income-table');
    const header = document.getElementById('income-header');
    const body = document.getElementById('income-body');

    const months = Object.keys(APP_DATA.income).sort().slice(-6);
    const categories = APP_DATA.incomeCategories;

    header.innerHTML = '<th>Category</th>' + 
        months.map(month => `<th>${month}</th>`).join('') + 
        '<th>Total</th>';

    body.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        
        const categoryCell = document.createElement('td');
        categoryCell.textContent = category;
        categoryCell.classList.add('total-col');
        row.appendChild(categoryCell);

        let rowTotal = 0;
        months.forEach(month => {
            const cell = document.createElement('td');
            const value = APP_DATA.income[month][category] || 0;
            cell.textContent = value > 0 ? formatNumber(value) : '-';
            cell.contentEditable = true;
            cell.dataset.month = month;
            cell.dataset.category = category;
            cell.addEventListener('blur', updateIncomeCell);
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
            return sum + (APP_DATA.income[month][cat] || 0);
        }, 0);
        totalRow.innerHTML += `<td>${formatNumber(monthTotal)}</td>`;
        grandTotal += monthTotal;
    });

    totalRow.innerHTML += `<td>${formatNumber(grandTotal)}</td>`;
    body.appendChild(totalRow);
}

function updateIncomeCell(e) {
    const cell = e.target;
    const month = cell.dataset.month;
    const category = cell.dataset.category;
    const value = parseFloat(cell.textContent.replace(/,/g, '')) || 0;

    APP_DATA.income[month][category] = value;
    loadIncomeTable();
    updateSummary();
    
    if (typeof saveTransactionsToSheet === 'function' && gapi.client.getToken()) {
        saveTransactionsToSheet();
    }
}

function addIncomeRow() {
    const newMonth = prompt('Add new month (YYYY-MM format):');
    if (!newMonth || !/^\d{4}-\d{2}$/.test(newMonth)) {
        alert('Invalid format. Please use YYYY-MM format.');
        return;
    }
    
    if (!APP_DATA.income[newMonth]) {
        APP_DATA.income[newMonth] = {};
        APP_DATA.incomeCategories.forEach(cat => {
            APP_DATA.income[newMonth][cat] = 0;
        });
        loadIncomeTable();
        updateSummary();
    } else {
        alert('This month already exists.');
    }
}

function deleteIncomeRow() {
    alert('To delete income data, set all amounts to 0.');
}
