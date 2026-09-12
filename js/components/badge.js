/* ===== components/badge.js ===== */

  function cssBadge(s) {
    let L = [];
    const pattern = getPattern(s);
    const style = s.bdStyle || 'slab';
    const mark  = s.bdMark  || 'none';
    const bw    = s.borderWidth;
    const fs    = s.fontSize;
    const bx    = (s.bdPadX === undefined) ? 13 : s.bdPadX;
    const by    = (s.bdPadY === undefined) ? 6  : s.bdPadY;
    const base  = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;

    /* 几何参数：全部随字号 / 内边距缩放，「字号」滑杆即整体放大缩小 */
    const boxH  = by * 2 + fs;                     /* 近似内容高度（line-height: 1） */
    const notch = Math.max(4, Math.round(boxH * 0.3));   /* 票券方缺口边长，按高度取三成 */
    const tip   = Math.round(fs * 0.9);            /* 缎带尖角伸出量 */
    const cut   = Math.round(fs * 0.62);           /* 折角边长 */
    const ampN  = fs * 0.26;                       /* 锯齿振幅（px） */
    const amp   = ampN.toFixed(1);
    const zigN  = 7;                               /* 锯齿齿数 */

    let padT = by, padR = bx, padB = by, padL = bx;
    let clip = null;          /* 交给 ::before 的形状层 */
    let viaFilter = false;    /* 硬影改走 filter: drop-shadow */
    let useBorder = true;
    let fill = true;
    let ringInner = 0;        /* 描边内侧再压一道细线（印刷标签感） */
    const extra = [];

    if (style === 'ticket') {
      useBorder = false; viaFilter = true;
      padL = Math.max(bx, notch + 5); padR = padL;
      clip = 'polygon(0 0, 100% 0,' +
             ' 100% calc(50% - ' + notch + 'px),' +
             ' calc(100% - ' + notch + 'px) calc(50% - ' + notch + 'px),' +
             ' calc(100% - ' + notch + 'px) calc(50% + ' + notch + 'px),' +
             ' 100% calc(50% + ' + notch + 'px),' +
             ' 100% 100%, 0 100%,' +
             ' 0 calc(50% + ' + notch + 'px),' +
             ' ' + notch + 'px calc(50% + ' + notch + 'px),' +
             ' ' + notch + 'px calc(50% - ' + notch + 'px),' +
             ' 0 calc(50% - ' + notch + 'px))';

    } else if (style === 'banner') {
      useBorder = false; viaFilter = true;
      padL = Math.max(bx + 4, tip + 2); padR = padL;
      clip = 'polygon(' + tip + 'px 0, calc(100% - ' + tip + 'px) 0, 100% 50%,' +
             ' calc(100% - ' + tip + 'px) 100%, ' + tip + 'px 100%, 0 50%)';

    } else if (style === 'zigzag') {
      useBorder = false; viaFilter = true;
      padT = Math.max(by, Math.ceil(ampN) + 1);   /* 齿深之上再留 1px，免得咬到文字 */
      padB = padT;
      const N = zigN;
      const pts = ['0 0'];
      for (let i = 0; i < N; i++) {
        pts.push(((i + .5) / N * 100).toFixed(2) + '% ' + amp + 'px');
        pts.push(((i + 1) / N * 100).toFixed(2) + '% 0');
      }
      pts.push('100% 100%');
      for (let i = 0; i < N; i++) {
        pts.push((100 - (i + .5) / N * 100).toFixed(2) + '% calc(100% - ' + amp + 'px)');
        pts.push((100 - (i + 1) / N * 100).toFixed(2) + '% 100%');
      }
      clip = 'polygon(' + pts.join(', ') + ')';

    } else if (style === 'fold') {
      useBorder = false; viaFilter = true;
      padR = Math.max(bx, cut + 4); padB = Math.max(by, 2);
      clip = 'polygon(0 0, 100% 0, 100% calc(100% - ' + cut + 'px),' +
             ' calc(100% - ' + cut + 'px) 100%, 0 100%)';

    } else if (style === 'stamp') {
      /* 透明底 + 粗描边 + 虚线外圈，像盖上去的一枚印；未指定角度时默认歪 3° 才像手盖的 */
      fill = false;
      extra.push('  outline: ' + Math.max(1, Math.round(bw * 0.6)) + 'px dashed ' + s.borderColor + ';');
      extra.push('  outline-offset: 3px;');
      extra.push('  transform: rotate(' + (s.rotate !== 0 ? s.rotate : -3) + 'deg);');

    } else if (style === 'outline') {
      fill = false;
      viaFilter = false;                     /* 空章不出影，靠描边立住 */

    } else if (style === 'side') {
      /* 只留左侧一条粗标条，上/右/下描边全去掉 —— 读起来是"色标贴条"而不是"可点的块" */
      const barW = Math.max(8, Math.round(bw * 2));
      useBorder = false;
      padL = Math.max(bx, barW + 7);
      extra.push('  border-left: ' + barW + 'px solid ' + s.borderColor + ';');

    } else if (style === 'grid') {
      /* 网格底纹：整块铺横竖交错的网格 */
      const gInk = hexToRgba(s.color, 0.3);
      extra.push('  background-image: repeating-linear-gradient(90deg, transparent 0 6px, ' +
                 gInk + ' 6px 8px), repeating-linear-gradient(0deg, transparent 0 6px, ' +
                 gInk + ' 6px 8px);');

    } else if (style === 'notch') {
      /* 缺口徽章：右上 + 左下各削一角（ticket 是中间咬缺口，fold 只切右下） */
      useBorder = false; viaFilter = true;
      padL = Math.max(bx, cut + 4); padR = padL;
      clip = 'polygon(0 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut + 'px, 100% 100%, ' +
             cut + 'px 100%, 0 calc(100% - ' + cut + 'px))';

    } else if (style === 'corner') {
      /* 切角徽章：四角各切一小块 */
      const cc = Math.round(cut * 0.5);
      useBorder = false; viaFilter = true;
      padT = Math.max(by, cc + 1); padB = padT;
      padL = Math.max(bx, cc + 1); padR = padL;
      clip = 'polygon(' + cc + 'px 0, calc(100% - ' + cc + 'px) 0, 100% ' + cc +
             'px, 100% calc(100% - ' + cc + 'px), calc(100% - ' + cc + 'px) 100%, ' + cc +
             'px 100%, 0 calc(100% - ' + cc + 'px), 0 ' + cc + 'px)';

    } else if (style === 'double') {
      /* 双线徽章：描边外面再套一圈实线（slab 是内侧细线，这里是外侧一整圈） */
      if (bw > 0) ringInner = Math.max(2, Math.round(bw * 0.5));
      extra.push('  outline: ' + Math.max(2, Math.round(bw * 0.8)) + 'px solid ' + s.borderColor + ';');
      extra.push('  outline-offset: 4px;');

    } else {
      /* slab 硬块标签：描边内侧再压一道细线 —— 双线印刷感，和按钮的单线+投影区分开 */
      if (bw > 0) ringInner = Math.max(2, Math.round(bw * 0.5));
    }

    L.push('.brutal-badge {');
    L.push('  position: relative;');
    if (clip) L.push('  isolation: isolate;');   /* 建独立层叠上下文，::before 才能安全置底 */
    L.push('  display: inline-flex;');
    L.push('  align-items: center;');
    L.push('  justify-content: center;');
    L.push('  gap: .45em;');
    L.push('  padding: ' + padT + 'px ' + padR + 'px ' + padB + 'px ' + padL + 'px;');
    if (clip) L.push('  background: transparent;');   /* 填充只交给形状层，元素自身留空 */
    else if (fill) L = L.concat(bgLines(s, pattern));
    else L.push('  background: transparent;');
    L.push('  color: ' + s.color + ';');
    if (useBorder) L = L.concat(borderLines(s));
    else L.push('  border: none;');
    L.push('  border-radius: ' + s.radius + 'px;');
    if (base && viaFilter) {
      L.push('  filter: drop-shadow(' + s.shadowX + 'px ' + s.shadowY + 'px ' +
             s.shadowBlur + 'px ' + s.shadowColor + ');');
    } else if (style !== 'outline') {
      const sh = [];
      if (base) sh.push(base);
      if (ringInner > 0) {
        /* 两道 inset 夹出"底色带 + 细线"：后画的那道只在更外圈露出，形成真正的双线 */
        const gap = Math.max(3, Math.round(bw * 1.2));
        sh.push('inset 0 0 0 ' + gap + 'px ' + s.bg);
        sh.push('inset 0 0 0 ' + (gap + ringInner) + 'px ' + s.borderColor);
      }
      if (sh.length) L.push('  box-shadow: ' + sh.join(', ') + ';');
    }
    L = L.concat(fontLines(s));
    L.push('  line-height: 1;');
    L.push('  white-space: nowrap;');
    L.push('  user-select: none;');
    if (s.rotate !== 0 && style !== 'stamp') L.push('  transform: rotate(' + s.rotate + 'deg);');
    L = L.concat(extra);
    L.push('}');

    /* 形状层：只给几何取形的变体输出，垫在文字之下承载填充与纹理 */
    if (clip) {
      L.push('');
      L.push('.brutal-badge::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  z-index: -1;');       /* 垫到文字之下（靠父级 isolation 兜住） */
      L = L.concat(bgLines(s, pattern));
      L.push('  clip-path: ' + clip + ';');
      L.push('}');
    }

    /* 前置标记：order:-1 让 ::after 排到文字之前，间距交给容器的 gap */
    const mk = (mark && mark !== 'none') ? markShape(mark) : null;
    if (mk) {
      L.push('');
      L.push('.brutal-badge::after {');
      L.push("  content: '';");
      L.push('  order: -1;');
      L.push('  flex: 0 0 auto;');
      L.push('  width: ' + mk.w + 'em;');
      L.push('  height: ' + mk.h + 'em;');
      L = L.concat(mk.decls);
      L.push('}');
    }

    return L;
  }

  /* =========================================================
     单选组（radio）
     ---------------------------------------------------------
     单选组是「一组里挑一个」：差异必须落在"选中长什么样"上，
     而不是换个投影了事。六款：标记取形（box · dot）/ 整行表态
     （invert · stamp）/ 分区（dash）/ 内腔填实（skew）。
     ========================================================= */

