/* ===== render.js · 渲染分派（注册表驱动） ===== */
'use strict';
/* 各组件文件登记完成后，汇总出 MODES/DEFAULTS/ENUMS/ROOT_SEL */
deriveConfig();

/* buildCSS：注册表分派，天然覆盖所有模式（含 alert/table/nav/tabs） */
function buildCSS(s) {
  const c = COMPONENTS[s.mode];
  let L = c ? c.css(s) : cssButton(s);
  L = stateAliases(L);
  return L.concat(universalStates(s)).join('\n');
}

/* buildHTML：注册表分派 */
function buildHTML(s) {
  const c = COMPONENTS[s.mode];
  return c ? c.build(s) : '';
}

  function withState(html, cls, idx) {
    let h = html;
    /* 单选组要靠 name 成组；五态矩阵会在同一页里摆 5 份同样的组件，
       同名就变成一个 15 个选项的大组，只有最后一份的 checked 生效 ——
       所以进矩阵时给每份的 name 加个下标，各自成组。 */
    if (idx !== undefined && idx !== null) {
      h = h.replace(/\bname="([^"]*)"/g, function (m, n) {
        return 'name="' + n + '-' + idx + '"';
      });
    }
    if (!cls) return h;
    /* 给根元素挂状态类（矩阵靠它命中派生出来的 .is-* 规则） */
    h = h.replace(/class="([^"]*)"/, function (m, c) {
      return 'class="' + c + ' ' + cls + '"';
    });
    h = h.replace(/<input\b([^>]*)>/, function (m, a) {
      return /\bclass="/.test(a) ? m : '<input' + a + ' class="' + cls + '">';
    });
    return h;
  }

  /* 矩阵只摆「这个组件真的有」的状态：
     badge / switch 这类没有 :hover 规则的组件，硬塞一个"悬停"格子只会让人困惑。
     判据就是生成的 CSS 里到底有没有这条别名规则 —— 不猜，直接查。 */

  function matrixStates(css) {
    return MX_STATES.filter(function (st) {
      return !st.cls || css.indexOf(st.cls) >= 0;
    });
  }


  function matrixHTML(s, one, css) {
    const states = matrixStates(css);
    let h = '<div class="mx-grid mx-grid--' + s.mode + '" data-states="' + states.length + '">\n';
    states.forEach(function (st, i) {
      h += '  <div class="mx-cell">\n';
      h += '    <div class="mx-stage">' + withState(one, st.cls, i) + '</div>\n';
      h += '    <span class="mx-label">' + st.label + '</span>\n';
      h += '  </div>\n';
    });
    h += '</div>';
    return h;
  }

  /* =========================================================
     同步 UI
     ========================================================= */


  function syncUI() {
    document.querySelectorAll('[data-key]').forEach(function (el) {
      if (document.activeElement === el) return;
      const key = el.dataset.key;
      const v = state[key];
      if (el.type === 'checkbox') {
        el.checked = !!v;
      } else if (el.value !== String(v)) {
        el.value = v;
      }
    });

    document.querySelectorAll('[data-out]').forEach(function (el) {
      const key = el.dataset.out;
      let v = state[key];
      if (typeof v === 'number' && !Number.isInteger(v)) v = v.toFixed(1);
      el.textContent = v;
    });
  }

  /* =========================================================
     可见性
     ========================================================= */


  function updateVisibility() {
    document.querySelectorAll('[data-modes]').forEach(function (el) {
      const modes = el.dataset.modes.split(/\s+/);
      el.style.display = modes.indexOf(state.mode) !== -1 ? '' : 'none';
    });
  }

  /* =========================================================
     渲染
     ========================================================= */

  /* ---------------- 预览区左上角的纹理标签 ----------------
     注意：必须放在 preview.innerHTML = html 之后重建，
     否则静态写在 HTML 里的 #patternTag 会被整块覆盖掉 */

  function renderPatternTag() {
    const old = document.getElementById('patternTag');
    if (old) old.remove();

    const tag = document.createElement('div');
    tag.className = 'pattern-tag';
    tag.id = 'patternTag';

    const sw = document.createElement('span');
    sw.className = 'pattern-tag__sw';
    sw.style.backgroundColor = state.bg;
    const p = getPattern(state, 0.45);   /* 缩略图用更深的墨色才看得清 */
    if (p) {
      sw.style.backgroundImage = p.image;
      sw.style.backgroundSize  = p.size;
    }

    const txt = document.createElement('span');
    txt.textContent = PATTERN_LABELS[state.pattern] || state.pattern;

    tag.appendChild(sw);
    tag.appendChild(txt);
    preview.appendChild(tag);
  }


  /* 代码区是「只读派生」，无需每帧都重跑语法高亮。
     raw 原文始终同步写入（复制拿它，永远最新）；
     高亮用 rAF 合并到一帧内、按元素只算最新一份。
     复制按钮点下去前会先 flushCodeRefresh() 冲掉挂起的高亮，所见即所得。 */
  let _codeHLFrame = 0;
  let _codeHLPending = [];

  function _codeHLFlush() {
    _codeHLFrame = 0;
    if (!_codeHLPending.length) return;
    const byId = {};
    _codeHLPending.forEach(function (it) { byId[it.el.id] = it; });
    _codeHLPending = [];
    Object.keys(byId).forEach(function (id) {
      const it = byId[id];
      it.el.innerHTML = (it.lang === 'css' ? hlCSS : hlHTML)(it.text);
    });
  }

  function scheduleCodeRefresh(el, text, lang) {
    el.dataset.raw = text;              /* 原文永远同步，复制安全 */
    el.textContent = text;
    if (!view.codeHL) return;          /* 不启用高亮时无需排队 */
    _codeHLPending.push({ el: el, text: text, lang: lang });
    if (_codeHLFrame) return;
    _codeHLFrame = requestAnimationFrame(_codeHLFlush);
  }

  function flushCodeRefresh() {
    if (_codeHLFrame) cancelAnimationFrame(_codeHLFrame);
    _codeHLFlush();
  }

  function render() {
    const one = buildHTML(state);
    const css = buildCSS(state);

    /* 预览区：五态矩阵 或 单个组件；导出的永远是单个组件。
       统一套一层 .pv-canvas，设备宽度模拟才有东西可以夹住。 */
    const inner = state.showMatrix ? matrixHTML(state, one, css) : one;
    preview.innerHTML = '<div class="pv-canvas">' + inner + '</div>';
    applyView();
    renderPatternTag();
    genStyle.textContent = css;

    scheduleCodeRefresh(htmlCode, view.minify ? minifyHTML(one) : one, 'html');
    scheduleCodeRefresh(cssCode,  view.minify ? minifyCSS(css)  : css,  'css');

    textLabel.textContent = TEXT_LABELS[state.mode] || '文字';
    updateVisibility();
    syncUI();
    saveStateSoon();
  }

  /* =========================================================
     事件绑定统一收敛到 app.js，避免重复绑定触发两次：
       - 控件 input 走 panel 事件委托（onPanelInput）
       - 模式切换走 modebar 事件委托
       - 键盘导航（方向键 / 数字键）绑定在 app.js
     render.js 不再逐元素 / 逐监听绑定。
     ========================================================= */

