/* ═══════════════════════════════════════════════════════════════════
   kpi-config.js  —  Shared configuration for all KPI dashboard pages
   ═══════════════════════════════════════════════════════════════════ */

/* ── Firebase init (called once; other pages reuse window.kpiDB) ── */
const KPI_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCS98TwN_CqGLuS1a600P76La7I7t6kJqU",
  authDomain:        "facilitymanagement-47470.firebaseapp.com",
  projectId:         "facilitymanagement-47470",
  storageBucket:     "facilitymanagement-47470.firebasestorage.app",
  messagingSenderId: "638809761503",
  appId:             "1:638809761503:web:1a15443eeeee2414aaab6a"
};

function initKpiFirebase() {
  if (!window.firebaseAppsInitialized) {
    firebase.initializeApp(KPI_FIREBASE_CONFIG);
    window.firebaseAppsInitialized = true;
  }
  window.kpiDB = firebase.firestore();
  return window.kpiDB;
}

/* ── Brand colours (used consistently across all charts) ── */
const KPI_COLORS = {
  teal:       '#0d9488',
  tealDark:   '#0f4c4c',
  tealLight:  '#ccfbf1',
  green:      '#16a34a',
  greenLight: '#dcfce7',
  amber:      '#d97706',
  amberLight: '#fef3c7',
  red:        '#dc2626',
  redLight:   '#fee2e2',
  blue:       '#1d4ed8',
  blueLight:  '#dbeafe',
  purple:     '#7c3aed',
  gray:       '#64748b',
  grayLight:  '#f1f5f9',
  morning:    '#f59e0b',
  afternoon:  '#0ea5e9',
  night:      '#6366f1',
  general:    '#14b8a6',
};

/* Palette for multi-series charts */
const KPI_PALETTE = [
  KPI_COLORS.teal,  KPI_COLORS.blue,   KPI_COLORS.amber,
  KPI_COLORS.green, KPI_COLORS.purple, KPI_COLORS.red,
  '#06b6d4', '#84cc16', '#f97316', '#ec4899'
];

/* ── Date helpers ── */
function parseDate(d) {
  if (!d) return null;
  if (d && d.toDate) return d.toDate();          /* Firestore Timestamp */
  const dt = new Date(d);
  if (!isNaN(dt)) return dt;
  const dt2 = new Date(String(d).replace(/-/g,'/'));
  return isNaN(dt2) ? null : dt2;
}

function formatDate(d) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : parseDate(d);
  if (!dt) return String(d);
  return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
}

function isoDate(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : parseDate(d);
  return dt ? dt.toISOString().slice(0,10) : '';
}

function startOfDay(d) {
  const dt = new Date(d); dt.setHours(0,0,0,0); return dt;
}

function getDateRange(rangeKey) {
  const now = new Date(), today = startOfDay(now);
  if (rangeKey === 'today') return { start: today, end: new Date(now) };
  if (rangeKey === 'week') {
    const s = new Date(today); s.setDate(today.getDate() - 6);
    return { start: s, end: new Date(now) };
  }
  if (rangeKey === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: s, end: new Date(now) };
  }
  if (rangeKey === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const s = new Date(now.getFullYear(), q * 3, 1);
    return { start: s, end: new Date(now) };
  }
  if (rangeKey === 'year') {
    const s = new Date(now.getFullYear(), 0, 1);
    return { start: s, end: new Date(now) };
  }
  return { start: today, end: new Date(now) };
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    days.push(d);
  }
  return days;
}

/* ── Number formatting ── */
function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/,'') + 'K';
  return String(n);
}
function fmtPct(n, d) { return d ? Math.round((n/d)*100)+'%' : '0%'; }
function fmtCurrency(n) { return '₹' + (n||0).toLocaleString('en-IN'); }

/* ── Base-unit to human readable ── */
function baseToHuman(base, unit) {
  if (base == null) return '—';
  const fam = {Litre:'liquid',ml:'liquid',L:'liquid',Kg:'weight',g:'weight',kg:'weight'}[unit] || 'count';
  if (fam==='liquid') return base>=1000 ? `${(base/1000).toFixed(2).replace(/\.?0+$/,'')} L` : `${Math.round(base)} ml`;
  if (fam==='weight') return base>=1000 ? `${(base/1000).toFixed(2).replace(/\.?0+$/,'')} Kg` : `${Math.round(base)} g`;
  return `${Math.round(base*100)/100} ${unit||''}`.trim();
}

