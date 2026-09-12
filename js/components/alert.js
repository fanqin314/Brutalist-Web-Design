/* ===== components/alert.js ===== */

  function cssAlert(s) {
    const style = AL_STYLES[s.alStyle] ? s.alStyle : 'slab';
    const L = [];
    const bw   = Math.max(0, s.borderWidth);
    const fs   = s.fontSize;
    const padX = s.padX, padY = s.padY;
    const r    = Math.max(0, s.radius);
    const barH = Math.max(8, bw * 2);          /* banner 的顶部通栏条 */
    const barW = (style === 'rail') ? Math.max(18, bw * 4) : 10; /* rail 的左侧粗条 */
    const cut  = Math.max(12, Math.round(fs * 1.1)); /* notch 的切角边长 */
    const SEV  = {
      info:    '#1f6feb',
      success: '#1a9c4b',
      warn:    '#e0a200',
      error:   '#e23b2e'
    };
    const sev = SEV[(['info', 'success', 'warn', 'error'].indexOf(s.alSev) >= 0) ? s.alSev : 'info'];
    const gap = Math.max(10, Math.round(fs * 0.8));
    const iconS = Math.max(22, fs + 10);

    L.push('.brutal-alert {');
    L.push('  position: relative;');
    L.push('  display: flex;');
    L.push('  align-items: stretch;');
    L.push('  gap: ' + gap + 'px;');
    L.push('  min-width: 260px;');
    L.push('  max-width: 560px;');
    /* banner 的顶部条要占布局高度，所以顶部内边距给它让位 */
    const padTop  = (style === 'banner') ? (padY + barH) : padY;
    const padLeft = (style === 'banner') ? padX : (padX + 14);
    L.push('  padding: ' + padTop + 'px ' + padX + 'px ' + padY + 'px ' + padLeft + 'px;');
    L.push('  background: ' + (style === 'outline' ? 'transparent' : s.bg) + ';');
    L.push('  color: ' + s.color + ';');
    if (style === 'stamp') {
      L.push('  border: ' + bw + 'px dashed ' + s.borderColor + ';');
    } else if (style === 'bracket' || style === 'notch') {
      /* clip-path 会连带裁掉边框，bracket 的角由 ::after 另画 —— 两者都不走常规边框 */
      L.push('  border: none;');
    } else if (bw > 0) {
      L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    }
    if (style === 'notch') {
      L.push('  clip-path: polygon(0 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut +
             'px, 100% 100%, ' + cut + 'px 100%, 0 calc(100% - ' + cut + 'px));');
    }
    /* clip-path 会裁掉圆角与外投影，bracket 的框线由伪元素画出 —— 这两种都不给 */
    const noDeco = (style === 'notch' || style === 'bracket');
    if (r > 0 && !noDeco) L.push('  border-radius: ' + r + 'px;');
    if (hasShadow(s) && !noDeco) L.push('  box-shadow: ' + shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) + ';');
    /* stamp 自带歪斜；用户若手动给过 rotate 就以用户的为准 */
    const rot = (s.rotate !== 0) ? s.rotate : (style === 'stamp' ? -1.2 : 0);
    if (rot !== 0) L.push('  transform: rotate(' + rot + 'deg);');
    L.push('}');

    L.push('.brutal-alert__bar {');
    L.push('  position: absolute;');
    if (style === 'banner') {
      /* 通栏横幅：色条改铺在顶边（左竖条挪到顶部），整条压住上沿 */
      L.push('  left: 0; right: 0; top: 0;');
      L.push('  height: ' + barH + 'px;');
    } else {
      L.push('  left: 0; top: 0; bottom: 0;');
      L.push('  width: ' + barW + 'px;');
    }
    L.push('  background: ' + sev + ';');
    if (r > 0 && style !== 'banner') {
      L.push('  border-top-left-radius: ' + r + 'px;');
      L.push('  border-bottom-left-radius: ' + r + 'px;');
    }
    L.push('}');

    if (style === 'bracket') {
      /* 四角夹框：容器不画线，改由四只 L 角夹出来 */
      const lg = 'linear-gradient(' + s.borderColor + ', ' + s.borderColor + ')';
      const armL = Math.max(12, Math.round(fs * 0.9)) + 'px';
      const armW = Math.max(2, Math.round(bw * 0.7)) + 'px';
      const sz = [armL + ' ' + armW, armW + ' ' + armL];
      L.push('');
      L.push('.brutal-alert::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: -' + Math.max(4, Math.round(bw * 0.8)) + 'px;');
      L.push('  background-image: ' + [lg, lg, lg, lg, lg, lg, lg, lg].join(', ') + ';');
      L.push('  background-size: ' + sz.concat(sz, sz, sz).join(', ') + ';');
      L.push('  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;');
      L.push('  background-repeat: no-repeat;');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    if (style === 'tape') {
      /* 斜贴封条：右上角斜压一条语义色封条 */
      L.push('');
      L.push('.brutal-alert::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  right: -' + Math.round(fs * 0.5) + 'px;');
      L.push('  top: -' + Math.round(fs * 0.4) + 'px;');
      L.push('  width: ' + Math.round(fs * 2.4) + 'px;');
      L.push('  height: ' + Math.max(10, Math.round(fs * 0.9)) + 'px;');
      L.push('  background: ' + sev + ';');
      L.push('  transform: rotate(26deg);');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    L.push('.brutal-alert__icon {');
    L.push('  flex: 0 0 auto;');
    L.push('  width: ' + iconS + 'px;');
    L.push('  height: ' + iconS + 'px;');
    L.push('  display: flex; align-items: center; justify-content: center;');
    L.push('  background: ' + sev + ';');
    L.push('  color: #fff;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-weight: 900;');
    L.push('  font-size: ' + Math.max(14, fs) + 'px;');
    if (r > 0) L.push('  border-radius: ' + Math.max(0, r - 2) + 'px;');
    L.push('}');

    L.push('.brutal-alert__body {');
    L.push('  display: flex; flex-direction: column; gap: 4px;');
    L.push('}');

    L.push('.brutal-alert__title {');
    L.push('  margin: 0;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + fs + 'px;');
    L.push('  font-weight: ' + s.fontWeight + ';');
    L.push('  letter-spacing: ' + s.letterSpacing + 'px;');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('}');

    L.push('.brutal-alert__msg {');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + Math.max(12, fs - 2) + 'px;');
    L.push('  line-height: 1.45;');
    L.push('  opacity: .85;');
    L.push('}');

    return L;
  }

  /* ---------------- 表格 ---------------- */

function buildAlert(s) {

        const sev   = (['info', 'success', 'warn', 'error'].indexOf(s.alSev) >= 0) ? s.alSev : 'info';
        const ICON  = { info: 'i', success: '✓', warn: '!', error: '×' }[sev];
        const title = (s.text || '提示').trim();
        const msg   = (s.sub || '').trim();
        let h = '<div class="brutal-alert brutal-alert--' + sev + '" role="alert">\n';
        h += '  <span class="brutal-alert__bar" aria-hidden="true"></span>\n';
        h += '  <span class="brutal-alert__icon" aria-hidden="true">' + ICON + '</span>\n';
        h += '  <div class="brutal-alert__body">\n';
        h += '    <strong class="brutal-alert__title">' + esc(title) + '</strong>\n';
        if (msg) h += '    <span class="brutal-alert__msg">' + esc(msg) + '</span>\n';
        h += '  </div>\n';
        h += '</div>';
        return h;
      
}

function randomAlert(s) {
s.alSev = pick(['info', 'success', 'warn', 'error']);
      s.sub = pick(['操作已成功完成。', '请检查输入的信息。', '系统将于今晚维护。', '发生未知错误，请重试。']);
      s.fontSize = pick([14, 15, 16, 18]);
      s.uppercase = Math.random() < 0.4;
}

COMPONENTS['alert'] = {
  label: '警告条',
  rootSel: '.brutal-alert',
  defaults: { alStyle: 'slab', alSev: 'info' },
  enums: { alStyle: Object.keys(AL_STYLES), alSev: ['info', 'success', 'warn', 'error'] },
  build: buildAlert,
  css: cssAlert,
  random: randomAlert,
  panel: `      <h2>警告条</h2>
      <div class="field">
        <label for="fAlStyle">轮廓变体</label>
        <select id="fAlStyle" data-key="alStyle">
          <option value="slab">硬块警告 / slab</option>
          <option value="banner">通栏横幅 / banner</option>
          <option value="rail">左侧粗条 / rail</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="stamp">印章歪斜 / stamp</option>
          <option value="notch">切角警告 / notch</option>
          <option value="tape">斜贴封条 / tape</option>
          <option value="outline">空描边 / outline</option>
        </select>
      </div>
      <div class="field">
        <label for="fAlSev">语义级别</label>
        <select id="fAlSev" data-key="alSev">
          <option value="info">信息 / info</option>
          <option value="success">成功 / success</option>
          <option value="warn">警告 / warn</option>
          <option value="error">错误 / error</option>
        </select>
      </div>
      <div class="field">
        <label for="fAlertSub">描述文字（留空隐藏）</label>
        <input type="text" id="fAlertSub" data-key="sub" maxlength="80" placeholder="描述文字">
      </div>`
};
