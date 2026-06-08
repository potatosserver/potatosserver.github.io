// js/main.js

// ==========================================
// 動態儲存庫與驗證配置變數 (將從 data/config.json 自動載入)
// ==========================================
let REPO_OWNER = '';
let REPO_NAME = '';
let DATABASE_PATH = '';
let GITHUB_CLIENT_ID = '';
let CLOUDFLARE_WORKER_URL = '';

// 安全讀取本地設定檔的函式
async function loadConfig() {
    if (REPO_OWNER && REPO_NAME && GITHUB_CLIENT_ID && CLOUDFLARE_WORKER_URL) return;

    try {
        const response = await fetch('data/config.json?nocache=' + new Date().getTime());
        if (response.ok) {
            const config = await response.json();
            REPO_OWNER = config.repo_owner;
            REPO_NAME = config.repo_name;
            DATABASE_PATH = config.database_path || 'data/projects_articles.json';
            
            // 【自動註冊驗證金鑰與後端網址】
            GITHUB_CLIENT_ID = config.github_client_id;
            CLOUDFLARE_WORKER_URL = config.cloudflare_worker_url;
            
            console.log(`設定檔自動載入成功：目標為 ${REPO_OWNER}/${REPO_NAME}`);
        } else {
            throw new Error("無法讀取本地 data/config.json 設定檔。");
        }
    } catch (error) {
        console.error("載入本地設定檔失敗，請確認檔案路徑與 JSON 格式：", error);
    }
}

// 輔助函式：支援 UTF-8 中文的 Base64 編解碼 (防亂碼)
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
    await loadConfig();

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

    if (database.profile && database.profile.theme && database.profile.theme.highlight_color) {
        applyDynamicTheme(database.profile.theme.highlight_color);
    }
    
    return {
        sha: fileInfo.sha,
        data: database
    };
}

// 3. [寫入] 將資料更新並 Commit 回 GitHub
async function saveDatabase(jsonData, sha) {
    await loadConfig();

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