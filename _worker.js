// Roami Travel - Cloudflare Pages Worker
// Direct Upload 模式：_worker.js 接管所有请求，API 走业务逻辑，其余 fallback 到静态资源

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ===== API 路由 =====
    if (path === '/api/send-starter-kit' && request.method === 'POST') {
      return handleSendStarterKit(request, env);
    }

    // ===== 静态资源 fallback =====
    return env.ASSETS.fetch(request);
  }
};

async function handleSendStarterKit(request, env) {
  try {
    const { email } = await request.json();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 保存邮箱到 Airtable（并发，不阻塞下载）
    const airtablePromise = (async () => {
      try {
        const airtableResponse = await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/StarterKit`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.AIRTABLE_PAT}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              records: [{
                fields: {
                  Email: email,
                  Date: new Date().toISOString(),
                  Source: 'website'
                }
              }]
            })
          }
        );
        if (!airtableResponse.ok) {
          console.error('Airtable error:', await airtableResponse.text());
        }
      } catch (e) {
        console.error('Airtable exception:', e);
      }
    })();

    // 不等待 Airtable，直接返回下载
    return new Response(JSON.stringify({ 
      success: true,
      downloadUrl: '/downloads/starter-kit.pdf'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
