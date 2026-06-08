# 個人作品集與動態內容管理系統

本專案是一個基於 Material 3 (M3) 暗黑視覺規範設計的個人網站。採用純前端（HTML, CSS, JavaScript）架構，無需自行架設資料庫，完全透過 GitHub API 與 Cloudflare Workers 無伺服器（Serverless）技術，實現安全的雲端內容編輯與即時發布。

本專案具有高度模板化與解耦設計，任何人皆可透過 Fork 本儲存庫，並依照設定文件完成一鍵部署。

## 系統核心特色

* **視覺規範**：對接 Material Design 3 暗黑規範，採用膠囊導覽選單、高圓角卡片與精美微動態。
* **零代碼二創**：全站所有連線設定、驗證金鑰與目標倉庫資訊皆抽離至單一設定檔中，Fork 之後免改原始碼即可使用。
* **獨立模組管理**：後台「個人設定」、「公告管理」、「作品管理」皆為獨立小卡片與獨立 Commit 同步機制。
* **安全性防線**：透過 Cloudflare Workers 隱藏 GitHub Client Secret，並結合 GitHub 權限審查，確保資料不被他人篡改。

## 檔案目錄結構

請參閱專案內部結構說明：
* 前台頁面：`index.html` (首頁)、`about.html` (關於我)、`portfolio.html` (作品集)、`contact.html` (聯絡我)
* 管理後台：`admin.html`
* 樣式表：`style.css` (M3 暗黑規格樣式)
* 雲端資料庫：`data/projects_articles.json`
* 系統設定檔：`data/config.json` (控制連線目標與金鑰)

## 部署與建置教學

本專案已完成模組化拆分，請點選以下連結查看極詳細的建置與部署步驟：

👉 [點此查看：系統建置與部署教學 (docs/setup.md)](docs/setup.md)

## 後端驗證程式碼

如果您需要查看、修改或自行部署 Cloudflare Worker 後端，請參考以下目錄：

👉 [點此查看：Cloudflare Worker 原始碼 (worker/worker.js)](worker/worker.js)
