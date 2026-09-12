/* ===== components/checkbox.js ===== */

  function cssCheckbox(s) {
    const style   = CB_STYLES[s.cbStyle] ? s.cbStyle : 'brutal';
    const pattern = getPattern(s);
    const bw      = Math.max(0, s.borderWidth);
    const hs      = hasShadow(s);
    const hardShadow = shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor);
    const liftShadow = shadowStr(
      Math.max(0, s.shadowX - 2),
      Math.max(0, s.shadowY - 2),
      s.shadowBlur,
      s.shadowColor
    );
    const ease = 'cubic-bezier(.34, 1.56, .64, 1)';

    /* ---- 两态骨架：K 关闭 / O 开启 ---- */
    const K = { rotate: 0, scale: 1, dashed: false, img: null };
    const O = { rotate: 0, scale: 1, dashed: false, img: null };

    if (style === 'offset') {
      /* 背后垫一块错位的实心方块（外阴影画的，天然压在方块之下），勾选时归位被盖住 */
      K.bg = '#ffffff'; K.border = bw; K.tick = s.color;
      K.shadow = '7px 6px 0 0 ' + s.borderColor;
      O.bg = s.bg;      O.border = bw; O.tick = s.color;
      O.shadow = '0 0 0 0 ' + s.borderColor;

    } else if (style === 'invert') {
      /* 勾选直接把方块填成墨色，对勾透出底色 */
      K.bg = '#ffffff'; K.border = bw; K.shadow = hs ? hardShadow : null; K.tick = s.color;
      O.bg = s.color;   O.border = bw; O.shadow = hs ? hardShadow : null; O.tick = s.bg;
      O.rotate = -2;

    } else if (style === 'hatch') {
      /* 勾选后填上警戒斜纹 */
      const ink = hexToRgba(s.color, 0.55);
      K.bg = '#ffffff'; K.border = bw; K.shadow = hs ? hardShadow : null; K.tick = s.color;
      O.bg = s.bg;      O.border = bw; O.shadow = hs ? hardShadow : null; O.tick = s.color;
      O.img = 'repeating-linear-gradient(45deg, transparent 0 4px, ' + ink + ' 4px 8px)';

    } else if (style === 'stamp') {
      /* 未选是虚线的空框，选中像啪一下盖了个章 */
      K.bg = '#ffffff'; K.border = Math.max(1, Math.round(bw / 2)); K.shadow = null;
      K.tick = s.color; K.dashed = true;
      O.bg = s.color;   O.border = bw;
      O.shadow = hs ? hardShadow : '4px 4px 0 ' + s.borderColor;
      O.tick = s.bg; O.rotate = -8; O.scale = 1.12;

    } else if (style === 'grid') {
      /* 网格复选框：勾选后整块填满网格 —— hatch 是单向斜纹，这是横竖交错的格子 */
      const ink = hexToRgba(s.color, 0.5);
      K.bg = '#ffffff'; K.border = bw; K.shadow = hs ? hardShadow : null; K.tick = s.color;
      O.bg = s.bg;      O.border = bw; O.shadow = hs ? hardShadow : null; O.tick = s.color;
      O.img = 'repeating-linear-gradient(90deg, transparent 0 5px, ' + ink + ' 5px 7px), ' +
              'repeating-linear-gradient(0deg, transparent 0 5px, ' + ink + ' 5px 7px)';

    } else if (style === 'notch') {
      /* 内缩双框：勾中后框线向内再压一圈，方块像被压进纸里 */
      K.bg = '#ffffff'; K.border = bw; K.shadow = hs ? hardShadow : null; K.tick = s.color;
      O.bg = '#ffffff'; O.border = bw; O.tick = s.color;
      O.shadow = 'inset 0 0 0 ' + Math.max(3, Math.round(bw * 1.5)) + 'px ' + s.bg + ', ' +
                 'inset 0 0 0 ' + Math.max(5, Math.round(bw * 2.5)) + 'px ' + s.borderColor;
      O.scale = 0.92;

    } else if (style === 'bevel') {
      /* 斜切复选框：勾中后整块正转 8°（stamp 是 -8° 且放大，这里只转不放大） */
      K.bg = '#ffffff'; K.border = bw; K.shadow = hs ? hardShadow : null; K.tick = s.color;
      O.bg = s.bg;      O.border = bw; O.shadow = hs ? hardShadow : null; O.tick = s.color;
      O.rotate = 8;

    } else if (style === 'bracket') {
      /* 四角夹框：未选是虚线空框，选中外套一圈实线（stamp 是虚线圈，这里反过来） */
      K.bg = '#ffffff'; K.border = Math.max(1, Math.round(bw / 2)); K.shadow = null;
      K.tick = s.color; K.dashed = true;
      O.bg = s.bg;      O.border = bw; O.tick = s.color;
      O.shadow = '0 0 0 ' + Math.max(3, bw) + 'px ' + s.bg + ', 0 0 0 ' +
                 Math.max(5, Math.round(bw * 1.8)) + 'px ' + s.borderColor;

    } else {
      /* brutal：粗野硬块 */
      K.bg = '#ffffff'; K.border = bw; K.shadow = hs ? hardShadow : null; K.tick = s.color;
      O.bg = s.bg;      O.border = bw; O.shadow = hs ? hardShadow : null; O.tick = s.color;
    }

    /* 纹理与变体底图叠成多层背景 */
    function compose(img) {
      const p = [], z = [];
      if (pattern) { p.push(pattern.image); z.push(pattern.size); }
      if (img)     { p.push(img);           z.push('auto'); }
      return { img: p.length ? p.join(', ') : null, size: z.length ? z.join(', ') : null };
    }
    const kBg = compose(K.img);
    const oBg = compose(O.img);

    function bgOut(obj, extra) {
      const out = ['  background-color: ' + obj.bg + ';'];
      if (extra.img) {
        out.push('  background-image: ' + extra.img + ';');
        out.push('  background-size: ' + extra.size + ';');
      }
      return out;
    }
    function shapeOut(obj) {
      const out = [];
      out.push('  border: ' + obj.border + 'px ' + (obj.dashed ? 'dashed' : 'solid') + ' ' + s.borderColor + ';');
      out.push('  border-radius: ' + s.radius + 'px;');
      if (obj.shadow) out.push('  box-shadow: ' + obj.shadow + ';');
      out.push('  transform: rotate(' + obj.rotate + 'deg) scale(' + obj.scale + ');');
      return out;
    }

    let L = [];

    L.push('.brutal-check {');
    L.push('  display: inline-flex;');
    L.push('  align-items: center;');
    L.push('  gap: 12px;');
    L.push('  cursor: pointer;');
    L.push('  user-select: none;');
    L.push('  color: ' + s.color + ';');
    L = L.concat(fontLines(s));
    L.push('  line-height: 1;');
    L.push('}');

    L.push('');
    L.push('.brutal-check input {');
    L.push('  position: absolute;');
    L.push('  opacity: 0;');
    L.push('  pointer-events: none;');
    L.push('}');

    L.push('');
    L.push('.brutal-check__box {');
    L.push('  position: relative;');
    L.push('  flex: 0 0 auto;');
    L.push('  width: 1.9em;');      /* 用 em：拖「字号」即可整体缩放 */
    L.push('  height: 1.9em;');
    L = L.concat(bgOut(K, kBg));
    L = L.concat(shapeOut(K));
    L.push('  transition: background-color .16s ease, border-color .16s ease,');
    L.push('              box-shadow .16s ease, transform .22s ' + ease + ';');
    L.push('}');

    /* ---- 勾选图案：形状由 cbMark 决定，颜色统一走 currentColor ---- */
    const mk = markLines(s.cbMark, s.radius);
    const baseT = 'translate(-50%, -50%)' +
                  ((mk.dx || mk.dy) ? ' translate(' + mk.dx + 'em, ' + mk.dy + 'em)' : '') +
                  (mk.rot ? ' rotate(' + mk.rot + 'deg)' : '');

    L.push('');
    L.push('.brutal-check__box::after {');
    L.push("  content: '';");
    L.push('  position: absolute;');
    L.push('  left: 50%;');
    L.push('  top: 50%;');
    L.push('  width: ' + mk.w + 'em;');
    L.push('  height: ' + mk.h + 'em;');
    L = L.concat(mk.decls);
    L.push('  color: ' + K.tick + ';');
    L.push('  opacity: 0;');
    L.push('  transform: ' + baseT + ' scale(.35);');
    L.push('  transition: opacity .12s ease, transform .22s ' + ease + ', color .16s ease;');
    L.push('}');

    L.push('');
    L.push('.brutal-check input:checked + .brutal-check__box {');
    L = L.concat(bgOut(O, oBg));
    L = L.concat(shapeOut(O));
    L.push('}');

    L.push('');
    L.push('.brutal-check input:checked + .brutal-check__box::after {');
    L.push('  color: ' + O.tick + ';');
    L.push('  opacity: 1;');
    L.push('  transform: ' + baseT + ' scale(1);');
    L.push('}');

    L.push('');
    L.push('.brutal-check:hover .brutal-check__box {');
    L.push('  translate: 2px 2px;');     /* 独立属性，不影响上面的旋转缩放 */
    if (hs && style !== 'offset') L.push('  box-shadow: ' + liftShadow + ';');
    L.push('}');

    return L;
  }

  /* ---------- 开关滑块图标（纯 CSS，无需图片） ---------- */
  const ICON_SEL = '.brutal-switch__icon';

  function iconLines(icon) {
    const L = [];
    if (!icon || icon === 'none') return L;

    L.push(ICON_SEL + '::before,');
    L.push(ICON_SEL + '::after {');
    L.push('  content: "";');
    L.push('  position: absolute;');
    L.push('}');

    if (icon === 'check') {
      L.push('');
      L.push(ICON_SEL + '::before {');
      L.push('  left: 50%;');
      L.push('  top: 50%;');
      L.push('  width: .3em;');
      L.push('  height: .56em;');
      L.push('  border-right: .13em solid currentColor;');
      L.push('  border-bottom: .13em solid currentColor;');
      L.push('  transform: translate(-50%, -58%) rotate(45deg);');
      L.push('}');

    } else if (icon === 'cross') {
      L.push('');
      L.push(ICON_SEL + '::before {');
      L.push('  left: 50%;');
      L.push('  top: 50%;');
      L.push('  width: .56em;');
      L.push('  height: .56em;');
      L.push('  background-image:');
      L.push('    linear-gradient(45deg, transparent calc(50% - .065em), currentColor calc(50% - .065em) calc(50% + .065em), transparent calc(50% + .065em)),');
      L.push('    linear-gradient(-45deg, transparent calc(50% - .065em), currentColor calc(50% - .065em) calc(50% + .065em), transparent calc(50% + .065em));');
      L.push('  transform: translate(-50%, -50%);');
      L.push('}');

    } else if (icon === 'moon') {
      L.push('');
      L.push(ICON_SEL + '::before {');
      L.push('  left: 50%;');
      L.push('  top: 50%;');
      L.push('  width: .66em;');
      L.push('  height: .66em;');
      L.push('  border-radius: 50%;');
      L.push('  background: currentColor;');
      L.push('  box-shadow: inset -.27em .16em 0 .02em var(--thumb-bg, #fff);');
      L.push('  transform: translate(-50%, -50%);');
      L.push('}');

    } else if (icon === 'bolt') {
      L.push('');
      L.push(ICON_SEL + '::before {');
      L.push('  left: 50%;');
      L.push('  top: 50%;');
      L.push('  width: .42em;');
      L.push('  height: .68em;');
      L.push('  background: currentColor;');
      L.push('  clip-path: polygon(60% 0, 20% 54%, 44% 54%, 34% 100%, 78% 42%, 52% 42%);');
      L.push('  transform: translate(-50%, -50%);');
      L.push('}');

    } else if (icon === 'power') {
      L.push('');
      L.push(ICON_SEL + '::before {');
      L.push('  left: 50%;');
      L.push('  top: 50%;');
      L.push('  width: .48em;');
      L.push('  height: .48em;');
      L.push('  border: .11em solid currentColor;');
      L.push('  border-top-color: transparent;');
      L.push('  border-radius: 50%;');
      L.push('  transform: translate(-50%, -50%);');
      L.push('}');
      L.push('');
      L.push(ICON_SEL + '::after {');
      L.push('  left: 50%;');
      L.push('  top: 50%;');
      L.push('  width: .11em;');
      L.push('  height: .3em;');
      L.push('  background: currentColor;');
      L.push('  transform: translate(-50%, -128%);');
      L.push('}');
    }
    return L;
  }

  /* ---------- SWITCH ----------
     骨架：轨道 4em × 2em，滑块尺寸随边框自适应，位移恒为 1.64em
     变量：swStyle 风格变体 · knobIcon 滑块图标 · motion 过渡曲线
           swScale 整体缩放 · glow 外发光 · offColor 关闭态底色 */