/* ── HTML escape ── */
function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ── Excel export (requires XLSX library) ── */
function exportToExcel(sheets, filename) {
  if (typeof XLSX === 'undefined') { alert('XLSX library not loaded'); return; }
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    /* Auto column width */
    const cols = data[0] ? Object.keys(data[0]).map(k => ({ wch: Math.max(k.length, 12) })) : [];
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0,31));
  });
  XLSX.writeFile(wb, filename || `KPI_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ── Export HTML table to Excel ── */
function exportTableToExcel(tableId, sheetName, filename) {
  if (typeof XLSX === 'undefined') { alert('XLSX library not loaded'); return; }
  const el = document.getElementById(tableId);
  if (!el) { alert('Table not found'); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(el);
  XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');
  XLSX.writeFile(wb, filename || `${sheetName}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ── PPT: fetch image as base64 ── */
async function getImageBase64(url) {
  if (!url) return null;
  if (!url.startsWith('http')) return url;
  try {
    const res = await fetch(url, { mode:'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((res, rej) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  } catch(e) { return null; }
}

/* ── PPT: generate multi-slide activity photo deck ── */
async function generateActivityPPT(records, filename) {
  if (!records || !records.length) { alert('No records with photos'); return; }
  if (typeof PptxGenJS === 'undefined') { alert('PptxGenJS not loaded'); return; }

  const pptx   = new PptxGenJS();
  const slideW = 13.3333, slideH = 7.5;
  const BG_FG  = '156082', BG_BG = 'FFFFFF';
  const PANEL_X = 1.4969, PANEL_W = 10.1486;
  const HDR = { x:1.4969, y:0.0908, w:10.1486, h:0.5107, color:'03339A' };
  const COL_X  = [1.4969, 5.0554, 8.6139];
  const PH     = { w:3.0315, h:1.6566 };
  const PHOTO_Y = [0.6869, 2.8652, 5.0508];
  const CAP_Y   = [2.4454, 4.6110, 6.7633];
  const CAP     = { h:0.2932, fill:'FFFFFF', border:'002060', text:'231A9E' };
  const LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyTCMtrLBcJmjce2b8m4G-bWzxVYfwpG1JdA&usqp=CAU";
  const RIGHT_X  = PANEL_X + PANEL_W;
  const patFill  = { type:'pattern', pattern:'pct5', fgColor:BG_FG, bgColor:BG_BG };

  let logoData = null;
  try { logoData = await getImageBase64(LOGO_URL); } catch(e){}

  for (const rec of records) {
    const title  = (rec.activityName || rec.activity || 'Untitled').toUpperCase();
    const photos = Array.isArray(rec.photos) ? rec.photos : [];
    if (!photos.length) continue;
    const pages  = Math.ceil(photos.length / 9);

    for (let pg = 0; pg < pages; pg++) {
      const slice = photos.slice(pg*9, (pg+1)*9);
      const slide = pptx.addSlide();

      /* Pattern strips */
      slide.addShape(pptx.shapes.RECTANGLE, { x:0, y:0, w:PANEL_X, h:slideH, fill:patFill, line:{color:'FFFFFF',pt:0} });
      slide.addShape(pptx.shapes.RECTANGLE, { x:RIGHT_X, y:0, w:slideW-RIGHT_X, h:slideH, fill:patFill, line:{color:'FFFFFF',pt:0} });

      /* Header */
      slide.addShape(pptx.shapes.RECTANGLE, { x:HDR.x, y:HDR.y, w:HDR.w, h:HDR.h, fill:{color:HDR.color}, line:{color:HDR.color,pt:0} });
      const pgLbl = pages > 1 ? ` (${pg+1}/${pages})` : '';
      slide.addText(title+pgLbl, { x:HDR.x,y:HDR.y,w:HDR.w,h:HDR.h, fontSize:20,bold:true,color:'FFFFFF',align:'center',valign:'middle',fontFace:'Calibri',margin:0 });

      /* Logo */
      if (logoData) slide.addImage({ data:logoData, x:slideW-1.7, y:slideH-0.55, w:1.6, h:0.5 });

      /* Photos + captions */
      for (let i = 0; i < slice.length; i++) {
        const col = i % 3, row = Math.floor(i/3);
        try {
          const img = await getImageBase64(slice[i].url || slice[i]);
          if (img) slide.addImage({ data:img, x:COL_X[col], y:PHOTO_Y[row], w:PH.w, h:PH.h, sizing:{type:'cover',w:PH.w,h:PH.h} });
        } catch(e){}
        slide.addShape(pptx.shapes.RECTANGLE, { x:COL_X[col],y:CAP_Y[row],w:PH.w,h:CAP.h, fill:{color:CAP.fill},line:{color:CAP.border,pt:1} });
        slide.addText(title, { x:COL_X[col],y:CAP_Y[row],w:PH.w,h:CAP.h, fontSize:10,bold:true,color:CAP.text,align:'center',valign:'middle',fontFace:'Calibri',margin:0 });
      }
    }
  }
  await pptx.writeFile({ fileName: filename || `KPI_PPT_${new Date().toISOString().slice(0,10)}.pptx` });
}

/* ── Common Chart.js defaults ── */
Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
Chart.defaults.color       = '#64748b';

/* ── Show/hide loading overlay ── */
function showLoader(id)  { const el=document.getElementById(id); if(el) el.style.display=''; }
function hideLoader(id)  { const el=document.getElementById(id); if(el) el.style.display='none'; }
function setEl(id, html) { const el=document.getElementById(id); if(el) el.innerHTML=html; }
function setText(id, v)  { const el=document.getElementById(id); if(el) el.textContent=v; }
