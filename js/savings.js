// 저축 테이블 로드
function loadSavingsTable() {
    const body = document.getElementById('savings-body');
    const summary = document.getElementById('savings-summary');

    body.innerHTML = '';
    
    let totalCurrentValue = 0;
    let totalInterest = 0;
    let totalTax = 0;
    let totalMaturity = 0;

    SAMPLE_DATA.savings.forEach((s, index) => {
        const row = document.createElement('tr');
        
        // 현재 평가액
        const currentValue = getCurrentValue(s);
        const maturityInterest = calculateMaturityInterest(s);
        const tax = calculateTax(s);
        const maturityAmount = currentValue + maturityInterest - tax;

        totalCurrentValue += currentValue;
        totalInterest += maturityInterest;
        totalTax += tax;
        totalMaturity += maturityAmount;

        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.holder || '-'}</td>
            <td>${s.principal > 0 ? formatNumber(s.principal) : '-'}</td>
            <td>${s.monthlyPayment > 0 ? formatNumber(s.monthlyPayment) : '-'}</td>
            <td>${s.interestRate > 0 ? s.interestRate.toFixed(2) + '%' : '-'}</td>
            <td>${s.startDate}</td>
            <td>${s.maturityDate}</td>
            <td>${formatNumber(Math.round(currentValue))}</td>
            <td>${formatNumber(Math.round(maturityInterest))}</td>
            <td>${tax > 0 ? formatNumber(Math.round(tax)) : '-'}</td>
            <td>${formatNumber(Math.round(maturityAmount))}</td>
            <td>${s.notes.substring(0, 20)}${s.notes.length > 20 ? '...' : ''}</td>
        `;

        row.addEventListener('click', () => {
            row.classList.toggle('selected');
        });

        body.appendChild(row);
    });

    // 요약 정보 업데이트
    summary.textContent = `총 저축: ${SAMPLE_DATA.savings.length}개 | ` +
        `현재 평가액: ${formatNumber(Math.round(totalCurrentValue))} | ` +
        `만기 예상 이자: ${formatNumber(Math.round(totalInterest))} | ` +
        `이자소득세: ${formatNumber(Math.round(totalTax))} | ` +
        `만기 수령액(세후): ${formatNumber(Math.round(totalMaturity))}`;
}

// 저축 행 추가
function addSavingsRow() {
    const newSavings = {
        name: "새 저축 상품",
        holder: "",
        principal: 0,
        monthlyPayment: 0,
        interestRate: 0,
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: new Date().toISOString().split('T')[0],
        notes: ""
    };

    SAMPLE_DATA.savings.push(newSavings);
    loadSavingsTable();
    createSavingsChart();
    updateSummary();
    
    // 구글 시트에 저장 (로그인된 경우)
    if (typeof saveSavingsToSheet === 'function' && gapi.client.getToken()) {
        saveSavingsToSheet();
    }
}

// 저축 행 삭제
function deleteSavingsRow() {
    const selectedRows = document.querySelectorAll('#savings-body tr.selected');
    
    if (selectedRows.length === 0) {
        alert('삭제할 항목을 선택하세요.');
        return;
    }

    if (confirm('선택한 항목을 삭제하시겠습니까?')) {
        const indices = Array.from(selectedRows).map(row => {
            return Array.from(row.parentNode.children).indexOf(row);
        });

        // 역순으로 삭제
        indices.sort((a, b) => b - a).forEach(index => {
            SAMPLE_DATA.savings.splice(index, 1);
        });

        loadSavingsTable();
        createSavingsChart();
        updateSummary();
        
        // 구글 시트에 저장 (로그인된 경우)
        if (typeof saveSavingsToSheet === 'function' && gapi.client.getToken()) {
            saveSavingsToSheet();
        }
    }
}
