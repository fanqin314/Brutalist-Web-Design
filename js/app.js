/* ===== app.js · 运行时：状态 / 随机 / 导出 / 事件 ===== */
'use strict';

/* DOM 引用（脚本在 body 末尾，DOM 已就绪） */
const preview   = document.getElementById('preview');
const genStyle  = document.getElementById('genStyle');
const htmlCode  = document.getElementById('htmlCode');
const cssCode   = document.getElementById('cssCode');
const textLabel = document.getElementById('textLabel');

const SAVE_KEY  = 'brutalist-gen-v3';
const HIST_MAX  = 60;

let state = Object.assign({}, DEFAULTS);

const VIEW_KEY = 'brutalist-gen-v3-view';
const VIEW_DEFAULTS = { previewBg: 'grid', devW: 0, codeHL: true, minify: false };
let view = Object.assign({}, VIEW_DEFAULTS);
const PV_BGS  = ['grid', 'light', 'dark', 'checker'];
const PV_DEVS = [0, 390, 768, 1024];

/* ---------------- 随机组合 ---------------- */
function randomize() {
  const p = pick(PALETTES);
  state.bg          = p.bg;
  state.color       = p.color;
  state.borderColor = p.borderColor;
  state.shadowColor = p.shadowColor;

  state.borderWidth = pick([2, 3, 4, 5, 6, 8]);
  state.radius      = pick([0, 0, 0, 0, 8, 16]);
  state.rotate      = pick([0, 0, -2, -3, 2, 3, -1]);
  state.shadowX     = pick([0, 4, 6, 8, 10, 12, 15]);
  state.shadowY     = pick([0, 4, 6, 8, 10, 12, 15]);
  state.shadowBlur  = pick([0, 0, 0, 10, 20]);
  state.padX        = pick([18, 24, 30, 34, 42]);
  state.padY        = pick([10, 14, 16, 20]);
  state.fontSize    = pick([14, 15, 16, 18, 20]);
  state.fontWeight  = pick(['700', '800', '900', '900']);
  state.fontFamily  = pick(['mono', 'mono', 'impact', 'arialblack', 'sans']);
  state.letterSpacing = pick([0, 1, 1.5, 2, 3]);
  state.uppercase   = Math.random() < 0.8;
  state.pattern     = pick(['none', 'none', 'none', 'stripes', 'grid', 'dots']);

  state.hoverStraighten = state.rotate !== 0;
  state.hoverGrowShadow = Math.random() < 0.6;
  state.hoverLift       = Math.random() < 0.35;
  state.hoverInvert     = Math.random() < 0.3;
  state.pressShake      = Math.random() < 0.3;

  /* 组件专属分支交给注册表 */
  const c = COMPONENTS[state.mode];
  if (c && c.random) c.random(state);

  render();
  flushHistory();
  renderFullpage();  /* 全屏开着时，配色/内容就地更新 */
  toast('已随机组合');  /* 即使配色接近也给出即时反馈，不会让人以为按钮失灵 */
}

  function reset() {
    const mode = state.mode;
    const showMatrix = !!state.showMatrix;   /* 五态矩阵是用户偏好：重置只该还原组件的样式，别把视图偏好也改回默认 */
    state = Object.assign({}, DEFAULTS);
    state.mode = mode;
    state.showMatrix = showMatrix;
    render();
    flushHistory();
    renderFullpage();
    toast(mode === 'page' ? '已恢复整页默认' : '已重置为该组件默认');
  }

  /* =========================================================
     复制
     ========================================================= */

  function copyText(text, btn) {
    const done = function () {
      const old = btn.textContent;
      btn.textContent = '已复制 ✓';
      setTimeout(function () { btn.textContent = old; }, 1100);
    };

    const fallback = function (t) {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallback(text);
        done();
      });
    } else {
      fallback(text);
      done();
    }
  }

  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      /* 复制前先冲掉挂起的高亮，保证所见即所得；
         内容本身走 dataset.raw（高亮会插 <span>，raw 才是原文） */
      if (typeof flushCodeRefresh === 'function') flushCodeRefresh();
      const raw = target.dataset.raw;
      copyText(raw != null ? raw : target.textContent, btn);
    });
  });

  /* =========================================================
     T1 · 存档 / 历史 / 分享 / 导出
     ========================================================= */


  function sanitize(raw) {
    const out = Object.assign({}, DEFAULTS);
    if (raw && typeof raw === 'object') {
      Object.keys(DEFAULTS).forEach(function (k) {
        if (!(k in raw)) return;
        const v = raw[k];
        const want = typeof DEFAULTS[k];
        if (want === 'number' && typeof v === 'number' && isFinite(v)) out[k] = v;
        else if (want === 'boolean' && typeof v === 'boolean') out[k] = v;
        else if (want === 'string' && typeof v === 'string') out[k] = v;
      });
    }
    Object.keys(ENUMS).forEach(function (k) {
      if (ENUMS[k].indexOf(out[k]) === -1) out[k] = DEFAULTS[k];
    });

    /* 数值区间不另建表：直接从面板上那个 range 控件读 min / max ——
       滑杆的区间就是唯一事实来源，以后改滑杆范围，这里自动跟上。
       少了这一步，一份手改过的 JSON 能塞进 fontSize:1e9，导出的 CSS 直接废掉。 */
    document.querySelectorAll('input[type="range"][data-key]').forEach(function (el) {
      const k = el.dataset.key;
      if (typeof out[k] !== 'number') return;
      const min = parseFloat(el.min);
      const max = parseFloat(el.max);
      if (isFinite(min) && out[k] < min) out[k] = min;
      if (isFinite(max) && out[k] > max) out[k] = max;
    });

    /* 文本按控件自身的 maxlength 截断，存档里塞不进超长串 */
    document.querySelectorAll('input[type="text"][data-key]').forEach(function (el) {
      const k = el.dataset.key;
      const max = parseInt(el.getAttribute('maxlength'), 10);
      if (typeof out[k] === 'string' && isFinite(max) && out[k].length > max) {
        out[k] = out[k].slice(0, max);
      }
    });

    return out;
  }

  /* ---------------- 本地存档 ---------------- */

  const savePill     = document.getElementById('savePill');
  const savePillText = document.getElementById('savePillText');
  const undoBtn      = document.getElementById('undoBtn');
  const redoBtn      = document.getElementById('redoBtn');
  const shareBtn     = document.getElementById('shareBtn');

  let saveTimer = null;

  function setSavePill(saved) {
    if (!savePill) return;
    savePill.classList.toggle('is-idle', !saved);
    savePillText.textContent = saved ? '已保存' : '保存中';
  }

  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch (e) { /* 隐私模式 / 配额满：静默降级，功能照用 */ }
    setSavePill(true);
  }

  function saveStateSoon() {
    setSavePill(false);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; saveState(); }, 300);
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return sanitize(JSON.parse(raw));
    } catch (e) { return null; }
  }

  /* ---------------- 撤销 / 重做 ----------------
     拖滑杆、连续打字都会连续触发 input：静默 420ms 才记一条，
     否则一次拖动就塞进几十条历史，撤销按到手酸。
     离散操作（切模式 / 预设 / 随机 / 重置 / 导入）立即记。 */

  let hist = [];
  let hIdx = -1;
  let histLock = false;
  let histTimer = null;

  function syncHistBtns() {
    if (undoBtn) undoBtn.disabled = hIdx <= 0;
    if (redoBtn) redoBtn.disabled = hIdx >= hist.length - 1;
  }

  function pushHistory() {
    if (histLock) return;
    const now = JSON.stringify(state);
    if (hIdx >= 0 && hist[hIdx] === now) return;
    hist = hist.slice(0, hIdx + 1);
    hist.push(now);
    if (hist.length > HIST_MAX) hist.shift();
    hIdx = hist.length - 1;
    syncHistBtns();
  }

  function scheduleHistory() {
    if (histTimer) clearTimeout(histTimer);
    histTimer = setTimeout(function () { histTimer = null; pushHistory(); }, 420);
  }

  function flushHistory() {
    if (histTimer) { clearTimeout(histTimer); histTimer = null; }
    pushHistory();
  }

  function applyHistory(str) {
    histLock = true;
    state = sanitize(JSON.parse(str));
    syncTabs();
    render();
    histLock = false;
  }

  function undo() {
    if (hIdx <= 0) return;
    hIdx -= 1;
    applyHistory(hist[hIdx]);
    syncHistBtns();
  }

  function redo() {
    if (hIdx >= hist.length - 1) return;
    hIdx += 1;
    applyHistory(hist[hIdx]);
    syncHistBtns();
  }

  /* ---------------- modebar 增强 ----------------
     原标签栏的短板：中文排版照搬英文大写那套、没有 tab 语义、
     没有键盘导航、窄屏换行把预览挤下去、没有 tip、没有焦点样式。 */

  /* 款式数不写死在 HTML 里 —— 常量表才是唯一事实源，
     以后给某个组件加了新款式，徽标自动跟上。 */

  function modeStyleCount(mode) {
    const T = { button: BTN_STYLES, card: CARD_STYLES, checkbox: CB_STYLES,
                switch: SW_STYLES, input: IN_STYLES, badge: BD_STYLES,
                radio: RD_STYLES, progress: PG_STYLES, slider: SL_STYLES,
                select: SE_STYLES, table: TB_STYLES, nav: NV_STYLES,
                tabs: TS_STYLES }[mode];
    return T ? Object.keys(T).length : 0;
  }

  function enhanceModebar() {
    document.querySelectorAll('.mode-tab').forEach(function (tab) {
      const mode = tab.dataset.mode;
      const name = tab.textContent.trim();
      const n = modeStyleCount(mode);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'preview');
      if (n) tab.setAttribute('title', name + ' · ' + n + ' 款变体');
      tab.innerHTML = '<span class="mode-tab__label">' + esc(name) + '</span>' +
                      '<span class="mode-tab__n" aria-hidden="true">' + n + '</span>';
    });
  }

  /* 切模式收成一个函数：点击、方向键、数字键三条路都走它，
     免得三处各写一遍 state.mode/syncTabs/render/flushHistory。 */

  function setMode(mode) {
    if (!mode || mode === state.mode) return;
    if (MODES.indexOf(mode) === -1) return;
    state.mode = mode;
    syncTabs();
    render();
    flushHistory();
  }

  function syncTabs() {
    let active = null;
    document.querySelectorAll('.mode-tab').forEach(function (t) {
      const on = t.dataset.mode === state.mode;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      /* roving tabindex：一组 tab 只占 Tab 键的一次停留，组内用方向键走。
         十个标签都留 tabindex=0 的话，光路过标签栏就要按十下 Tab。 */
      t.tabIndex = on ? 0 : -1;
      if (on) active = t;
    });
    /* 标签栏溢出时把当前项滚进视野 */
    if (active && active.parentElement) {
      const bar = active.parentElement;
      const br = bar.getBoundingClientRect();
      const tr = active.getBoundingClientRect();
      if (tr.left < br.left) bar.scrollLeft -= (br.left - tr.left) + 10;
      else if (tr.right > br.right) bar.scrollLeft += (tr.right - br.right) + 10;
    }
  }

  /* ---------------- 分享链接 ----------------
     状态编成 URL-safe base64 挂在 # 后面。
     TextEncoder 而不是 escape()：中文描述文字也能安全往返。 */


  function toB64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }


  function fromB64(s) {
    let b = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    const bin = atob(b);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }


  function shareLink() {
    const code = toB64(JSON.stringify(state));
    const url  = location.href.split('#')[0] + '#' + code;
    try { history.replaceState(null, '', '#' + code); } catch (e) { /* file:// 下可能受限 */ }
    copyText(url, shareBtn);
    toast('分享链接已复制');
  }

  /* ---------------- 提示条 ---------------- */

  let toastTimer = null;


  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 1800);
  }

  /* ---------------- 导出 / 导入 ---------------- */


  function downloadFile(name, text, mime) {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  /* 导出的是「单个组件」而不是五态矩阵 —— 预览区那套 .mx-* 只是工具自带的外壳 */

  function exportHTML() {
    const css = view.minify ? minifyCSS(buildCSS(state)) : buildCSS(state);
    const one = view.minify ? minifyHTML(buildHTML(state)) : buildHTML(state);
    /* 整页是纵向长页面，不能像单个组件那样在 body 里垂直居中 */
    const bodyWrap = (state.mode === 'page')
      ? 'body{margin:0;padding:40px 16px;background:#f7f4ec;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;}'
      : 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
        'padding:40px;background:#f7f4ec;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;}';
    const doc =
      '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>Brutalist ' + state.mode + '</title>\n' +
      '<style>\n' +
      bodyWrap + '\n' +
      '</style>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + one + '\n<script>\n' + (view.minify ? (SELECT_JS + '\n' + SLIDER_JS + '\n' + TABS_JS).replace(/\n[ \t]+/g, '\n') : (SELECT_JS + '\n' + SLIDER_JS + '\n' + TABS_JS)) + '\n<\/script>\n</body>\n</html>\n';
    downloadFile('brutalist-' + state.mode + '.html', doc, 'text/html');
    toast('已导出独立 HTML');
  }

  function exportJSON() {
    downloadFile('brutalist-' + state.mode + '.json',
                 JSON.stringify(state, null, 2), 'application/json');
    toast('已导出配置');
  }

  function importJSON(file) {
    const fr = new FileReader();
    fr.onload = function () {
      try {
        state = sanitize(JSON.parse(String(fr.result)));
        syncTabs();
        render();
        flushHistory();
        toast('配置已导入');
      } catch (e) { toast('配置文件读不出来'); }
    };
    fr.readAsText(file);
  }

  /* ---------------- 绑定 ---------------- */

  if (shareBtn) shareBtn.addEventListener('click', shareLink);
  if (undoBtn)  undoBtn.addEventListener('click', undo);
  if (redoBtn)  redoBtn.addEventListener('click', redo);
  document.getElementById('exportHtmlBtn').addEventListener('click', exportHTML);
  document.getElementById('exportJsonBtn').addEventListener('click', exportJSON);
  document.getElementById('importJsonBtn').addEventListener('click', function () {
    document.getElementById('importFile').click();
  });
  /* 自定义下拉 + 滑块交互：预览区生效（事件委托只绑一次）；导出的独立 HTML 也内联同一份 */
  (function () { var sc = document.createElement('script'); sc.textContent = SELECT_JS + '\n' + SLIDER_JS + '\n' + TABS_JS; document.body.appendChild(sc); })();

  document.getElementById('importFile').addEventListener('change', function (e) {
    const f = e.target.files && e.target.files[0];
    if (f) importJSON(f);
    e.target.value = '';
  });

  /* 输入框里放行浏览器原生撤销，否则打字时按 Ctrl+Z 会变成「回退整个组件」 */
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = (e.key || '').toLowerCase();
    const t = e.target;
    const typing = !!t && (t.tagName === 'TEXTAREA' ||
      (t.tagName === 'INPUT' &&
        ['text', 'search', 'url', 'email', 'tel', 'password', 'number'].indexOf(t.type) !== -1));
    if (typing && k === 'z') return;
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
  });

  /* 让预设 chip 本身显示自己的配底色（像演示那样直接上色）：
     默认 = 该 preset 的底色/文字/描边；悬停 = 反白表态；选中 = 荧光黄高亮。
     用注入的 <style>（比 base.css 后加载）统一接管，颜色数据仍只维护在 PRESETS。 */
  function addPresetChipColors() {
    const rules = [];
    document.querySelectorAll('.presets .chip[data-preset]').forEach(function (b) {
      const p = PRESETS[b.getAttribute('data-preset')];
      if (!p || !p.bg) return;
      const s = b.getAttribute('data-preset');
      const fg = p.color || '#0a0a0a';
      const bc = p.borderColor || fg;
      rules.push('.chip[data-preset="' + s + '"]{background:' + p.bg + ';color:' + fg + ';border-color:' + bc + '}');
      rules.push('.chip[data-preset="' + s + '"]:hover{background:' + bc + ';color:' + p.bg + ';border-color:' + bc + '}');
      rules.push('.chip[data-preset="' + s + '"].is-on{background:#ffe44d;color:#141414;border-color:#141414}');
    });
    if (!rules.length) return;
    const st = document.createElement('style');
    st.textContent = rules.join('\n');
    document.head.appendChild(st);
  }

  function boot() {
    let loaded = null;
    let fromHash = false;
    const hash = String(location.hash || '').replace(/^#/, '');

    if (hash) {
      try { loaded = sanitize(JSON.parse(fromB64(hash))); fromHash = true; }
      catch (e) { loaded = null; }
    }
    if (!loaded) loaded = loadSaved();

    loadView();

    if (loaded) state = loaded;
    enhanceModebar();
    addPresetChipColors();   /* 等 buildChrome 把各组件的预设 chip 也注进来后再上色 */
    syncTabs();
    syncViewChips();
    render();
    pushHistory();

    if (fromHash)    toast('已从分享链接载入');
    else if (loaded) toast('已恢复上次设置');
  }

  function loadView() {
    try {
      const raw = localStorage.getItem(VIEW_KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return;
      if (PV_BGS.indexOf(o.previewBg) !== -1)   view.previewBg = o.previewBg;
      if (PV_DEVS.indexOf(o.devW) !== -1)       view.devW = o.devW;
      if (typeof o.codeHL === 'boolean')        view.codeHL = o.codeHL;
      if (typeof o.minify === 'boolean')        view.minify = o.minify;
    } catch (e) { /* 坏存档就用默认 */ }
  }

  function saveView() {
    try { localStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch (e) { /* noop */ }
  }

  function applyView() {
    preview.classList.remove('pv-grid', 'pv-light', 'pv-dark', 'pv-checker');
    preview.classList.add('pv-' + view.previewBg);

    if (view.devW) {
      preview.classList.add('is-dev');
      preview.style.setProperty('--dev-w', view.devW + 'px');
      preview.setAttribute('data-dev', view.devW + 'px');
    } else {
      preview.classList.remove('is-dev');
      preview.style.removeProperty('--dev-w');
      preview.removeAttribute('data-dev');
    }
  }

  function syncViewChips() {
    document.querySelectorAll('[data-pvbg]').forEach(function (b) {
      b.classList.toggle('is-on', b.dataset.pvbg === view.previewBg);
    });
    document.querySelectorAll('[data-dev]').forEach(function (b) {
      b.classList.toggle('is-on', Number(b.dataset.dev) === view.devW);
    });
    const hl = document.getElementById('vCodeHL');
    const mf = document.getElementById('vMinify');
    if (hl) hl.checked = view.codeHL;
    if (mf) mf.checked = view.minify;
  }

  /* ---------------- 语法高亮 ----------------
     不引任何 CDN：一次正则扫描 + 按位置补上「没匹配到的间隙」，
     这样输出文本与原文逐字节等长（textContent 仍等于原文）。 */

  function escTok(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* 分组：1 注释 / 2 自定义属性 / 3 @规则 / 4 十六进制色 / 5 字符串 /
           6 选择器 / 7 符号 / 8 数字 / 9 分组符号 / 10 标识符
     选择器那组必须排在标点组前面，否则 :hover 会被拆成 ":" + "hover" */
  const CSS_TOK = /(\/\*[\s\S]*?\*\/)|(--[a-zA-Z][\w-]*)|(@[a-zA-Z-]+)|(#[0-9a-fA-F]{3,8}\b)|("(?:[^"\\]|\\.)*"|'[^']*')|(::?[a-zA-Z-]+(?:\([^()]*\))?|\.[a-zA-Z_][\w-]*|&)|([\[\]*\/>~+=!])|(\d+(?:\.\d+)?(?:px|%|em|rem|ms|s|deg|fr|vh|vw|ch)?)|([,{}():;])|([a-zA-Z-]+)/g;

  function hlCSS(src) {
    let out = '';
    let last = 0;
    let m;
    CSS_TOK.lastIndex = 0;
    while ((m = CSS_TOK.exec(src)) !== null) {
      out += escTok(src.slice(last, m.index));
      const t = m[0];
      let cls;
      if (m[1])      cls = 'c-com';
      else if (m[2]) cls = 'c-var';
      else if (m[3]) cls = 'c-at';
      else if (m[4]) cls = 'c-num';
      else if (m[5]) cls = 'c-val';
      else if (m[6]) cls = 'c-sel';
      else if (m[7]) cls = 'c-pun';
      else if (m[8]) cls = 'c-num';
      else if (m[9]) cls = 'c-pun';
      else {
        /* 标识符：后面紧跟冒号就是属性名，否则是关键字值 */
        const rest = src.slice(m.index + t.length);
        cls = /^\s*:/.test(rest) ? 'c-prop' : 'c-key';
      }
      out += '<span class="' + cls + '">' + escTok(t) + '</span>';
      last = m.index + t.length;
    }
    out += escTok(src.slice(last));
    return out;
  }

  const TAG_TOK = /("[^"]*")|(\/?>)|(<)|([a-zA-Z][\w-]*)|(=)|(\s+)|(.)/g;

  function hlTag(tag) {
    if (tag.slice(0, 4) === '<!--') return '<span class="c-com">' + escTok(tag) + '</span>';
    let out = '';
    let m;
    let first = true;   /* 紧跟 < 的第一个标识符是标签名，其后的都是属性名 */
    TAG_TOK.lastIndex = 0;
    while ((m = TAG_TOK.exec(tag)) !== null) {
      const t = m[0];
      if (m[1])      out += '<span class="c-val">' + escTok(t) + '</span>';
      else if (m[2] || m[3]) { out += '<span class="c-pun">' + escTok(t) + '</span>'; first = true; }
      else if (m[4]) { out += '<span class="' + (first ? 'c-tag' : 'c-attr') + '">' + escTok(t) + '</span>'; first = false; }
      else if (m[5]) out += '<span class="c-pun">' + escTok(t) + '</span>';
      else           out += escTok(t);
    }
    return out;
  }

  function hlHTML(src) {
    let out = '';
    let last = 0;
    let m;
    const re = /<[^>]*>/g;
    while ((m = re.exec(src)) !== null) {
      out += escTok(src.slice(last, m.index));
      out += hlTag(m[0]);
      last = m.index + m[0].length;
    }
    out += escTok(src.slice(last));
    return out;
  }

  /* 代码区的 raw / 高亮写入已收敛到 render.js 的 scheduleCodeRefresh/刷新逻辑 */

  /* ---------------- 压缩 ----------------
     刻意只做「安全压缩」：去注释、去换行缩进、收掉分隔符周围空白。
     不做 token 级重写 —— 生成的 CSS 里有 clip-path 的 polygon(38% 0, ...)，
     那种值里面的空格是有意义的。 */

  function minifyCSS(css) {
    /* 手写压缩器。三条铁律：
       1) 只做「删空白」与「等价改写」，绝不动 token 本身；
       2) 先把所有空白统一压成单空格，再删标点旁的空白。
          直接按换行删除会把 `1fr\n2fr` 粘成 `1fr2fr` —— 那是真事故；
       3) polygon() / calc() 里坐标之间的空格有意义，只删「标点旁」的空白，
          坐标之间的空格原样保留，否则形状会塌。 */
    return String(css)
      .replace(/\/\*[\s\S]*?\*\//g, '')          /* 去注释 */
      .replace(/\s+/g, ' ')                      /* 空白统一压成单空格（token 安全） */
      .replace(/\s*([{};:,])\s*/g, '$1')          /* 标点两侧去空白（含逗号） */
      .replace(/;}/g, '}')                       /* 块尾多余分号 */
      /* 四值 padding / margin 折叠成两值：16px 30px 16px 30px -> 16px 30px */
      .replace(/(^|[;{])((?:padding|margin)(?:-(?:top|right|bottom|left))?):([^;{}]+)/g,
        function (m, pre, prop, val) {
          const p = val.trim().split(/\s+/);
          if (p.length === 4 && p[0] === p[2] && p[1] === p[3]) {
            return pre + prop + ':' + p[0] + ' ' + p[1];
          }
          return m;
        })
      .replace(/\b0(?:px|em|rem|pt|pc|in|cm|mm|ex|ch|q)\b/g, '0')  /* 零值去单位 */
      .replace(/(^|[^\d.])0\.(\d)/g, '$1.$2')   /* 0.12em -> .12em */
      .trim();
  }

  function minifyHTML(h) {
    return String(h).replace(/\n[ \t]*/g, '').trim();
  }

  /* ---------------- 全屏预览 ----------------
     整页（或当前组件）在固定预览面板里会被压缩得很小。这里提供一个
     无干扰的全屏浮层：只渲染生成的 HTML + 其 CSS，其余工作台元素一概不出。 */

  const FULLPAGE_CSS = [
    '.pv-full{position:fixed;inset:0;z-index:9999;background:#f7f4ec;overflow:auto;' +
      'padding:16px 24px 72px;box-sizing:border-box;display:none;}',
    '.pv-full.is-open{display:block;}',
    '.pv-full__bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;' +
      'justify-content:space-between;gap:12px;margin-bottom:20px;}',
    '.pv-full__tools{display:flex;gap:8px;}',
    '.pv-full__act{font-family:var(--study-font-sans, ui-monospace, Menlo, Consolas, monospace);' +
      'font-weight:800;font-size:11px;letter-spacing:.08em;text-transform:uppercase;' +
      'color:#fff;background:#141414;border:2px solid #141414;padding:10px 14px;cursor:pointer;' +
      'box-shadow:3px 3px 0 rgba(20,20,20,.35);}',
    '.pv-full__act:hover{background:#ffe44d;color:#141414;border-color:#141414;}',
    '.pv-full__act:active{transform:translate(2px,2px);box-shadow:none;}',
    '.pv-full__title{font-family:var(--study-font-sans, ui-monospace, Menlo, Consolas, monospace);' +
      'font-weight:800;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#222;}',
    '.pv-full__close{width:46px;height:46px;border-radius:999px;border:2px solid #141414;' +
      'background:#f7f4ec;color:#141414;cursor:pointer;padding:0;display:flex;align-items:center;' +
      'justify-content:center;box-shadow:3px 3px 0 #141414;font-size:0;}',
    '.pv-full__close svg{width:20px;height:20px;stroke:#141414;fill:none;' +
      'stroke-width:2.4;stroke-linecap:square;}',
    '.pv-full__close:hover{background:#ffe44d;}',
    '.pv-full__close:active{transform:translate(2px,2px);box-shadow:none;}',
    '.pv-full__wrap{max-width:1200px;margin:0 auto;}',
    '.pv-full__wrap .brutal-page{margin:0 auto;}',
    'body.no-scroll-full{overflow:hidden;}'
  ].join('\n');

  function isFullpageOpen() {
    const ov = document.getElementById('pv-full');
    return !!(ov && ov.classList.contains('is-open'));
  }

  /* 重建全屏浮层里的页面（不需要重建外围框架）。
     随机 / 重置后调用，让全屏里的配色也跟着变。 */
  function renderFullpage() {
    const ov = document.getElementById('pv-full');
    if (!ov || !isFullpageOpen()) return;
    const wrap = ov.querySelector('.pv-full__wrap');
    const cssEl = document.createElement('style');
    cssEl.textContent = FULLPAGE_CSS + '\n' +
      (view.minify ? minifyCSS(buildCSS(state)) : buildCSS(state));
    wrap.innerHTML = buildHTML(state);
    wrap.insertBefore(cssEl, wrap.firstChild);
    /* 重新让整页里的标签页 / 下拉框等恢复交互 */
    try { (new Function(TABS_JS))(); } catch (e) { /* 增强交互失败不回退 */ }
    ov.scrollTop = 0;
  }

  function openFullpage() {
    let ov = document.getElementById('pv-full');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'pv-full';
      ov.className = 'pv-full';
      ov.innerHTML =
        '<div class="pv-full__bar">' +
        '<div class="pv-full__tools">' +
        '<button class="pv-full__act" id="pvFullRandom" type="button" title="随机组合配色与内容">随机</button>' +
        '<button class="pv-full__act" id="pvFullReset" type="button" title="重置该模式默认">重置</button>' +
        '</div>' +
        '<span class="pv-full__title">全屏预览</span>' +
        '<button class="pv-full__close" type="button" title="关闭（Esc）" aria-label="关闭预览">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4 L20 20 M20 4 L4 20"/></svg>' +
        '</button></div>' +
        '<div class="pv-full__wrap"></div>';
      ov.querySelector('.pv-full__close').addEventListener('click', function (e) {
        e.stopPropagation(); closeFullpage();
      });
      ov.querySelector('#pvFullRandom').addEventListener('click', function (e) {
        e.stopPropagation(); randomize();
      });
      ov.querySelector('#pvFullReset').addEventListener('click', function (e) {
        e.stopPropagation(); reset();
      });
      ov.addEventListener('click', function (e) { if (e.target === ov) closeFullpage(); });
      document.body.appendChild(ov);
    }
    renderFullpage();
    ov.classList.add('is-open');
    document.body.classList.add('no-scroll-full');
    ov.querySelector('.pv-full__close').focus();
  }

  function closeFullpage() {
    const ov = document.getElementById('pv-full');
    if (ov) ov.classList.remove('is-open');
    document.body.classList.remove('no-scroll-full');
  }

  /* ---------------- 绑定 ---------------- */

  document.querySelectorAll('[data-pvbg]').forEach(function (b) {
    b.addEventListener('click', function () {
      view.previewBg = b.dataset.pvbg;
      saveView(); syncViewChips(); render();
    });
  });

  document.querySelectorAll('[data-dev]').forEach(function (b) {
    b.addEventListener('click', function () {
      view.devW = Number(b.dataset.dev);
      saveView(); syncViewChips(); render();
    });
  });

  document.getElementById('vCodeHL').addEventListener('change', function (e) {
    view.codeHL = e.target.checked;
    saveView(); render();
  });

  document.getElementById('vMinify').addEventListener('change', function (e) {
    view.minify = e.target.checked;
    saveView(); render();
  });

  var fpBtn = document.getElementById('fullpageBtn');
  if (fpBtn) fpBtn.addEventListener('click', openFullpage);

  /* 全屏预览时按 Esc 关闭（叠加在全局按键之上，不影响其它快捷键） */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeFullpage();
  });

  /* =========================================================
     顶栏
     ========================================================= */

  document.getElementById('randomBtn').addEventListener('click', randomize);
  document.getElementById('resetBtn').addEventListener('click', reset);

/* ---------------- 事件委托：动态面板 + 模式栏 ---------------- */
function onPanelInput(e) {
  const el = e.target;
  const key = el && el.dataset && el.dataset.key;
  if (!key) return;
  let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (el.type === 'range') v = parseFloat(el.value);
  else v = el.value;
  state[key] = v;
  render();
  scheduleHistory();
}
document.getElementById('panel').addEventListener('input', onPanelInput);

/* 预设：事件委托（各模式面板是运行时注入的，静态绑定抓不到它们） */
document.getElementById('panel').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  const preset = PRESETS[btn.dataset.preset];
  if (!preset) return;
  const mode = state.mode;
  const showMatrix = !!state.showMatrix;   /* 五态矩阵是视图偏好，切预设别把它顺带改回默认 */
  state = sanitize(Object.assign({}, preset, { mode: mode, showMatrix: showMatrix }));
  render();
  flushHistory();
});

document.getElementById('modebar').addEventListener('click', function (e) {
  const tab = e.target.closest('.mode-tab');
  if (tab) setMode(tab.dataset.mode);
});

/* 标签栏键盘导航 */
(function bindModeKeys() {
  const bar = document.getElementById('modebar');
  bar.addEventListener('keydown', function (e) {
    const tabs = Array.prototype.slice.call(bar.querySelectorAll('.mode-tab'));
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMode(tabs[i].dataset.mode); return; }
    else return;
    e.preventDefault();
    tabs[n].focus();
    setMode(tabs[n].dataset.mode);
  });
})();

/* 数字键 1~9 / 0 直跳模式 */
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
            t.tagName === 'SELECT' || t.isContentEditable)) return;
  if (!/^[0-9]$/.test(e.key)) return;
  const mode = MODES[e.key === '0' ? 9 : Number(e.key) - 1];
  if (!mode) return;
  e.preventDefault();
  setMode(mode);
});

/* 用 registry 动态生成模式栏与每模式的控制分组 */
(function buildChrome() {
  const bar = document.getElementById('modebar');
  const host = document.getElementById('modePanels');
  MODES.forEach(function (m) {
    const c = COMPONENTS[m];
    const b = document.createElement('button');
    b.className = 'mode-tab' + (m === state.mode ? ' active' : '');
    b.type = 'button';
    b.dataset.mode = m;
    b.textContent = c ? c.label : m;
    bar.appendChild(b);

    if (c && c.panel) {
      const sec = document.createElement('section');
      sec.className = 'group';
      sec.setAttribute('data-modes', m);
      sec.innerHTML = c.panel;
      host.appendChild(sec);
    }
  });
})();

/* 启动 */
boot();
