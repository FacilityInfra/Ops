/* ══════════════════════════════════════════════════════
   inv-firebase.js — Shared JS for Inventory Admin pages
   Firebase init + unit system + utilities
══════════════════════════════════════════════════════ */
const _FBCFG = {
  apiKey:"AIzaSyCS98TwN_CqGLuS1a600P76La7I7t6kJqU",
  authDomain:"facilitymanagement-47470.firebaseapp.com",
  projectId:"facilitymanagement-47470",
  storageBucket:"facilitymanagement-47470.firebasestorage.app",
  messagingSenderId:"638809761503",
  appId:"1:638809761503:web:1a15443eeeee2414aaab6a"
};
if(!window._fbInvInit){firebase.initializeApp(_FBCFG);window._fbInvInit=true;}
const db=firebase.firestore(), auth=firebase.auth();

/* ── Unit System ── */
function unitFamily(u){return({Litre:'liquid',ml:'liquid',L:'liquid',Kg:'weight',g:'weight',kg:'weight'}[u]||'count');}
function toBaseQty(amt,unit){if(!unit||!amt)return amt||0;const f=unitFamily(unit);if(f==='liquid')return unit.toLowerCase()==='ml'?amt:amt*1000;if(f==='weight')return unit==='g'?amt:amt*1000;return amt;}
function baseToHuman(val,unit){if(val==null)return'—';const f=unitFamily(unit);if(f==='liquid')return val>=1000?`${+(val/1000).toFixed(3)} L`:`${Math.round(val)} ml`;if(f==='weight')return val>=1000?`${+(val/1000).toFixed(3)} Kg`:`${Math.round(val)} g`;return`${Math.round(val*100)/100} ${unit||''}`.trim();}

/* ── Utilities ── */
function esc(s){if(!s&&s!==0)return'';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function localDate(d){const dt=d||new Date();return`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;}
function fmtDate(dt){if(!dt)return'—';return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
function fmtTime(dt){if(!dt)return'';return dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:true});}
function fmtCurrency(n){return'₹'+(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});}
function toast(msg,type='ok'){const el=document.getElementById('toast');if(!el)return;const div=document.createElement('div');div.className=`toast-msg toast-${type==='err'?'err':'ok'}`;div.innerHTML=(type==='err'?'❌ ':'✅ ')+esc(msg);el.appendChild(div);setTimeout(()=>div.remove(),3200);}

/* ── Stock helpers ── */
function stockPct(r){const a=r.availableQty??r.receivedQty??0,t=r.totalQty??r.receivedQty??a;return t>0?(a/t)*100:0;}
function isLowStock(r){const a=r.availableQty??r.receivedQty??0;if(r.threshold>0)return a<r.threshold;return stockPct(r)<20;}

/* ── Auth guard ── */
function initAuth(cb){
  auth.onAuthStateChanged(user=>{
    if(!user){location.href='index.html';return;}
    const name=localStorage.getItem('supervisorName')||user.email.split('@')[0];
    /* show admin name in header nav area */
    const hdr=document.getElementById('adminName');
    if(hdr){
      const pill=document.createElement('span');
      pill.style.cssText='font-size:12px;opacity:.75;margin-left:4px;font-weight:600;';
      pill.textContent='👤 '+name;
      hdr.appendChild(pill);
    }
    const lb=document.getElementById('btnLogout');
    if(lb)lb.addEventListener('click',()=>auth.signOut().finally(()=>location.href='index.html'));
    cb(user,name);
  });
}

/* ── Pending requests badge (nav) ── */
async function refreshReqBadge(){
  try{
    const snap=await db.collection('materialRequests').where('status','==','Pending').get();
    const b=document.getElementById('reqNavBadge');
    if(b){b.textContent=snap.size;b.style.display=snap.size>0?'':'none';}
  }catch(e){}
}

/* ── Category dropdown loader ── */
async function loadCategoryOptions(selId,dept){
  const sel=document.getElementById(selId);if(!sel)return;
  const cur=sel.value;sel.innerHTML='<option value="">Loading…</option>';
  try{
    const snap=await db.collection('categories').get();
    const docs=[...snap.docs].map(d=>d.data()).filter(d=>!dept||d.department===dept).sort((a,b)=>a.categoryName.localeCompare(b.categoryName));
    sel.innerHTML='<option value="">Select Category</option>';
    docs.forEach(d=>{const o=document.createElement('option');o.value=d.categoryName;o.textContent=d.categoryName;if(d.categoryName===cur)o.selected=true;sel.appendChild(o);});
  }catch(e){sel.innerHTML='<option value="">Error</option>';}
}

/* ── Supplier dropdown loader ── */
async function loadSupplierOptions(selId){
  const sel=document.getElementById(selId);if(!sel)return;const cur=sel.value;
  try{
    const snap=await db.collection('suppliers').get();
    const docs=[...snap.docs].sort((a,b)=>a.data().supplierName.localeCompare(b.data().supplierName));
    sel.innerHTML='<option value="">Select Supplier</option>';
    docs.forEach(doc=>{const d=doc.data();const o=document.createElement('option');o.value=doc.id;o.textContent=d.supplierName;if(doc.id===cur)o.selected=true;sel.appendChild(o);});
  }catch(e){}
}
