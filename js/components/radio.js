/* ===== components/radio.js ===== */

  function cssRadio(s) {
    const style  = RD_STYLES[s.rdStyle] ? s.rdStyle : 'box';
    const pattern = getPattern(s);
    const bw     = Math.max(0, s.borderWidth);
    const size   = Math.max(12, s.rdSize === undefined ? 22 : s.rdSize);
    const gap    = Math.max(0, s.rdGap === undefined ? 10 : s.rdGap);
    const w      = Math.max(140, s.rdW || 260);
    const ease   = 'cubic-bezier(.34, 1.56, .64, 1)';
    const shadow = shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor);
    const hs     = hasShadow(s);
    const hoverS = hoverShadow(s);
    const inner  = Math.max(4, size - bw * 2);
    const markW  = Math.max(4, Math.round(inner * 0.56));
    /* 标条必须明显宽于边框 —— 8px 挨着 4px 边框只是"左边粗一点"，一眼看不出是变体 */
    const barW   = Math.max(16, Math.round(bw * 3));
    const padV   = Math.max(6, Math.round(size * 0.4));
    const padH   = Math.max(10, Math.round(size * 0.55));
    const padL   = (style === 'dash') ? Math.max(padH, barW + 10) : padH;
    const markRing = (style === 'skew' || style === 'notch'); /* 实心外块被 clip 取形 + 内腔让位，两片叠出空心 */
    const fillAll  = (style === 'block');  /* block 选中时整块填满内腔，而不是中心缩一枚小方块 */

    /* 两态骨架：OFF 未选 / ON 选中。差异只写进这两只对象，
       下面负责把对象翻译成 CSS —— 和复选框同一个套路 */
    const OFF = { rowBg: '#ffffff', rowColor: s.color, markBg: '#ffffff',
                  markFill: 'transparent', rowShadow: hs ? shadow : null,
                  rowT: 'none', markR: s.radius + 'px', ring: 'solid', clip: null };
    const ON  = { rowBg: s.bg, rowColor: s.color, markBg: '#ffffff',
                  markFill: s.color, rowShadow: hs ? shadow : null,
                  rowT: 'none', markR: s.radius + 'px', ring: 'solid', clip: null };

    if (style === 'dot') {
      OFF.markR = '50%'; ON.markR = '50%';
    } else if (style === 'dash') {
      OFF.markR = '0px'; ON.markR = '0px';
    } else if (style === 'invert') {
      ON.rowBg = s.color; ON.rowColor = s.bg;
      ON.markBg = s.color; ON.markFill = s.bg;
    } else if (style === 'skew') {
      const cut = 'polygon(24% 0, 100% 0, 76% 100%, 0 100%)';
      OFF.markR = '0px'; ON.markR = '0px';
      OFF.clip = cut; ON.clip = cut;
    } else if (style === 'stamp') {
      /* 印章：整行不变色（否则和 invert 长得一样），靠「实线内框 + 虚线外圈 + 歪斜」表态 */
      OFF.ring = 'dashed';
      ON.rowBg = '#ffffff'; ON.rowColor = s.color;
      ON.markBg = '#ffffff'; ON.markFill = s.color;
      ON.rowT = 'rotate(-1.5deg)';
      ON.ringOut = true;
    } else if (style === 'notch') {
      /* 切角：右上 + 左下各切一块。skew 是"整块倾斜"，notch 是"两角被削"，一眼能分开 */
      const cut = 'polygon(0 0, calc(100% - 34%) 0, 100% 34%, 100% 100%, 34% 100%, 0 calc(100% - 34%))';
      OFF.markR = '0px'; ON.markR = '0px';
      OFF.clip = cut; ON.clip = cut;
    } else if (style === 'block') {
      /* 实心方块：方形标记、选中时内腔被整块填满（对比 dot 的圆点、box 的中心小方块） */
      OFF.markR = '0px'; ON.markR = '0px';
    } else if (style === 'bar') {
      /* 底部粗条：整行底边拉出一条实心横条 —— 与 dash 的左侧竖条方向相反 */
      ON.barBottom = true;
    } else if (style === 'frame') {
      /* 双线外框：选中行外面再套一圈实线。stamp 是虚线外圈 + 歪斜，这里是端正的实线双框 */
      ON.rowBg = s.bg; ON.rowColor = s.color;
      ON.ringOut = true; ON.ringSolid = true;
    }

    let L = [];

    L.push('.brutal-radio {');
    L.push('  display: inline-flex;');
    L.push('  flex-direction: column;');
    L.push('  gap: ' + gap + 'px;');
    L.push('  width: ' + w + 'px;');
    L.push('  box-sizing: border-box;');
    L.push('  color: ' + s.color + ';');
    L = L.concat(fontLines(s));
    L.push('  line-height: 1;');
    L.push('  user-select: none;');
    L.push('}');

    L.push('');
    L.push('.brutal-radio__opt {');
    L.push('  position: relative;');
    L.push('  display: flex;');
    L.push('  align-items: center;');
    L.push('  gap: ' + gap + 'px;');
    L.push('  box-sizing: border-box;');
    L.push('  padding: ' + padV + 'px ' + padH + 'px ' + padV + 'px ' + padL + 'px;');
    L.push('  background: #ffffff;');
    L.push('  color: ' + OFF.rowColor + ';');
    L.push('  border: ' + bw + 'px ' + OFF.ring + ' ' + s.borderColor + ';');
    L.push('  border-radius: ' + s.radius + 'px;');
    if (OFF.rowShadow) L.push('  box-shadow: ' + OFF.rowShadow + ';');
    L.push('  cursor: pointer;');
    L.push('  transform: ' + OFF.rowT + ';');
    L.push('  transition: background-color .16s ' + ease + ', color .16s ' + ease +
           ', box-shadow .16s ' + ease + ', transform .16s ' + ease + ';');
    L.push('}');

    /* 视觉隐藏真 input：用 opacity 而不是 display:none ——
       display:none 的元素不可聚焦，Tab 键就永远走不到单选组 */
    L.push('');
    L.push('.brutal-radio__input {');
    L.push('  position: absolute;');
    L.push('  width: 1px;');
    L.push('  height: 1px;');
    L.push('  opacity: 0;');
    L.push('  margin: 0;');
    L.push('  pointer-events: none;');
    L.push('}');

    L.push('');
    L.push('.brutal-radio__mark {');
    L.push('  position: relative;');
    L.push('  flex: 0 0 auto;');
    L.push('  display: block;');
    L.push('  width: ' + size + 'px;');
    L.push('  height: ' + size + 'px;');
    L.push('  box-sizing: border-box;');
    if (markRing) {
      /* 实心外块被 clip-path 取形，自身边框会被一起剪掉 —— 所以边框改由内腔让位表现 */
      L.push('  background: ' + s.borderColor + ';');
      L.push('  border: none;');
      L.push('  clip-path: ' + OFF.clip + ';');
    } else {
      L.push('  background: ' + OFF.markBg + ';');
      L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
      L.push('  border-radius: ' + OFF.markR + ';');
    }
    L.push('}');

    if (markRing) {
      L.push('');
      L.push('.brutal-radio__mark::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: ' + Math.max(2, bw) + 'px;');
      L.push('  background: #ffffff;');
      L.push('  clip-path: ' + OFF.clip + ';');
      L.push('  transition: background .16s ' + ease + ';');
      L.push('}');
      L.push('.brutal-radio__opt:has(input:checked) .brutal-radio__mark::before {');
      L.push('  background: ' + (style === 'invert' ? s.bg : s.color) + ';');
      L.push('}');
    } else {
      /* block 走 inset 撑满内腔（整块填色），其余走中心缩放的小方块 */
      const tfOff = fillAll ? 'scale(0)' : 'translate(-50%, -50%) scale(.4)';
      const tfOn  = fillAll ? 'scale(1)' : 'translate(-50%, -50%) scale(1)';
      L.push('');
      L.push('.brutal-radio__mark::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      if (fillAll) {
        L.push('  inset: ' + bw + 'px;');
      } else {
        L.push('  left: 50%;');
        L.push('  top: 50%;');
        L.push('  width: ' + markW + 'px;');
        L.push('  height: ' + markW + 'px;');
      }
      L.push('  border-radius: ' + OFF.markR + ';');
      L.push('  background: ' + OFF.markFill + ';');
      L.push('  transform: ' + tfOff + ';');
      L.push('  transition: transform .16s ' + ease + ', background .16s ' + ease + ';');
      L.push('}');
    }

    /* 选中态：整行表态 */
    L.push('');
    L.push('.brutal-radio__opt:has(input:checked) {');
    L.push('  background-color: ' + ON.rowBg + ';');
    if (pattern) {
      L.push('  background-image: ' + pattern.image + ';');
      L.push('  background-size: ' + pattern.size + ';');
    }
    L.push('  color: ' + ON.rowColor + ';');
    if (ON.ring !== 'solid') L.push('  border-style: ' + ON.ring + ';');
    if (ON.ringOut) {
      L.push('  outline: ' + Math.max(1, Math.round(bw * 0.6)) + 'px dashed ' + s.borderColor + ';');
      L.push('  outline-offset: 3px;');
    }
    L.push('  transform: ' + ON.rowT + ';');
    L.push('}');
    if (!markRing) {
      L.push('.brutal-radio__opt:has(input:checked) .brutal-radio__mark {');
      L.push('  background: ' + ON.markBg + ';');
      L.push('  border-radius: ' + ON.markR + ';');
      L.push('}');
      L.push('.brutal-radio__opt:has(input:checked) .brutal-radio__mark::before {');
      L.push('  background: ' + ON.markFill + ';');
      L.push('  transform: ' + (fillAll ? 'scale(1)' : 'translate(-50%, -50%) scale(1)') + ';');
      L.push('}');
    }

    /* dash 的左侧粗标条：绝对定位实心块。
       不能用 border-left-width —— 那只是"左边界粗一点"，一眼看不出是变体 */
    if (style === 'dash' || style === 'bar') {
      const vertical = (style === 'dash');
      L.push('');
      L.push('.brutal-radio__opt::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      if (vertical) {
        L.push('  top: 0;');
        L.push('  bottom: 0;');
        L.push('  left: 0;');
        L.push('  width: ' + barW + 'px;');
      } else {
        L.push('  left: 0;');
        L.push('  right: 0;');
        L.push('  bottom: 0;');
        L.push('  height: ' + Math.max(6, Math.round(bw * 2)) + 'px;');
      }
      L.push('  background: ' + s.color + ';');
      L.push('  transform: ' + (vertical ? 'scaleY(0)' : 'scaleX(0)') + ';');
      L.push('  transform-origin: center;');
      L.push('  transition: transform .16s ' + ease + ';');
      L.push('}');
      L.push('.brutal-radio__opt:has(input:checked)::after {');
      L.push('  transform: ' + (vertical ? 'scaleY(1)' : 'scaleX(1)') + ';');
      L.push('}');
    }

    /* 悬停 / 按下写在根上：矩阵的状态类是打在根元素上的，
       写成 .brutal-radio__opt:hover 的话矩阵那一格不会有任何变化 */
    L.push('');
    L.push('.brutal-radio:hover .brutal-radio__opt {');
    L.push('  box-shadow: ' + hoverS + ';');
    L.push('}');
    L.push('.brutal-radio:active .brutal-radio__opt {');
    L.push('  transform: translate(2px, 2px);');
    L.push('  box-shadow: none;');
    L.push('}');

    return L;
  }

  /* =========================================================
     进度条（progress）
     ========================================================= */

