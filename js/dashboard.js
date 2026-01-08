
function loadDashboard() {
    updateSummary();
    createSavingsChart();
    createExpenseChart();
}


function updateSummary() {
    const savings = APP_DATA.savings;
    
    
    let totalAssets = 0;
    let jinaAssets = 0;
    let yonggeunAssets = 0;

    savings.forEach(s => {
        const value = getCurrentValue(s);
        totalAssets += value;
        if (s.holder === '용근') {
            yonggeunAssets += value;
        } else {
            jinaAssets += value;
        }
    });

    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyIncome = calculateMonthlyIncome(currentMonth);
    const monthlyExpense = calculateMonthlyExpense(currentMonth);
    const monthlyBalance = monthlyIncome - monthlyExpense;

    document.getElementById('total-assets').textContent = 
        `${formatNumber(Math.round(totalAssets))} (진아: ${formatNumber(Math.round(jinaAssets))} / 용근: ${formatNumber(Math.round(yonggeunAssets))})`;
    document.getElementById('monthly-income').textContent = formatNumber(Math.round(monthlyIncome));
    document.getElementById('monthly-expense').textContent = formatNumber(Math.round(monthlyExpense));
    document.getElementById('monthly-balance').textContent = formatNumber(Math.round(monthlyBalance));
}


function calculateMonthlyIncome(month) {
    const income = APP_DATA.income[month];
    if (!income) return 0;
    
    return Object.values(income).reduce((sum, val) => sum + val, 0);
}


function calculateMonthlyExpense(month) {
    const expenses = APP_DATA.expenses[month];
    if (!expenses) return 0;
    
    return Object.values(expenses).reduce((sum, val) => sum + val, 0);
}


let savingsChart = null;
function createSavingsChart() {
    const ctx = document.getElementById('savings-chart');
    if (!ctx) return;

    
    const jinaSavings = [];
    const yonggeunSavings = [];

    APP_DATA.savings.forEach(s => {
        const value = getCurrentValue(s);
        const data = { name: s.name, value: value };
        
        if (s.holder === '용근') {
            yonggeunSavings.push(data);
        } else {
            jinaSavings.push(data);
        }
    });

    
    jinaSavings.sort((a, b) => b.value - a.value);
    yonggeunSavings.sort((a, b) => b.value - a.value);

    
    const labels = ['진아', '용근'];
    const datasets = [];

    
    const maxItems = Math.max(jinaSavings.length, yonggeunSavings.length);
    const colors = generateColors(maxItems);

    
    for (let i = 0; i < maxItems; i++) {
        const jinaValue = i < jinaSavings.length ? jinaSavings[i].value : 0;
        const yonggeunValue = i < yonggeunSavings.length ? yonggeunSavings[i].value : 0;
        
        const label = i < jinaSavings.length ? jinaSavings[i].name : 
                     (i < yonggeunSavings.length ? yonggeunSavings[i].name : '');

        datasets.push({
            label: label,
            data: [jinaValue, yonggeunValue],
            backgroundColor: colors[i]
        });
    }

    if (savingsChart) {
        savingsChart.destroy();
    }

    savingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return context.dataset.label + ': ' + formatNumber(Math.round(value)) + '원';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 10000).toFixed(0) + '만';
                        }
                    }
                }
            }
        }
    });
}


let expenseChart = null;
function createExpenseChart() {
    const ctx = document.getElementById('expense-chart');
    if (!ctx) return;

    
    const months = Object.keys(APP_DATA.expenses).sort().slice(-6);
    const categories = APP_DATA.expenseCategories;

    
    const categoryTotals = {};
    categories.forEach(cat => {
        categoryTotals[cat] = months.reduce((sum, month) => {
            return sum + (APP_DATA.expenses[month][cat] || 0);
        }, 0);
    });

    const sortedCategories = categories
        .filter(cat => categoryTotals[cat] > 0)
        .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

    
    const datasets = sortedCategories.map((cat, idx) => {
        return {
            label: cat,
            data: months.map(month => APP_DATA.expenses[month][cat] || 0),
            backgroundColor: generateColors(sortedCategories.length)[idx]
        };
    });

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 10 },
                        boxWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatNumber(context.parsed.y) + '원';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 10000).toFixed(0) + '만';
                        }
                    }
                }
            }
        }
    });
}


function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 0.618033988749895 * 360) % 360;
        const saturation = 60 + (i % 3) * 15;
        const lightness = 50 + (i % 2) * 10;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}
