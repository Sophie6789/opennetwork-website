const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ========================================
// Lark Base Configuration
// ========================================
const LARK_CONFIG = {
  appId: process.env.LARK_APP_ID,
  appSecret: process.env.LARK_APP_SECRET,
  appToken: process.env.LARK_APP_TOKEN,
  tables: {
    volunteer: process.env.LARK_TABLE_VOLUNTEER,
    membership: process.env.LARK_TABLE_MEMBERSHIP,
    sponsor: process.env.LARK_TABLE_SPONSOR,
  }
};

// Use Feishu domain by default; set LARK_API_DOMAIN=https://open.larksuite.com for international
const LARK_DOMAIN = process.env.LARK_API_DOMAIN || 'https://open.feishu.cn';

let tenantAccessToken = null;
let tokenExpiry = 0;

// ========================================
// Get Tenant Access Token
// ========================================
async function getTenantAccessToken() {
  if (tenantAccessToken && Date.now() < tokenExpiry) {
    return tenantAccessToken;
  }

  const response = await fetch(`${LARK_DOMAIN}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: LARK_CONFIG.appId,
      app_secret: LARK_CONFIG.appSecret,
    }),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Failed to get tenant access token: ${data.msg}`);
  }

  tenantAccessToken = data.tenant_access_token;
  tokenExpiry = Date.now() + (data.expire - 300) * 1000;

  return tenantAccessToken;
}

// ========================================
// Add Record to Lark Base
// ========================================
async function addRecordToLarkBase(tableId, fields) {
  const token = await getTenantAccessToken();

  const response = await fetch(
    `${LARK_DOMAIN}/open-apis/bitable/v1/apps/${LARK_CONFIG.appToken}/tables/${tableId}/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fields }),
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Failed to add record: ${data.msg}`);
  }

  return data;
}

// ========================================
// Build Field Mapping for Each Form Type
// ========================================
function buildVolunteerFields(data) {
  return {
    'Name': data.name || '',
    'Email': data.email || '',
    'Phone': data.phone || '',
    'Location': data.location || '',
    'Skills': data.skills || '',
    'Availability': data.availability || '',
    'Motivation': data.motivation || '',
    'Submitted At': data.submitted_at || new Date().toISOString(),
  };
}

function buildMembershipFields(data) {
  return {
    'Name': data.name || '',
    'Email': data.email || '',
    'Phone': data.phone || '',
    'Organization': data.organization || '',
    'Membership Type': data.membership_type || '',
    'Interests': data.interests || '',
    'Message': data.message || '',
    'Submitted At': data.submitted_at || new Date().toISOString(),
  };
}

function buildSponsorFields(data) {
  return {
    'Name': data.name || '',
    'Email': data.email || '',
    'Phone': data.phone || '',
    'Company': data.company || '',
    'Sponsorship Level': data.sponsorship_level || '',
    'Focus Area': data.focus_area || '',
    'Message': data.message || '',
    'Submitted At': data.submitted_at || new Date().toISOString(),
  };
}

// ========================================
// API Endpoint
// ========================================
app.post('/api/submit', async (req, res) => {
  try {
    const { type, ...formData } = req.body;

    if (!type || !['volunteer', 'membership', 'sponsor'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid form type' });
    }

    const tableId = LARK_CONFIG.tables[type];

    if (!tableId || !LARK_CONFIG.appId || !LARK_CONFIG.appSecret) {
      console.warn('Lark Base not configured. Logging form data instead:');
      console.log(`[${type.toUpperCase()}]`, formData);
      return res.json({
        success: true,
        message: 'Application received (Lark Base not configured — data logged to console)',
      });
    }

    let fields;
    switch (type) {
      case 'volunteer':
        fields = buildVolunteerFields(formData);
        break;
      case 'membership':
        fields = buildMembershipFields(formData);
        break;
      case 'sponsor':
        fields = buildSponsorFields(formData);
        break;
    }

    await addRecordToLarkBase(tableId, fields);

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
});

// Fallback — serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  BLAKE Foundation Website`);
  console.log(`  ========================`);
  console.log(`  Server running at http://localhost:${PORT}`);
  console.log(`  Lark Base: ${LARK_CONFIG.appId ? 'Configured' : 'Not configured (form data will be logged to console)'}\n`);
});
