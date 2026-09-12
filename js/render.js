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

    /* 代码区可能被压缩 / 高亮，但复制与导出永远拿 dataset.raw 这份原文 */
    setCode(htmlCode, view.minify ? minifyHTML(one) : one, 'html');
    setCode(cssCode,  view.minify ? minifyCSS(css)  : css,  'css');

    textLabel.textContent = TEXT_LABELS[state.mode] || '文字';
    updateVisibility();
    syncUI();
    saveStateSoon();
  }

  /* =========================================================
     事件 · 控件
     ========================================================= */

  document.querySelectorAll('[data-key]').forEach(function (el) {
    const key = el.dataset.key;

    el.addEventListener('input', function () {
      let v;
      if (el.type === 'checkbox')      v = el.checked;
      else if (el.type === 'range')    v = parseFloat(el.value);
      else                             v = el.value;

      state[key] = v;
      render();
      scheduleHistory();
    });
  });

  /* =========================================================
     事件 · 模式切换
     ========================================================= */

  document.querySelectorAll('.mode-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { setMode(tab.dataset.mode); });
  });

  /* 标签栏键盘导航：方向键在组内移动并即时切换，Home / End 跳首尾。 */
  (function bindModeKeys() {
    const bar = document.querySelector('.modebar');
    if (!bar) return;
    bar.addEventListener('keydown', function (e) {
      const tabs = Array.prototype.slice.call(bar.querySelectorAll('.mode-tab'));
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;

      let n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')   n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home')                             n = 0;
      else if (e.key === 'End')                              n = tabs.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setMode(tabs[i].dataset.mode);
        return;
      } else return;

      e.preventDefault();
      tabs[n].focus();
      setMode(tabs[n].dataset.mode);
    });
  })();

  /* 数字键 1~9 / 0 直跳模式。面板里有几十个输入控件 ——
     在输入框、下拉里按数字是在打字，绝不能抢。 */
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

  /* =========================================================
     随机 / 重置
     ========================================================= */

