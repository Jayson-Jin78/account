// 수입 테이블 로드
function loadIncomeTable() {
    const table = document.getElementById('income-table');
    const header = document.getElementById('income-header');
    const body = document.getElementById('income-body');

    // 헤더 생성
    const months = Object.keys(SAMPLE_DATA.income).sort().slice(-6);
    const categories = SAMPLE_DATA.incomeCategories;

    header.innerHTML = '<th>월</th>' + 
        categories.map(cat => `<th>${cat}</th>`).join('') + 
        '<th>총액</th>';

    // 데이터 행 생성
    body.innerHTML = '';
    months.forEach(month => {
        const row = document.createElement('tr');
        const monthData = SAMPLE_DATA.income[month];
        
        // 월 셀
        const monthCell = document.createElement('td');
        monthCell.textContent = month;
        monthCell.classList.add('total-col');
        row.appendChild(monthCell);

        // 카테고리별 셀
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

        // 월별 총액
        const totalCell = document.createElement('td');
        totalCell.textContent = formatNumber(rowTotal);
        totalCell.classList.add('total-col');
        row.appendChild(totalCell);

        body.appendChild(row);
    });

    // 총액 행 추가
    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-row');
    totalRow.innerHTML = '<td>총액</td>';

    let grandTotal = 0;
    categories.forEach(cat => {
        const catTotal = months.reduce((sum, month) => {
            return sum + (SAMPLE_DATA.income[month][cat] || 0);
        }, 0);
        totalRow.innerHTML += `<td>${formatNumber(catTotal)}</td>`;
        grandTotal += catTotal;
    });

    totalRow.innerHTML += `<td>${formatNumber(grandTotal)}</td>`;
    body.appendChild(totalRow);
}

// 수입 셀 업데이트
function updateIncomeCell(e) {
    const cell = e.target;
    const month = cell.dataset.month;
    const category = cell.dataset.category;
    const value = parseFloat(cell.textContent.replace(/,/g, '')) || 0;

    SAMPLE_DATA.income[month][category] = value;
    loadIncomeTable();
    updateSummary();
    
    // 구글 시트에 저장 (로그인된 경우)
    if (typeof saveIncomeToSheet === 'function' && gapi.client.getToken()) {
        saveIncomeToSheet();
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