function buildRadio(s) {

        /* 三个选项，第二个选中；name 统一给 plan，矩阵里会按份加下标 */
        const opts = [s.text || '选项一', '选项二', '选项三'];
        let h = '<div class="brutal-radio">\n';
        opts.forEach(function (t, i) {
          h += '  <label class="brutal-radio__opt">\n';
          h += '    <input class="brutal-radio__input" type="radio" name="plan"' +
               (i === 1 ? ' checked' : '') + '>\n';
          h += '    <span class="brutal-radio__mark"></span>\n';
          h += '    <span class="brutal-radio__text">' + esc(t) + '</span>\n';
          h += '  </label>\n';
        });
        h += '</div>';
        return h;
      
}

function randomRadio(s) {
s.rdStyle = pick(['box', 'box', 'dot', 'dash', 'invert', 'skew', 'stamp']);
      s.rdSize  = pick([16, 20, 22, 26, 30]);
      s.rdGap   = pick([6, 8, 10, 12, 16]);
      s.rdW     = pick([220, 260, 300, 340]);
      s.fontSize = pick([14, 15, 16, 18]);
      s.uppercase = Math.random() < 0.2;
}

COMPONENTS['radio'] = {
  label: '单选组',
  rootSel: '.brutal-radio',
  defaults: { rdStyle: 'box', rdSize: 22, rdGap: 10, rdW: 260 },
  enums: { rdStyle: Object.keys(RD_STYLES) },
  build: buildRadio,
  css: cssRadio,
  random: randomRadio,
  panel: `      <h2>单选组</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="rdDash">左侧粗标</button>
        <button class="chip" type="button" data-preset="rdInvert">选中反白</button>
        <button class="chip" type="button" data-preset="rdSkew">斜切标记</button>
        <button class="chip" type="button" data-preset="rdStamp">印章歪斜</button>
      </div>
      <div class="field">
        <label for="fRdStyle">选中表态变体</label>
        <select id="fRdStyle" data-key="rdStyle">
          <option value="box">方框方标 / box</option>
          <option value="dot">圆框圆点 / dot</option>
          <option value="dash">左侧粗标 / dash</option>
          <option value="invert">选中反白 / invert</option>
          <option value="skew">斜切标记 / skew</option>
          <option value="stamp">印章歪斜 / stamp</option>
          <option value="notch">切角标记 / notch</option>
          <option value="block">实心方块 / block</option>
          <option value="bar">底部粗条 / bar</option>
          <option value="frame">双线外框 / frame</option>
        </select>
      </div>
      <div class="field">
        <label>组宽度 <span class="val"><span data-out="rdW"></span>px</span></label>
        <input type="range" data-key="rdW" min="140" max="440" step="10">
      </div>
      <div class="grid-2">
        <div class="field">
          <label>标记尺寸 <span class="val"><span data-out="rdSize"></span>px</span></label>
          <input type="range" data-key="rdSize" min="12" max="38" step="1">
        </div>
        <div class="field">
          <label>行距 <span class="val"><span data-out="rdGap"></span>px</span></label>
          <input type="range" data-key="rdGap" min="0" max="24" step="1">
        </div>
      </div>`
};
