// index.js (Cloudflare Worker 程式碼)
export default {
  async fetch(request, env, ctx) {
    // 1. 設定跨來源資源共享 (CORS) 標頭，允許您的 GitHub Pages 存取
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // 安全起見，正式上線可將 * 改為您的 GitHub Pages 網址
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 2. 處理瀏覽器的預檢請求 (Preflight Request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 3. 限制僅能使用 POST 請求
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "僅支援 POST 請求" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // 4. 解析前端傳來的 JSON 資料 (取得臨時 code)
      const body = await request.json();
      const { code } = body;

      if (!code) {
        return new Response(JSON.stringify({ error: "遺失必要的 code 參數" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 5. 向 GitHub API 交換正式的 Access Token
      // 這裡的 GITHUB_CLIENT_ID 與 GITHUB_CLIENT_SECRET 會安全地讀取 Cloudflare 的設定環境變數
      const githubResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const oauthData = await githubResponse.json();

      // 6. 將取得的 Token 資料回傳給前端
      return new Response(JSON.stringify(oauthData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};