function buildBadge(s) {
return '<span class="brutal-badge">' + esc(s.text || 'NEW') + '</span>';
}

function randomBadge(s) {
s.bdStyle = pick(['slab', 'ticket', 'banner', 'zigzag', 'fold', 'stamp', 'outline', 'side', 'grid', 'notch', 'corner', 'double']);
      s.bdMark  = pick(['none', 'none', 'square', 'circle', 'star', 'bolt', 'arrow', 'bar']);
      s.bdPadX  = pick([9, 11, 13, 16, 20]);
      s.bdPadY  = pick([3, 5, 6, 8, 10]);
      s.fontSize = pick([13, 15, 16, 18, 20]);
}

COMPONENTS['badge'] = {
  label: '徽章',
  rootSel: '.brutal-badge',
  defaults: { bdStyle: 'ticket', bdMark: 'none', bdPadX: 13, bdPadY: 6 },
  enums: { bdStyle: Object.keys(BD_STYLES), bdMark: Object.keys(BD_MARKS) },
  build: buildBadge,
  css: cssBadge,
  random: randomBadge,
  panel: `      <h2>徽章样式</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="bdTicket">票券缺口</button>
        <button class="chip" type="button" data-preset="bdBanner">缎带旗标</button>
        <button class="chip" type="button" data-preset="bdZigzag">锯齿封条</button>
        <button class="chip" type="button" data-preset="bdStamp">印章双框</button>
        <button class="chip" type="button" data-preset="bdFold">折角贴纸</button>
        <button class="chip" type="button" data-preset="bdOutline">描边空章</button>
        <button class="chip" type="button" data-preset="bdSide">侧栏标条</button>
        <button class="chip" type="button" data-preset="bdGrid">网格底纹</button>
        <button class="chip" type="button" data-preset="bdCorner">切角徽章</button>
        <button class="chip" type="button" data-preset="bdNotch">缺口徽章</button>
        <button class="chip" type="button" data-preset="bdDouble">双线徽章</button>
      </div>
      <div class="field">
        <label for="fBdStyle">形状变体</label>
        <select id="fBdStyle" data-key="bdStyle">
          <option value="slab">硬块标签 / slab</option>
          <option value="ticket">票券缺口 / ticket</option>
          <option value="banner">缎带旗标 / banner</option>
          <option value="zigzag">锯齿封条 / zigzag</option>
          <option value="fold">折角贴纸 / fold</option>
          <option value="stamp">印章双框 / stamp</option>
          <option value="outline">描边空章 / outline</option>
          <option value="side">侧栏标条 / side</option>
        
          <option value="grid">网格底纹 / grid</option>
          <option value="notch">缺口徽章 / notch</option>
          <option value="corner">切角徽章 / corner</option>
          <option value="double">双线徽章 / double</option></select>
      </div>
      <div class="field">
        <label for="fBdMark">前置标记</label>
        <select id="fBdMark" data-key="bdMark">
          <option value="none">无 / none</option>
          <option value="square">方点 / square</option>
          <option value="circle">圆点 / circle</option>
          <option value="star">星标 / star</option>
          <option value="bolt">闪电 / bolt</option>
          <option value="arrow">箭头 / arrow</option>
          <option value="bar">竖条 / bar</option>
        </select>
      </div>
      <div class="grid-2">
        <div class="field">
          <label>横向内边距 <span class="val"><span data-out="bdPadX"></span></span></label>
          <input type="range" data-key="bdPadX" min="4" max="34" step="1">
        </div>
        <div class="field">
          <label>纵向内边距 <span class="val"><span data-out="bdPadY"></span></span></label>
          <input type="range" data-key="bdPadY" min="1" max="16" step="1">
        </div>
      </div>`
};
