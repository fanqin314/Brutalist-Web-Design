/* ===== components/switch.js ===== */

  function cssSwitch(s) {
    let L = [];
    const pattern = getPattern(s);
    const style = SW_STYLES[s.swStyle] ? s.swStyle : 'brutal';
    const mo = MOTION[s.motion] || MOTION.spring;
    const ease = mo.ease + ' ' + mo.dur + 's';
    const bw = s.borderWidth;
    const off = s.offColor || '#ffffff';
    const g = s.glow || 0;
    const pad = 0.18;

    const thumbSize  = 'calc(2em - 2 * ' + bw + 'px - ' + (pad * 2) + 'em)';
    const thumbInset = 'calc(' + bw + 'px + ' + pad + 'em)';
    const travel     = (2 - pad * 2) + 'em';

    /* ---- 变体骨架：K = 关闭态，O = 开启态 ---- */
    const K = {};
    const O = {};

    if (style === 'slab') {
      /* 厚板镂空：墨色实心厚板 + 镂空的方孔滑块，开启时变实心块 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = s.borderColor;
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = 'transparent';
      K.thumbShadow = 'inset 0 0 0 ' + Math.max(3, Math.round(bw * 0.8)) + 'px ' + off;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.borderColor;
      O.thumbShadow = null;
      K.icon = contrastOn(s.borderColor, s.borderColor, off);
      O.icon = contrastOn(s.borderColor, s.color, s.bg);

    } else if (style === 'double') {
      /* 双框硬描：边框外再套一圈描边，中间留出一道空隙，像套色错版 */
      const dGap = 3, dLine = 3;
      const dFrame = '0 0 0 ' + dGap + 'px ' + off + ', 0 0 0 ' + (dGap + dLine) + 'px ' + s.borderColor;
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackShadow = dFrame;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackShadow = dFrame;
      O.thumbColor = s.color;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'split') {
      /* 对半硬切：一块墨色硬块把轨道一分为二，开关时整块翻到另一侧 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackImage = 'linear-gradient(90deg, ' + s.borderColor + ' 0 50%, transparent 50% 100%)';
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = off;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackImage = 'linear-gradient(90deg, transparent 0 50%, ' + s.borderColor + ' 50% 100%)';
      O.trackShadow = K.trackShadow;
      O.thumbColor = off;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(off, s.color, s.bg);

    } else if (style === 'tape') {
      /* 条带封条：轨道上下各压一条墨色硬带，滑块嵌在两条带之间 */
      const band = Math.max(3, Math.round(bw * 1.2));
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackImage = 'linear-gradient(180deg, ' + s.borderColor + ' 0 ' + band + 'px, transparent ' + band +
                      'px calc(100% - ' + band + 'px), ' + s.borderColor + ' calc(100% - ' + band + 'px) 100%)';
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackImage = K.trackImage;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'flip') {
      /* 反相硬块：关是墨底浅块，开整体反相成彩底墨块，无过渡装饰 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = s.borderColor;
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = off;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.borderColor;
      O.thumbShadow = null;
      K.icon = contrastOn(off, s.color, s.bg);
      O.icon = contrastOn(s.borderColor, s.color, off);

    } else if (style === 'offset') {
      /* 错位叠影：轨道挂一块错开的实心硬影，滑块关/开反相 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackShadow = '6px 6px 0 ' + s.borderColor;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = '#ffffff';
      O.thumbShadow = null;
      K.icon = contrastOn(s.color, s.color, '#ffffff');
      O.icon = contrastOn('#ffffff', s.color, s.bg);

    } else if (style === 'stripe') {
      /* 警戒条纹：条纹方向随开关状态翻转 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackImage = 'repeating-linear-gradient(45deg, transparent 0 6px, ' +
                     hexToRgba(s.color, 0.3) + ' 6px 12px)';
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = 'inset 0 0 0 2px ' + s.bg;
      O.trackColor = s.bg;
      O.trackImage = 'repeating-linear-gradient(-45deg, transparent 0 6px, ' +
                     hexToRgba(s.color, 0.45) + ' 6px 12px)';
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = K.thumbShadow;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'skew') {
      /* 斜切块：轨道整体斜切，滑块反向补偿保持正立 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'grid') {
      /* 网格轨道：横竖两层叠加铺满轨道 */
      const ink = hexToRgba(s.color, 0.32);
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackImage = 'repeating-linear-gradient(90deg, transparent 0 6px, ' + ink + ' 6px 8px), ' +
                     'repeating-linear-gradient(0deg, transparent 0 6px, ' + ink + ' 6px 8px)';
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackImage = K.trackImage;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'notch') {
      /* 缺口开关：滑块 inset 挖出内腔，像被剜掉一块（方角，与 ring 的圆环形对立） */
      K.radius = s.radius + 'px'; K.thumbRadius = '0px'; K.border = bw;
      K.trackColor = off;
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = 'inset 0 0 0 ' + Math.max(3, Math.round(bw * 0.9)) + 'px ' + off;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = K.thumbShadow;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'bevel') {
      /* 斜切开关：轨道用 135° 硬切色块，读起来是斜着切开的两半 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackImage = 'linear-gradient(135deg, ' + s.borderColor + ' 0 46%, transparent 46% 100%)';
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackImage = 'linear-gradient(135deg, transparent 0 54%, ' + s.borderColor + ' 54% 100%)';
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else if (style === 'ring') {
      /* 圆环滑块：滑块切圆形，再 inset 挖出内环 —— 不是一枚实心圆点 */
      K.radius = s.radius + 'px'; K.thumbRadius = '50%'; K.border = bw;
      K.trackColor = off;
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = 'inset 0 0 0 ' + Math.max(3, Math.round(bw * 1.1)) + 'px ' + off;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = K.thumbShadow;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);

    } else {
      /* brutal：粗野硬边 + 硬阴影 */
      K.radius = s.radius + 'px'; K.thumbRadius = s.radius + 'px'; K.border = bw;
      K.trackColor = off;
      K.trackShadow = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
      K.thumbColor = s.color;
      K.thumbShadow = null;
      O.trackColor = s.bg;
      O.trackShadow = K.trackShadow;
      O.thumbColor = s.color;
      O.thumbShadow = null;
      K.icon = O.icon = contrastOn(s.color, s.color, s.bg);
    }

    /* ---- 外扩硬边：无模糊的实心扩散环，替代柔和的霓虹光晕 ---- */
    if (g > 0) {
      O.trackShadow = (O.trackShadow ? O.trackShadow + ', ' : '') + '0 0 0 ' + g + 'px ' + s.bg;
    }

    /* 纹理与变体底图叠成多层背景 */
    function compose(img, size) {
      if (!pattern) return { img: img || null, size: size || null };
      if (!img) return { img: pattern.image, size: pattern.size };
      return { img: pattern.image + ', ' + img, size: pattern.size + ', ' + (size || 'auto') };
    }
    function bgLines(obj) {
      const out = [];
      if (obj.img) {
        out.push('  background-image: ' + obj.img + ';');
        out.push('  background-size: ' + obj.size + ';');
      }
      return out;
    }

    const kBg = compose(K.trackImage, null);
    const oBg = compose(O.trackImage, null);

    /* ---------- 输出 ---------- */
    L.push('.brutal-switch {');
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
    L.push('.brutal-switch input {');
    L.push('  position: absolute;');
    L.push('  opacity: 0;');
    L.push('  pointer-events: none;');
    L.push('}');

    L.push('');
    L.push('.brutal-switch__track {');
    L.push('  position: relative;');
    L.push('  flex: 0 0 auto;');
    L.push('  width: 4em;');
    L.push('  height: 2em;');
    L.push('  font-size: ' + (16 * (s.swScale || 1)) + 'px;');   /* 整体缩放全靠这一行 */
    L.push('  background-color: ' + K.trackColor + ';');
    L = L.concat(bgLines(kBg));
    L.push('  border: ' + K.border + 'px solid ' + s.borderColor + ';');
    L.push('  border-radius: ' + K.radius + ';');
    if (style === 'skew') L.push('  transform: skewX(-12deg);');
    if (K.trackShadow) L.push('  box-shadow: ' + K.trackShadow + ';');
    L.push('  transition: background-color .2s ease, box-shadow .2s ease, border-color .2s ease;');
    L.push('}');

    L.push('');
    L.push('.brutal-switch__thumb {');
    L.push('  position: absolute;');
    L.push('  top: 50%;');
    L.push('  left: ' + thumbInset + ';');
    L.push('  width: ' + thumbSize + ';');
    L.push('  height: ' + thumbSize + ';');
    if (K.thumbColor) L.push('  background-color: ' + K.thumbColor + ';');
    if (K.thumbImage) L.push('  background-image: ' + K.thumbImage + ';');
    L.push('  border-radius: ' + K.thumbRadius + ';');
    if (K.thumbShadow) L.push('  box-shadow: ' + K.thumbShadow + ';');
    L.push('  --thumb-bg: ' + (K.thumbColor || '#dcdcdc') + ';');
    L.push('  transform: translateY(-50%)' + (style === 'skew' ? ' skewX(12deg)' : '') + ';');
    L.push('  transition: transform ' + ease + ', background-color .2s ease, box-shadow .2s ease;');
    L.push('}');

    L.push('');
    L.push('.brutal-switch__icon {');
    L.push('  position: absolute;');
    L.push('  inset: 0;');
    if (s.knobIcon && s.knobIcon !== 'none') L.push('  color: ' + K.icon + ';');
    L.push('}');
    const iL = iconLines(s.knobIcon);
    if (iL.length) {
      L.push('');
      L = L.concat(iL);
    }

    L.push('');
    L.push('.brutal-switch input:checked + .brutal-switch__track {');
    L.push('  background-color: ' + O.trackColor + ';');
    L = L.concat(bgLines(oBg));
    if (O.trackShadow) L.push('  box-shadow: ' + O.trackShadow + ';');
    L.push('}');

    L.push('');
    L.push('.brutal-switch input:checked + .brutal-switch__track .brutal-switch__thumb {');
    L.push('  transform: translateY(-50%) translateX(' + travel + ')' +
           (style === 'skew' ? ' skewX(12deg)' : '') + ';');
    if (O.thumbColor) L.push('  background-color: ' + O.thumbColor + ';');
    if (O.thumbImage) L.push('  background-image: ' + O.thumbImage + ';');
    if (O.thumbShadow) L.push('  box-shadow: ' + O.thumbShadow + ';');
    L.push('  --thumb-bg: ' + (O.thumbColor || '#dcdcdc') + ';');
    L.push('}');

    /* 关闭 / 开启两态图标色不同的变体（如厚板镂空、反相硬块）需要单独覆盖 */
    if (s.knobIcon && s.knobIcon !== 'none' && O.icon !== K.icon) {
      L.push('');
      L.push('.brutal-switch input:checked + .brutal-switch__track .brutal-switch__icon {');
      L.push('  color: ' + O.icon + ';');
      L.push('}');
    }

    return L;
  }

  /* ---------- INPUT ----------
     <input> 是替换元素，伪元素挂不上去 —— 所以输入框一律套一层壳（.brutal-field），
     裸 input 只负责收字。这样「前置标记 / 后缀单位 / 标签牌」才能对所有变体成立，
     壳也才能像卡片一样长出伪元素装饰（顶条 / 角夹 / 取形层 / 斜纹带）。
     变体：inStyle（brutal / double / under / label / term /
                    bracket / bevel / band / rail / stamp / stripe） */
  function inMarkDecls(mark) {
    switch (mark) {
      case 'caret':  return { kind: 'glyph', content: '>' };
      case 'prompt': return { kind: 'glyph', content: '$' };
      case 'at':     return { kind: 'glyph', content: '@' };
      case 'hash':   return { kind: 'glyph', content: '#' };
      case 'star':   return { kind: 'glyph', content: '*' };
      case 'arrow':  return { kind: 'glyph', content: '\u2192' };
      case 'block':  return { kind: 'box', w: '.5em',  h: '.5em',  radius: '0' };
      case 'dot':    return { kind: 'box', w: '.46em', h: '.46em', radius: '50%' };
      default:       return null;
    }
  }


