/**
 * Roami Playbook Access Gate — Cloudflare Pages Function
 * 
 * POST /api/verify
 * Body: { "code": "ROAMI-XXXXXXXXX" }
 * 
 * Returns:
 *   200 { "valid": true, "product": "...", "email": "..." }
 *   400 { "valid": false, "error": "..." }
 * 
 * Reads Airtable "Access Codes" table via env vars:
 *   AIRTABLE_PAT      - Personal Access Token
 *   AIRTABLE_BASE_ID  - Base ID (appIYZUP9MFpILu7G)
 *   AIRTABLE_TABLE_ID - Table ID (tbl2iG9cbXD8a7Uox)
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await request.json();
    const code = (body.code || '').trim().toUpperCase();

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check env vars
    if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
      console.error('Missing Airtable env vars');
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query Airtable
    const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}`;
    const filterFormula = encodeURIComponent(`AND({Code} = "${code}", {Status} = "active")`);
    const queryParams = `?filterByFormula=${filterFormula}&maxRecords=1`;

    const airtableResp = await fetch(airtableUrl + queryParams, {
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!airtableResp.ok) {
      console.error('Airtable error:', airtableResp.status, await airtableResp.text());
      return new Response(
        JSON.stringify({ valid: false, error: 'Verification service unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await airtableResp.json();
    const records = data.records || [];

    if (records.length === 0) {
      // Code not found or inactive
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or expired code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Code is valid
    const record = records[0];
    const fields = record.fields;

    return new Response(
      JSON.stringify({
        valid: true,
        product: fields.Product || 'Shenzhen Playbook',
        email: fields.Email || '',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Verify error:', err);
    return new Response(
      JSON.stringify({ valid: false, error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
