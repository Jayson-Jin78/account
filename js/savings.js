// ?ÄÏ∂??åÏù¥Î∏?Î°úÎìú
function loadSavingsTable() {
    const body = document.getElementById('savings-body');
    const summary = document.getElementById('savings-summary');

    body.innerHTML = '';
    
    let totalCurrentValue = 0;
    let totalInterest = 0;
    let totalTax = 0;
    let totalMaturity = 0;

    APP_DATA.savings.forEach((s, index) => {
        const row = document.createElement('tr');
        
        // ?ÑÏû¨ ?âÍ???
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

    // ?îÏïΩ ?ïÎ≥¥ ?ÖÎç∞?¥Ìä∏
    summary.textContent = `Ï¥??ÄÏ∂? ${APP_DATA.savings.length}Í∞?| ` +
        `?ÑÏû¨ ?âÍ??? ${formatNumber(Math.round(totalCurrentValue))} | ` +
        `ÎßåÍ∏∞ ?àÏÉÅ ?¥Ïûê: ${formatNumber(Math.round(totalInterest))} | ` +
        `?¥Ïûê?åÎìù?? ${formatNumber(Math.round(totalTax))} | ` +
        `ÎßåÍ∏∞ ?òÎ†π???∏ÌõÑ): ${formatNumber(Math.round(totalMaturity))}`;
}

// ?ÄÏ∂???Ï∂îÍ?
function addSavingsRow() {
    const newSavings = {
        name: "???ÄÏ∂??ÅÌíà",
        holder: "",
        principal: 0,
        monthlyPayment: 0,
        interestRate: 0,
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: new Date().toISOString().split('T')[0],
        notes: ""
    };

    APP_DATA.savings.push(newSavings);
    loadSavingsTable();
    createSavingsChart();
    updateSummary();
    
    // Íµ¨Í? ?úÌä∏???Ä??(Î°úÍ∑∏?∏Îêú Í≤ΩÏö∞)
    if (typeof saveSavingsToSheet === 'function' && gapi.client.getToken()) {
        saveSavingsToSheet();
    }
}

// ?ÄÏ∂?????†ú
function deleteSavingsRow() {
    const selectedRows = document.querySelectorAll('#savings-body tr.selected');
    
    if (selectedRows.length === 0) {
        alert('??†ú????™©???†ÌÉù?òÏÑ∏??');
        return;
    }

    if (confirm('?†ÌÉù????™©????†ú?òÏãúÍ≤†Ïäµ?àÍπå?')) {
        const indices = Array.from(selectedRows).map(row => {
            return Array.from(row.parentNode.children).indexOf(row);
        });

        // ??àú?ºÎ°ú ??†ú
        indices.sort((a, b) => b - a).forEach(index => {
            APP_DATA.savings.splice(index, 1);
        });

        loadSavingsTable();
        createSavingsChart();
        updateSummary();
        
        // Íµ¨Í? ?úÌä∏???Ä??(Î°úÍ∑∏?∏Îêú Í≤ΩÏö∞)
        if (typeof saveSavingsToSheet === 'function' && gapi.client.getToken()) {
            saveSavingsToSheet();
        }
    }
}
