
let gapiInited = false;
let gisInited = false;
let tokenClient;


function initGoogleAPI() {
    if (!validateConfig()) {
        showError('구글 시트 API 설정이 필요합니다. GOOGLE_SHEETS_SETUP.md 파일을 참고하세요.');
        return;
    }

    gapi.load('client', initializeGapiClient);
    gisInited = true;
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: '', 
    });
}


async function initializeGapiClient() {
    try {
        await gapi.client.init({
            discoveryDocs: CONFIG.DISCOVERY_DOCS,
        });
        gapiInited = true;
        maybeEnableButtons();
    } catch (error) {
        console.error('GAPI 초기화 실패:', error);
        showError('Google API 초기화에 실패했습니다.');
    }
}


function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize-btn').style.display = 'block';
        document.getElementById('signout-btn').style.display = 'none';
    }
}


function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout-btn').style.display = 'block';
        document.getElementById('authorize-btn').style.display = 'none';
        await loadDataFromSheets();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}


function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('authorize-btn').style.display = 'block';
        document.getElementById('signout-btn').style.display = 'none';
    }
}


async function loadDataFromSheets() {
    try {
        showLoading('데이터 로딩 중...');
        
        
        const savingsData = await readSheet(CONFIG.SHEETS.SAVINGS);
        if (savingsData && savingsData.length > 1) {
            APP_DATA.savings = parseSavingsData(savingsData);
            console.log('✅ 저축 데이터 로드:', APP_DATA.savings.length, '개');
        } else {
            console.log('⚠️ 저축 데이터가 비어있습니다.');
            APP_DATA.savings = [];
        }
        
        
        const transactionsData = await readSheet(CONFIG.SHEETS.TRANSACTIONS);
        if (transactionsData && transactionsData.length > 1) {
            parseTransactionsData(transactionsData);
            console.log('✅ 거래 데이터 로드 완료');
        } else {
            console.log('⚠️ 거래 데이터가 비어있습니다.');
        }
        
        
        loadDashboard();
        loadIncomeTable();
        loadExpenseTable();
        loadSavingsTable();
        
        hideLoading();
        showSuccess('데이터를 성공적으로 불러왔습니다!');
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        hideLoading();
        showError('데이터 로드에 실패했습니다: ' + error.message);
    }
}


async function readSheet(sheetName) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${sheetName}!A:Z`,
        });
        return response.result.values;
    } catch (error) {
        console.error(`시트 읽기 실패 (${sheetName}):`, error);
        return null;
    }
}


async function writeSheet(sheetName, data) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: data
            }
        });
        return response.result;
    } catch (error) {
        console.error(`시트 쓰기 실패 (${sheetName}):`, error);
        throw error;
    }
}


function parseSavingsData(data) {
    if (!data || data.length < 2) return [];
    
    const headers = data[0];
    const savings = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue; 
        
        savings.push({
            name: row[0] || '',
            holder: row[1] || '',
            principal: parseFloat(row[2]?.replace(/,/g, '')) || 0,
            monthlyPayment: parseFloat(row[6]?.replace(/,/g, '')) || 0,
            interestRate: parseFloat(row[8]?.replace(/%/g, '')) || 0,
            startDate: row[3] || '',
            maturityDate: row[4] || '',
            notes: row[7] || ''
        });
    }
    
    return savings;
}


function parseTransactionsData(data) {
    if (!data || data.length < 2) return;
    
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        
        const date = row[0]; 
        const type = row[1]; 
        const category = row[2]; 
        const amount = parseFloat(row[3]?.replace(/,/g, '')) || 0;
        
        const month = date.substring(0, 7); 
        
        
        if (!APP_DATA.income[month]) {
            APP_DATA.income[month] = {};
            APP_DATA.incomeCategories.forEach(cat => {
                APP_DATA.income[month][cat] = 0;
            });
        }
        if (!APP_DATA.expenses[month]) {
            APP_DATA.expenses[month] = {};
            APP_DATA.expenseCategories.forEach(cat => {
                APP_DATA.expenses[month][cat] = 0;
            });
        }
        
        
        if (type === '수입' && APP_DATA.incomeCategories.includes(category)) {
            APP_DATA.income[month][category] += amount;
        } else if (type === '지출' && APP_DATA.expenseCategories.includes(category)) {
            APP_DATA.expenses[month][category] += amount;
        }
    }
}


async function saveSavingsToSheet() {
    try {
        showLoading('저장 중...');
        
        const headers = ['예금명', '예금주', '잔액', '신규일', '만기일', '자동이체일', '월납액', '비고', '이율'];
        const rows = [headers];
        
        APP_DATA.savings.forEach(s => {
            rows.push([
                s.name,
                s.holder,
                s.principal,
                s.startDate,
                s.maturityDate,
                '',
                s.monthlyPayment,
                s.notes,
                s.interestRate + '%'
            ]);
        });
        
        await writeSheet(CONFIG.SHEETS.SAVINGS, rows);
        hideLoading();
        showSuccess('저장되었습니다!');
    } catch (error) {
        hideLoading();
        showError('저장 실패: ' + error.message);
    }
}


async function saveTransactionsToSheet() {
    try {
        showLoading('저장 중...');
        
        const headers = ['날짜', '유형', '카테고리', '금액', '메모', '반복', '주기'];
        const rows = [headers];
        
        
        Object.keys(APP_DATA.income).forEach(month => {
            const income = APP_DATA.income[month];
            Object.keys(income).forEach(category => {
                const amount = income[category];
                if (amount > 0) {
                    rows.push([
                        `${month}-01`,
                        '수입',
                        category,
                        amount,
                        '',
                        'False',
                        ''
                    ]);
                }
            });
        });
        
        
        Object.keys(APP_DATA.expenses).forEach(month => {
            const expenses = APP_DATA.expenses[month];
            Object.keys(expenses).forEach(category => {
                const amount = expenses[category];
                if (amount > 0) {
                    rows.push([
                        `${month}-01`,
                        '지출',
                        category,
                        amount,
                        '',
                        'False',
                        ''
                    ]);
                }
            });
        });
        
        await writeSheet(CONFIG.SHEETS.TRANSACTIONS, rows);
        hideLoading();
        showSuccess('저장되었습니다!');
    } catch (error) {
        hideLoading();
        showError('저장 실패: ' + error.message);
    }
}


function showLoading(message) {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        loader.textContent = message;
        loader.style.display = 'block';
    }
}

function hideLoading() {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        loader.style.display = 'none';
    }
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}


window.addEventListener('load', initGoogleAPI);
