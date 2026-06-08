# 系統建置與部署教學

本文件將引導您從零開始設定 GitHub OAuth、部署 Cloudflare Workers，並將此作品集與動態內容管理系統（CMS）上線。

---

## 步驟一：複製（Fork）儲存庫
1. 登入您的 GitHub 帳號。
2. 前往本專案的 GitHub 倉庫。
3. 點擊右上角的 **Fork** 按鈕，將此儲存庫複製一份到您自己的帳號下（建議儲存庫名稱直接設定為 `[您的帳號].github.io`，這樣網址最為乾淨）。

---

## 步驟二：註冊 GitHub OAuth 應用程式
為了解決管理後台的安全登入與 API 金鑰換取，必須向 GitHub 申請一組應用程式憑證：
1. 前往 GitHub 個人設定 (Settings) -> 左側選單最下方 **Developer settings** -> **OAuth Apps**。
2. 點擊 **Register a new application**（註冊新應用程式）。
3. 填入以下設定：
   * **Application name**：自訂名稱（例如：`Portfolio Admin`）
   * **Homepage URL**：填入您的網頁首頁網址（例如：`https://your-username.github.io/`）
   * **Authorization callback URL**：填入您的後台實體網址（例如：`https://your-username.github.io/admin.html`）
4. 點擊 **Register application**。
5. 註冊成功後，複製並記錄畫面上的 **Client ID**。
6. 點擊 **Generate a new client secret**，並立刻複製產生的 **Client Secret**（此金鑰僅會出現一次，關閉網頁後將無法再檢視，請妥善儲存）。

---

## 步驟三：部署 Cloudflare Worker 後端
1. 登入 [Cloudflare 儀表板](https://dash.cloudflare.com/)。
2. 進入 **Workers & Pages** -> 點擊 **Create Application** -> 點擊 **Create Worker**。
3. 命名您的 Worker（例如：`github-oauth-handler`），點擊 **Deploy**。
4. 部署完成後，點擊 **Quick Edit** 進入線上編輯器。
5. 清空預設程式碼，並將本專案中 `worker/index.js` 檔案內的程式碼複製並貼上。
6. 點擊右上角 **Save and Deploy** 進行部署。
7. 返回該 Worker 主頁面，複製專屬的 **Worker 網址**。

---

## 步驟四：設定 Cloudflare 安全環境變數
為了確保安全，GitHub 的 Client Secret 絕對不能放在前端程式碼中，必須將其鎖在 Cloudflare 的伺服器端：
1. 在該 Worker 管理頁面中，點擊 **Settings**（設定）頁籤。
2. 點擊左側選單的 **Variables**（變數）。
3. 在 **Environment Variables** 區塊中點擊 **Add variable**，新增以下兩組變數（請注意英文字母大小寫）：
   * 變數一：
     * **KEY**：`GITHUB_CLIENT_ID`
     * **VALUE**：填入您在步驟二取得的 **Client ID**。
   * 變數二：
     * **KEY**：`GITHUB_CLIENT_SECRET`
     * **VALUE**：填入您在步驟二取得的 **Client Secret**。
4. 點選 **Save and deploy**（儲存並部署）。

---

## 步驟五：配置設定檔 `data/config.json`
回到您的 GitHub 倉庫中，打開並修改 `data/config.json` 檔案。您只需要修改這一個檔案，全站的所有 HTML 與 JavaScript 就會自動對接：

```json
{
  "repo_owner": "您的_GITHUB_帳號名稱",
  "repo_name": "您的_GITHUB_儲存庫名稱",
  "database_path": "data/projects_articles.json",
  "github_client_id": "您的_GITHUB_CLIENT_ID",
  "cloudflare_worker_url": "您的_CLOUDFLARE_WORKER_網址"
}
```

---

## 步驟六：開啟 GitHub Pages 靜態網站託管
1. 進入您 GitHub 倉庫的 **Settings**（設定）頁籤。
2. 點選左側選單的 **Pages**。
3. 在 Build and deployment 區塊下：
   * **Source** 選擇 `Deploy from a branch`。
   * **Branch** 選擇 `main` (或您分支名稱)，目錄選擇 `/ (root)`。
4. 點擊 **Save**。稍等 1 至 2 分鐘，您的個人網站便已在網路上成功發布！
