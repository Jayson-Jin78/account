// Google Sheets API 통합
let gapiInited = false;
let gisInited = false;
let tokenClient;

// API 초기화
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
        callback: '', // 나중에 설정
    });
}

// GAPI 클라이언트 초기화
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

// 버튼 활성화
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize-btn').style.display = 'block';
        document.getElementById('signout-btn').style.display = 'none';
    }
}

// 로그인
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

// 로그아웃
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('authorize-btn').style.display = 'block';
        document.getElementById('signout-btn').style.display = 'none';
    }
}

// 구글 시트에서 데이터 로드
async function loadDataFromSheets() {
    try {
        showLoading('데이터 로딩 중...');
        
        // 저축 데이터 로드
        const savingsData = await readSheet(CONFIG.SHEETS.SAVINGS);
        if (savingsData) {
            SAMPLE_DATA.savings = parseSavingsData(savingsData);
            console.log('✅ 저축 데이터 로드:', SAMPLE_DATA.savings.length, '개');
        }
        
        // 지출 데이터 로드
        const transactionsData = await readSheet(CONFIG.SHEETS.TRANSACTIONS);
        if (transactionsData) {
            parseTransactionsData(transactionsData);
            console.log('✅ 지출 데이터 로드 완료');
        }
        
        // UI 업데이트
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

// 시트 읽기
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

// 시트 쓰기
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

// 저축 데이터 파싱
function parseSavingsData(data) {
    if (!data || data.length < 2) return [];
    
    const headers = data[0];
    const savings = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue; // 빈 행 건너뛰기
        
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

// 지출 데이터 파싱
function parseTransactionsData(data) {
    if (!data || data.length < 2) return;
    
    // 지출 데이터를 SAMPLE_DATA.expenses 형식으로 변환
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        
        const date = row[0]; // 날짜
        const type = row[1]; // 유형
        const category = row[2]; // 카테고리
        const amount = parseFloat(row[3]) || 0;
        
        if (type === '고정지출') {
            const month = date.substring(0, 7); // YYYY-MM
            if (!SAMPLE_DATA.expenses[month]) {
                SAMPLE_DATA.expenses[month] = {};
                SAMPLE_DATA.expenseCategories.forEach(cat => {
                    SAMPLE_DATA.expenses[month][cat] = 0;
                });
            }
            if (SAMPLE_DATA.expenseCategories.includes(category)) {
                SAMPLE_DATA.expenses[month][category] = amount;
            }
        }
    }
}

// 저축 데이터 저장
async function saveSavingsToSheet() {
    try {
        showLoading('저장 중...');
        
        const headers = ['예금명', '예금주', '잔액', '신규일', '만기일', '자동이체일', '월납액', '비고', '이율'];
        const rows = [headers];
        
        SAMPLE_DATA.savings.forEach(s => {
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

// 지출 데이터 저장
async function saveExpensesToSheet() {
    try {
        showLoading('저장 중...');
        
        const headers = ['날짜', '유형', '카테고리', '금액', '메모', '반복', '주기'];
        const rows = [headers];
        
        // SAMPLE_DATA.expenses를 transactions 형식으로 변환
        Object.keys(SAMPLE_DATA.expenses).forEach(month => {
            const expenses = SAMPLE_DATA.expenses[month];
            Object.keys(expenses).forEach(category => {
                const amount = expenses[category];
                if (amount > 0) {
                    rows.push([
                        `${month}-01`,
                        '고정지출',
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

// UI 헬퍼 함수
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

// 페이지 로드 시 초기화
window.addEventListener('load', initGoogleAPI);
