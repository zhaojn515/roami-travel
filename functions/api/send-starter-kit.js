export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email } = await request.json();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 保存邮箱到 Airtable
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/StarterKit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Email: email,
              Status: 'Active',
              Source: 'Website',
              'Created At': new Date().toISOString().split('T')[0]
            }
          }
        ]
      })
    });

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error('Airtable error:', errorText);
      // 即使保存失败，也允许下载
    }

    // 发送邮件通知到 hello@roamitravel.com
    if (env.RESEND_API_KEY) {
      try {
        const now = new Date();
        const dateStr = now.toISOString();
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Roami Travel <noreply@roamitravel.com>',
            to: 'hello@roamitravel.com',
            subject: `🎉 New Starter Kit Download - ${email}`,
            html: `
              <h2>New Starter Kit Download</h2>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Product:</strong> China Travel Starter Kit (Free)</p>
              <hr>
              <p style="color: #666; font-size: 14px;">This is an automated notification from Roami Travel website.</p>
            `
          })
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // 邮件失败不影响下载
      }
    }

    // 返回成功状态和重定向 URL
    return new Response(JSON.stringify({ 
      success: true,
      redirectUrl: '/thank-you/?product=starter-kit'
    }), {
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