function buildSwitch(s) {
return '<label class="brutal-switch">\n' +
               '  <input type="checkbox" checked>\n' +
               '  <span class="brutal-switch__track">\n' +
               '    <span class="brutal-switch__thumb">\n' +
               '      <span class="brutal-switch__icon"></span>\n' +
               '    </span>\n' +
               '  </span>\n' +
               '  <span class="brutal-switch__label">' + esc(s.text || '开关') + '</span>\n' +
               '</label>';
}

function randomSwitch(s) {
s.swStyle  = pick(['brutal', 'offset', 'stripe', 'skew',
                             'slab', 'double', 'split', 'tape', 'flip', 'grid', 'notch', 'bevel', 'ring']);
      s.knobIcon = pick(['none', 'none', 'check', 'cross', 'bolt', 'moon', 'power']);
      s.motion   = pick(['step', 'step', 'linear', 'smooth', 'spring', 'bounce']);
      s.swScale  = pick([0.9, 1, 1, 1.2, 1.4]);
      s.glow     = pick([0, 0, 6, 10, 14]);
}

COMPONENTS['switch'] = {
  label: '开关',
  rootSel: '.brutal-switch',
  defaults: { swStyle: 'brutal', knobIcon: 'none', motion: 'spring', swScale: 1, glow: 0, offColor: '#ffffff' },
  enums: { swStyle: Object.keys(SW_STYLES), knobIcon: ['none', 'check', 'cross', 'bolt', 'moon', 'power'], motion: Object.keys(MOTION) },
  build: buildSwitch,
  css: cssSwitch,
  random: randomSwitch,
  panel: `      <h2>开关样式</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="swOffset">错位叠影</button>
        <button class="chip" type="button" data-preset="swStripe">警戒条纹</button>
        <button class="chip" type="button" data-preset="swSkew">斜切块</button>
        <button class="chip" type="button" data-preset="swSlab">厚板镂空</button>
        <button class="chip" type="button" data-preset="swDouble">双框硬描</button>
        <button class="chip" type="button" data-preset="swTape">条带封条</button>
      </div>
      <div class="field">
        <label for="fSwStyle">风格变体</label>
        <select id="fSwStyle" data-key="swStyle">
          <option value="brutal">粗野硬块 / brutal</option>
          <option value="offset">错位叠影 / offset</option>
          <option value="stripe">警戒条纹 / stripe</option>
          <option value="skew">斜切块 / skew</option>
          <option value="slab">厚板镂空 / slab</option>
          <option value="double">双框硬描 / double</option>
          <option value="split">对半硬切 / split</option>
          <option value="tape">条带封条 / tape</option>
          <option value="flip">反相硬块 / flip</option>
        
          <option value="grid">网格轨道 / grid</option>
          <option value="notch">缺口开关 / notch</option>
          <option value="bevel">斜切开关 / bevel</option>
          <option value="ring">圆环滑块 / ring</option></select>
      </div>
      <div class="field">
        <label for="fKnobIcon">滑块图标</label>
        <select id="fKnobIcon" data-key="knobIcon">
          <option value="none">无</option>
          <option value="check">对勾</option>
          <option value="cross">叉号</option>
          <option value="bolt">闪电</option>
          <option value="moon">月牙</option>
          <option value="power">电源</option>
        </select>
      </div>
      <div class="field">
        <label for="fMotion">动效曲线</label>
        <select id="fMotion" data-key="motion">
          <option value="step">生硬阶跃 / step</option>
          <option value="linear">线性 / linear</option>
          <option value="smooth">平滑 / smooth</option>
          <option value="spring">弹性 / spring</option>
          <option value="bounce">重回弹 / bounce</option>
        </select>
      </div>
      <div class="field">
        <label>整体尺寸 <span class="val"><span data-out="swScale"></span>×</span></label>
        <input type="range" data-key="swScale" min="0.7" max="1.8" step="0.1">
      </div>
      <div class="field">
        <label>外扩硬边 <span class="val"><span data-out="glow"></span>px</span></label>
        <input type="range" data-key="glow" min="0" max="30" step="1">
      </div>
      <div class="field">
        <label>关闭态底色</label>
        <input type="color" data-key="offColor">
      </div>`
};
