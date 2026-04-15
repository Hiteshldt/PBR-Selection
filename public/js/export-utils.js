/* ════════ Shared Export Utilities ════════
   Generates PDF and Excel from quote data (JSON).
   Used by: admin dashboard, customer tracking page.
   Dependencies: jsPDF (CDN), html2canvas (CDN), xlsx (CDN)
*/

function ensureExportFonts() {
  if (document.getElementById('ibm-plex-fonts')) return Promise.resolve();
  const link = document.createElement('link');
  link.id = 'ibm-plex-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
  return document.fonts ? document.fonts.ready : new Promise(r => setTimeout(r, 400));
}

function fmtExport(n, cur) {
  const x = Number(n) || 0;
  if (cur === 'USD') return 'USD ' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return 'INR ' + x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const LABELS = {
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
  iot_suite: 'IoT Suite (Connectivity + Dashboard)',
  sensors_total: 'Sensors Subtotal',
  organisation: 'Organisation',
  contact: 'Contact Person',
  email: 'Email',
  phone: 'Phone',
  country: 'Country',
  currency: 'Currency',
  delivery: 'Delivery Location',
  date: 'Quotation Date',
  reference: 'Reference Number'
};

const PRICE_LABELS = {
  tank: 'Tank (acrylic, custom build)',
  frame: 'Frame & Hardware Kit',
  led: 'LED Lighting System',
  sensors: 'Sensor Package',
  air: 'Air Flow Sensors',
  heater: 'Immersion Heater',
  wavemaker: 'Wavemaker / Circulation Pump',
  electrical: 'Electrical Control Panel',
  hmi: 'HMI Touch Panel',
  connectivity: 'Connectivity Module',
  iot_dashboard: 'Cloud IoT Dashboard'
};

function prettyLabel(key) {
  if (LABELS[key]) return LABELS[key];
  return key.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
}

function prettyPriceLabel(key) {
  const base = key.replace(/_price$/, '');
  if (PRICE_LABELS[base]) return PRICE_LABELS[base];
  return base.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
}

const SKIP_KEYS = new Set(['sensors_total']);

function prettyValue(v) {
  const s = String(v);
  if (s === 'Yes') return 'Included';
  if (s === 'No') return 'Not selected';
  if (s === 'N/A') return 'Not applicable';
  return s;
}

/**
 * Build a config key-value list from stored config JSON.
 * Filters out _price fields and nested objects for display.
 */
function configDisplayRows(cfg) {
  return Object.entries(cfg || {})
    .filter(([k, v]) => v != null && v !== '' && typeof v !== 'object' && !k.endsWith('_price') && !SKIP_KEYS.has(k))
    .map(([k, v]) => [prettyLabel(k), prettyValue(v)]);
}

/**
 * Build a pricing breakdown list from stored config JSON (items with _price suffix).
 */
function configPriceRows(cfg, cur) {
  return Object.entries(cfg || {})
    .filter(([k, v]) => k.endsWith('_price') && Number(v) > 0)
    .map(([k, v]) => [prettyPriceLabel(k), fmtExport(v, cur)]);
}

/* ════════ EXCEL EXPORT FROM DATA ════════ */
function exportQuoteXL(data) {
  if (typeof XLSX === 'undefined') { alert('Excel library not loaded'); return; }
  const c = data.client || {};
  const cfg = data.config || {};
  const p = data.pricing || {};
  const cur = c.currency || 'INR';
  const total = p.display_total != null ? p.display_total : p.grand_total_inr;
  const ref = c.reference || data.reference || 'CBL-PBR';

  const rows = [
    ['CARBELIM PRIVATE LIMITED'],
    ['Photobioreactor (PBR) Custom Design \u2014 Quotation'],
    ['R&D and Production Centre, No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, Tamil Nadu 641020'],
    ['mail@carbelim.io | +91 85903 25180 | Redefining Green Engineering'],
    [''],
    ['Organisation', c.organisation || ''],
    ['Contact', c.contact || ''],
    ['Email', c.email || ''],
    ['Phone', c.phone || ''],
    ['Country', c.country || ''],
    ['Currency', cur],
    ['Date', c.date || ''],
    ['Reference', ref],
    ['Delivery', c.delivery || ''],
  ];

  if (cfg.custom_dimensions && typeof cfg.custom_dimensions === 'object') {
    const d = cfg.custom_dimensions;
    rows.push(['Tank Dimensions', `${d.width || '?'} \u00d7 ${d.height || '?'} \u00d7 ${d.depth || '?'} cm`]);
  }

  rows.push([''], ['CONFIGURATION']);
  const displayRows = configDisplayRows(cfg);
  displayRows.forEach(([k, v]) => rows.push([k, v]));

  rows.push(
    [''],
    ['TOTAL (' + cur + (cur === 'INR' ? ', ex-GST' : '') + ')', total],
    ['Note', cur === 'INR' ? 'GST 18 percent applicable additionally' : 'International quote in USD. Shipping, duties and taxes as applicable at destination.'],
    [''],
    ['REMARKS', data.remarks || 'None'],
    [''],
    ['Ex-works Coimbatore. Validity 30 days. Payment: 50 percent advance, 50 percent before dispatch.'],
    ['Carbelim Private Limited | R&D and Production Centre, No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, TN 641020 | CIN: U74909KL2025PTC091260'],
    ['mail@carbelim.io | +91 85903 25180']
  );

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 26 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Configuration');

  // Pricing sheet
  const priceRows = [['CARBELIM \u2014 PBR Pricing Breakdown'], [''], ['Component', 'Price (' + cur + ')']];
  configPriceRows(cfg, cur).forEach(([k, v]) => priceRows.push([k, v]));
  priceRows.push([''], ['Total', fmtExport(total, cur)]);
  const ws2 = XLSX.utils.aoa_to_sheet(priceRows);
  ws2['!cols'] = [{ wch: 36 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Pricing');

  XLSX.writeFile(wb, `Carbelim_PBR_Quotation_${ref}.xlsx`);
}

/* ════════ PDF EXPORT FROM DATA ════════ */
async function exportQuotePDF(data) {
  await ensureExportFonts();
  const c = data.client || {};
  const cfg = data.config || {};
  const p = data.pricing || {};
  const cur = c.currency || 'INR';
  const total = p.display_total != null ? p.display_total : p.grand_total_inr;
  const ref = c.reference || data.reference || 'CBL-PBR';

  let headerExtra = '';
  if (cfg.custom_dimensions && typeof cfg.custom_dimensions === 'object') {
    const d = cfg.custom_dimensions;
    headerExtra = `<div><strong>Tank Dimensions:</strong> ${d.width || '?'} \u00d7 ${d.height || '?'} \u00d7 ${d.depth || '?'} cm</div>`;
  }

  const displayRows = configDisplayRows(cfg);
  const cfgHtml = displayRows.map(([k, v]) =>
    `<tr><td style="padding:3px 6px;color:#6b7280;font-size:9px;border-bottom:1px solid #f3f4f6">${escHtml(k)}</td><td style="padding:3px 6px;font-size:9px;font-weight:600;border-bottom:1px solid #f3f4f6">${escHtml(v)}</td></tr>`
  ).join('');

  const priceRows = configPriceRows(cfg, cur);
  const priceHtml = priceRows.map(([k, v]) =>
    `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:9px;border-bottom:1px dashed #e5e7eb"><span style="color:#6b7280">${escHtml(k)}</span><span style="font-weight:600">${escHtml(v)}</span></div>`
  ).join('');

  const wrap = document.createElement('div');
  wrap.style.cssText = "padding:20px;font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;font-weight:400;font-size:11px;color:#111827;width:900px;position:fixed;top:0;left:0;z-index:-9999;background:#fff;opacity:0.01;pointer-events:none";

  wrap.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #0A3D2E">
      <img src="/img/logo.webp" alt="Carbelim" style="height:56px;margin-bottom:4px" onerror="this.style.display='none'">
      <div style="font-size:9px;color:#0A3D2E;font-style:italic;margin-top:2px">Redefining Green Engineering</div>
      <div style="font-size:12px;color:#374151;margin-top:8px;font-weight:600">Photobioreactor (PBR) Custom Design \u2014 Quotation</div>
      <div style="font-size:8px;color:#6b7280;margin-top:6px">R&amp;D and Production Centre, No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, Tamil Nadu 641020</div>
      <div style="font-size:8px;color:#6b7280;margin-top:1px">mail@carbelim.io | +91 85903 25180</div>
      <div style="font-size:9px;color:#6b7280;margin-top:4px">Ex-works Coimbatore, India | Ref: ${escHtml(ref)} | ${escHtml(c.date || '')}</div>
    </div>
    <table style="width:100%;font-size:10px;margin-bottom:14px;border-collapse:collapse">
      <tr><td style="padding:2px 0"><strong>Organisation:</strong> ${escHtml(c.organisation)}</td><td style="padding:2px 0"><strong>Contact:</strong> ${escHtml(c.contact)}</td></tr>
      <tr><td style="padding:2px 0"><strong>Email:</strong> ${escHtml(c.email)}</td><td style="padding:2px 0"><strong>Phone:</strong> ${escHtml(c.phone)}</td></tr>
      <tr><td style="padding:2px 0"><strong>Country:</strong> ${escHtml(c.country)}</td><td style="padding:2px 0"><strong>Delivery:</strong> ${escHtml(c.delivery)}</td></tr>
      ${headerExtra ? `<tr><td colspan="2" style="padding:2px 0">${headerExtra}</td></tr>` : ''}
    </table>
    <div style="margin-bottom:14px;border:1px solid #e5e7eb;border-radius:8px;padding:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#0A3D2E">Configuration</div>
      <table style="width:100%;border-collapse:collapse">${cfgHtml}</table>
    </div>
    ${priceHtml ? `<div style="margin-bottom:14px;border:1px solid #d1d5db;border-radius:8px;padding:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#0A3D2E">Cost Breakdown</div>
      ${priceHtml}
    </div>` : ''}
    <div style="text-align:center;padding:16px;background:#0A3D2E;color:#fff;border-radius:8px;margin-bottom:14px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;opacity:.7">Total${cur === 'INR' ? ' (ex-GST)' : ' (' + cur + ')'}</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px">${fmtExport(total, cur)}</div>
      <div style="font-size:9px;opacity:.6;margin-top:2px">${cur === 'INR' ? 'GST 18 percent applicable additionally' : 'International quote \u2014 shipping, duties and taxes as applicable at destination'}</div>
    </div>
    ${data.remarks ? `<div style="margin-bottom:12px;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:10px"><div style="font-size:11px;font-weight:700;color:#0A3D2E;margin-bottom:4px">Comments / Remarks</div><div style="color:#374151;line-height:1.6;white-space:pre-wrap">${escHtml(data.remarks)}</div></div>` : ''}
    <div style="font-size:8px;color:#6b7280;text-align:center;border-top:1px solid #d1d5db;padding-top:8px">
      All prices indicative, ex-works Coimbatore. ${cur === 'INR' ? 'GST 18 percent applicable.' : 'International quote in USD, duties and taxes extra at destination.'} Validity 30 days. Payment terms: 50 percent advance, 50 percent before dispatch.<br>
      Carbelim Private Limited | R&amp;D and Production Centre, No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, TN 641020 | mail@carbelim.io | +91 85903 25180 | CIN: U74909KL2025PTC091260
    </div>
  `;

  document.body.appendChild(wrap);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.html(wrap, {
    callback: function (doc) {
      document.body.removeChild(wrap);
      doc.save(`Carbelim_PBR_Quotation_${ref}.pdf`);
    },
    x: 8,
    y: 8,
    width: 194,
    windowWidth: 900,
    margin: [8, 8, 8, 8],
    autoPaging: 'text',
    html2canvas: { scale: 0.215, useCORS: true }
  });
}

/* ════════ PROFORMA / COMMERCIAL INVOICE EXPORT ════════ */
const COMPANY = {
  name: 'CARBELIM PRIVATE LIMITED',
  tagline: 'Redefining Green Engineering',
  address: 'R&D and Production Centre, No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, Tamil Nadu 641020, India',
  registeredAddress: 'L.R. Towers, 39/2475, B1, South Janatha Road, Palarivattom, Ernakulam, Kerala 682025, India',
  email: 'mail@carbelim.io',
  phone: '+91 85903 25180',
  cin: 'U74909KL2025PTC091260',
  dipp: 'DIPP191511',
  bank: {
    beneficiary: 'CARBELIM PRIVATE LIMITED',
    beneficiaryAddress: 'L.R. Towers, 39/2475 B1, South Janatha Road, Palarivattom, Ernakulam, Kerala 682025, India',
    name: 'Axis Bank Limited',
    branchAddress: 'X/110-E-1 Valiyakulangara Buildings, Seaport-Airport Road, Kakkanad, Ernakulam, Kerala 682037, India',
    account: '925020057331610',
    accountType: 'Current Account',
    currency: 'INR',
    ifsc: 'UTIB0001161',
    swift: 'AXISINBBA70'
  }
};

function numToWordsINR(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = x => x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
  const three = x => x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '') : two(x);
  let result = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) result += three(crore) + ' Crore ';
  if (lakh) result += three(lakh) + ' Lakh ';
  if (thousand) result += three(thousand) + ' Thousand ';
  if (rest) result += three(rest);
  return result.trim() + ' Rupees Only';
}

function numToWordsUSD(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Zero Dollars Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = x => x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? '-' + a[x % 10] : '');
  const three = x => x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '') : two(x);
  let result = '';
  const million = Math.floor(n / 1000000);
  const thousand = Math.floor((n % 1000000) / 1000);
  const rest = n % 1000;
  if (million) result += three(million) + ' Million ';
  if (thousand) result += three(thousand) + ' Thousand ';
  if (rest) result += three(rest);
  return result.trim() + ' Dollars Only';
}

async function exportQuotePI(data) {
  await ensureExportFonts();
  const c = data.client || {};
  const cfg = data.config || {};
  const p = data.pricing || {};
  const cur = c.currency || 'INR';
  const isDomestic = cur === 'INR';
  const subtotal = Number(p.display_total != null ? p.display_total : p.grand_total_inr) || 0;
  const gst = isDomestic ? Math.round(subtotal * 0.18) : 0;
  const total = subtotal + gst;
  const ref = c.reference || data.reference || 'CBL-PBR';
  const today = new Date();
  const piNumber = `CBL/PI/${String(today.getFullYear()).slice(-2)}${String(today.getMonth() + 1).padStart(2, '0')}/${ref.split('-').pop()}`;
  const dateStr = today.toLocaleDateString('en-GB');

  const specEntries = configDisplayRows(cfg);

  // Build two-column spec table
  const mid = Math.ceil(specEntries.length / 2);
  const col1 = specEntries.slice(0, mid);
  const col2 = specEntries.slice(mid);
  const maxRows = Math.max(col1.length, col2.length);
  let specRows = '';
  for (let i = 0; i < maxRows; i++) {
    const a = col1[i]; const b = col2[i];
    specRows += `<tr>
      <td style="padding:4px 6px;font-size:10px;color:#4b5563;width:24%;border-bottom:1px solid #f3f4f6"><span style="color:#0A3D2E">&bull;</span> ${a ? escHtml(a[0]) : ''}</td>
      <td style="padding:4px 6px;font-size:10px;color:#111827;font-weight:600;width:26%;border-bottom:1px solid #f3f4f6">${a ? escHtml(a[1]) : ''}</td>
      <td style="padding:4px 6px;font-size:10px;color:#4b5563;width:24%;border-bottom:1px solid #f3f4f6">${b ? '<span style="color:#0A3D2E">&bull;</span> ' + escHtml(b[0]) : ''}</td>
      <td style="padding:4px 6px;font-size:10px;color:#111827;font-weight:600;width:26%;border-bottom:1px solid #f3f4f6">${b ? escHtml(b[1]) : ''}</td>
    </tr>`;
  }

  const totalWords = isDomestic ? numToWordsINR(total) : numToWordsUSD(total);

  const domesticTerms = [
    ['Payment', '60% advance, 40% before dispatch'],
    ['Delivery', '8-10 weeks from advance receipt'],
    ['Ex-works', 'Coimbatore; freight extra'],
    ['Tax', 'GST 18 percent included in grand total'],
    ['Validity', '30 days from date of issue'],
    ['Jurisdiction', 'Subject to Coimbatore jurisdiction'],
  ];
  const intlTerms = [
    ['Payment', '50% advance, 40% pre-dispatch, 10% on delivery'],
    ['Delivery', '10-12 weeks from advance receipt'],
    ['Shipping', 'FOB Chennai / Mumbai Port'],
    ['Duties', 'Destination duties and freight by buyer'],
    ['Validity', '30 days from date of issue'],
    ['Jurisdiction', 'Subject to Coimbatore, India'],
  ];
  const termsList = isDomestic ? domesticTerms : intlTerms;
  const termsRows = termsList.map(([k, v]) =>
    `<tr>
      <td style="padding:4px 6px;font-size:9.5px;color:#0A3D2E;font-weight:600;width:30%;vertical-align:top">${k}</td>
      <td style="padding:4px 6px;font-size:9.5px;color:#4b5563;vertical-align:top">${v}</td>
    </tr>`
  ).join('');

  const bankList = [
    ['Beneficiary', COMPANY.bank.beneficiary],
    ['Bank', COMPANY.bank.name],
    ['Account No', COMPANY.bank.account],
    ['Account Type', COMPANY.bank.accountType],
    ['Currency', COMPANY.bank.currency],
    [isDomestic ? 'IFSC Code' : 'SWIFT Code', isDomestic ? COMPANY.bank.ifsc : COMPANY.bank.swift],
    ['Branch', COMPANY.bank.branchAddress],
  ];
  const MONO_KEYS = new Set(['Account No', 'IFSC Code', 'SWIFT Code']);
  const bankRows = bankList.map(([k, v]) => {
    const mono = MONO_KEYS.has(k) ? "font-family:'IBM Plex Mono',Consolas,monospace;letter-spacing:.5px;" : '';
    return `<tr>
      <td style="padding:4px 6px;font-size:10px;color:#6b7280;width:34%;vertical-align:top">${k}</td>
      <td style="padding:4px 6px;font-size:10px;color:#111827;font-weight:600;vertical-align:top;${mono}">${v}</td>
    </tr>`;
  }).join('');

  const wrap = document.createElement('div');
  wrap.style.cssText = "padding:28px 32px;font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;font-weight:400;font-size:11px;color:#111827;width:900px;position:fixed;top:0;left:0;z-index:-9999;background:#fff;opacity:0.01;pointer-events:none;line-height:1.4";

  // Build cgst/sgst rate display safely (avoid % in string concatenation that html2canvas parses oddly)
  const cgstLabel = 'CGST (9 percent)';
  const sgstLabel = 'SGST (9 percent)';

  wrap.innerHTML = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border-bottom:3px solid #0A3D2E">
      <tr>
        <td style="vertical-align:top;padding-bottom:12px">
          <img src="/img/logo.webp" alt="Carbelim" style="height:56px;margin-bottom:4px" onerror="this.style.display='none'">
          <div style="font-size:9px;color:#0A3D2E;font-style:italic;margin-top:2px">${COMPANY.tagline}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:6px;max-width:340px">${COMPANY.address}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:2px">${COMPANY.email} | ${COMPANY.phone}</div>
        </td>
        <td style="vertical-align:top;text-align:right;padding-bottom:12px;width:260px">
          <div style="display:inline-block;padding:8px 18px;background:#0A3D2E;color:#fff;border-radius:4px;font-size:13px;font-weight:800;letter-spacing:2px">${isDomestic ? 'PROFORMA INVOICE' : 'COMMERCIAL INVOICE'}</div>
          <table style="width:100%;margin-top:10px;border-collapse:collapse;font-size:10px">
            <tr><td style="padding:2px 0;color:#6b7280;text-align:right;width:60px">PI No:</td><td style="padding:2px 0 2px 8px;font-weight:600;text-align:right">${piNumber}</td></tr>
            <tr><td style="padding:2px 0;color:#6b7280;text-align:right">Date:</td><td style="padding:2px 0 2px 8px;font-weight:600;text-align:right">${dateStr}</td></tr>
            <tr><td style="padding:2px 0;color:#6b7280;text-align:right">Ref:</td><td style="padding:2px 0 2px 8px;font-weight:600;text-align:right">${escHtml(ref)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
      <tr>
        <td style="padding:6px 10px;background:#f9fafb;border-radius:4px;font-size:9px;color:#4b5563;width:50%"><strong style="color:#0A3D2E">CIN:</strong> ${COMPANY.cin}</td>
        <td style="padding:6px 10px;background:#f9fafb;border-radius:4px;font-size:9px;color:#4b5563;width:50%;border-left:4px solid #fff"><strong style="color:#0A3D2E">DIPP:</strong> ${COMPANY.dipp} &nbsp; &bull; &nbsp; <strong style="color:#0A3D2E">Origin:</strong> India</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:separate;border-spacing:10px 0;margin-bottom:14px">
      <tr>
        <td style="vertical-align:top;width:60%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:6px">
          <div style="font-size:9px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Billed To</div>
          <div style="font-size:12px;font-weight:700;color:#111827">${escHtml(c.organisation)}</div>
          <div style="font-size:10px;color:#4b5563;margin-top:2px">${escHtml(c.contact)}</div>
          <div style="font-size:10px;color:#4b5563">${escHtml(c.email)}${c.phone ? '  |  ' + escHtml(c.phone) : ''}</div>
          <div style="font-size:10px;color:#4b5563;margin-top:4px">${escHtml(c.delivery)}, ${escHtml(c.country)}</div>
        </td>
        <td style="vertical-align:top;width:40%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:6px">
          <div style="font-size:9px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Invoice Details</div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:2px 0;font-size:10px;color:#6b7280;width:90px">Currency</td><td style="padding:2px 0;font-size:10px;color:#111827;font-weight:600">${cur}</td></tr>
            <tr><td style="padding:2px 0;font-size:10px;color:#6b7280">Origin</td><td style="padding:2px 0;font-size:10px;color:#111827;font-weight:600">India</td></tr>
            <tr><td style="padding:2px 0;font-size:10px;color:#6b7280">Destination</td><td style="padding:2px 0;font-size:10px;color:#111827;font-weight:600">${escHtml(c.country)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;border:1px solid #d1d5db;border-radius:6px;overflow:hidden">
      <thead>
        <tr style="background:#0A3D2E;color:#fff">
          <th style="padding:10px 8px;font-size:10px;font-weight:700;text-align:center;width:32px;letter-spacing:1px">#</th>
          <th style="padding:10px 12px;font-size:10px;font-weight:700;text-align:left;letter-spacing:1px">DESCRIPTION OF GOODS</th>
          <th style="padding:10px 8px;font-size:10px;font-weight:700;text-align:center;width:80px;letter-spacing:1px">HSN</th>
          <th style="padding:10px 8px;font-size:10px;font-weight:700;text-align:center;width:60px;letter-spacing:1px">QTY</th>
          <th style="padding:10px 10px;font-size:10px;font-weight:700;text-align:right;width:130px;letter-spacing:1px">AMOUNT (${cur})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:14px 8px;font-size:11px;font-weight:600;text-align:center;vertical-align:top;border-right:1px solid #e5e7eb">1</td>
          <td style="padding:14px 12px;vertical-align:top;border-right:1px solid #e5e7eb">
            <div style="font-size:12px;font-weight:700;color:#0A3D2E;margin-bottom:2px">Photobioreactor (PBR) &mdash; Custom Configuration</div>
            <div style="font-size:9px;color:#6b7280;margin-bottom:10px">As per Quotation ${escHtml(ref)}</div>
            <div style="font-size:10px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid #e5e7eb">Specifications Selected</div>
            <table style="width:100%;border-collapse:collapse">${specRows}</table>
          </td>
          <td style="padding:14px 8px;font-family:'IBM Plex Mono',Consolas,monospace;font-size:10px;font-weight:500;text-align:center;vertical-align:top;border-right:1px solid #e5e7eb">84198990</td>
          <td style="padding:14px 8px;font-size:10px;font-weight:500;text-align:center;vertical-align:top;border-right:1px solid #e5e7eb">1 Set</td>
          <td style="padding:14px 10px;font-family:'IBM Plex Mono',Consolas,monospace;font-size:12px;font-weight:600;color:#111827;text-align:right;vertical-align:top">${fmtExport(subtotal, cur)}</td>
        </tr>
      </tbody>
    </table>

    <table style="width:100%;border-collapse:separate;border-spacing:10px 0;margin-bottom:14px">
      <tr>
        <td style="vertical-align:top;width:58%;padding:14px;border:1px solid #e5e7eb;border-radius:6px;background:#f9fafb">
          <div style="font-size:9px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Amount in Words</div>
          <div style="font-size:11px;color:#111827;font-weight:600;font-style:italic">${totalWords}</div>
        </td>
        <td style="vertical-align:top;width:42%;padding:0;border:1px solid #d1d5db;border-radius:6px;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 14px;font-size:10.5px;color:#4b5563;border-bottom:1px solid #e5e7eb">Subtotal</td><td style="padding:8px 14px;font-family:'IBM Plex Mono',Consolas,monospace;font-size:10.5px;font-weight:500;text-align:right;border-bottom:1px solid #e5e7eb">${fmtExport(subtotal, cur)}</td></tr>
            ${isDomestic ? `
              <tr><td style="padding:8px 14px;font-size:10.5px;color:#4b5563;border-bottom:1px solid #e5e7eb">${cgstLabel}</td><td style="padding:8px 14px;font-family:'IBM Plex Mono',Consolas,monospace;font-size:10.5px;font-weight:500;text-align:right;border-bottom:1px solid #e5e7eb">${fmtExport(gst / 2, cur)}</td></tr>
              <tr><td style="padding:8px 14px;font-size:10.5px;color:#4b5563;border-bottom:1px solid #e5e7eb">${sgstLabel}</td><td style="padding:8px 14px;font-family:'IBM Plex Mono',Consolas,monospace;font-size:10.5px;font-weight:500;text-align:right;border-bottom:1px solid #e5e7eb">${fmtExport(gst / 2, cur)}</td></tr>
            ` : ''}
            <tr style="background:#0A3D2E;color:#fff"><td style="padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:1px">GRAND TOTAL</td><td style="padding:10px 14px;font-family:'IBM Plex Mono',Consolas,monospace;font-size:13px;font-weight:600;text-align:right">${fmtExport(total, cur)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:separate;border-spacing:10px 0;margin-bottom:20px">
      <tr>
        <td style="vertical-align:top;width:50%;padding:14px;border:1px solid #e5e7eb;border-radius:6px">
          <div style="font-size:9px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Bank Details</div>
          <table style="width:100%;border-collapse:collapse">${bankRows}</table>
        </td>
        <td style="vertical-align:top;width:50%;padding:14px;border:1px solid #e5e7eb;border-radius:6px">
          <div style="font-size:9px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Terms and Conditions</div>
          <table style="width:100%;border-collapse:collapse">${termsRows}</table>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:30px">
      <tr>
        <td style="width:50%;vertical-align:bottom;font-size:9.5px;color:#6b7280;padding-top:40px">
          <div style="border-top:1px solid #9ca3af;padding-top:4px;width:200px;text-align:center;font-weight:600;color:#4b5563">Buyer's Signature and Stamp</div>
        </td>
        <td style="width:50%;text-align:right;vertical-align:bottom;font-size:9.5px;color:#6b7280;padding-top:10px">
          <div style="font-weight:600;color:#111827;margin-bottom:40px">For ${COMPANY.name}</div>
          <div style="border-top:1px solid #9ca3af;padding-top:4px;width:200px;text-align:center;font-weight:600;color:#4b5563;display:inline-block">Authorised Signatory</div>
        </td>
      </tr>
    </table>

    <div style="margin-top:22px;padding-top:12px;border-top:2px solid #0A3D2E;text-align:center;font-size:8.5px;color:#6b7280;line-height:1.7">
      <div style="font-size:10px;color:#0A3D2E;font-style:italic;font-weight:600;margin-bottom:4px;letter-spacing:.5px">${COMPANY.tagline}</div>
      <div><strong style="color:#4b5563">Registered Office:</strong> ${COMPANY.registeredAddress}</div>
      <div style="margin-top:2px">${COMPANY.email} &nbsp;&nbsp;|&nbsp;&nbsp; ${COMPANY.phone} &nbsp;&nbsp;|&nbsp;&nbsp; CIN: ${COMPANY.cin} &nbsp;&nbsp;|&nbsp;&nbsp; DIPP: ${COMPANY.dipp}</div>
      <div style="margin-top:6px;color:#9ca3af;font-size:8px">This is a computer-generated ${isDomestic ? 'proforma' : 'commercial'} invoice and is valid without a physical signature.</div>
    </div>
  `;

  document.body.appendChild(wrap);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.html(wrap, {
    callback: function (doc) {
      document.body.removeChild(wrap);
      doc.save(`Carbelim_${isDomestic ? 'PI' : 'CI'}_${ref}.pdf`);
    },
    x: 8,
    y: 8,
    width: 194,
    windowWidth: 900,
    margin: [8, 8, 8, 8],
    autoPaging: 'text',
    html2canvas: { scale: 0.215, useCORS: true }
  });
}
