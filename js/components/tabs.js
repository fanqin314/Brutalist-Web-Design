/* ===== components/tabs.js ===== */

  function cssTabs(s) {
    const style = TS_STYLES[s.tsStyle] ? s.tsStyle : 'slab';
    const L = [];
    const bw   = Math.max(1, s.borderWidth);
    const fs   = s.fontSize;
    const padX = s.padX, padY = s.padY;
    const r    = Math.max(0, s.radius);
    const railW = Math.max(8, Math.round(bw * 3));   /* rail 的左侧标条 */
    const cut   = Math.max(10, Math.round(fs * 0.8));/* notch 的切角边长 */

    L.push('.brutal-tabs {');
    L.push('  width: 100%;');
    L.push('  max-width: 520px;');
    if (s.rotate !== 0) L.push('  transform: rotate(' + s.rotate + 'deg);');
    L.push('}');

    L.push('.brutal-tabs__bar {');
    L.push('  display: flex;');
    /* under / invert 的标签栏不铺底：让激活态的下划线或反白块自己说话 */
    const barSolid = !(style === 'under' || style === 'invert');
    L.push('  background: ' + (barSolid ? s.borderColor : 'transparent') + ';');
    if (barSolid) L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    else L.push('  border: none;');
    if (r > 0) L.push('  border-radius: ' + r + 'px ' + r + 'px 0 0;');
    L.push('}');

    L.push('.brutal-tabs__tab {');
    L.push('  appearance: none;');
    L.push('  cursor: pointer;');
    L.push('  border: none;');
    L.push('  border-right: ' + Math.max(1, Math.round(bw * 0.6)) + 'px solid ' + s.borderColor + ';');
    L.push('  padding: ' + padY + 'px ' + padX + 'px;');
    L.push('  background: ' + s.bg + ';');
    L.push('  color: ' + s.color + ';');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + fs + 'px;');
    L.push('  font-weight: ' + s.fontWeight + ';');
    L.push('  letter-spacing: ' + s.letterSpacing + 'px;');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('}');

    L.push('.brutal-tabs__tab:last-child { border-right: none; }');

    L.push('.brutal-tabs__tab[aria-selected="true"] {');
    if (style === 'under') {
      /* 粗下划线：背景不动，底部压一条粗线（inset 阴影，不占布局） */
      L.push('  background: transparent;');
      L.push('  color: ' + s.color + ';');
      L.push('  box-shadow: inset 0 -' + Math.max(4, bw + 2) + 'px 0 0 ' + s.borderColor + ';');
    } else if (style === 'invert') {
      /* 反白：用 color/bg 整套互换，不是 slab 那套 shadowColor 实心 */
      L.push('  background: ' + s.color + ';');
      L.push('  color: ' + s.bg + ';');
    } else if (style === 'notch') {
      /* 缺口标签：右上 + 左下削角 */
      L.push('  background: ' + s.shadowColor + ';');
      L.push('  color: ' + s.bg + ';');
      L.push('  clip-path: polygon(0 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut +
             'px, 100% 100%, ' + cut + 'px 100%, 0 calc(100% - ' + cut + 'px));');
    } else if (style === 'stamp') {
      /* 印章：本体不变色，靠虚线外圈 + 歪斜表态 */
      L.push('  background: ' + s.bg + ';');
      L.push('  color: ' + s.color + ';');
      L.push('  outline: ' + Math.max(1, Math.round(bw * 0.6)) + 'px dashed ' + s.borderColor + ';');
      L.push('  outline-offset: 2px;');
      L.push('  transform: rotate(-1.5deg);');
    } else {
      L.push('  background: ' + s.shadowColor + ';');
      L.push('  color: ' + s.bg + ';');
    }
    L.push('}');

    if (style === 'rail') {
      /* 左侧标条：激活标签左端拉出一条实心竖条 */
      L.push('');
      L.push('.brutal-tabs__tab::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  left: 0; top: 0; bottom: 0;');
      L.push('  width: ' + railW + 'px;');
      L.push('  background: ' + s.color + ';');
      L.push('  transform: scaleX(0);');
      L.push('  transform-origin: left;');
      L.push('  transition: transform .16s cubic-bezier(.34, 1.56, .64, 1);');
      L.push('}');
      L.push('.brutal-tabs__tab[aria-selected="true"]::before {');
      L.push('  transform: scaleX(1);');
      L.push('}');
    }

    if (style === 'tape') {
      /* 斜贴封条：激活标签右上角斜压一条实心封条 */
      L.push('');
      L.push('.brutal-tabs__tab[aria-selected="true"]::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  right: -' + Math.round(fs * 0.4) + 'px;');
      L.push('  top: -' + Math.round(fs * 0.35) + 'px;');
      L.push('  width: ' + Math.round(fs * 2.2) + 'px;');
      L.push('  height: ' + Math.max(8, Math.round(fs * 0.7)) + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  transform: rotate(24deg);');
      L.push('}');
    }

    if (style === 'bracket') {
      /* 四角夹框：激活标签被四只 L 角夹住（8 层背景拼角） */
      const lg = 'linear-gradient(' + s.borderColor + ', ' + s.borderColor + ')';
      const armL = Math.max(8, Math.round(fs * 0.5)) + 'px';
      const armW = Math.max(2, Math.round(bw * 0.5)) + 'px';
      const sz = [armL + ' ' + armW, armW + ' ' + armL];
      L.push('');
      L.push('.brutal-tabs__tab[aria-selected="true"]::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: -' + Math.max(4, Math.round(bw * 0.8)) + 'px;');
      L.push('  background-image: ' + [lg, lg, lg, lg, lg, lg, lg, lg].join(', ') + ';');
      L.push('  background-size: ' + sz.concat(sz, sz, sz).join(', ') + ';');
      L.push('  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;');
      L.push('  background-repeat: no-repeat;');
      L.push('}');
    }

    L.push('.brutal-tabs__tab:hover {');
    L.push('  background: ' + hexToRgba(s.shadowColor, 0.85) + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('}');

    L.push('.brutal-tabs__panel {');
    L.push('  padding: ' + padY + 'px ' + padX + 'px;');
    L.push('  background: ' + s.bg + ';');
    L.push('  color: ' + s.color + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  border-top: none;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + fs + 'px;');
    if (r > 0) L.push('  border-radius: 0 0 ' + r + 'px ' + r + 'px;');
    if (hasShadow(s)) L.push('  box-shadow: ' + shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) + ';');
    L.push('}');

    return L;
  }


