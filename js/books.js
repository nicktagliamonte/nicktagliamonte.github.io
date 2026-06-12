const BOOKS_CSV_PATH = "data/books.csv";

// Color utilities used for hover darkening
function hexToRgb(hex) {
  hex = hex.replace('#','');
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r,g,b){
  return '#'+[r,g,b].map(x=>{ const s = x.toString(16); return s.length==1? '0'+s: s; }).join('');
}

function rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){ h=s=0; } else { const d=max-min; s = l>0.5? d/(2-max-min): d/(max+min); switch(max){ case r: h=(g-b)/d + (g<b?6:0); break; case g: h=(b-r)/d+2; break; default: h=(r-g)/d+4; } h/=6; }
  return {h: h, s: s, l: l};
}

function hslToRgb(h,s,l){
  let r,g,b;
  if(s===0){ r=g=b=Math.round(l*255); }
  else{
    const hue2rgb = (p,q,t)=>{
      if(t<0)t+=1; if(t>1)t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p;
    };
    const q = l<0.5? l*(1+s): l+s-l*s;
    const p = 2*l-q;
    r = hue2rgb(p,q,h+1/3);
    g = hue2rgb(p,q,h);
    b = hue2rgb(p,q,h-1/3);
    r=Math.round(r*255); g=Math.round(g*255); b=Math.round(b*255);
  }
  return {r,g,b};
}

function darkenHex(hex, amount){
  try{
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, Math.min(1, hsl.l - (amount || 0)));
    const drgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(drgb.r, drgb.g, drgb.b);
  }catch(e){ return hex; }
}

// Column definitions and labels used throughout the books UI. Keep keys in
// sync with the CSV column header aliases so mapColumns can find them.
const TABLE_COLUMNS = [
  { key: 'num', label: 'Num', required: false, aliases: ['num','number'] },
  { key: 'title', label: 'Title', required: true, aliases: ['title'] },
  { key: 'author', label: 'Author', required: true, aliases: ['author'] },
  { key: 'pages', label: 'Pages', required: false, aliases: ['pages'] },
  { key: 'category', label: 'Category', required: false, aliases: ['category','cycle'] },
  { key: 'startDate', label: 'Anticipated Start Date', required: false, aliases: ['anticipated start date'] },
  { key: 'completed', label: 'Completed Date', required: false, aliases: ['completed','completion date','completed date'] },
  { key: 'rating', label: 'Rating', required: false, aliases: ['rating'] },
];

document.addEventListener('DOMContentLoaded', loadBooks);

// In-memory state for filtering/sorting
const BOOKS_STATE = {
  records: [], // array of { title, author, pages, category, startDate, rating, completionDate, _rawRow }
  filter: { text: '', year: '' },
  sort: { key: 'startDate', dir: 1 }, // default: sort by startDate ascending
  columnFilters: {}, // key -> Set(allowedValues) (empty = all allowed)
  // ui: which tab is active: 'inprogress' or 'completed'
  ui: { activeTab: 'inprogress' }
};

async function loadBooks() {

  try {
    const response = await fetch(BOOKS_CSV_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = (await response.text()).replace(/^\uFEFF/, "");
    const delimiter = detectDelimiter(text);
    const rows = parseCSV(text, delimiter);
    if (rows.length < 2) {
      throw new Error("No book rows found");
    }

    const columnIndex = mapColumns(rows[0]);
    // build in-memory records
    const records = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.every((cell) => cell.trim() === "")) continue;
      const rec = {};
      for (const column of TABLE_COLUMNS) {
        const sourceIndex = columnIndex[column.key];
        rec[column.key] = sourceIndex === -1 ? '' : (row[sourceIndex] ?? '').trim();
      }
    // parse start date into a Date object for chronological sorting
    rec._rawRow = row;
    rec._startDateObj = parseDate(rec.startDate);
      records.push(rec);
    }
  BOOKS_STATE.records = records;
  // populate year filter options
  populateYearFilter(records);
  // render table from state
  renderTable();
  // attach control handlers
  attachBooksControls();
  // build header menus (sort + per-column filters)
  buildColumnMenus();
  } catch (error) {
    console.error("Failed to load books:", error);
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = TABLE_COLUMNS.length;
    td.textContent =
      "Could not load the book list. Export your spreadsheet as CSV into data/books.csv.";
    tr.appendChild(td);
    tbody.replaceChildren(tr);
  }
}

