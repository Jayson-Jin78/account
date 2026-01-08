
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadDashboard();
    loadIncomeTable();
    loadExpenseTable();
    loadSavingsTable();
});


function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}


function formatNumber(num) {
    return num.toLocaleString('ko-KR');
}


function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
}


function monthsBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}


function calculateSimpleInterest(principal, rate, startDate, maturityDate) {
    const days = daysBetween(new Date(startDate), new Date(maturityDate));
    const years = days / 365;
    return principal * (rate / 100) * years;
}


function calculateInstallmentInterest(monthlyPayment, rate, months) {
    const monthlyRate = rate / 12 / 100;
    const avgMonths = (months + 1) / 2;
    return monthlyPayment * avgMonths * monthlyRate * months;
}


function calculateInterestToDate(savings) {
    const now = new Date();
    const startDate = new Date(savings.startDate);
    const maturityDate = new Date(savings.maturityDate);

    if (now >= maturityDate) {
        return calculateMaturityInterest(savings);
    }

    if (now < startDate) {
        return 0;
    }

    if (savings.monthlyPayment > 0) {
        const monthsPaid = monthsBetween(startDate, now);
        return calculateInstallmentInterest(savings.monthlyPayment, savings.interestRate, monthsPaid);
    } else {
        return calculateSimpleInterest(savings.principal, savings.interestRate, startDate, now);
    }
}


function calculateMaturityInterest(savings) {
    if (savings.monthlyPayment > 0) {
        const months = monthsBetween(savings.startDate, savings.maturityDate);
        return calculateInstallmentInterest(savings.monthlyPayment, savings.interestRate, months);
    } else {
        return calculateSimpleInterest(savings.principal, savings.interestRate, savings.startDate, savings.maturityDate);
    }
}


function calculateTax(savings) {
    if (savings.notes.includes('일반과세')) {
        const interest = calculateMaturityInterest(savings);
        return interest * 0.154;
    }
    return 0;
}


function getCurrentValue(savings) {
    const totalPrincipal = savings.monthlyPayment > 0 
        ? savings.monthlyPayment * monthsBetween(savings.startDate, savings.maturityDate)
        : savings.principal;
    return totalPrincipal + calculateInterestToDate(savings);
}
