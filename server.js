require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets webhook URL (still forwards data to your sheet)
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

// Nodemailer transporter
let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// Email recipients
const NOTIFY_TO = (process.env.NOTIFY_TO || '').split(',').map(e => e.trim()).filter(Boolean);

// Build email HTML from submission data
function buildEmailHTML(data) {
  const c = data.client || {};
  const cfg = data.config || {};
  const p = data.pricing || {};
  const F = n => '₹' + Number(n).toLocaleString('en-IN');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#065f46;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">New PBR Configuration Request</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.8">Ref: ${c.reference || '—'} | ${c.date || '—'}</p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <h3 style="color:#065f46;font-size:14px;margin:0 0 10px">Client Details</h3>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;width:120px">Organisation</td><td style="font-weight:600">${c.organisation || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Contact</td><td style="font-weight:600">${c.contact || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Email/Phone</td><td style="font-weight:600">${c.email_phone || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Delivery</td><td style="font-weight:600">${c.delivery || '—'}</td></tr>
        </table>

        <h3 style="color:#065f46;font-size:14px;margin:16px 0 10px">Configuration</h3>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;width:120px">Tank</td><td>${cfg.tank} (${F(cfg.tank_price)})</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Frame</td><td>${cfg.frame} (${F(cfg.frame_price)})</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Colour</td><td>${cfg.color}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">LED</td><td>${cfg.led} (${F(cfg.led_price)})</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Air Sensor</td><td>${cfg.air_sensor} (${F(cfg.air_price)})</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Heater</td><td>${cfg.heater}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Wavemaker</td><td>${cfg.wavemaker}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">IoT</td><td>${cfg.iot_suite}</td></tr>
        </table>

        <div style="margin-top:16px;padding:14px;background:#065f46;color:#fff;border-radius:8px;text-align:center">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.7">Total (ex-GST)</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px">${F(p.grand_total)}</div>
          <div style="font-size:10px;opacity:.6;margin-top:2px">GST @18% applicable additionally</div>
        </div>

        ${data.remarks ? `<div style="margin-top:14px;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px"><strong style="color:#065f46">Remarks:</strong><br><span style="color:#374151">${data.remarks}</span></div>` : ''}

        <p style="font-size:10px;color:#9ca3af;margin-top:16px;text-align:center">Carbelim PBR Configurator &bull; Auto-generated notification</p>
      </div>
    </div>
  `;
}

// API: Submit configuration
app.post('/api/submit', async (req, res) => {
  const data = req.body;

  try {
    // 1. Forward to Google Sheets webhook (if configured)
    if (WEBHOOK_URL) {
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (sheetErr) {
        console.error('Google Sheets webhook error:', sheetErr.message);
      }
    }

    // 2. Send email notification via Nodemailer
    if (transporter && NOTIFY_TO.length > 0) {
      const ref = data.client?.reference || 'CBL-PBR';
      const org = data.client?.organisation || 'Unknown';

      await transporter.sendMail({
        from: `"Carbelim PBR Configurator" <${process.env.GMAIL_USER}>`,
        to: NOTIFY_TO.join(', '),
        subject: `New PBR Quote: ${org} — ${ref}`,
        html: buildEmailHTML(data),
      });

      console.log(`Email sent to: ${NOTIFY_TO.join(', ')}`);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Fallback: serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Carbelim PBR Configurator running at http://localhost:${PORT}`);
});