function buildCheckbox(s) {
return '<label class="brutal-check">\n' +
               '  <input type="checkbox" checked>\n' +
               '  <span class="brutal-check__box"></span>\n' +
               '  <span class="brutal-check__label">' + esc(s.text || '选项') + '</span>\n' +
               '</label>';
}

function randomCheckbox(s) {
s.cbStyle = pick(['brutal', 'offset', 'invert', 'hatch', 'stamp', 'grid', 'notch', 'bevel', 'bracket']);
      s.cbMark  = pick(['check', 'check', 'cross', 'dash', 'block',
                            'bars', 'plus', 'slash', 'ring', 'bolt', 'notch']);
}

COMPONENTS['checkbox'] = {
  label: '复选框',
  rootSel: '.brutal-check',
  defaults: { cbStyle: 'brutal', cbMark: 'check' },
  enums: { cbStyle: Object.keys(CB_STYLES), cbMark: Object.keys(CB_MARKS) },
  build: buildCheckbox,
  css: cssCheckbox,
  random: randomCheckbox,
  panel: `      <h2>复选框样式</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="cbOffset">错位双框</button>
        <button class="chip" type="button" data-preset="cbInvert">反白填充</button>
        <button class="chip" type="button" data-preset="cbHatch">警戒斜纹</button>
        <button class="chip" type="button" data-preset="cbBolt">闪电标记</button>
        <button class="chip" type="button" data-preset="cbBars">双横线标记</button>
      </div>
      <div class="field">
        <label for="fCbStyle">风格变体</label>
        <select id="fCbStyle" data-key="cbStyle">
          <option value="brutal">粗野硬块 / brutal</option>
          <option value="offset">错位双框 / offset</option>
          <option value="invert">反白填充 / invert</option>
          <option value="hatch">警戒斜纹 / hatch</option>
          <option value="stamp">印章弹入 / stamp</option>
        
          <option value="grid">网格复选框 / grid</option>
          <option value="notch">内缩双框 / notch</option>
          <option value="bevel">斜切复选框 / bevel</option>
          <option value="bracket">四角夹框 / bracket</option></select>
      </div>
      <div class="field">
        <label for="fCbMark">勾选图案</label>
        <select id="fCbMark" data-key="cbMark">
          <option value="check">对勾 / check</option>
          <option value="cross">叉号 / cross</option>
          <option value="dash">横杠 / dash</option>
          <option value="block">实心块 / block</option>
          <option value="bars">双横线 / bars</option>
          <option value="plus">加号 / plus</option>
          <option value="slash">斜杠 / slash</option>
          <option value="ring">方环 / ring</option>
          <option value="bolt">闪电 / bolt</option>
          <option value="notch">折角 / notch</option>
        </select>
      </div>`
};