function populateYearFilter(records) {
  const sel = document.getElementById('books-year-filter');
  if (!sel) return;
  const years = new Set();
  for (const r of records) {
    const m = (r.startDate || '').match(/\/(\d{2})(?:$|\/)/);
    if (m) years.add(m[1]);
  }
  const sorted = Array.from(years).sort();
  sel.innerHTML = '<option value="">(all)</option>' + sorted.map(y=>`<option value="${y}">${y}</option>`).join('');
}

function parseDate(s){
  if(!s) return null;
  // expect formats like M/D/YY or MM/DD/YYYY
  const m = s.match(/^(\s*)(\d{1,2})\/(\d{1,2})\/(\d{2,4})(\s*)$/);
  if(!m) return null;
  let yy = m[4]; let mm=Number(m[2]); let dd=Number(m[3]);
  if(yy.length===2) yy = String(2000 + Number(yy));
  const y = Number(yy);
  if(Number.isNaN(y) || Number.isNaN(mm) || Number.isNaN(dd)) return null;
  // JS Date: months 0-indexed
  const d = new Date(y, mm-1, dd);
  return isNaN(d.getTime())? null : d;
}

function buildColumnMenus() {
  const thead = document.querySelector('#books-container .books-table thead');
  if(!thead) return;
  const ths = Array.from(thead.querySelectorAll('th'));
  ths.forEach((th, idx)=>{
    // clear existing menu if present
    const existing = th.querySelector('.col-menu');
    if(existing) existing.remove();
  const key = TABLE_COLUMNS[idx]?.key || null;
  if(!key) return;
  // Do not create a column menu for the Num column (narrow numeric index)
  if(key === 'num') return;
    // Ensure header text is wrapped in a span so we can layout with flex and keep the menu button separate
    let labelSpan = th.querySelector('.header-label');
    if(!labelSpan){
      // find first text node
      let text = '';
      for(const node of Array.from(th.childNodes)){
        if(node.nodeType === Node.TEXT_NODE && node.textContent.trim()){ text = node.textContent.trim(); node.remove(); break; }
      }
      labelSpan = document.createElement('span');
      labelSpan.className = 'header-label';
      labelSpan.textContent = text || (TABLE_COLUMNS[idx]?.label || '');
      // prepend so it sits before the menu
      th.insertBefore(labelSpan, th.firstChild);
    }
    const btnWrap = document.createElement('span');
    btnWrap.className = 'col-menu';
    const btn = document.createElement('button'); btn.innerHTML='▾'; btn.title='Column options';
  const panel = document.createElement('div'); panel.className='col-menu-panel';
  panel.addEventListener('click', (e)=>{ e.stopPropagation(); });
    // sort buttons
  const sa = document.createElement('button'); sa.textContent='Sort ascending'; sa.style.display='block'; sa.addEventListener('click', ()=>{ BOOKS_STATE.sort.key = key; BOOKS_STATE.sort.dir = 1; renderTable(); });
  const sd = document.createElement('button'); sd.textContent='Sort descending'; sd.style.display='block'; sd.addEventListener('click', ()=>{ BOOKS_STATE.sort.key = key; BOOKS_STATE.sort.dir = -1; renderTable(); });
    panel.appendChild(sa); panel.appendChild(sd);
    panel.appendChild(document.createElement('hr'));
    // unique values
    const values = getUniqueValuesForColumn(key);
    // initialize filter set if not present
    if(!BOOKS_STATE.columnFilters[key]) BOOKS_STATE.columnFilters[key] = new Set(values);
    // Add a toggle-all button (behaves: if any unchecked -> check all; if all checked -> uncheck all)
    const toggleAllBtn = document.createElement('button');
    const updateToggleAllLabel = ()=>{
      const allowed = BOOKS_STATE.columnFilters[key] || new Set();
      const allSelected = values.length > 0 && values.every(v=> allowed.has(v));
      toggleAllBtn.textContent = allSelected ? 'Remove all' : 'Add all';
    };
    toggleAllBtn.style.display = 'block';
    toggleAllBtn.addEventListener('click', ()=>{
      const allowed = BOOKS_STATE.columnFilters[key] || new Set();
      const allSelected = values.length > 0 && values.every(v=> allowed.has(v));
      if(allSelected){
        // remove all
        BOOKS_STATE.columnFilters[key] = new Set();
        // update checkboxes below after creation
        checkboxes.forEach(cb=> cb.checked = false);
      } else {
        // add all
        BOOKS_STATE.columnFilters[key] = new Set(values);
        checkboxes.forEach(cb=> cb.checked = true);
      }
      updateToggleAllLabel();
      renderTable();
    });
    panel.appendChild(toggleAllBtn);

    // build checkbox list
    const checkboxes = [];
    for(const v of values){
      const lab = document.createElement('label');
      const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = BOOKS_STATE.columnFilters[key].has(v);
      cb.addEventListener('change', (e)=>{
        if(e.target.checked) BOOKS_STATE.columnFilters[key].add(v); else BOOKS_STATE.columnFilters[key].delete(v);
        updateToggleAllLabel();
        renderTable();
      });
      const span = document.createElement('span'); span.textContent = v|| '(empty)';
      lab.appendChild(cb); lab.appendChild(span);
      panel.appendChild(lab);
      checkboxes.push(cb);
    }
    updateToggleAllLabel();
    btnWrap.appendChild(btn); btnWrap.appendChild(panel);
    th.appendChild(btnWrap);
    // toggle menu
    btn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      // debug log to verify click handlers are firing
      try { console.log('col-menu clicked for', key); } catch(e) {}

      // Close other open menus and reset their panels' inline styles
      document.querySelectorAll('.col-menu.show').forEach(n=>{
        if(n !== btnWrap) {
          n.classList.remove('show');
          n.classList.remove('open-up');
          const p = n.querySelector('.col-menu-panel');
          if(p){
            p.style.position = '';
            p.style.left = '';
            p.style.top = '';
            p.style.display = '';
            p.style.maxHeight = '';
            p.style.overflow = '';
          }
        }
      });

      // Toggle this menu: rely on CSS (.col-menu.show .col-menu-panel) for display/positioning
      const panel = btnWrap.querySelector('.col-menu-panel');
      const willShow = !btnWrap.classList.contains('show');
      if(willShow){
        // ensure any inline positioning is cleared so CSS absolute positioning works
        if(panel){
          panel.style.position = '';
          panel.style.left = '';
          panel.style.top = '';
          panel.style.display = '';
          panel.style.maxHeight = '';
          panel.style.overflow = '';
        }
        btnWrap.classList.add('show');
      } else {
        if(panel){
          panel.style.position = '';
          panel.style.left = '';
          panel.style.top = '';
          panel.style.display = '';
          panel.style.maxHeight = '';
          panel.style.overflow = '';
        }
        btnWrap.classList.remove('show');
        btnWrap.classList.remove('open-up');
      }
    });
  });
  // close menus on outside click and reset panels
  document.addEventListener('click', ()=>{
    document.querySelectorAll('.col-menu.show').forEach(n=>{
      n.classList.remove('show');
      n.classList.remove('open-up');
      const p = n.querySelector('.col-menu-panel');
      if(p){
        p.style.position = '';
        p.style.left = '';
        p.style.top = '';
        p.style.display = '';
        p.style.maxHeight = '';
        p.style.overflow = '';
      }
    });
  });
}

