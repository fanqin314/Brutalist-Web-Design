/* ===== components/table.js ===== */

  function cssTable(s) {
    const style = TB_STYLES[s.tbStyle] ? s.tbStyle : 'slab';
    const L = [];
    const bw   = Math.max(1, s.borderWidth);
    const fs   = s.fontSize;
    const padX = s.padX, padY = s.padY;
    const r    = Math.max(0, s.radius);
    const cellB = Math.max(1, Math.round(bw * 0.6));
    const railW = Math.max(8, Math.round(bw * 3));  /* rail 的左侧标条：必须明显宽于普通框线 */

    L.push('.brutal-table {');
    L.push('  border-collapse: collapse;');
    L.push('  width: 100%;');
    L.push('  max-width: 520px;');
    L.push('  background: ' + s.bg + ';');
    L.push('  color: ' + s.color + ';');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + fs + 'px;');
    L.push('  border: ' + bw + 'px ' + (style === 'stamp' ? 'dashed' : 'solid') + ' ' + s.borderColor + ';');
    if (style === 'stamp') L.push('  transform: rotate(-1.2deg);');
    if (r > 0) L.push('  border-radius: ' + r + 'px;');
    if (hasShadow(s)) L.push('  box-shadow: ' + shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) + ';');
    L.push('}');

    L.push('.brutal-table th,');
    L.push('.brutal-table td {');
    if (style === 'band') {
      /* 通栏表头：只留竖向分栏线、去掉横向线 —— 和 slab 的"整片网格"一眼不同 */
      L.push('  border: 0 solid ' + s.borderColor + ';');
      L.push('  border-right-width: ' + cellB + 'px;');
    } else if (style === 'rule') {
      /* 粗分隔线：只留横向粗线，栏与栏之间不画线 */
      L.push('  border: 0 solid ' + s.borderColor + ';');
      L.push('  border-bottom-width: ' + Math.max(2, cellB * 2) + 'px;');
    } else {
      /* grid 用 1px 细线铺满，slab 用常规粗线 —— 靠线宽拉开差异 */
      L.push('  border: ' + (style === 'grid' ? 1 : cellB) + 'px solid ' + s.borderColor + ';');
    }
    L.push('  padding: ' + padY + 'px ' + padX + 'px;');
    L.push('  text-align: left;');
    L.push('  letter-spacing: ' + s.letterSpacing + 'px;');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('}');

    L.push('.brutal-table th {');
    L.push('  background: ' + s.borderColor + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  font-weight: ' + s.fontWeight + ';');
    if (style === 'tape') {
      /* 斜贴封条：表头压粗斜纹，像拿胶带斜着贴住 */
      L.push('  background-image: repeating-linear-gradient(45deg, ' +
             hexToRgba(s.bg, 0.38) + ' 0 8px, transparent 8px 18px);');
    } else if (style === 'bevel') {
      /* 斜切表头：135deg 硬切一刀，色块边缘是斜的 */
      L.push('  background-image: linear-gradient(135deg, ' + s.borderColor + ' 0 68%, ' +
             hexToRgba(s.color, 0.3) + ' 68% 100%);');
    }
    L.push('}');

    if (style === 'rail') {
      /* 左侧标条：首列压一条实心粗条 —— 不是"左边框粗一点"，是整列被标出来 */
      L.push('.brutal-table th:first-child,');
      L.push('.brutal-table td:first-child {');
      L.push('  border-left-width: ' + railW + 'px;');
      L.push('}');
    }

    L.push('.brutal-table tbody tr:hover {');
    L.push('  background: ' + s.shadowColor + ';');
    L.push('}');

    if (s.tStripe) {
      L.push('.brutal-table tbody tr:nth-child(even) {');
      L.push('  background: ' + hexToRgba(s.color, 0.07) + ';');
      L.push('}');
    }

    L.push('.brutal-table__cap {');
    L.push('  caption-side: top;');
    L.push('  text-align: left;');
    L.push('  font-weight: 900;');
    L.push('  padding-bottom: 8px;');
    L.push('  color: ' + s.color + ';');
    L.push('}');

    return L;
  }

  /* ---------------- 导航栏 ---------------- */

function buildTable(s) {

        const cols = Math.max(2, Math.min(6, Number(s.tCols) || 4));
        const rows = Math.max(1, Math.min(8, Number(s.tRows) || 3));
        const heads = ['名称', '类型', '状态', '操作'].slice(0, cols);
        while (heads.length < cols) heads.push('列' + (heads.length + 1));
        let h = '<table class="brutal-table"' + (s.tStripe ? ' data-stripe="1"' : '') + '>\n';
        if (s.text && s.text.trim()) h += '  <caption class="brutal-table__cap">' + esc(s.text.trim()) + '</caption>\n';
        h += '  <thead>\n    <tr>\n';
        for (let i = 0; i < cols; i++) h += '      <th>' + esc(heads[i]) + '</th>\n';
        h += '    </tr>\n  </thead>\n  <tbody>\n';
        for (let r = 0; r < rows; r++) {
          h += '    <tr>\n';
          for (let i = 0; i < cols; i++) h += '      <td>' + esc(demoCell(i, r)) + '</td>\n';
          h += '    </tr>\n';
        }
        h += '  </tbody>\n</table>';
        return h;
      
}

function randomTable(s) {
s.tCols = pick([3, 4, 5, 6]);
      s.tRows = pick([2, 3, 4, 6]);
      s.tStripe = Math.random() < 0.7;
      s.fontSize = pick([13, 14, 15, 16]);
}

COMPONENTS['table'] = {
  label: '表格',
  rootSel: '.brutal-table',
  defaults: { tbStyle: 'slab', tCols: 4, tRows: 3, tStripe: true },
  enums: { tbStyle: Object.keys(TB_STYLES) },
  build: buildTable,
  css: cssTable,
  random: randomTable,
  panel: `      <h2>表格</h2>
      <div class="field">
        <label>列数 <span class="val"><span data-out="tCols"></span></span></label>
        <input type="range" data-key="tCols" min="2" max="6" step="1">
      </div>
      <div class="field">
        <label>行数 <span class="val"><span data-out="tRows"></span></span></label>
        <input type="range" data-key="tRows" min="1" max="8" step="1">
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" data-key="tStripe"> 隔行底纹</label>
      </div>`
};
