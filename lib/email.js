const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

const NOTIFY_TO = (process.env.NOTIFY_TO || '').split(',').map(e => e.trim()).filter(Boolean);

const FONT_STACK = "'IBM Plex Sans','Helvetica Neue',Arial,sans-serif";

const EMAIL_LABELS = {
  tank: 'Tank Size',
  frame: 'Frame & Hardware',
  color: 'Frame Colour',
  led: 'LED Lighting',
  air_sensor: 'Air Flow Sensor',
  aeration: 'Aeration System',
  fans: 'Cooling Fans',
  heater: 'Immersion Heater',
  wavemaker: 'Wavemaker / Circulation Pump',
  electrical_panel: 'Electrical Control Panel',
  hmi: 'HMI Touch Panel',
  connectivity: 'Connectivity Module',
  iot_dashboard: 'Cloud IoT Dashboard',
  iot_suite: 'IoT Suite (Connectivity + Dashboard)'
};
const EMAIL_SKIP = new Set(['sensors_total']);

function emailLabel(k) {
  if (EMAIL_LABELS[k]) return EMAIL_LABELS[k];
  return k.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
}

function emailValue(v) {
  const s = String(v);
  if (s === 'Yes') return 'Included';
  if (s === 'No') return 'Not selected';
  if (s === 'N/A') return 'Not applicable';
  return s;
}

function configRows(cfg) {
  return Object.entries(cfg || {})
    .filter(([k, v]) => v != null && v !== '' && typeof v !== 'object' && !k.endsWith('_price') && !EMAIL_SKIP.has(k))
    .map(([k, v]) => `<tr><td style="padding:4px 10px;color:#6b7280;font-size:12px;border-bottom:1px solid #f3f4f6;width:44%">${emailLabel(k)}</td><td style="padding:4px 10px;font-size:12px;font-weight:600;border-bottom:1px solid #f3f4f6;color:#111827">${emailValue(v)}</td></tr>`)
    .join('');
}