function getUniqueValuesForColumn(key){
  const s = new Set();
  for(const r of BOOKS_STATE.records){
    if(key==='startDate'){
      const d = r._startDateObj;
      if(d) s.add(String(d.getFullYear())); else s.add('');
    } else {
      s.add((r[key]||'').toString());
    }
  }
  return Array.from(s).sort((a,b)=> a.localeCompare(b));
}

// Apply text filter, per-column checkbox filters, year select, and sorting.
function applyFiltersAndSort(records){
  try{
    let out = Array.from(records || []);
    const txt = (BOOKS_STATE.filter.text || '').trim().toLowerCase();
    const yearFilter = BOOKS_STATE.filter.year || '';

    // text search across several fields
    if(txt){
      out = out.filter(r => {
        return (r.title||'').toLowerCase().includes(txt)
          || (r.author||'').toLowerCase().includes(txt)
          || (r.category||'').toLowerCase().includes(txt)
          || (r.pages||'').toString().toLowerCase().includes(txt)
          || (r.rating||'').toString().toLowerCase().includes(txt)
          || (r.completed||'').toLowerCase().includes(txt);
      });
    }

    // year select (legacy top control) - expects two-digit year string
    if(yearFilter){
      out = out.filter(r => {
        const d = r._startDateObj;
        if(!d) return false;
        const two = String(d.getFullYear()).slice(-2);
        return two === yearFilter;
      });
    }

    // per-column checkbox filters (BOOKS_STATE.columnFilters: key -> Set)
    for(const [key, allowedSet] of Object.entries(BOOKS_STATE.columnFilters || {})){
      if(!allowedSet || allowedSet.size === 0) continue; // empty = allow all
      out = out.filter(r => {
        if(key === 'startDate'){
          const d = r._startDateObj;
          return d ? allowedSet.has(String(d.getFullYear())) : allowedSet.has('');
        }
        return allowedSet.has((r[key]||'').toString());
      });
    }

    // single-pass sort across the filtered set
    const sortKey = BOOKS_STATE.sort?.key || 'title';
    const dir = BOOKS_STATE.sort?.dir || 1;
    out.sort((a,b)=>{
      try{
        if(sortKey === 'startDate'){
          const ta = a._startDateObj ? a._startDateObj.getTime() : (dir===1? Infinity : -Infinity);
          const tb = b._startDateObj ? b._startDateObj.getTime() : (dir===1? Infinity : -Infinity);
          return (ta - tb) * dir;
        }
        const va = (a[sortKey] ?? '').toString();
        const vb = (b[sortKey] ?? '').toString();
        // attempt numeric compare when both look numeric
        const na = Number(va); const nb = Number(vb);
        if(!Number.isNaN(na) && !Number.isNaN(nb)){
          return (na - nb) * dir;
        }
        return va.localeCompare(vb) * dir;
      }catch(e){ return 0; }
    });

    return out;
  }catch(e){ console.error('applyFiltersAndSort error', e); return records || []; }
}

