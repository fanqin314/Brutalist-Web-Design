/* ===== components/slider.js ===== */

  function cssSlider(s) {
    const style  = SL_STYLES[s.slStyle] ? s.slStyle : 'slab';
    const pattern = getPattern(s);
    const bw     = Math.max(0, s.borderWidth);
    const v      = Math.max(0, Math.min(100, Number(s.slValue) || 0));
    const w      = Math.max(160, s.slW || 320);
    const h      = Math.max(10, s.slH || 22);
    const shadow = shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor);
    const hs     = hasShadow(s);
    const hoverS = hoverShadow(s);
    const ease   = 'cubic-bezier(.34, 1.56, .64, 1)';
    const trackH = h + bw * 2;
    let   knob   = Math.max(16, Math.round(h * 1.35));
    if (style === 'block') knob = Math.max(22, Math.round(h * 1.9)); /* 大方块滑块：明显比常规宽一圈 */
    const thumbMT = Math.round((trackH - knob) / 2);
    const ink    = hexToRgba(s.color, 0.42);
    const seg    = Math.max(10, Math.round(h * 1.1));
    const gap1   = Math.max(3, Math.round(bw * 1.2));

    const filled = (style === 'invert') ? s.color : s.bg;
    const empty  = (style === 'invert') ? s.bg : '#ffffff';
    /* 填充用 var(--val) 驱动，拖拽时由 SLIDER_JS 实时更新 → 填充跟随滑块。
       --val 与 fallback 均已带 % 单位，切莫再追加 %（否则 '60%%' 非法 → 整条 background-image 被丢弃） */
    const fillMask = 'linear-gradient(90deg, ' + filled + ' 0 var(--val,' + v + '%), transparent var(--val,' + v + '%) 100%)';

    /* 图层顺序 = 视觉从下往上倒着写（先写的在上层）：
       刻度线要盖住填充 → 排在填充掩膜之前 */
    const img = [], sz = [];
    if (style === 'tick') {
      img.push('repeating-linear-gradient(90deg, transparent 0 ' + (seg - 2) + 'px, ' +
               ink + ' ' + (seg - 2) + 'px ' + seg + 'px)');
      sz.push('auto');
    }
    if (style === 'grid') {
      /* 网格轨道：横竖两层叠加（90deg 出竖线、0deg 出横线），画在填充之上 */
      img.push('repeating-linear-gradient(90deg, transparent 0 ' + (seg - 2) + 'px, ' +
               ink + ' ' + (seg - 2) + 'px ' + seg + 'px)');
      sz.push('auto');
      img.push('repeating-linear-gradient(0deg, transparent 0 ' + (seg - 2) + 'px, ' +
               ink + ' ' + (seg - 2) + 'px ' + seg + 'px)');
      sz.push('auto');
    }
    img.push(fillMask); sz.push('auto');
    if (style === 'hatch' || style === 'skew') {
      img.push('repeating-linear-gradient(45deg, transparent 0 6px, ' + ink + ' 6px 12px)');
      sz.push('auto');
    }
    if (pattern) { img.push(pattern.image); sz.push(pattern.size); }

    /* 轨道的 box-shadow：外投影 + （double 的内双线） */
    const sh = [];
    if (hs) sh.push(shadow);
    if (style === 'double') {
      sh.push('inset 0 0 0 ' + gap1 + 'px ' + empty);
      sh.push('inset 0 0 0 ' + (gap1 + Math.max(2, Math.round(bw * 0.5))) + 'px ' + s.borderColor);
    }

    let L = [];

    L.push('.brutal-slider {');
    L.push('  display: inline-flex;');
    L.push('  flex-direction: column;');
    L.push('  gap: 8px;');
    L.push('  width: ' + w + 'px;');
    L.push('  box-sizing: border-box;');
    L.push('  color: ' + s.color + ';');
    L = L.concat(fontLines(s));
    L.push('  line-height: 1;');
    L.push('}');

    L.push('.brutal-slider__head {');
    L.push('  display: flex;');
    L.push('  align-items: baseline;');
    L.push('  justify-content: space-between;');
    L.push('  gap: 10px;');
    L.push('}');
    L.push('.brutal-slider__label:empty { display: none; }');
    L.push('.brutal-slider__val {');
    L.push('  flex: 0 0 auto;');
    L.push('  padding: ' + Math.max(2, Math.round(bw * 0.6)) + 'px ' +
           Math.max(6, Math.round(bw * 1.6)) + 'px;');
    L.push('  background: ' + s.bg + ';');
    L.push('  color: ' + s.color + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  transition: background-color .16s ' + ease + ', color .16s ' + ease + ';');
    L.push('}');

    L.push('');
    /* 关键：轨道视觉（填充梯度/图案/边框/投影）放在「宿主 input」上，而非
       ::-webkit-slider-runnable-track 伪元素。因为该伪元素的 background-image 里
       用 var() 在 Edge/Chrome 下不生效（会被整体丢弃）。宿主元素是普通元素，var() 正常。
       伪元素只留透明轨道承托滑块。 */
    L.push('.brutal-slider__input {');
    L.push('  -webkit-appearance: none;');
    L.push('  appearance: none;');
    L.push('  box-sizing: border-box;');
    L.push('  width: 100%;');
    L.push('  height: ' + trackH + 'px;');
    L.push('  margin: 0;');
    L.push('  padding: 0;');
    L.push('  background-color: ' + empty + ';');
    L.push('  background-image: ' + img.join(', ') + ';');
    L.push('  background-size: ' + sz.join(', ') + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  border-radius: ' + s.radius + 'px;');
    if (sh.length) L.push('  box-shadow: ' + sh.join(', ') + ';');
    L.push('  cursor: pointer;');
    L.push('}');

    L.push('');
    L.push('.brutal-slider__input::-webkit-slider-runnable-track {');
    L.push('  -webkit-appearance: none;');
    L.push('  background: transparent;');
    L.push('  border: none;');
    L.push('  height: ' + trackH + 'px;');
    L.push('}');

    L.push('');
    L.push('.brutal-slider__input::-webkit-slider-thumb {');
    L.push('  -webkit-appearance: none;');
    L.push('  appearance: none;');
    L.push('  width: ' + knob + 'px;');
    L.push('  height: ' + knob + 'px;');
    L.push('  margin-top: ' + thumbMT + 'px;');
    L.push('  background: ' + s.color + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
  L.push('  border-radius: ' + (style === 'ring' ? '50%' : s.radius + 'px') + ';');
  if (style === 'ring') {
    /* 圆环滑块：外圈实色 + inset 挖出内环，不是一枚纯色圆点 */
    L.push('  box-shadow: inset 0 0 0 ' + Math.max(3, Math.round(bw * 1.2)) + 'px ' + s.bg + ';');
  } else if (hs) {
    L.push('  box-shadow: ' + shadow + ';');
  }
  if (style === 'skew') {
    L.push('  clip-path: polygon(30% 0, 100% 0, 70% 100%, 0 100%);');
  } else if (style === 'notch') {
    /* 缺口滑块：右上 + 左下各切一角（skew 是整块倾斜，一眼能分开） */
    L.push('  clip-path: polygon(0 0, calc(100% - 34%) 0, 100% 34%, 100% 100%, 34% 100%, 0 calc(100% - 34%));');
  }
  L.push('}');

    L.push('');
    /* —— Firefox / 跨浏览器：补 ::-moz- 伪元素，导出到 Firefox 也不崩样式 —— */
    L.push('.brutal-slider__input::-moz-range-track {');
    L.push('  background: transparent;');
    L.push('  border: none;');
    L.push('  height: ' + trackH + 'px;');
    L.push('}');
    L.push('.brutal-slider__input::-moz-range-thumb {');
    L.push('  width: ' + knob + 'px;');
    L.push('  height: ' + knob + 'px;');
    L.push('  background: ' + s.color + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  border-radius: ' + s.radius + 'px;');
    if (hs) L.push('  box-shadow: ' + shadow + ';');
    if (style === 'skew') {
      L.push('  clip-path: polygon(30% 0, 100% 0, 70% 100%, 0 100%);');
    }
    L.push('}');
    /* —— 键盘焦点环（可访问性）：去掉默认 outline，给滑块套双环 —— */
    L.push('.brutal-slider__input:focus { outline: none; }');
    L.push('.brutal-slider__input:focus::-webkit-slider-thumb {');
    L.push('  box-shadow: 0 0 0 ' + Math.max(2, bw + 1) + 'px ' + s.bg + ', 0 0 0 ' + Math.max(4, bw + 3) + 'px ' + s.color + ';');
    L.push('}');
    L.push('.brutal-slider__input:focus::-moz-range-thumb {');
    L.push('  box-shadow: 0 0 0 ' + Math.max(2, bw + 1) + 'px ' + s.bg + ', 0 0 0 ' + Math.max(4, bw + 3) + 'px ' + s.color + ';');
    L.push('}');
    L.push('');

    L.push('.brutal-slider:hover .brutal-slider__val {');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('}');
    L.push('.brutal-slider:hover .brutal-slider__input::-webkit-slider-thumb {');
    L.push('  box-shadow: ' + hoverS + ';');
    L.push('}');
    L.push('.brutal-slider:active .brutal-slider__val {');
    L.push('  transform: translate(2px, 2px);');
    L.push('}');

    return L;
  }

  /* =========================================================
     下拉（select）
     ---------------------------------------------------------
     原生 <select> 去外观（appearance:none），右侧箭头自绘：
     slab 是一整条实心竖块 + 内三角，其余变体只留三角。
     ========================================================= */

function buildSlider(s) {

        const label = (s.text || '').trim();
        const val   = Math.round(Math.max(0, Math.min(100, Number(s.slValue) || 0)));
        let h = '<div class="brutal-slider">\n';
        h += '  <div class="brutal-slider__head">\n';
        h += '    <span class="brutal-slider__label">' + (label ? esc(label) : '') + '</span>\n';
        if (s.slShowVal !== false) {
          h += '    <span class="brutal-slider__val">' + val + '</span>\n';
        }
        h += '  </div>\n';
        h += '  <input class="brutal-slider__input" type="range" min="0" max="100" value="' + val + '" style="--val:' + val + '%">\n';
        h += '</div>';
        return h;
      
}

function randomSlider(s) {
s.slStyle = pick(['slab', 'slab', 'double', 'tick', 'skew', 'hatch', 'invert']);
      s.slValue = pick([12, 30, 45, 60, 75, 88]);
      s.slW     = pick([260, 300, 340, 400, 460]);
      s.slH     = pick([16, 20, 24, 30, 38]);
      s.slShowVal = Math.random() < 0.75;
      s.fontSize = pick([13, 14, 15, 16]);
      s.uppercase = Math.random() < 0.5;
}

COMPONENTS['slider'] = {
  label: '滑块',
  rootSel: '.brutal-slider',
  defaults: { slStyle: 'slab', slValue: 60, slW: 320, slH: 22, slShowVal: true },
  enums: { slStyle: Object.keys(SL_STYLES) },
  build: buildSlider,
  css: cssSlider,
  random: randomSlider,
  panel: `      <h2>滑块</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="slDouble">双线轨道</button>
        <button class="chip" type="button" data-preset="slTick">刻度轨道</button>
        <button class="chip" type="button" data-preset="slSkew">斜切滑块</button>
        <button class="chip" type="button" data-preset="slHatch">未填充斜纹</button>
        <button class="chip" type="button" data-preset="slGrid">网格轨道</button>
        <button class="chip" type="button" data-preset="slBlock">大方块滑块</button>
        <button class="chip" type="button" data-preset="slNotch">缺口滑块</button>
        <button class="chip" type="button" data-preset="slRing">圆环滑块</button>
      </div>
      <div class="field">
        <label for="fSlStyle">轨道 / 滑块变体</label>
        <select id="fSlStyle" data-key="slStyle">
          <option value="slab">方头滑块 / slab</option>
          <option value="double">双线轨道 / double</option>
          <option value="tick">刻度轨道 / tick</option>
          <option value="skew">斜切滑块 / skew</option>
          <option value="hatch">未填充斜纹 / hatch</option>
          <option value="invert">反色填充 / invert</option>
          <option value="block">大方块滑块 / block</option>
          <option value="notch">缺口滑块 / notch</option>
          <option value="grid">网格轨道 / grid</option>
          <option value="ring">圆环滑块 / ring</option>
        </select>
      </div>
      <div class="field">
        <label>当前值 <span class="val"><span data-out="slValue"></span></span></label>
        <input type="range" data-key="slValue" min="0" max="100" step="1">
      </div>
      <div class="grid-2">
        <div class="field">
          <label>轨道长 <span class="val"><span data-out="slW"></span>px</span></label>
          <input type="range" data-key="slW" min="160" max="560" step="10">
        </div>
        <div class="field">
          <label>轨道高 <span class="val"><span data-out="slH"></span>px</span></label>
          <input type="range" data-key="slH" min="10" max="46" step="1">
        </div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" data-key="slShowVal"> 显示当前值</label>
      </div>`
};
