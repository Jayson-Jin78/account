// ?€?œë³´??ë¡œë“œ
function loadDashboard() {
    updateSummary();
    createSavingsChart();
    createExpenseChart();
}

// ?”ì•½ ?•ë³´ ?…ë°?´íŠ¸
function updateSummary() {
    const savings = APP_DATA.savings;
    
    // ì´??ì‚° ê³„ì‚°
    let totalAssets = 0;
    let jinaAssets = 0;
    let yonggeunAssets = 0;

    savings.forEach(s => {
        const value = getCurrentValue(s);
        totalAssets += value;
        if (s.holder === '?©ê·¼') {
            yonggeunAssets += value;
        } else {
            jinaAssets += value;
        }
    });

    // ?´ë²ˆ ???˜ì…/ì§€ì¶?ê³„ì‚°
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyIncome = calculateMonthlyIncome(currentMonth);
    const monthlyExpense = calculateMonthlyExpense(currentMonth);
    const monthlyBalance = monthlyIncome - monthlyExpense;

    document.getElementById('total-assets').textContent = 
        `${formatNumber(Math.round(totalAssets))} (ì§„ì•„: ${formatNumber(Math.round(jinaAssets))} / ?©ê·¼: ${formatNumber(Math.round(yonggeunAssets))})`;
    document.getElementById('monthly-income').textContent = formatNumber(Math.round(monthlyIncome));
    document.getElementById('monthly-expense').textContent = formatNumber(Math.round(monthlyExpense));
    document.getElementById('monthly-balance').textContent = formatNumber(Math.round(monthlyBalance));
}

// ?”ë³„ ?˜ì… ê³„ì‚°
function calculateMonthlyIncome(month) {
    const income = APP_DATA.income[month];
    if (!income) return 0;
    
    return Object.values(income).reduce((sum, val) => sum + val, 0);
}

// ?”ë³„ ì§€ì¶?ê³„ì‚°
function calculateMonthlyExpense(month) {
    const expenses = APP_DATA.expenses[month];
    if (!expenses) return 0;
    
    return Object.values(expenses).reduce((sum, val) => sum + val, 0);
}

// ?€ì¶??ì‚° êµ¬ì„± ì°¨íŠ¸
let savingsChart = null;
function createSavingsChart() {
    const ctx = document.getElementById('savings-chart');
    if (!ctx) return;

    // ?ˆê¸ˆì£¼ë³„ë¡?ë¶„ë¥˜
    const jinaSavings = [];
    const yonggeunSavings = [];

    APP_DATA.savings.forEach(s => {
        const value = getCurrentValue(s);
        const data = { name: s.name, value: value };
        
        if (s.holder === '?©ê·¼') {
            yonggeunSavings.push(data);
        } else {
            jinaSavings.push(data);
        }
    });

    // ê¸ˆì•¡ ê¸°ì? ?´ë¦¼ì°¨ìˆœ ?•ë ¬
    jinaSavings.sort((a, b) => b.value - a.value);
    yonggeunSavings.sort((a, b) => b.value - a.value);

    // ì°¨íŠ¸ ?°ì´??ì¤€ë¹?
    const labels = ['ì§„ì•„', '?©ê·¼'];
    const datasets = [];

    // ?‰ìƒ ?ì„±
    const maxItems = Math.max(jinaSavings.length, yonggeunSavings.length);
    const colors = generateColors(maxItems);

    // ê°??€ì¶??í’ˆë³??°ì´?°ì…‹ ?ì„±
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
                            return context.dataset.label + ': ' + formatNumber(Math.round(value)) + '??;
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
                            return (value / 10000).toFixed(0) + 'ë§?;
                        }
                    }
                }
            }
        }
    });
}

// ì§€ì¶?ì°¨íŠ¸
let expenseChart = null;
function createExpenseChart() {
    const ctx = document.getElementById('expense-chart');
    if (!ctx) return;

    // ìµœê·¼ 6ê°œì›” ?°ì´??
    const months = Object.keys(APP_DATA.expenses).sort().slice(-6);
    const categories = APP_DATA.expenseCategories;

    // ì¹´í…Œê³ ë¦¬ë³?ì´ì•¡ ê³„ì‚° ë°??•ë ¬
    const categoryTotals = {};
    categories.forEach(cat => {
        categoryTotals[cat] = months.reduce((sum, month) => {
            return sum + (APP_DATA.expenses[month][cat] || 0);
        }, 0);
    });

    const sortedCategories = categories
        .filter(cat => categoryTotals[cat] > 0)
        .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

    // ?°ì´?°ì…‹ ?ì„±
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
                            return context.dataset.label + ': ' + formatNumber(context.parsed.y) + '??;
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
                            return (value / 10000).toFixed(0) + 'ë§?;
                        }
                    }
                }
            }
        }
    });
}

// ?‰ìƒ ?ì„± (?©ê¸ˆë¹??¬ìš©)
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
