// Google Sheets API 설정 파일
// 이 파일을 수정하여 본인의 API 정보를 입력하세요

const CONFIG = {
    // Google Cloud Console에서 생성한 OAuth 클라이언트 ID
    // 예: '123456789-abcdefg.apps.googleusercontent.com'
    CLIENT_ID: '129815513434-sv56dd1h36euuall0im3vubm80gek3cv.apps.googleusercontent.com',
    
    // 구글 시트 스프레드시트 ID
    // URL에서 확인: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
    SPREADSHEET_ID: '1iXDYlifONI59mNhTvsZb2R8jr1Z5NNLlqSE9kge41UQ',
    
    // API 설정 (수정하지 마세요)
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
    
    // 시트 이름
    SHEETS: {
        SAVINGS: 'savings',
        TRANSACTIONS: 'transactions'
    }
};

// 설정 검증
function validateConfig() {
    if (CONFIG.CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
        console.error('❌ CLIENT_ID가 설정되지 않았습니다. config.js 파일을 수정하세요.');
        return false;
    }
    if (CONFIG.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
        console.error('❌ SPREADSHEET_ID가 설정되지 않았습니다. config.js 파일을 수정하세요.');
        return false;
    }
    console.log('✅ 설정이 올바르게 구성되었습니다.');
    return true;
}
