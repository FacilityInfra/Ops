/* ═══════════════════════════════════════════════════════
   supervisor-common.js — Shared runtime for all pages
   ═══════════════════════════════════════════════════════ */

/* ── Scroll-hide nav ── */
let _lastY = 0;
window.addEventListener('scroll', () => {
  const top = document.getElementById('autoNav');
  const bot = document.getElementById('bottomNav');
  const cur = window.scrollY;
  if (cur <= 0) { top?.classList.remove('hidden'); bot?.classList.remove('hidden'); }
  else if (cur > _lastY + 6) { top?.classList.add('hidden'); bot?.classList.add('hidden'); }
  else if (cur < _lastY - 6) { top?.classList.remove('hidden'); bot?.classList.remove('hidden'); }
  _lastY = cur;
});

/* ── Toast ── */
window.toast = function(msg, type = 'success', duration = 3000) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = `<div class="toast-inner toast-${type}"><span>${icon}</span>${msg}</div>`;
  el.className = 'show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', duration);
};

/* ── HTML escape ── */
window.escapeHtml = function(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
};

/* ── Unit converters ── */
window.toBaseQty = function(amount, unit) {
  if (!amount || !unit) return amount;
  const u = unit.toLowerCase();
  if (u === 'kg' || u === 'kgs') return amount * 1000;
  if (u === 'litre' || u === 'l' || u === 'litres') return amount * 1000;
  return amount;
};

window.formatReadable = function(val, unit) {
  if (val == null) return '—';
  const u = (unit || '').toLowerCase();
  if (u === 'g' || u === 'gm' || u === 'grams')
    return val >= 1000 ? (val/1000).toFixed(2).replace(/\.00$/,'') + ' Kg' : val + ' g';
  if (u === 'ml' || u === 'millilitre' || u === 'millilitres')
    return val >= 1000 ? (val/1000).toFixed(2).replace(/\.00$/,'') + ' L' : val + ' ml';
  if (u === 'nos' || u === 'pcs' || u === 'no' || u === 'pieces') return val + ' pcs';
  return val + (unit ? ' ' + unit : '');
};

/* ── Query shortcut ── */
window.qs  = sel => document.querySelector(sel);
window.qsa = sel => document.querySelectorAll(sel);
