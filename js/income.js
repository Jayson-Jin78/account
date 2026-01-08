
function loadIncomeTable() {
    const table = document.getElementById('income-table');
    const header = document.getElementById('income-header');
    const body = document.getElementById('income-body');

    
    const months = Object.keys(APP_DATA.income).sort().slice(-6);
    const categories = APP_DATA.incomeCategories;

    header.innerHTML = '<th>??/th>' + 
        categories.map(cat => `<th>${cat}</th>`).join('') + 
        '<th>총액</th>';

    
    body.innerHTML = '';
    months.forEach(month => {
        const row = document.createElement('tr');
        const monthData = APP_DATA.income[month];
        
        
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
    totalRow.innerHTML = '<td>총액</td>';

    let grandTotal = 0;
    categories.forEach(cat => {
        const catTotal = months.reduce((sum, month) => {
            return sum + (APP_DATA.income[month][cat] || 0);
        }, 0);
        totalRow.innerHTML += `<td>${formatNumber(catTotal)}</td>`;
        grandTotal += catTotal;
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


// 수입 행 추가
function addIncomeRow() {
    alert('수입 데이터는 월별로 자동 생성됩니다.\\n셀을 직접 편집하여 금액을 입력하세요.');
}

// 수입 행 삭제
function deleteIncomeRow() {
    alert('수입 데이터를 삭제하려면 해당 셀의 금액을 0으로 설정하세요.');
}