function fmtMoney(n, currency) {
  const num = Number(n) || 0;
  if (currency === 'USD') return 'USD ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return 'INR ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildSubmissionHTML(data, portalUrl) {
  const c = data.client || {};
  const cfg = data.config || {};
  const p = data.pricing || {};
  const cur = c.currency || 'INR';
  const total = p.display_total != null ? p.display_total : p.grand_total_inr;
  const F = n => fmtMoney(n, cur);

  return `
    <div style="font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#0A3D2E;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">New PBR Configuration Request</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.8">Ref: ${c.reference || '—'} &bull; ${c.date || '—'} &bull; ${c.country || '—'}</p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <h3 style="color:#0A3D2E;font-size:14px;margin:0 0 10px">Client Details</h3>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;width:130px">Organisation</td><td style="font-weight:600">${c.organisation || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Contact</td><td style="font-weight:600">${c.contact || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Email</td><td style="font-weight:600">${c.email || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Phone</td><td style="font-weight:600">${c.phone || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Country</td><td style="font-weight:600">${c.country || '—'}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Delivery</td><td style="font-weight:600">${c.delivery || '—'}</td></tr>
        </table>

        <h3 style="color:#0A3D2E;font-size:14px;margin:16px 0 10px">Configuration</h3>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          ${configRows(cfg)}
        </table>

        <div style="margin-top:16px;padding:14px;background:#0A3D2E;color:#fff;border-radius:8px;text-align:center">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.7">Total${cur === 'INR' ? ' (ex-GST)' : ' (' + cur + ')'}</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px">${F(total)}</div>
          <div style="font-size:10px;opacity:.6;margin-top:2px">${cur === 'INR' ? 'GST 18 percent applicable additionally' : 'Shipping, duties & taxes extra at destination'}</div>
        </div>

        ${data.remarks ? `<div style="margin-top:14px;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px"><strong style="color:#0A3D2E">Remarks:</strong><br><span style="color:#374151">${data.remarks}</span></div>` : ''}

        ${portalUrl ? `<div style="margin-top:14px;padding:12px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;font-size:12px"><strong style="color:#0A3D2E">Admin link:</strong> <a href="${portalUrl}" style="color:#0A3D2E">${portalUrl}</a></div>` : ''}

        <p style="font-size:10px;color:#9ca3af;margin-top:16px;text-align:center">Carbelim PBR Configurator &bull; Auto-generated notification</p>
      </div>
    </div>
  `;
}

function buildCustomerHTML(data, portalUrl) {
  const c = data.client || {};
  const cfg = data.config || {};
  const p = data.pricing || {};
  const cur = c.currency || 'INR';
  const total = p.display_total != null ? p.display_total : p.grand_total_inr;
  const F = n => fmtMoney(n, cur);

  const cfgRows = configRows(cfg);

  return `
    <div style="font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#0A3D2E;color:#fff;padding:18px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">Thank you — request received</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.85">Ref: ${c.reference} &bull; ${c.date || new Date().toLocaleDateString()}</p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:13px;color:#374151;line-height:1.6">
        <p>Hi ${c.contact || 'there'},</p>
        <p>We've received your PBR configuration request. Our team will review it and get back to you shortly.</p>
        <p style="font-size:11px;color:#6b7280;font-style:italic">This is an automated acknowledgement confirming that your request has been received by our system.</p>

        <div style="margin:18px 0;padding:14px;border:1px solid #e5e7eb;border-radius:8px">
          <h3 style="margin:0 0 10px;font-size:13px;color:#0A3D2E">Your Selection Summary</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:3px 8px;color:#6b7280;font-size:12px;border-bottom:1px solid #f3f4f6">Organisation</td><td style="padding:3px 8px;font-size:12px;font-weight:600;border-bottom:1px solid #f3f4f6">${c.organisation || '—'}</td></tr>
            <tr><td style="padding:3px 8px;color:#6b7280;font-size:12px;border-bottom:1px solid #f3f4f6">Country</td><td style="padding:3px 8px;font-size:12px;font-weight:600;border-bottom:1px solid #f3f4f6">${c.country || '—'}</td></tr>
            <tr><td style="padding:3px 8px;color:#6b7280;font-size:12px;border-bottom:1px solid #f3f4f6">Delivery</td><td style="padding:3px 8px;font-size:12px;font-weight:600;border-bottom:1px solid #f3f4f6">${c.delivery || '—'}</td></tr>
            ${cfgRows}
          </table>
        </div>

        <div style="margin:14px 0;padding:14px;background:#0A3D2E;color:#fff;border-radius:8px;text-align:center">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.7">Indicative Total${cur === 'INR' ? ' (ex-GST)' : ' (' + cur + ')'}</div>
          <div style="font-size:22px;font-weight:800;margin-top:4px">${F(total)}</div>
          <div style="font-size:10px;opacity:.6;margin-top:2px">${cur === 'INR' ? 'GST 18 percent applicable additionally' : 'Shipping, duties & taxes extra at destination'}</div>
        </div>

        ${data.remarks ? `<div style="margin:10px 0;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:12px"><strong style="color:#0A3D2E">Your Remarks:</strong><br><span style="color:#374151">${data.remarks}</span></div>` : ''}

        <p style="margin-top:18px">You can track the status of your request anytime:</p>
        <p style="text-align:center;margin:14px 0">
          <a href="${portalUrl}" style="display:inline-block;background:#0A3D2E;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:600">Track My Request</a>
        </p>
        <p style="font-size:11px;color:#6b7280">Or copy this link: <br><code style="font-size:10px">${portalUrl}</code></p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
        <p style="font-size:12px;margin:0">For any queries:</p>
        <p style="font-size:12px;margin:4px 0"><strong>Email:</strong> <a href="mailto:mail@carbelim.io" style="color:#0A3D2E">mail@carbelim.io</a></p>
        <p style="font-size:12px;margin:4px 0"><strong>WhatsApp:</strong> <a href="https://wa.me/918590325180" style="color:#0A3D2E">+91 85903 25180</a></p>

        <p style="color:#0A3D2E;font-weight:600;margin-top:16px">Team Carbelim</p>
        <p style="font-size:10px;color:#9ca3af;margin-top:8px">Carbelim Private Limited | R&D and Production Centre, No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, TN 641020 | CIN: U74909KL2025PTC091260</p>
      </div>
    </div>
  `;
}

function buildStatusUpdateHTML(quote, history) {
  const statusLabels = {
    received: 'Received',
    acknowledged: 'Acknowledged',
    in_production: 'In Production',
    ready_to_ship: 'Ready to Ship',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  const label = statusLabels[history.status] || history.status;
  return `
    <div style="font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#0A3D2E;color:#fff;padding:18px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">Status Update: ${label}</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.85">Ref: ${quote.reference}</p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:13px;color:#374151;line-height:1.6">
        <p>Hi ${quote.contact_name || 'there'},</p>
        <p>Your request <strong>${quote.reference}</strong> has been updated to <strong style="color:#0A3D2E">${label}</strong>.</p>
        ${history.note ? `<div style="margin:12px 0;padding:10px 14px;background:#f9fafb;border-left:3px solid #0A3D2E;border-radius:4px"><strong>Note:</strong> ${history.note}</div>` : ''}
        ${history.eta_date ? `<p><strong>Expected date:</strong> ${history.eta_date}</p>` : ''}
        <p>For any queries, reply to this email.</p>
        <p style="color:#0A3D2E;font-weight:600;margin-top:16px">Team Carbelim</p>
      </div>
    </div>
  `;
}

async function sendSubmissionEmails(data, portalUrl) {
  if (!transporter) return;
  const ref = data.client?.reference || 'CBL-PBR';
  const org = data.client?.organisation || 'Unknown';
  const customerEmail = data.client?.email;

  const tasks = [];
  if (NOTIFY_TO.length > 0) {
    tasks.push(transporter.sendMail({
      from: `"Carbelim PBR Configurator" <${process.env.GMAIL_USER}>`,
      to: NOTIFY_TO.join(', '),
      subject: `New PBR Quote: ${org} — ${ref}`,
      html: buildSubmissionHTML(data, portalUrl),
    }));
  }
  if (customerEmail) {
    tasks.push(transporter.sendMail({
      from: `"Carbelim" <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      subject: `Carbelim PBR request received — ${ref}`,
      html: buildCustomerHTML(data, portalUrl),
    }));
  }
  await Promise.allSettled(tasks);
}

async function sendStatusUpdateEmail(quote, history) {
  if (!transporter || !quote.email) return;
  await transporter.sendMail({
    from: `"Carbelim" <${process.env.GMAIL_USER}>`,
    to: quote.email,
    subject: `Status update: ${quote.reference}`,
    html: buildStatusUpdateHTML(quote, history),
  });
}

function buildCustomEmailHTML(quote, messageBody) {
  const lines = messageBody.replace(/\n/g, '<br>');
  return `
    <div style="font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#0A3D2E;color:#fff;padding:18px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">Message from Carbelim</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.85">Ref: ${quote.reference}</p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:13px;color:#374151;line-height:1.6">
        <p>Hi ${quote.contact_name || 'there'},</p>
        <div style="margin:14px 0">${lines}</div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
        <p style="font-size:12px;margin:4px 0"><strong>Email:</strong> <a href="mailto:mail@carbelim.io" style="color:#0A3D2E">mail@carbelim.io</a></p>
        <p style="font-size:12px;margin:4px 0"><strong>WhatsApp:</strong> <a href="https://wa.me/918590325180" style="color:#0A3D2E">+91 85903 25180</a></p>
        <p style="color:#0A3D2E;font-weight:600;margin-top:16px">Team Carbelim</p>
      </div>
    </div>
  `;
}

async function sendCustomEmail(quote, subject, messageBody) {
  if (!transporter || !quote.email) return;
  await transporter.sendMail({
    from: `"Carbelim" <${process.env.GMAIL_USER}>`,
    to: quote.email,
    subject: subject,
    html: buildCustomEmailHTML(quote, messageBody),
  });
}

module.exports = { sendSubmissionEmails, sendStatusUpdateEmail, sendCustomEmail };
