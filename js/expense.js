
function loadExpenseTable() {
    const table = document.getElementById('expense-table');
    const header = document.getElementById('expense-header');
    const body = document.getElementById('expense-body');

    
    const months = Object.keys(APP_DATA.expenses).sort().slice(-6);
    const categories = APP_DATA.expenseCategories;

    header.innerHTML = '<th>??/th>' + 
        categories.map(cat => `<th>${cat}</th>`).join('') + 
        '<th>총액</th>';

    
    body.innerHTML = '';
    months.forEach(month => {
        const row = document.createElement('tr');
        const monthData = APP_DATA.expenses[month];
        
        
        const monthCell = document.createElement('td');
        monthCell.textContent = month;
        monthCell.classList.add('total-col');
        row.appendChild(monthCell);

        
        let rowTotal = 0;
        categories.forEach(cat => {
            const cell = document.createElement('td');
            const value = monthData[cat] || 0;
            cell.textContent = value > 0 ? formatNumber(value) : '-';
            cell.contentEditable = true;
            cell.dataset.month = month;
            cell.dataset.category = cat;
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
    totalRow.innerHTML = '<td>총액</td>';

    let grandTotal = 0;
    categories.forEach(cat => {
        const catTotal = months.reduce((sum, month) => {
            return sum + (APP_DATA.expenses[month][cat] || 0);
        }, 0);
        totalRow.innerHTML += `<td>${formatNumber(catTotal)}</td>`;
        grandTotal += catTotal;
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


// 지출 행 추가
function addExpenseRow() {
    alert('지출 데이터는 월별로 자동 생성됩니다.\n셀을 직접 편집하여 금액을 입력하세요.');
}

// 지출 행 삭제
function deleteExpenseRow() {
    alert('지출 데이터를 삭제하려면 해당 셀의 금액을 0으로 설정하세요.');
}