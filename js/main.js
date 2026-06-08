// js/main.js

// ==========================================
// 核心儲存庫設定
// ==========================================
const REPO_OWNER = 'potatosserver';
const REPO_NAME = 'my-portfolio'; // 您的專案倉庫名稱
const DATABASE_PATH = 'data/projects_articles.json';

// 輔助函式：支援 UTF-8 中文的 Base64 編解碼 (防亂碼)
function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

// 1. 載入共用導覽列
async function loadNavbar() {
    try {
        const response = await fetch('components/navbar.html');
        if (response.ok) {
            const html = await response.text();
            document.getElementById('navbar-container').innerHTML = html;
            highlightCurrentPage();
        }
    } catch (error) {
        console.error('導覽列載入失敗:', error);
    }
}

function highlightCurrentPage() {
    const path = window.location.pathname;
    let page = path.split("/").pop();
    if (page === "" || page === undefined) {
        page = "index.html";
    }
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 2. [讀取] 獲取 GitHub 最新資料庫內容與 SHA 值
async function fetchDatabase() {
    const token = localStorage.getItem('gh_token');
    // 加入時間戳參數防瀏覽器快取
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATABASE_PATH}?nocache=${new Date().getTime()}`;
    
    const headers = { "Accept": "application/vnd.github.v3+json" };
    if (token) {
        headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`讀取 GitHub 資料庫失敗 (狀態碼: ${response.status})`);
    }

    const fileInfo = await response.json();
    const decodedContent = b64_to_utf8(fileInfo.content);
    
    return {
        sha: fileInfo.sha,
        data: JSON.parse(decodedContent)
    };
}

// 3. [寫入] 將資料更新並 Commit 回 GitHub
async function saveDatabase(jsonData, sha) {
    const token = localStorage.getItem('gh_token');
    if (!token) {
        throw new Error('未偵測到管理員驗證權杖，請重新登入。');
    }

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATABASE_PATH}`;
    const contentStr = JSON.stringify(jsonData, null, 2);
    const base64Content = utf8_to_b64(contentStr);

    const body = {
        message: `Admin Panel Updated: ${new Date().toISOString()}`,
        content: base64Content,
        sha: sha
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || '雲端儲存失敗');
    }

    return await response.json();
}