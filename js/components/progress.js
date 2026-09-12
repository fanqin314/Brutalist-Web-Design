/* ===== components/progress.js ===== */

  function cssProgress(s) {
    const style  = PG_STYLES[s.pgStyle] ? s.pgStyle : 'slab';
    const pattern = getPattern(s);
    const bw     = Math.max(0, s.borderWidth);
    const v      = Math.max(0, Math.min(100, Number(s.pgValue) || 0));
    const w      = Math.max(160, s.pgW || 320);
    const h      = Math.max(8, s.pgH || 26);
    const shadow = shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor);
    const hs     = hasShadow(s);
    const hoverS = hoverShadow(s);
    const ink    = hexToRgba(s.color, 0.45);
    const ease   = 'cubic-bezier(.34, 1.56, .64, 1)';
    const seg    = Math.max(8, Math.round(h * 0.85));      /* 分段格宽 */
    const notch  = Math.max(6, Math.round(h * 0.5));       /* 箭头伸出量 */
    const gap1   = Math.max(3, Math.round(bw * 1.2));      /* 双线内框间距 */
    const roundPill = (style === 'pill');                  /* 胶囊：整条轨道切成半圆头 */

    /* 填充层纹理（叠在填充色之上） */
    const fImg = [], fSize = [];
    if (style === 'stripe') {
      fImg.push('repeating-linear-gradient(45deg, transparent 0 5px, ' +
                hexToRgba(s.color, 0.32) + ' 5px 10px)');
      fSize.push('auto');
    } else if (style === 'segment') {
      fImg.push('repeating-linear-gradient(90deg, transparent 0 ' + (seg - Math.max(1, bw)) +
                'px, ' + s.borderColor + ' ' + (seg - Math.max(1, bw)) + 'px ' + seg + 'px)');
      fSize.push('auto');
    } else if (style === 'chevron') {
      /* 人字斜纹：方向取 135deg（stripe 是 45deg）、条更粗、间距更疏 —— 与 stripe 一眼可分 */
      fImg.push('repeating-linear-gradient(135deg, ' + hexToRgba(s.color, 0.42) +
                ' 0 7px, transparent 7px 16px)');
      fSize.push('auto');
    }
    if (pattern) { fImg.push(pattern.image); fSize.push(pattern.size); }

    /* 轨道自身的纹理（tick 的刻度线画在填充之上，所以走 ::after） */
    const segLine = 'repeating-linear-gradient(90deg, transparent 0 ' + (seg - 2) + 'px, ' +
                    ink + ' ' + (seg - 2) + 'px ' + seg + 'px)';
    /* grid 用横竖两层叠加出网格：90deg 出竖线，0deg 出横线 */
    const gridLine = 'repeating-linear-gradient(0deg, transparent 0 ' + (seg - 2) + 'px, ' +
                     ink + ' ' + (seg - 2) + 'px ' + seg + 'px)';

    let L = [];

    L.push('.brutal-progress {');
    L.push('  display: inline-flex;');
    L.push('  flex-direction: column;');
    L.push('  gap: 8px;');
    L.push('  width: ' + w + 'px;');
    L.push('  box-sizing: border-box;');
    L.push('  color: ' + s.color + ';');
    L = L.concat(fontLines(s));
    L.push('  line-height: 1;');
    L.push('}');

    L.push('.brutal-progress__head {');
    L.push('  display: flex;');
    L.push('  align-items: baseline;');
    L.push('  justify-content: space-between;');
    L.push('  gap: 10px;');
    L.push('}');
    L.push('.brutal-progress__label:empty { display: none; }');
    L.push('.brutal-progress__val {');
    L.push('  flex: 0 0 auto;');
    L.push('  padding: ' + Math.max(2, Math.round(bw * 0.6)) + 'px ' +
           Math.max(6, Math.round(bw * 1.6)) + 'px;');
    L.push('  background: ' + s.bg + ';');
    L.push('  color: ' + s.color + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  transition: background-color .16s ' + ease + ', color .16s ' + ease + ';');
    L.push('}');

    L.push('');
    L.push('.brutal-progress__track {');
    L.push('  position: relative;');
    L.push('  box-sizing: border-box;');
    L.push('  height: ' + (h + bw * 2) + 'px;');
    L.push('  overflow: hidden;');
    L.push('  background: #ffffff;');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  border-radius: ' + (roundPill ? Math.round((h + bw * 2) / 2) + 'px' : s.radius + 'px') + ';');
    if (hs) L.push('  box-shadow: ' + shadow + ';');
    L.push('  transition: transform .16s ' + ease + ', box-shadow .16s ' + ease + ';');
    L.push('}');

    L.push('');
    L.push('.brutal-progress__fill {');
    L.push('  position: absolute;');
    L.push('  left: 0;');
    L.push('  top: 0;');
    L.push('  bottom: 0;');
    L.push('  width: var(--v, ' + v + '%);');
    L.push('  background-color: ' + s.bg + ';');
    if (fImg.length) {
      L.push('  background-image: ' + fImg.join(', ') + ';');
      L.push('  background-size: ' + fSize.join(', ') + ';');
    }
    if (style === 'notch') {
      L.push('  clip-path: polygon(0 0, calc(100% - ' + notch + 'px) 0, 100% 50%,' +
             ' calc(100% - ' + notch + 'px) 100%, 0 100%);');
    }
    L.push('  transition: width .3s ' + ease + ';');
    L.push('  animation: brutal-progress-in .6s ' + ease + ' both;');
    L.push('}');

    /* 入场动画：填充从 0 长到目标值（--v 由 HTML 内联传入，每个进度条独立取值） */
    L.push('@keyframes brutal-progress-in {');
    L.push('  from { width: 0; }');
    L.push('  to   { width: var(--v, ' + v + '%); }');
    L.push('}');
    L.push('@media (prefers-reduced-motion: reduce) {');
    L.push('  .brutal-progress__fill { animation: none; }');
    L.push('}');

    /* tick：刻度线必须画在填充之上，否则会被填充整片盖住 */
    if (style === 'tick') {
      L.push('');
      L.push('.brutal-progress__track::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  background-image: ' + segLine + ';');
      L.push('  pointer-events: none;');
      L.push('}');
    }
    /* grid：横竖两层叠出网格，画在填充之上才不会被整片盖住 */
    if (style === 'grid') {
      L.push('');
      L.push('.brutal-progress__track::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  background-image: ' + segLine + ', ' + gridLine + ';');
      L.push('  pointer-events: none;');
      L.push('}');
    }
    /* tape：填充末端压一道斜置实心条，像拿封条把进度斜贴封住 */
    if (style === 'tape') {
      L.push('');
      L.push('.brutal-progress__fill::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  right: ' + Math.round(bw * 0.5) + 'px;');
      L.push('  top: -' + Math.round(h * 0.3) + 'px;');
      L.push('  bottom: -' + Math.round(h * 0.3) + 'px;');
      L.push('  width: ' + Math.max(6, Math.round(bw * 1.6)) + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  transform: rotate(16deg);');
      L.push('}');
    }
    /* double：框内再压一道线（inset 两层夹出细线，与徽章双线同一手法） */
    if (style === 'double') {
      L.push('');
      L.push('.brutal-progress__track::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: ' + gap1 + 'px;');
      L.push('  border: ' + Math.max(2, Math.round(bw * 0.5)) + 'px solid ' + s.borderColor + ';');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    L.push('');
    L.push('.brutal-progress:hover .brutal-progress__val {');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('}');
    L.push('.brutal-progress:hover .brutal-progress__track {');
    L.push('  box-shadow: ' + hoverS + ';');
    L.push('}');
    L.push('.brutal-progress:active .brutal-progress__track {');
    L.push('  transform: translate(2px, 2px);');
    L.push('  box-shadow: none;');
    L.push('}');

    return L;
  }

  /* =========================================================
     滑块（slider）
     ---------------------------------------------------------
     用真 <input type="range">：拖得动才算滑块。上妆靠 -webkit- 伪元素
     （Edge / Chrome 系；Firefox 要另补 ::-moz-range-track / ::-moz-range-thumb）。
     「已填充 / 未填充」的分界没法塞 DOM 子元素进轨道，用一层线性渐变在
     v% 处硬切一刀 —— 这是唯一稳的做法。
     ========================================================= */

function buildProgress(s) {

        const label = (s.text || '').trim();
        const v = Math.round(Math.max(0, Math.min(100, Number(s.pgValue) || 0)));
        let h = '<div class="brutal-progress">\n';
        h += '  <div class="brutal-progress__head">\n';
        h += '    <span class="brutal-progress__label">' + (label ? esc(label) : '') + '</span>\n';
        if (s.pgShowVal !== false) {
          h += '    <span class="brutal-progress__val">' + v + '%</span>\n';
        }
        h += '  </div>\n';
        h += '  <div class="brutal-progress__track">\n';
        h += '    <div class="brutal-progress__fill" style="--v:' + v + '%"></div>\n';
        h += '  </div>\n';
        h += '</div>';
        return h;
      
}

function randomProgress(s) {
s.pgStyle = pick(['slab', 'slab', 'stripe', 'segment', 'notch', 'double', 'tick']);
      s.pgValue = pick([18, 35, 50, 64, 78, 92]);
      s.pgW     = pick([260, 300, 340, 400, 460]);
      s.pgH     = pick([14, 20, 26, 32, 40]);
      s.pgShowVal = Math.random() < 0.75;
      s.fontSize = pick([13, 14, 15, 16]);
      s.uppercase = Math.random() < 0.5;
}

COMPONENTS['progress'] = {
  label: '进度条',
  rootSel: '.brutal-progress',
  defaults: { pgStyle: 'slab', pgValue: 64, pgW: 320, pgH: 26, pgShowVal: true },
  enums: { pgStyle: Object.keys(PG_STYLES) },
  build: buildProgress,
  css: cssProgress,
  random: randomProgress,
  panel: `      <h2>进度条</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="pgStripe">警戒斜纹</button>
        <button class="chip" type="button" data-preset="pgSegment">分段格子</button>
        <button class="chip" type="button" data-preset="pgNotch">箭头缺口</button>
        <button class="chip" type="button" data-preset="pgTick">刻度轨道</button>
      </div>
      <div class="field">
        <label for="fPgStyle">轨道变体</label>
        <select id="fPgStyle" data-key="pgStyle">
          <option value="slab">硬块实心 / slab</option>
          <option value="stripe">警戒斜纹 / stripe</option>
          <option value="segment">分段格子 / segment</option>
          <option value="notch">箭头缺口 / notch</option>
          <option value="double">双线内框 / double</option>
          <option value="tick">刻度轨道 / tick</option>
          <option value="grid">网格轨道 / grid</option>
          <option value="pill">圆头胶囊 / pill</option>
          <option value="chevron">人字斜纹 / chevron</option>
          <option value="tape">斜贴封条 / tape</option>
        </select>
      </div>
      <div class="field">
        <label>进度值 <span class="val"><span data-out="pgValue"></span>%</span></label>
        <input type="range" data-key="pgValue" min="0" max="100" step="1">
      </div>
      <div class="grid-2">
        <div class="field">
          <label>条宽 <span class="val"><span data-out="pgW"></span>px</span></label>
          <input type="range" data-key="pgW" min="160" max="560" step="10">
        </div>
        <div class="field">
          <label>条高 <span class="val"><span data-out="pgH"></span>px</span></label>
          <input type="range" data-key="pgH" min="8" max="48" step="1">
        </div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" data-key="pgShowVal"> 显示百分比</label>
      </div>`
};