function buildTabs(s) {

        const labels = String(s.tTabs || '').split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 5);
        if (!labels.length) labels.push('标签一');
        const body = (s.text || '内容').trim();
        const uid  = 'bt' + Math.random().toString(36).slice(2, 8);
        let h = '<div class="brutal-tabs">\n';
        h += '  <div class="brutal-tabs__bar" role="tablist">\n';
        labels.forEach(function (t, i) {
          h += '    <button class="brutal-tabs__tab" type="button" role="tab" id="' + uid + '-t' + i +
               '" aria-controls="' + uid + '-p' + i + '"' + (i === 0 ? ' aria-selected="true"' : '') + '>' + esc(t) + '</button>\n';
        });
        h += '  </div>\n';
        labels.forEach(function (t, i) {
          h += '  <div class="brutal-tabs__panel" role="tabpanel" id="' + uid + '-p' + i +
               '" aria-labelledby="' + uid + '-t' + i + '"' + (i === 0 ? '' : ' hidden') + '>' + esc(body) + '</div>\n';
        });
        h += '</div>';
        return h;
      
}

function randomTabs(s) {
s.tsStyle = pick(['slab', 'slab', 'under', 'bracket', 'notch', 'invert', 'stamp', 'rail', 'tape']);
      s.tTabs = pick(['概览, 规格, 评价', '基础, 进阶, 高级', 'Day 1, Day 2, Day 3']);
      s.fontSize = pick([14, 15, 16, 18]);
      s.uppercase = Math.random() < 0.4;
}

COMPONENTS['tabs'] = {
  label: '标签页',
  rootSel: '.brutal-tabs',
  defaults: { tsStyle: 'slab', tTabs: '概览, 规格, 评价' },
  enums: { tsStyle: Object.keys(TS_STYLES) },
  build: buildTabs,
  css: cssTabs,
  random: randomTabs,
  panel: `      <h2>标签页</h2>
      <div class="field">
        <label for="fTsStyle">标签变体</label>
        <select id="fTsStyle" data-key="tsStyle">
          <option value="slab">硬块标签 / slab</option>
          <option value="under">粗下划线 / under</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="notch">缺口标签 / notch</option>
          <option value="invert">反白标签 / invert</option>
          <option value="stamp">印章标签 / stamp</option>
          <option value="rail">侧栏标签 / rail</option>
          <option value="tape">斜贴标签 / tape</option>
        </select>
      </div>
      <div class="field">
        <label for="fTabsOpts">标签（逗号分隔，最多 5 个）</label>
        <input type="text" id="fTabsOpts" data-key="tTabs" maxlength="50" placeholder="概览, 规格, 评价">
      </div>`
};