function renderTable() {
  // Decide which tab to render
  const active = BOOKS_STATE.ui.activeTab || 'inprogress';
  const rows = applyFiltersAndSort(BOOKS_STATE.records || []);

  // Partition rows by completed presence
  const isCompleted = r => (r.completed || '').toString().trim() !== '';
  const inprogressRows = rows.filter(r => !isCompleted(r));
  const completedRows = rows.filter(r => isCompleted(r));

  // helper to render a table body for a given container and columns
  const renderBody = (tbodyId, cols, data) => {
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;
    const frag = document.createDocumentFragment();
    for (const r of data) {
      const tr = document.createElement('tr');
      for (const col of cols) {
        const td = document.createElement('td');
        td.textContent = r[col.key] ?? '';
        tr.appendChild(td);
      }
      frag.appendChild(tr);
    }
    tbody.replaceChildren(frag);
  };

  // Define columns for each table view
  const inprogressCols = TABLE_COLUMNS.filter(c => ['num','title','author','pages','category','startDate'].includes(c.key));
  const completedCols = TABLE_COLUMNS.filter(c => ['num','title','author','pages','category','completed','rating'].includes(c.key));

  // Render both bodies (they may be hidden via CSS/tab state)
  renderBody('books-table-body-inprogress', inprogressCols, inprogressRows);
  renderBody('books-table-body-completed', completedCols, completedRows);

  // Apply year styling only to the currently visible table body (startDate-based)
  try {
    if(active === 'inprogress') {
      applyYearStyling(document.getElementById('books-table-body-inprogress'), {});
    }
  } catch(e){ console.error('applyYearStyling failed', e); }

  // Render mobile blocks for both views
  try { renderMobileViewFor('inprogress', inprogressRows); } catch(e) { console.error('renderMobileView failed (inprogress)', e); }
  try { renderMobileViewFor('completed', completedRows); } catch(e) { console.error('renderMobileView failed (completed)', e); }

  // Show/hide the appropriate table & mobile block based on active tab
  const inTable = document.getElementById('books-table-inprogress');
  const compTable = document.getElementById('books-table-completed');
  const inMobile = document.getElementById('books-mobile-inprogress');
  const compMobile = document.getElementById('books-mobile-completed');
  if(active === 'inprogress'){
    if(inTable) inTable.style.display = '';
    if(compTable) compTable.style.display = 'none';
    if(inMobile) inMobile.style.display = '';
    if(compMobile) compMobile.style.display = 'none';
  } else {
    if(inTable) inTable.style.display = 'none';
    if(compTable) compTable.style.display = '';
    if(inMobile) inMobile.style.display = 'none';
    if(compMobile) compMobile.style.display = '';
  }
}

// Render a compact, parseable mobile view and provide CSV export/copy
function csvFromRecords(records){
  // default: full table using TABLE_COLUMNS
  return csvFromColumns(records, TABLE_COLUMNS);
}

