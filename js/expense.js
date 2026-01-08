// ì§€ì¶??Œì´ë¸?ë¡œë“œ
function loadExpenseTable() {
    const table = document.getElementById('expense-table');
    const header = document.getElementById('expense-header');
    const body = document.getElementById('expense-body');

    // ?¤ë” ?ì„±
    const months = Object.keys(APP_DATA.expenses).sort().slice(-6);
    const categories = APP_DATA.expenseCategories;

    header.innerHTML = '<th>??/th>' + 
        categories.map(cat => `<th>${cat}</th>`).join('') + 
        '<th>ì´ì•¡</th>';

    // ?°ì´?????ì„±
    body.innerHTML = '';
    months.forEach(month => {
        const row = document.createElement('tr');
        const monthData = APP_DATA.expenses[month];
        
        // ???€
        const monthCell = document.createElement('td');
        monthCell.textContent = month;
        monthCell.classList.add('total-col');
        row.appendChild(monthCell);

        // ì¹´í…Œê³ ë¦¬ë³??€
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

        // ?”ë³„ ì´ì•¡
        const totalCell = document.createElement('td');
        totalCell.textContent = formatNumber(rowTotal);
        totalCell.classList.add('total-col');
        row.appendChild(totalCell);

        body.appendChild(row);
    });

    // ì´ì•¡ ??ì¶”ê?
    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-row');
    totalRow.innerHTML = '<td>ì´ì•¡</td>';

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

// ì§€ì¶??€ ?…ë°?´íŠ¸
function updateExpenseCell(e) {
    const cell = e.target;
    const month = cell.dataset.month;
    const category = cell.dataset.category;
    const value = parseFloat(cell.textContent.replace(/,/g, '')) || 0;

    APP_DATA.expenses[month][category] = value;
    loadExpenseTable();
    createExpenseChart();
    updateSummary();
    
    // êµ¬ê? ?œíŠ¸???€??(ë¡œê·¸?¸ëœ ê²½ìš°)
    if (typeof saveTransactionsToSheet === 'function' && gapi.client.getToken()) {
        saveTransactionsToSheet();
    }
}

// ì§€ì¶???ì¶”ê?
function addExpenseRow() {
    alert('ì§€ì¶??°ì´?°ëŠ” ?”ë³„ë¡??ë™ ?ì„±?©ë‹ˆ??\n?€??ì§ì ‘ ?¸ì§‘?˜ì—¬ ê¸ˆì•¡???…ë ¥?˜ì„¸??');
}

// ì§€ì¶????? œ
function deleteExpenseRow() {
    alert('ì§€ì¶??°ì´?°ë? ?? œ?˜ë ¤ë©??´ë‹¹ ?€??ê¸ˆì•¡??0?¼ë¡œ ?¤ì •?˜ì„¸??');
}
