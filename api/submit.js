const LARK_DOMAIN = process.env.LARK_API_DOMAIN || 'https://open.feishu.cn';

let tenantAccessToken = null;
let tokenExpiry = 0;

async function getTenantAccessToken() {
  if (tenantAccessToken && Date.now() < tokenExpiry) {
    return tenantAccessToken;
  }

  const response = await fetch(`${LARK_DOMAIN}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  });

  const data = await response.json();
  if (data.code !== 0) throw new Error(`Token error: ${data.msg}`);

  tenantAccessToken = data.tenant_access_token;
  tokenExpiry = Date.now() + (data.expire - 300) * 1000;
  return tenantAccessToken;
}

async function addRecord(tableId, fields) {
  const token = await getTenantAccessToken();
  const response = await fetch(
    `${LARK_DOMAIN}/open-apis/bitable/v1/apps/${process.env.LARK_APP_TOKEN}/tables/${tableId}/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fields }),
    }
  );
  const data = await response.json();
  if (data.code !== 0) throw new Error(`Record error: ${data.msg}`);
  return data;
}

const fieldBuilders = {
  volunteer: (d) => ({
    Name: d.name || '', Email: d.email || '', Phone: d.phone || '',
    Location: d.location || '', Skills: d.skills || '',
    Availability: d.availability || '', Motivation: d.motivation || '',
    'Submitted At': d.submitted_at || new Date().toISOString(),
  }),
  membership: (d) => ({
    Name: d.name || '', Email: d.email || '', Phone: d.phone || '',
    Organization: d.organization || '', 'Membership Type': d.membership_type || '',
    Interests: d.interests || '', Message: d.message || '',
    'Submitted At': d.submitted_at || new Date().toISOString(),
  }),
  sponsor: (d) => ({
    Name: d.name || '', Email: d.email || '', Phone: d.phone || '',
    Company: d.company || '', 'Sponsorship Level': d.sponsorship_level || '',
    Message: d.message || '',
    'Submitted At': d.submitted_at || new Date().toISOString(),
  }),
};

const tableKeys = {
  volunteer: 'LARK_TABLE_VOLUNTEER',
  membership: 'LARK_TABLE_MEMBERSHIP',
  sponsor: 'LARK_TABLE_SPONSOR',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { type, ...formData } = req.body;

    if (!type || !fieldBuilders[type]) {
      return res.status(400).json({ success: false, message: 'Invalid form type' });
    }

    const tableId = process.env[tableKeys[type]];
    if (!tableId || !process.env.LARK_APP_ID || !process.env.LARK_APP_SECRET) {
      console.log(`[${type.toUpperCase()}]`, formData);
      return res.json({
        success: true,
        message: 'Application received (Lark Base not configured)',
      });
    }

    const fields = fieldBuilders[type](formData);
    await addRecord(tableId, fields);

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
}
