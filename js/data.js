
const APP_DATA = {
    savings: [],
    income: {},
    expenses: {},
    
    
    incomeCategories: [
        "급여", "상여금", "부업", "이자", "배당", "기타"
    ],
    
    expenseCategories: [
        "자동차", "카드연회비", "지방세", "관리비", "가스", "통신",
        "육아", "유류교통", "국민연금", "구독렌탈", "주식", "외식",
        "의료", "문화생활", "경조사", "의류미용", "생활용품",
        "바이올린", "건강관리", "기타"
    ]
};


function initializeMonthData(months = 6) {
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        
        if (!APP_DATA.income[monthKey]) {
            APP_DATA.income[monthKey] = {};
            APP_DATA.incomeCategories.forEach(cat => {
                APP_DATA.income[monthKey][cat] = 0;
            });
        }
        
        
        if (!APP_DATA.expenses[monthKey]) {
            APP_DATA.expenses[monthKey] = {};
            APP_DATA.expenseCategories.forEach(cat => {
                APP_DATA.expenses[monthKey][cat] = 0;
            });
        }
    }
}


initializeMonthData();
