// js/main.js

const REPO_OWNER = 'potatosserver';
const REPO_NAME = 'potatosserver.github.io'; 
const DATABASE_PATH = 'data/projects_articles.json';

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

// 動態修改 CSS 主題變數，實現一鍵變色
function applyDynamicTheme(color) {
    if (color) {
        document.documentElement.style.setProperty('--md-sys-color-primary', color);
    }
}

// 將 {h} 轉為 <span class="highlight">
function parseHighlights(text) {
    if (!text) return "";
    return text.replace(/{h}/g, '<span class="highlight">').replace(/{\/h}/g, '</span>');
}

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

// 獲取最新資料庫 (獲取後會自動執行一次配色檢查)
async function fetchDatabase() {
    const token = localStorage.getItem('gh_token');
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
    const database = JSON.parse(decodedContent);

    // 【自動套用變色】只要頁面載入資料庫，就會自動讀取配置更新主題色
    if (database.profile && database.profile.theme && database.profile.theme.highlight_color) {
        applyDynamicTheme(database.profile.theme.highlight_color);
    }
    
    return {
        sha: fileInfo.sha,
        data: database
    };
}

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