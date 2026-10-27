export default async (request, env) => {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email } = await request.json();

    // 验证邮箱
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 发送 Starter Kit 邮件
    const emailResponse = await env.MAILER.send({
      to: email,
      subject: 'Your China Travel Starter Kit',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .section h3 { color: #667eea; margin-top: 0; }
            .section ul { margin: 10px 0; padding-left: 20px; }
            .section li { margin: 8px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
            .cta-button:hover { background: #5568d3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your China Travel Starter Kit</h1>
            <p>Everything you need to travel in China</p>
          </div>
          <div class="content">
            <div class="section">
              <h3>💳 Alipay & WeChat Pay</h3>
              <ul>
                <li><strong>Alipay:</strong> Download app → Register with international card → Verify identity</li>
                <li><strong>WeChat Pay:</strong> Download WeChat → Add international card → Enable payment feature</li>
                <li><strong>Tip:</strong> Both apps accept Visa/Mastercard, but Alipay has better English support</li>
              </ul>
            </div>

            <div class="section">
              <h3>📱 eSIM & Connectivity</h3>
              <ul>
                <li><strong>Recommended:</strong> Airalo, Holafly, or China Unicom eSIM</li>
                <li><strong>Setup:</strong> Install before arrival, activate when you land</li>
                <li><strong>Coverage:</strong> Major cities have excellent 5G, rural areas have 4G</li>
              </ul>
            </div>

            <div class="section">
              <h3>🗺️ Must-Have Apps</h3>
              <ul>
                <li><strong>Navigation:</strong> Amap (高德地图) or Baidu Maps - Google Maps doesn't work well</li>
                <li><strong>Translation:</strong> Baidu Translate or Papago - better for Chinese characters</li>
                <li><strong>Food Delivery:</strong> Ele.me (饿了么) or Meituan (美团)</li>
                <li><strong>Ride Hailing:</strong> DiDi (滴滴) - China's Uber</li>
              </ul>
            </div>

            <div class="section">
              <h3>🔐 Account Setup Without Chinese Phone</h3>
              <ul>
                <li>Use international phone numbers where possible</li>
                <li>For apps requiring Chinese number: ask hotel concierge or use SMS forwarding service</li>
                <li>Some apps accept email registration - check settings</li>
              </ul>
            </div>

            <div class="section">
              <h3>📋 Quick Checklist</h3>
              <ul>
                <li>☐ Download Alipay & WeChat</li>
                <li>☐ Set up eSIM before departure</li>
                <li>☐ Install Chinese map app</li>
                <li>☐ Download translation app</li>
                <li>☐ Save emergency contacts</li>
              </ul>
            </div>

            <div class="section" style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <h3 style="color: white;">Ready to Explore Shenzhen?</h3>
              <p>Get our comprehensive Shenzhen Playbook with 12 curated walking routes, local insights, and real-time support.</p>
              <a href="https://roamitravel.com" class="cta-button" style="background: white; color: #667eea;">Explore Our Guides</a>
            </div>

            <div class="footer">
              <p>Questions? Reply to this email or contact us at <a href="mailto:hello@roamitravel.com">hello@roamitravel.com</a></p>
              <p>Roami Travel — Your AI Travel Concierge for China</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (!emailResponse.success) {
      throw new Error('Failed to send email');
    }

    // 保存到 Airtable（如果配置了）
    if (env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID) {
      try {
        await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Starter Kit Requests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              'Email': email,
              'Status': 'Sent',
              'Sent At': new Date().toISOString()
            }
          })
        });
      } catch (error) {
        console.error('Failed to save to Airtable:', error);
        // 不抛出错误，邮件已发送成功
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending starter kit:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
