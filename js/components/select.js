/* ===== components/select.js ===== */

  function cssSelect(s) {
    const style  = SE_STYLES[s.seStyle] ? s.seStyle : 'slab';
    const pattern = getPattern(s);
    const bw     = Math.max(0, s.borderWidth);
    const w      = Math.max(140, s.seW || 300);
    const fs     = s.fontSize;
    const shadow = shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor);
    const hs     = hasShadow(s);
    const hoverS = hoverShadow(s);
    const ease   = 'cubic-bezier(.34, 1.56, .64, 1)';
    const padV   = Math.max(8, Math.round(fs * 0.72));
    const padH   = Math.max(12, Math.round(fs * 0.95));
    const arrowW = Math.max(16, Math.round(fs * 1.5));
    const triW   = Math.max(8, Math.round(fs * 0.55));
    const triH   = Math.max(5, Math.round(fs * 0.4));
    const armW   = Math.max(5, Math.round(bw * 1.4));
    const armL   = Math.max(14, Math.round(fs * 1.05));
    const barW   = Math.max(8, Math.round(bw * 2));
    const bandH  = Math.max(8, Math.round(fs * 0.75));
    const gap1   = Math.max(3, Math.round(bw * 1.2));
    const notchCut = Math.max(10, Math.round(fs * 0.9));  /* notch 的切角边长 */
    const bev      = Math.max(8, Math.round(fs * 0.6));   /* bevel 的倾斜位移 */
    const gridCell = Math.max(8, Math.round(fs * 0.9));   /* grid 的网格步长 */

    let useBorder = true;
    let fill = true;
    let showBlock = (style === 'slab');
    let padL = padH;
    let padT = padV;
    const extra = [];

    if (style === 'double') {
      const sh = [];
      if (hs) sh.push(shadow);
      sh.push('inset 0 0 0 ' + gap1 + 'px ' + s.bg);
      sh.push('inset 0 0 0 ' + (gap1 + Math.max(2, Math.round(bw * 0.5))) + 'px ' + s.borderColor);
      extra.push('  box-shadow: ' + sh.join(', ') + ';');
    } else if (style === 'rail') {
      extra.push('  border-left-width: ' + barW + 'px;');
      padL = padH;
    } else if (style === 'bracket') {
      useBorder = false;
      padL = padH + armW;
      extra.push('  padding-right: ' + (padH + armW) + 'px;');
    } else if (style === 'band') {
      padT = padV + bandH;
    } else if (style === 'stamp') {
      fill = false;
      extra.push('  outline: ' + Math.max(1, Math.round(bw * 0.6)) + 'px dashed ' + s.borderColor + ';');
      extra.push('  outline-offset: 3px;');
      extra.push('  transform: rotate(' + (s.rotate !== 0 ? s.rotate : -3) + 'deg);');
    } else if (style === 'notch') {
      /* 切角硬框：右上 + 左下各削一角。clip-path 会连带裁掉边框，所以改由背景块取形 */
      useBorder = false;
      extra.push('  clip-path: polygon(0 0, calc(100% - ' + notchCut + 'px) 0, 100% ' + notchCut +
                 'px, 100% 100%, ' + notchCut + 'px 100%, 0 calc(100% - ' + notchCut + 'px));');
    } else if (style === 'bevel') {
      /* 斜切硬框：整块压成平行四边形（notch 是削角，bevel 是整体倾斜） */
      extra.push('  clip-path: polygon(' + bev + 'px 0, 100% 0, calc(100% - ' + bev + 'px) 100%, 0 100%);');
    }
    /* tape / grid 的外挂装饰见下方 ::before / ::after，这里只需占位说明 */

    const padR = padH + (showBlock ? arrowW : Math.round(triW * 2.2));

    let L = [];

    L.push('.brutal-select {');
    L.push('  position: relative;');
    L.push('  display: inline-flex;');
    L.push('  align-items: center;');
    L.push('  gap: 8px;');
    L.push('  box-sizing: border-box;');
    L.push('  width: ' + w + 'px;');
    L.push('  padding: ' + padT + 'px ' + padR + 'px ' + padV + 'px ' + padL + 'px;');
    if (fill) L = L.concat(bgLines(s, pattern));
    else L.push('  background: transparent;');
    L.push('  color: ' + s.color + ';');
    if (useBorder) L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    else L.push('  border: none;');
    L.push('  border-radius: ' + s.radius + 'px;');
    if (hs && style !== 'double' && style !== 'bracket' &&
        style !== 'notch' && style !== 'bevel') {   /* clip-path 会裁掉外投影，这两种不给 */
      L.push('  box-shadow: ' + shadow + ';');
    }
    L = L.concat(fontLines(s));
    L.push('  line-height: 1;');
    L.push('  cursor: pointer;');
    L.push('  transition: transform .16s ' + ease + ', box-shadow .16s ' + ease + ';');
    L = L.concat(extra);
    L.push('}');

    if (style === 'band') {
      /* 通栏硬切：顶部压一条满宽实心条，文字靠 padding 让位 */
      L.push('');
      L.push('.brutal-select::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  left: 0;');
      L.push('  right: 0;');
      L.push('  top: 0;');
      L.push('  height: ' + bandH + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    if (style === 'bracket') {
      /* 四角夹框：8 层背景拼出四只 L 角（与按钮 bracket 同一手法） */
      const lg = 'linear-gradient(' + s.borderColor + ', ' + s.borderColor + ')';
      const vl = armL + 'px', vw = armW + 'px';
      L.push('');
      L.push('.brutal-select::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: -' + armW + 'px;');
      L.push('  pointer-events: none;');
      L.push('  background-image: ' + [lg, lg, lg, lg, lg, lg, lg, lg].join(', ') + ';');
      L.push('  background-size: ' + [vl + ' ' + vw, vw + ' ' + vl, vl + ' ' + vw, vw + ' ' + vl,
                                     vl + ' ' + vw, vw + ' ' + vl, vl + ' ' + vw, vw + ' ' + vl].join(', ') + ';');
      L.push('  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;');
      L.push('  background-repeat: no-repeat;');
      L.push('}');
    }

    if (style === 'grid') {
      /* 网格底纹：横竖两层叠加（90deg 出竖线、0deg 出横线），盖在填充之上 */
      const gInk = hexToRgba(s.color, 0.32);
      L.push('');
      L.push('.brutal-select::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  background-image: repeating-linear-gradient(90deg, transparent 0 ' +
             (gridCell - 2) + 'px, ' + gInk + ' ' + (gridCell - 2) + 'px ' + gridCell + 'px), ' +
             'repeating-linear-gradient(0deg, transparent 0 ' + (gridCell - 2) + 'px, ' +
             gInk + ' ' + (gridCell - 2) + 'px ' + gridCell + 'px);');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    /* 前置标签牌 */
    L.push('');
    L.push('.brutal-select__tag {');
    L.push('  flex: 0 0 auto;');
    L.push('  padding: ' + Math.max(2, Math.round(bw * 0.5)) + 'px ' +
           Math.max(6, Math.round(bw * 1.4)) + 'px;');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  font-size: .82em;');
    L.push('}');

    /* 原生 select 去外观：背景、边框、outline 全交还给壳 */
    L.push('');
    /* 当前选中值：占位，点击穿透到壳统一处理展开 */
    L.push('.brutal-select__value {');
    L.push('  flex: 1 1 auto;');
    L.push('  min-width: 0;');
    L.push('  overflow: hidden;');
    L.push('  text-overflow: ellipsis;');
    L.push('  white-space: nowrap;');
    L.push('  line-height: 1;');
    L.push('  pointer-events: none;');
    L.push('}');

    /* 展开列表：硬框 + 硬阴影，彻底脱离系统菜单（原生 <select> 的 option 在 Windows 上改不了） */
    L.push('.brutal-select__list {');
    L.push('  position: absolute;');
    L.push('  left: calc(-1 * ' + bw + 'px);');
    L.push('  right: calc(-1 * ' + bw + 'px);');
    L.push('  top: 100%;');
    L.push('  margin: ' + Math.max(4, bw) + 'px 0 0;');
    L.push('  z-index: 60;');
    L.push('  padding: 0;');
    L.push('  list-style: none;');
    L.push('  background: ' + s.bg + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  border-radius: 0;');
    L.push('  box-shadow: 6px 6px 0 ' + s.borderColor + ';');
    L.push('  display: none;');
    L.push('}');
    L.push('.brutal-select.is-open .brutal-select__list {');
    L.push('  display: block;');
    L.push('}');

    const markW = Math.max(6, Math.round(bw * 1.6));
    L.push('.brutal-select__opt {');
    L.push('  position: relative;');
    L.push('  padding: ' + padV + 'px ' + (padH + markW) + 'px ' + padV + 'px ' + padH + 'px;');
    L.push('  color: ' + s.color + ';');
    L.push('  line-height: 1;');
    L.push('  cursor: pointer;');
    L.push('  border-bottom: 1px dashed ' + hexToRgba(s.borderColor, 0.35) + ';');
    L.push('}');
    L.push('.brutal-select__opt:last-child {');
    L.push('  border-bottom: none;');
    L.push('}');
    L.push('.brutal-select__opt[aria-selected="true"] {');
    L.push('  font-weight: 700;');
    L.push('  background: ' + hexToRgba(s.color, 0.08) + ';');
    L.push('}');
    L.push('.brutal-select__opt[aria-selected="true"]::before {');
    L.push("  content: '';");
    L.push('  position: absolute;');
    L.push('  left: ' + Math.max(4, Math.round(bw * 0.8)) + 'px;');
    L.push('  top: 50%;');
    L.push('  width: ' + markW + 'px;');
    L.push('  height: ' + markW + 'px;');
    L.push('  transform: translateY(-50%);');
    L.push('  background: ' + s.color + ';');
    L.push('}');
    L.push('.brutal-select__opt:hover, .brutal-select__opt.is-active {');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('}');
    L.push('.brutal-select__opt:hover::before, .brutal-select__opt.is-active::before {');
    L.push('  background: ' + s.bg + ';');
    L.push('}');

    L.push('');
    L.push('.brutal-select__arrow {');
    L.push('  position: absolute;');
    L.push('  top: 0;');
    L.push('  bottom: 0;');
    L.push('  right: 0;');
    L.push('  display: flex;');
    L.push('  align-items: center;');
    L.push('  justify-content: center;');
    if (showBlock) {
      L.push('  width: ' + arrowW + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  color: ' + s.bg + ';');
    } else {
      L.push('  width: ' + Math.round(triW * 2.2) + 'px;');
      L.push('  color: ' + s.color + ';');
    }
    L.push('  pointer-events: none;');
    L.push('}');
    L.push('.brutal-select__arrow::before {');
    L.push("  content: '';");
    L.push('  width: ' + triW + 'px;');
    L.push('  height: ' + triH + 'px;');
    L.push('  background: currentColor;');
    L.push('  clip-path: polygon(0 0, 100% 0, 50% 100%);');
    L.push('  transition: transform .16s ' + ease + ';');
    L.push('}');
    L.push('.brutal-select.is-open .brutal-select__arrow::before {');
    L.push('  transform: rotate(180deg);');
    L.push('}');

    L.push('');
    L.push('.brutal-select:hover .brutal-select__arrow {');
    L.push('  background: ' + (showBlock ? s.bg : s.color) + ';');
    L.push('  color: ' + (showBlock ? s.color : s.bg) + ';');
    L.push('}');
    L.push('.brutal-select:hover {');
    L.push('  box-shadow: ' + hoverS + ';');
    L.push('}');
    L.push('.brutal-select:active {');
    L.push('  transform: translate(2px, 2px);');
    L.push('  box-shadow: none;');
    L.push('}');

    return L;
  }

  /* ---------------- 统一入口 ---------------- */
  /* ---------------- 状态别名 ----------------
     把 :hover / :active / :focus(-visible|-within) 额外挂一个类名别名，
     好让「五态矩阵」在不真的悬停鼠标的情况下把状态摆出来；
     顺带也让使用者能用 JS 手动切状态（比如 .is-hover 做「加载中」）。 */
  /* ---------------- 警告条 ---------------- */

function buildSelect(s) {

        const tag = (s.text || '').trim();
        const opts = String(s.seOpts || '').split(/[,，]/)
          .map(function (x) { return x.trim(); })
          .filter(Boolean).slice(0, 5);
        const selIdx = (typeof s.seSelected === 'number' && opts[s.seSelected]) ? s.seSelected : 0;
        let h = '<div class="brutal-select" role="combobox" aria-haspopup="listbox" aria-expanded="false" tabindex="0">\n';
        if (tag) h += '  <span class="brutal-select__tag">' + esc(tag) + '</span>\n';
        h += '  <span class="brutal-select__value">' + esc(opts[selIdx] || opts[0] || '') + '</span>\n';
        h += '  <span class="brutal-select__arrow"></span>\n';
        h += '  <ul class="brutal-select__list" role="listbox">\n';
        opts.forEach(function (t, i) {
          h += '    <li class="brutal-select__opt" role="option"' + (i === selIdx ? ' aria-selected="true"' : '') + '>' + esc(t) + '</li>\n';
        });
        h += '  </ul>\n';
        h += '</div>';
        return h;
      
}

function randomSelect(s) {
s.seStyle = pick(['slab', 'slab', 'double', 'rail', 'bracket', 'band', 'stamp',
                        'notch', 'tape', 'bevel', 'grid']);
      s.seW     = pick([240, 280, 320, 380, 440]);
      s.seOpts  = pick(['选项一, 选项二, 选项三',
                            '标准, 加急, 特急',
                            '北京, 上海, 成都, 深圳',
                            '小, 中, 大, 特大',
                            'A 档, B 档, C 档']);
      s.fontSize = pick([14, 15, 16, 17, 18]);
      s.uppercase = Math.random() < 0.25;
}

COMPONENTS['select'] = {
  label: '下拉',
  rootSel: '.brutal-select',
  defaults: { seStyle: 'slab', seW: 300, seOpts: '选项一, 选项二, 选项三' },
  enums: { seStyle: Object.keys(SE_STYLES) },
  build: buildSelect,
  css: cssSelect,
  random: randomSelect,
  panel: `      <h2>下拉</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="seDouble">双线硬框</button>
        <button class="chip" type="button" data-preset="seRail">侧栏标条</button>
        <button class="chip" type="button" data-preset="seBracket">四角夹框</button>
        <button class="chip" type="button" data-preset="seBand">通栏硬切</button>
        <button class="chip" type="button" data-preset="seStamp">印章双框</button>
        <button class="chip" type="button" data-preset="seNotch">切角硬框</button>
        <button class="chip" type="button" data-preset="seBevel">斜切硬框</button>
        <button class="chip" type="button" data-preset="seGrid">网格底纹</button>
      </div>
      <div class="field">
        <label for="fSeStyle">框体变体</label>
        <select id="fSeStyle" data-key="seStyle">
          <option value="slab">硬块方箭 / slab</option>
          <option value="double">双线硬框 / double</option>
          <option value="rail">侧栏标条 / rail</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="band">通栏硬切 / band</option>
          <option value="stamp">印章双框 / stamp</option>
          <option value="notch">切角硬框 / notch</option>
          <option value="bevel">斜切硬框 / bevel</option>
          <option value="grid">网格底纹 / grid</option>
        </select>
      </div>
      <div class="field">
        <label for="fSeOpts">选项（逗号分隔，最多 5 个）</label>
        <input type="text" id="fSeOpts" data-key="seOpts" maxlength="60" placeholder="选项一, 选项二">
      </div>
      <div class="field">
        <label>框宽 <span class="val"><span data-out="seW"></span>px</span></label>
        <input type="range" data-key="seW" min="140" max="520" step="10">
      </div>`
};