function csvFromColumns(records, columns){
  if(!records) return '';
  const headers = columns.map(c=>`"${c.label.replace(/"/g,'""')}"`).join(',');
  const lines = [headers];
  for(const r of records){
    const vals = columns.map(c=>`"${(r[c.key]??'').toString().replace(/"/g,'""')}"`);
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

// Render mobile view for a named tab ('inprogress' or 'completed') into its container
function renderMobileViewFor(tabName, records){
  const listId = tabName === 'completed' ? 'books-mobile-list-completed' : 'books-mobile-list-inprogress';
  const csvId = tabName === 'completed' ? 'books-mobile-csv-completed' : 'books-mobile-csv-inprogress';
  const list = document.getElementById(listId);
  const csvPre = document.getElementById(csvId);
  if(!list) return;
  list.replaceChildren();
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    item.className = 'books-mobile-item';
    const num = (r.num && r.num.toString().trim()) ? r.num : (i + 1).toString();
    const numSpan = document.createElement('div'); numSpan.className = 'books-mobile-num'; numSpan.textContent = num;
    const content = document.createElement('div'); content.className = 'books-mobile-content';
    const titleEl = document.createElement('div'); titleEl.className = 'books-mobile-title'; titleEl.textContent = r.title || '';
    const authorEl = document.createElement('div'); authorEl.className = 'books-mobile-author'; authorEl.textContent = r.author || '';
    const metaEl = document.createElement('div'); metaEl.className = 'books-mobile-meta';
    const parts = [];
    if (r.category) parts.push(r.category);
    if (tabName === 'inprogress') {
      if (r.startDate) parts.push(r.startDate);
      if (r.pages) parts.push(r.pages);
    } else {
      if (r.completed) parts.push(r.completed);
      if (r.pages) parts.push(r.pages);
      if (r.rating) parts.push(r.rating);
    }
    metaEl.textContent = parts.join(' • ');
    content.appendChild(titleEl); content.appendChild(authorEl); content.appendChild(metaEl);
    item.appendChild(numSpan); item.appendChild(content); list.appendChild(item);
  }
  if(csvPre) csvPre.textContent = csvFromRecords(records);
}

function renderMobileView(records){
  const container = document.getElementById('books-mobile');
  if(!container) return;
  const list = document.getElementById('books-mobile-list');
  const csvPre = document.getElementById('books-mobile-csv');
  // Clear list
  list.replaceChildren();
  // Build structured list items for improved readability
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    item.className = 'books-mobile-item';

    // Prefix with 'num' from CSV if present, otherwise use the index (1-based)
    const num = (r.num && r.num.toString().trim()) ? r.num : (i + 1).toString();
    const numSpan = document.createElement('div');
    numSpan.className = 'books-mobile-num';
    numSpan.textContent = num;

    const content = document.createElement('div');
    content.className = 'books-mobile-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'books-mobile-title';
    titleEl.textContent = r.title || '';

    const authorEl = document.createElement('div');
    authorEl.className = 'books-mobile-author';
    authorEl.textContent = r.author || '';

    const metaEl = document.createElement('div');
    metaEl.className = 'books-mobile-meta';
    // small meta line: category • startDate • pages • rating • completed
    const parts = [];
    if (r.category) parts.push(r.category);
    if (r.startDate) parts.push(r.startDate);
    if (r.pages) parts.push(r.pages);
    if (r.rating) parts.push(r.rating);
    if (r.completed) parts.push(r.completed);
    metaEl.textContent = parts.join(' • ');

    content.appendChild(titleEl);
    content.appendChild(authorEl);
    content.appendChild(metaEl);

    item.appendChild(numSpan);
    item.appendChild(content);
    list.appendChild(item);
  }
  // CSV generation
  const csv = csvFromRecords(records);
  csvPre.textContent = csv;

  // Note: desktop buttons (next to search) are wired in attachBooksControls and
  // will control the CSV pre element. renderMobileView only updates the CSV text.
}

