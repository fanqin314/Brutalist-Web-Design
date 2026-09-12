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

        /* 表头：优先用用户填的 tbHead（逗号分隔），
           不足列用「列N」补齐、超出则截断到 cols。 */
        const heads = String(s.tbHead || '').split(/[,，]/)
          .map(function (x) { return x.trim(); }).filter(Boolean);
        while (heads.length < cols) heads.push('列' + (heads.length + 1));
        heads.length = cols;

        /* 单元格：tbData 每行是一行数据（单元格逗号分隔）；
           行/列不足时用 demoCell 兜底，用户留白也不至于空表格。 */
        const lines = String(s.tbData || '').split(/\r?\n/).map(function (x) { return x.trim(); });
        const cellAt = function (r, c) {
          const ls = lines[r];
          if (ls) {
            const cells = ls.split(/[,，]/).map(function (x) { return x.trim(); });
            if (cells[c]) return cells[c];
          }
          return demoCell(c, r);
        };

        let h = '<table class="brutal-table"' + (s.tStripe ? ' data-stripe="1"' : '') + '>\n';
        if (s.text && s.text.trim()) h += '  <caption class="brutal-table__cap">' + esc(s.text.trim()) + '</caption>\n';
        h += '  <thead>\n    <tr>\n';
        for (let i = 0; i < cols; i++) h += '      <th>' + esc(heads[i]) + '</th>\n';
        h += '    </tr>\n  </thead>\n  <tbody>\n';
        for (let r = 0; r < rows; r++) {
          h += '    <tr>\n';
          for (let i = 0; i < cols; i++) h += '      <td>' + esc(cellAt(r, i)) + '</td>\n';
          h += '    </tr>\n';
        }
        h += '  </tbody>\n</table>';
        return h;
      
}

function randomTable(s) {
  s.tbStyle = pick(['slab', 'slab', 'band', 'rule', 'grid', 'bevel', 'rail', 'tape', 'stamp']);
  s.tCols = pick([3, 4, 5, 6]);
  s.tRows = pick([3, 4, 5, 6]);
  s.tStripe = Math.random() < 0.7;
  /* 表头 + 内容成组抽换：乱点也能一眼看出整表换了主题 */
  const sets = [
    { h: '名称, 类型, 状态, 操作', d: 'Alpha, 默认, 就绪, 编辑\nBravo, 主要, 运行中, 查看\nCharlie, 警告, 待处理, 删除' },
    { h: '项目, 负责人, 进度, 预算', d: '重构, 阿杜, 完成, ¥42K\n新官网, 大李, 进行中, ¥120K\n压测, 老周, 已排期, ¥8K' },
    { h: 'Stock, Q1, Q2, Q3', d: '001, +12%, -3%, +28%\n002, +5%, +9%, -11%\n003, -20%, +15%, +40%' },
    { h: '车站, 首班, 末班, 票价', d: 'A口, 06:10, 23:40, ¥6\nB口, 06:05, 23:35, ¥8\nC口, 06:20, 23:50, ¥4' }
  ];
  const st = pick(sets);
  s.tbHead = st.h;
  s.tbData = st.d;
  s.fontSize = pick([13, 14, 15, 16]);
}

COMPONENTS['table'] = {
  label: '表格',
  rootSel: '.brutal-table',
  defaults: { tbStyle: 'slab', tCols: 4, tRows: 3, tStripe: true, tbHead: '名称, 类型, 状态, 操作', tbData: '' },
  enums: { tbStyle: Object.keys(TB_STYLES) },
  build: buildTable,
  css: cssTable,
  random: randomTable,
  panel: `      <h2>表格</h2>
      <div class="field">
        <label for="fTbHead">表头（逗号分隔）</label>
        <input type="text" id="fTbHead" data-key="tbHead" maxlength="80" placeholder="名称, 类型, 状态, 操作">
      </div>
      <div class="field">
        <label for="fTbData">单元格（每行一行，逗号分隔；留空自动填充演示数据）</label>
        <textarea id="fTbData" data-key="tbData" rows="4" placeholder="可用, 正常, 通过, 编辑"></textarea>
      </div>
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
