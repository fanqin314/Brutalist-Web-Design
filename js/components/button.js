/* ===== components/button.js ===== */

  function cssButton(s) {
    let L = [];
    const pattern   = getPattern(s);
    const style     = s.btnStyle || 'solid';
    const bw        = s.borderWidth;
    const r         = s.radius;
    const hasIcon   = !!(BTN_ICONS[s.btnIcon] && s.btnIcon !== 'none');
    const iconRight = (s.btnIconPos !== 'left');
    const clip      = (style === 'skew' || style === 'corner' || style === 'notch');
    const gridCell  = Math.max(8, Math.round(s.fontSize * 0.7));   /* grid 的网格步长 */

    /* 变体量纲 */
    const cut   = Math.max(10, Math.round(s.fontSize * 0.85));
    const sk    = Math.max(9,  Math.round(s.fontSize * 0.65));
    const thick = Math.max(6,  bw + 4);
    const barW  = Math.max(16, Math.round(bw * 5));
    const gap   = Math.max(3,  bw);
    const armL  = Math.max(14, Math.round(s.fontSize * 1.05));
    const armW  = Math.max(5,  Math.round(bw * 1.4));

    /* padding 让位给装饰 */
    let padT = s.padY, padR = s.padX, padB = s.padY, padL = s.padX;
    if (style === 'rail')    padL += barW;
    if (style === 'double')  { padT += gap + bw; padR += gap + bw; padB += gap + bw; padL += gap + bw; }
    if (style === 'bracket') { padT += armW; padR += armW; padB += armW; padL += armW; }

    /* 完整 transform：用户设定的 rotate 在任何状态下都得带着 */
    const tf = function (extra) {
      let p = [];
      if (s.rotate !== 0) p.push('rotate(' + s.rotate + 'deg)');
      if (extra && extra.length) p = p.concat(extra);
      return p.length ? p.join(' ') : 'none';
    };

    /* ---------------- 基础块 ---------------- */
    L.push('.brutal-btn {');
    L.push('  position: relative;');
    L.push('  display: inline-flex;');
    L.push('  align-items: center;');
    L.push('  justify-content: center;');
    L.push('  gap: .46em;');
    L.push('  box-sizing: border-box;');
    L.push('  padding: ' + padT + 'px ' + padR + 'px ' + padB + 'px ' + padL + 'px;');
    L.push('  color: ' + s.color + ';');

    if (style === 'outline') {
      L.push('  background: transparent;');
    } else {
      L = L.concat(bgLines(s, pattern, '  '));
    }

    if (clip || style === 'bracket') {
      L.push('  border: none;');
    } else if (style === 'rail') {
      L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    } else {
      L = L.concat(borderLines(s, '  '));
    }

    if (!clip && r > 0) L.push('  border-radius: ' + r + 'px;');

    if (clip) {
      /* skew=整块倾斜 / notch=右上+左下削角 / corner=左上+右下切角 */
      let cp;
      if (style === 'skew') {
        cp = 'polygon(' + sk + 'px 0, 100% 0, calc(100% - ' + sk + 'px) 100%, 0 100%)';
      } else if (style === 'notch') {
        cp = 'polygon(0 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut + 'px, 100% 100%, ' +
             cut + 'px 100%, 0 calc(100% - ' + cut + 'px))';
      } else {
        cp = 'polygon(' + cut + 'px 0, 100% 0, 100% calc(100% - ' + cut + 'px), calc(100% - ' +
             cut + 'px) 100%, 0 100%, 0 ' + cut + 'px)';
      }
      L.push('  clip-path: ' + cp + ';');
    } else if (style === 'push') {
      L.push('  box-shadow: 0 ' + thick + 'px 0 0 ' + s.borderColor + ';');
    } else if (style === 'double') {
      const sh = [];
      if (hasShadow(s)) sh.push(shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor));
      sh.push('inset 0 0 0 ' + gap + 'px ' + s.bg);
      sh.push('inset 0 0 0 ' + (gap + bw) + 'px ' + s.borderColor);
      L.push('  box-shadow: ' + sh.join(', ') + ';');
    } else if (style === 'stamp') {
      /* 印章双框：实线内框（走上面的 borderLines）+ 外面再套一圈虚线，并整体略微歪斜 */
      const sh = [];
      if (hasShadow(s)) sh.push(shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor));
      if (sh.length) L.push('  box-shadow: ' + sh.join(', ') + ';');
      L.push('  outline: ' + Math.max(1, Math.round(bw * 0.6)) + 'px dashed ' + s.borderColor + ';');
      L.push('  outline-offset: 3px;');
      L.push('  transform: rotate(' + (s.rotate !== 0 ? s.rotate : -2.5) + 'deg);');
    } else if (style !== 'outline' && hasShadow(s)) {
      L.push('  box-shadow: ' + shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) + ';');
    }

    if (s.rotate !== 0) L.push('  transform: rotate(' + s.rotate + 'deg);');

    L = L.concat(fontLines(s, '  '));
    L.push('  line-height: 1;');
    L.push('  text-decoration: none;');
    L.push('  cursor: pointer;');
    L.push('  user-select: none;');
    L.push('  -webkit-tap-highlight-color: transparent;');
    L.push('  transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease, color .15s ease, border-color .15s ease;');
    L.push('}');

    /* ---------------- 侧栏标条：左侧一条实心粗标条 ----------------
       （早先用 border-left-width 加粗，结果只是"左边界粗一点"，看不出标条） */
    if (style === 'rail') {
      L.push('');
      L.push('.brutal-btn::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: 0;');
      L.push('  bottom: 0;');
      L.push('  left: 0;');
      L.push('  width: ' + barW + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    /* ---------------- 网格底纹 / 斜贴封条（::before 与 rail、bracket 互斥） ---------------- */
    if (style === 'grid') {
      const gInk = hexToRgba(s.color, 0.3);
      L.push('');
      L.push('.brutal-btn::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  background-image: repeating-linear-gradient(90deg, transparent 0 ' +
             (gridCell - 1) + 'px, ' + gInk + ' ' + (gridCell - 1) + 'px ' + gridCell + 'px), ' +
             'repeating-linear-gradient(0deg, transparent 0 ' + (gridCell - 1) + 'px, ' +
             gInk + ' ' + (gridCell - 1) + 'px ' + gridCell + 'px);');
      L.push('  pointer-events: none;');
      L.push('}');
    }
    if (style === 'tape') {
      L.push('');
      L.push('.brutal-btn::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  right: -' + Math.round(s.fontSize * 0.7) + 'px;');
      L.push('  top: -' + Math.round(s.fontSize * 0.55) + 'px;');
      L.push('  width: ' + Math.round(s.fontSize * 2.8) + 'px;');
      L.push('  height: ' + Math.max(10, Math.round(s.fontSize * 1.05)) + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  transform: rotate(24deg);');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    /* ---------------- 四角夹框：8 层背景拼出四只 L 角 ---------------- */
    if (style === 'bracket') {
      const lg = 'linear-gradient(' + s.borderColor + ', ' + s.borderColor + ')';
      const vl = armL + 'px', vw = armW + 'px';
      L.push('');
      L.push('.brutal-btn::before {');
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

    /* ---------------- 图标（纯 CSS 形状，跟随 currentColor） ---------------- */
    if (hasIcon) {
      L.push('');
      L.push('.brutal-btn__icon {');
      L.push('  flex: 0 0 auto;');
      L.push('  width: .82em;');
      L.push('  height: .82em;');
      L.push('  background: currentColor;');
      if (s.btnIcon === 'dot') L.push('  border-radius: 50%;');
      else if (ICON_POLY[s.btnIcon]) L.push('  clip-path: ' + ICON_POLY[s.btnIcon] + ';');
      if (!iconRight) L.push('  order: -1;');
      L.push('}');
    }

    /* ---------------- 角标 ---------------- */
    if (s.badge) {
      L.push('');
      L.push('.brutal-btn::after {');
      L.push('  content: attr(data-badge);');
      L.push('  position: absolute;');
      L.push('  top: 0;');
      L.push('  right: 0;');
      L.push('  padding: 3px 7px;');
      L.push('  background: ' + s.color + ';');
      L.push('  color: ' + s.bg + ';');
      L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
      L.push('  font-size: 9px;');
      L.push('  font-weight: 800;');
      L.push('  line-height: 1;');
      L.push('  letter-spacing: 0.12em;');
      L.push('  text-transform: uppercase;');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    /* ---------------- 悬停 ---------------- */
    const hv = [];
    const straighten = s.hoverStraighten && s.rotate !== 0;
    const ex = [];
    if (style === 'skew') ex.push('translate(' + Math.round(sk * 0.4) + 'px, 0)');
    if (s.hoverLift) ex.push('translateY(-6px)');
    if (straighten || ex.length) {
      let tp = [];
      if (!straighten && s.rotate !== 0) tp.push('rotate(' + s.rotate + 'deg)');
      if (ex.length) tp = tp.concat(ex);
      hv.push('  transform: ' + (tp.length ? tp.join(' ') : 'none') + ';');
    }

    if (style === 'push') {
      hv.push('  box-shadow: 0 ' + Math.round(thick * 1.6) + 'px 0 0 ' + s.borderColor + ';');
    } else if (style === 'double') {
      const sh = [];
      if (hasShadow(s)) sh.push(shadowStr(Math.round(s.shadowX * 1.6),
                                          Math.round(s.shadowY * 1.6) + (s.hoverLift ? 6 : 0),
                                          s.shadowBlur, s.shadowColor));
      sh.push('inset 0 0 0 ' + gap + 'px ' + s.bg);
      sh.push('inset 0 0 0 ' + (gap + bw) + 'px ' + s.borderColor);
      hv.push('  box-shadow: ' + sh.join(', ') + ';');
    } else if (!clip && style !== 'outline' && hasShadow(s) && (s.hoverGrowShadow || s.hoverLift)) {
      hv.push('  box-shadow: ' + hoverShadow(s) + ';');
    }

    if (style === 'outline') {
      hv.push('  background: ' + s.bg + ';');
      if (pattern) {
        hv.push('  background-image: ' + pattern.image + ';');
        hv.push('  background-size: ' + pattern.size + ';');
      }
    } else if (clip) {
      hv.push('  background: ' + s.borderColor + ';');
      hv.push('  color: ' + s.bg + ';');
    } else if (s.hoverInvert) {
      hv.push('  background-color: ' + s.color + ';');
      hv.push('  color: ' + s.bg + ';');
      if (pattern) hv.push('  background-image: none;');
    }

    if (hv.length) {
      L.push('');
      L.push('.brutal-btn:hover {');
      L = L.concat(hv);
      L.push('}');
    }

    /* ---------------- 按下 ---------------- */
    if (s.pressShake) {
      L.push('');
      L.push('.brutal-btn:active {');
      L.push('  animation: brutal-shake 0.4s ease-in-out;');
      L.push('}');
      L.push('');
      L.push('@keyframes brutal-shake {');
      L.push('  0%, 100% { transform: ' + tf([]) + '; }');
      L.push('  25%      { transform: ' + tf(['translateX(-5px)']) + '; }');
      L.push('  50%      { transform: ' + tf(['translateX(5px)']) + '; }');
      L.push('  75%      { transform: ' + tf(['translateX(-3px)']) + '; }');
      L.push('}');
    } else {
      const av = [];
      if (style === 'push') {
        av.push('  transform: ' + tf(['translateY(' + thick + 'px)']) + ';');
        av.push('  box-shadow: 0 0 0 0 ' + s.borderColor + ';');
      } else if (clip || style === 'outline') {
        av.push('  transform: ' + tf(['translate(2px, 2px)']) + ';');
      } else if (style === 'double') {
        av.push('  transform: ' + tf(['translate(' + s.shadowX + 'px, ' + s.shadowY + 'px)']) + ';');
        av.push('  box-shadow: inset 0 0 0 ' + gap + 'px ' + s.bg + ', inset 0 0 0 ' +
                (gap + bw) + 'px ' + s.borderColor + ';');
      } else if (hasShadow(s)) {
        av.push('  transform: ' + tf(['translate(' + s.shadowX + 'px, ' + s.shadowY + 'px)']) + ';');
        av.push('  box-shadow: none;');
      }
      if (av.length) {
        L.push('');
        L.push('.brutal-btn:active {');
        L = L.concat(av);
        L.push('}');
      }
    }

    return L;
  }

  /* ---------- CARD ----------
     卡片是"面"，变体差异必须落在版式与轮廓上：
       slab    底线款（硬边框 + 硬投影 + 标题分隔线）
       band    通栏硬切：顶部实心墨色条，正文整体下移
       bracket 四角夹框：无边框无投影，四只 L 角夹从外侧夹住
       bevel   斜切双边：切掉左上 / 右下两只角，影走 drop-shadow
       notch   缺口票卡：左右两腰各咬一个方缺口
       stamp   印章双框：外框 + 内框双线 + 虚线外圈
       rail    侧栏标条：左侧一条粗标条
       tape    斜贴封条：左上 / 右下各贴一条斜封条
     clip-path 会吃掉同一元素自身的 box-shadow，所以取形款一律走
     「::before 承载填充与取形 + 父级 filter: drop-shadow 出硬影」。
     装饰性内框（inset 影）单独存进 deco，悬停换影时叠加而非覆盖。 */

function buildButton(s) {

        const hasIcon = !!(BTN_ICONS[s.btnIcon] && s.btnIcon !== 'none');
        let h = '<button class="brutal-btn" type="button"' +
                (s.badge ? ' data-badge="' + esc(s.badge) + '"' : '') + '>\n';
        if (hasIcon) h += '  <span class="brutal-btn__icon"></span>\n';
        h += '  <span class="brutal-btn__label">' + esc(s.text || '按钮') + '</span>\n';
        h += '</button>';
        return h;
      
}

function randomButton(s) {
s.badge = Math.random() < 0.35 ? pick(['NEW', 'HOT', 'V2', '!', '99']) : '';
      s.btnStyle = pick(['solid', 'solid', 'outline', 'double', 'skew',
                             'corner', 'rail', 'bracket', 'push',
                             'grid', 'tape', 'notch', 'stamp']);
      s.btnIcon  = pick(['none', 'none', 'none', 'arrow', 'plus',
                             'check', 'bolt', 'star', 'chevron', 'dot']);
      s.btnIconPos = pick(['right', 'right', 'left']);
}

COMPONENTS['button'] = {
  label: '按钮',
  rootSel: '.brutal-btn',
  defaults: { badge: 'NEW', btnStyle: 'solid', btnIcon: 'none', btnIconPos: 'right' },
  enums: { btnStyle: Object.keys(BTN_STYLES), btnIcon: Object.keys(BTN_ICONS), btnIconPos: ['left', 'right'] },
  build: buildButton,
  css: cssButton,
  random: randomButton,
  panel: `      <h2>按钮轮廓</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="btOutline">空描边</button>
        <button class="chip" type="button" data-preset="btDouble">双线硬框</button>
        <button class="chip" type="button" data-preset="btSkew">斜切块</button>
        <button class="chip" type="button" data-preset="btCorner">切角块</button>
        <button class="chip" type="button" data-preset="btRail">侧栏标条</button>
        <button class="chip" type="button" data-preset="btBracket">四角夹框</button>
        <button class="chip" type="button" data-preset="btPush">厚底立体</button>
        <button class="chip" type="button" data-preset="btArrow">箭头动作</button>
        <button class="chip" type="button" data-preset="btGrid">网格纹理</button>
        <button class="chip" type="button" data-preset="btTape">斜贴封条</button>
        <button class="chip" type="button" data-preset="btNotch">缺口</button>
        <button class="chip" type="button" data-preset="btStamp">印章</button>
      </div>
      <div class="field">
        <label for="fBtnStyle">轮廓变体</label>
        <select id="fBtnStyle" data-key="btnStyle">
          <option value="solid">硬块 / solid</option>
          <option value="outline">空描边 / outline</option>
          <option value="double">双线硬框 / double</option>
          <option value="skew">斜切块 / skew</option>
          <option value="corner">切角块 / corner</option>
          <option value="rail">侧栏标条 / rail</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="push">厚底立体 / push</option>
          <option value="grid">网格纹理 / grid</option>
          <option value="tape">斜贴封条 / tape</option>
          <option value="notch">缺口按钮 / notch</option>
          <option value="stamp">印章双框 / stamp</option>
        </select>
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="fBtnIcon">按钮图标</label>
          <select id="fBtnIcon" data-key="btnIcon">
            <option value="none">无 / none</option>
            <option value="arrow">箭头 / arrow</option>
            <option value="plus">加号 / plus</option>
            <option value="check">对勾 / check</option>
            <option value="bolt">闪电 / bolt</option>
            <option value="star">星形 / star</option>
            <option value="chevron">尖括号 / chevron</option>
            <option value="dot">圆点 / dot</option>
          </select>
        </div>
        <div class="field">
          <label for="fBtnIconPos">图标位置</label>
          <select id="fBtnIconPos" data-key="btnIconPos">
            <option value="right">文字右侧</option>
            <option value="left">文字左侧</option>
          </select>
        </div>
      </div>`
};