// wire up controls
function attachBooksControls() {
  const search = document.getElementById('books-search');
  const yearSel = document.getElementById('books-year-filter');
  const sortSel = document.getElementById('books-sort');
  const sortDir = document.getElementById('books-sort-dir');
  // CSV controls (desktop buttons placed next to search).
  const copyBtnDesktop = document.getElementById('books-copy-csv-desktop');
  const toggleBtnDesktop = document.getElementById('books-toggle-csv-desktop');
  const tabInBtn = document.getElementById('books-tab-inprogress');
  const tabCompBtn = document.getElementById('books-tab-completed');
  if (search) {
    search.addEventListener('input', (e)=>{ BOOKS_STATE.filter.text = e.target.value; renderTable(); });
  }
  if (yearSel) {
    yearSel.addEventListener('change', (e)=>{ BOOKS_STATE.filter.year = e.target.value; renderTable(); });
  }
  if (sortSel) {
    sortSel.addEventListener('change', (e)=>{ BOOKS_STATE.sort.key = e.target.value; renderTable(); });
  }
  if (sortDir) {
    sortDir.addEventListener('click', ()=>{ BOOKS_STATE.sort.dir *= -1; sortDir.textContent = BOOKS_STATE.sort.dir===1? '▲':'▼'; renderTable(); });
  }

  // Shared CSV logic: generate CSV from current filtered records
  const doCopyCsv = async () => {
    const rows = applyFiltersAndSort(BOOKS_STATE.records || []);
    const active = BOOKS_STATE.ui.activeTab || 'inprogress';
    const isCompleted = r => (r.completed || '').toString().trim() !== '';
    const rowsForTab = active === 'completed' ? rows.filter(isCompleted) : rows.filter(r=>!isCompleted(r));
    const inprogressCols = TABLE_COLUMNS.filter(c => ['num','title','author','pages','category','startDate'].includes(c.key));
    const completedCols = TABLE_COLUMNS.filter(c => ['num','title','author','pages','category','completed','rating'].includes(c.key));
    const cols = active === 'completed' ? completedCols : inprogressCols;
    const csv = csvFromColumns(rowsForTab, cols);
    try{
      await navigator.clipboard.writeText(csv);
      // feedback: change label briefly if desktop button exists
      if (copyBtnDesktop) { const orig = copyBtnDesktop.textContent; copyBtnDesktop.textContent = 'Copied'; setTimeout(()=>copyBtnDesktop.textContent = orig, 1200); }
    }catch(e){ console.error('copy failed', e); alert('Copy failed: '+e); }
  };

  const doToggleCsv = () => {
    const active = BOOKS_STATE.ui.activeTab || 'inprogress';
    const csvPre = document.getElementById(active === 'completed' ? 'books-mobile-csv-completed' : 'books-mobile-csv-inprogress');
    if(!csvPre) return;
    csvPre.style.display = csvPre.style.display === 'none' ? 'block' : 'none';
    const showing = csvPre.style.display !== 'none';
    if (toggleBtnDesktop) toggleBtnDesktop.textContent = showing ? 'Hide CSV' : 'Show CSV';
  };

  if (copyBtnDesktop) copyBtnDesktop.addEventListener('click', doCopyCsv);
  if (toggleBtnDesktop) toggleBtnDesktop.addEventListener('click', doToggleCsv);

  // Tab button handlers
  const setActiveTab = (tab) => {
    BOOKS_STATE.ui.activeTab = tab;
    if(tabInBtn) tabInBtn.classList.toggle('active', tab==='inprogress');
    if(tabCompBtn) tabCompBtn.classList.toggle('active', tab==='completed');
    // reset CSV toggle label and hide both csv prese
    if(toggleBtnDesktop) toggleBtnDesktop.textContent = 'Show CSV';
    const pre1 = document.getElementById('books-mobile-csv-inprogress');
    const pre2 = document.getElementById('books-mobile-csv-completed');
    if(pre1) pre1.style.display = 'none';
    if(pre2) pre2.style.display = 'none';
    renderTable();
  };
  if(tabInBtn) tabInBtn.addEventListener('click', ()=> setActiveTab('inprogress'));
  if(tabCompBtn) tabCompBtn.addEventListener('click', ()=> setActiveTab('completed'));
}

function getSiteHeaderHeight() {
  const header = document.querySelector("header");
  if (!header) return 0;
  return header.getBoundingClientRect().height || 0;
}

function mapColumns(headerRow) {
  const normalizedHeaders = headerRow.map(normalizeHeader);
  const columnIndex = {};

  for (const column of TABLE_COLUMNS) {
    const index = findColumnIndex(normalizedHeaders, column.aliases);
    if (index === -1 && column.required) {
      throw new Error(`Missing required column: ${column.label}`);
    }
    columnIndex[column.key] = index;
  }

  return columnIndex;
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumnIndex(normalizedHeaders, aliases) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const exactIndex = normalizedHeaders.indexOf(normalizedAlias);
    if (exactIndex !== -1) {
      return exactIndex;
    }
  }
  return -1;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;

  if (tabs > semicolons && tabs > commas) {
    return "\t";
  }
  if (semicolons > commas) {
    return ";";
  }
  return ",";
}

function parseCSV(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else if (char === "\r") {
      continue;
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

// Year-based styling: examine the Anticipated Start Date column for each row,
// extract the year (two-digit), and add a class `year-XX` to the TR so CSS can style it.
function applyYearStyling(tbody, columnIndex) {
  // columnIndex contains the CSV source index for each logical column key.
  // But the rendered TDs are in TABLE_COLUMNS order. Find the displayed index
  // (the position of the startDate column in the table) and use that to
  // read the date from the TR's TDs.
  const csvStartIdx = columnIndex['startDate'];
  let displayStartIdx = TABLE_COLUMNS.findIndex(c => c.key === 'startDate');

  // fallback: if TABLE_COLUMNS doesn't contain it (shouldn't happen), try header lookup
  if (displayStartIdx === -1) {
    const thead = tbody.closest('table')?.querySelector('thead');
    if (thead) {
      const headers = Array.from(thead.querySelectorAll('th'));
      const idx = headers.findIndex(h => (h.textContent||'').trim().toLowerCase() === 'anticipated start date');
      if (idx !== -1) displayStartIdx = idx;
    }
  }

  console.log('applyYearStyling: csvStartIdx=', csvStartIdx, 'displayStartIdx=', displayStartIdx);
  if (typeof displayStartIdx !== 'number' || displayStartIdx === -1) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  const yearToClass = (yearTwoDigits) => `year-${yearTwoDigits}`;

  // Inline color map derived from css/year-colors.css (even/odd variants).
  // Using inline styles ensures the color is visible even when other
  // stylesheet rules are more specific or applied later.
  const YEAR_COLORS = {
    '26': { even: '#c1e8ba', odd: '#ade0a3' },
    '27': { even: '#bbe8ba', odd: '#a5e0a3' },
    '28': { even: '#bae8be', odd: '#a3e0a9' },
    '29': { even: '#bae8c4', odd: '#a3e0b1' },
    '30': { even: '#bae8ca', odd: '#a3e0b9' },
    '31': { even: '#bae8d0', odd: '#a3e0c1' },
    '32': { even: '#bae8d6', odd: '#a3e0c9' },
    '33': { even: '#bae8dc', odd: '#a3e0d1' },
    '34': { even: '#bae8e2', odd: '#a3e0d9' },
    '35': { even: '#bae7e8', odd: '#a3dfe0' },
    '36': { even: '#bae1e8', odd: '#a3d7e0' },
    '37': { even: '#badbe8', odd: '#a3cfe0' },
    '38': { even: '#bad5e8', odd: '#a3c7e0' },
    '39': { even: '#bacfe8', odd: '#a3bfe0' },
    '40': { even: '#bac9e8', odd: '#a3b7e0' },
    '41': { even: '#bac3e8', odd: '#a3afe0' },
    '42': { even: '#babce8', odd: '#a3a6e0' },
    '43': { even: '#bdbae8', odd: '#a7a3e0' },
    '44': { even: '#c3bae8', odd: '#afa3e0' },
    '45': { even: '#c9bae8', odd: '#b7a3e0' },
    '46': { even: '#cfbae8', odd: '#bfa3e0' },
    '47': { even: '#d5bae8', odd: '#c7a3e0' },
    '48': { even: '#dbbae8', odd: '#cfa3e0' },
    '49': { even: '#e1bae8', odd: '#d7a3e0' },
    '50': { even: '#e7bae8', odd: '#dfa3e0' },
    '51': { even: '#e8bae2', odd: '#e0a3d8' },
    '52': { even: '#e8badc', odd: '#e0a3d0' },
    '53': { even: '#e8bad6', odd: '#e0a3c8' },
    '54': { even: '#e8bad0', odd: '#e0a3c0' },
    '55': { even: '#e8baca', odd: '#e0a3b8' },
    '56': { even: '#e8bac4', odd: '#e0a3b0' },
    '57': { even: '#e8babe', odd: '#e0a3a8' },
    '58': { even: '#e8bcba', odd: '#e0a5a3' },
    '59': { even: '#e8c2ba', odd: '#e0ada3' },
    '60': { even: '#e8c8ba', odd: '#e0b5a3' },
    '61': { even: '#e8ceba', odd: '#e0bea3' },
    '62': { even: '#e8d4ba', odd: '#e0c6a3' },
    '63': { even: '#e8daba', odd: '#e0cea3' },
    '64': { even: '#e8e0ba', odd: '#e0d6a3' },
  };

  // No-year per-row variants (even/odd) to keep the slight offset pattern
  const NO_YEAR_LIGHT = { even: '#f7f7f7', odd: '#f1f1f1' };
  const NO_YEAR_DARK = { even: '#2b2b2b', odd: '#242424' };

  for (const tr of rows) {
  const tds = tr.querySelectorAll('td');
  if (tds.length <= displayStartIdx) continue;
  const dateText = (tds[displayStartIdx].textContent || '').trim();

    // match MM/DD/YY or M/D/YY or MM/DD/YYYY etc. (fallback for rows that
    // aren't completed and do have a startDate)
    const m = dateText.match(/^(\s*)(\d{1,2})\/(\d{1,2})\/(\d{2,4})(\s*)$/);
    if (!m) {
      // similar handling for unparsable date formats
      tr.classList.add('no-year');
      try {
        const idx = Array.from(tr.parentElement.children).indexOf(tr);
        const isOddKey = (idx % 2) === 0 ? 'odd' : 'even';
        const orig = NO_YEAR_LIGHT[isOddKey];
        const hover = darkenHex(orig, 0.06);
        const darkModeBg = NO_YEAR_DARK[isOddKey];
        const darkModeHover = darkenHex(darkModeBg, 0.06);
        tr.dataset._origBg = orig;
        tr.dataset._hoverBg = hover;
        tr.dataset._darkBg = darkModeBg;
        tr.dataset._darkHover = darkModeHover;
        if (document.body.classList.contains('dark-mode')) {
          setRowBackgroundAndText(tr, tr.dataset._darkBg);
        } else {
          setRowBackgroundAndText(tr, tr.dataset._origBg);
        }
        tr.addEventListener('mouseenter', () => {
          const use = document.body.classList.contains('dark-mode') ? tr.dataset._darkHover : tr.dataset._hoverBg;
          setRowBackgroundAndText(tr, use);
        });
        tr.addEventListener('mouseleave', () => {
          const use = document.body.classList.contains('dark-mode') ? tr.dataset._darkBg : tr.dataset._origBg;
          setRowBackgroundAndText(tr, use);
        });
      } catch (e) { /* ignore */ }
      continue;
    }
    let yy = m[4];
    if (yy.length === 4) yy = yy.slice(-2);
    yy = yy.padStart(2, '0');
    const cls = yearToClass(yy);
    tr.classList.add(cls);
    // apply inline background color to guarantee visibility
    try {
      const map = YEAR_COLORS[yy];
      if (map) {
          const idx = Array.from(tr.parentElement.children).indexOf(tr);
          const isOdd = (idx % 2) === 0 ? 'odd' : 'even';
          const color = map[isOdd] || map.even;
          // set inline style and with priority to ensure visibility
          tr.style.setProperty('background-color', color, 'important');
          // attach hover handlers to darken the row slightly on hover
          try {
            const orig = color;
            const hover = darkenHex(orig, 0.08); // darken by 8%
            // compute dark-mode variant (invert hue/sat and darken slightly)
            const darkModeBg = invertHueSatAndDarken(orig, 0.06, yy);
            // compute hover variant for dark-mode as well
            const darkModeHover = darkenHex(darkModeBg, 0.06);
            // store originals and dark-mode values
            tr.dataset._origBg = orig;
            tr.dataset._hoverBg = hover;
            tr.dataset._darkBg = darkModeBg;
            tr.dataset._darkHover = darkModeHover;

            // if the page is currently in dark-mode, apply dark bg + readable text
            if (document.body.classList.contains('dark-mode')) {
              setRowBackgroundAndText(tr, tr.dataset._darkBg);
            } else {
              setRowBackgroundAndText(tr, tr.dataset._origBg);
            }

            tr.addEventListener('mouseenter', () => {
              const use = document.body.classList.contains('dark-mode') ? tr.dataset._darkHover : tr.dataset._hoverBg;
              setRowBackgroundAndText(tr, use);
            });
            tr.addEventListener('mouseleave', () => {
              const use = document.body.classList.contains('dark-mode') ? tr.dataset._darkBg : tr.dataset._origBg;
              setRowBackgroundAndText(tr, use);
            });
          } catch (e) {
            // ignore
          }
          // log the first few rows so we can confirm behavior without flooding the console
          if (idx < 20) console.log(`row ${idx} -> added class ${cls}, inline color ${color}`);
        }
    } catch (e) {
      // silently ignore inline styling failures
    }
  }
  // debug: report counts per year
  try {
    const counts = {};
    for (const tr of rows) {
      for (const c of Array.from(tr.classList)) {
        const m = c.match(/^year-(\d{2})$/);
        if (m) counts[m[1]] = (counts[m[1]] || 0) + 1;
      }
    }
    console.log('Year styling applied:', counts);
  } catch (e) {
    console.log('Year styling debug failed', e);
  }
  // observe dark-mode toggles on body and update rows live
  try {
    const obs = new MutationObserver(() => {
      const dark = document.body.classList.contains('dark-mode');
      for (const tr of rows) {
        if (dark) {
          const d = tr.dataset._darkBg || tr.dataset._origBg;
          if (d) setRowBackgroundAndText(tr, d);
        } else {
          const o = tr.dataset._origBg;
          if (o) setRowBackgroundAndText(tr, o);
        }
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {
    // ignore
  }
}
