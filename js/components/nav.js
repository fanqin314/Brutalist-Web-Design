/* ===== components/nav.js ===== */

  function cssNav(s) {
    const style = NV_STYLES[s.nvStyle] ? s.nvStyle : 'slab';
    const L = [];
    const bw   = Math.max(0, s.borderWidth);
    const fs   = s.fontSize;
    const padX = s.padX, padY = s.padY;
    const r    = Math.max(0, s.radius);
    const railW = Math.max(10, Math.round(bw * 3));  /* rail 的左侧标条 */

    L.push('.brutal-nav {');
    L.push('  display: flex;');
    L.push('  align-items: center;');
    L.push('  gap: ' + Math.max(12, Math.round(fs * 1.2)) + 'px;');
    L.push('  width: 100%;');
    L.push('  max-width: 640px;');
    L.push('  padding: ' + padY + 'px ' + padX + 'px;');
    L.push('  background: ' + s.bg + ';');
    L.push('  color: ' + s.color + ';');
    if (bw > 0) {
      L.push('  border: ' + bw + 'px ' + (style === 'stamp' ? 'dashed' : 'solid') + ' ' + s.borderColor + ';');
      if (style === 'rail') L.push('  border-left-width: ' + railW + 'px;');
    }
    if (r > 0) L.push('  border-radius: ' + r + 'px;');
    if (hasShadow(s)) L.push('  box-shadow: ' + shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) + ';');
    /* stamp 自带歪斜；用户若手动给过 rotate 就以用户的为准 */
    const rot = (s.rotate !== 0) ? s.rotate : (style === 'stamp' ? -1 : 0);
    if (rot !== 0) L.push('  transform: rotate(' + rot + 'deg);');
    L.push('}');

    L.push('.brutal-nav__brand {');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + (fs + 4) + 'px;');
    L.push('  font-weight: ' + s.fontWeight + ';');
    L.push('  letter-spacing: ' + s.letterSpacing + 'px;');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('  margin-right: auto;');
    L.push('}');

    L.push('.brutal-nav__links {');
    L.push('  display: flex;');
    L.push('  gap: ' + Math.max(10, Math.round(fs * 0.9)) + 'px;');
    L.push('  list-style: none;');
    L.push('  margin: 0; padding: 0;');
    L.push('}');

    L.push('.brutal-nav__link {');
    L.push('  position: relative;');
    L.push('  color: ' + s.color + ';');
    L.push('  text-decoration: none;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + fs + 'px;');
    if (style === 'tag') {
      /* 标签块：每个链接自带边框与内边距，是独立的小硬块（不是光秃秃的文字） */
      L.push('  padding: ' + Math.max(3, Math.round(padY * 0.35)) + 'px ' +
             Math.max(6, Math.round(padX * 0.35)) + 'px;');
      L.push('  border: ' + Math.max(2, Math.round(bw * 0.6)) + 'px solid ' + s.borderColor + ';');
    } else if (style === 'under') {
      /* 粗下划线：常态就压一条粗线，不是 hover 才冒出来 */
      L.push('  border-bottom: ' + Math.max(3, bw) + 'px solid ' + s.borderColor + ';');
    } else {
      L.push('  border-bottom: 3px solid transparent;');
    }
    L.push('}');

    L.push('.brutal-nav__link:hover {');
    if (style === 'invert') {
      /* 反白激活：底色与文字色整套互换 */
      L.push('  background: ' + s.color + ';');
      L.push('  color: ' + s.bg + ';');
    } else if (style === 'tag') {
      L.push('  background: ' + s.borderColor + ';');
      L.push('  color: ' + s.bg + ';');
    } else {
      L.push('  border-bottom-color: ' + s.shadowColor + ';');
    }
    L.push('}');

    if (style === 'arrow') {
      /* 箭头指示：每个链接左侧顶出一枚实心三角（clip-path 画，跟随文字色不好取，用主色） */
      L.push('');
      L.push('.brutal-nav__link::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  left: -' + Math.max(9, Math.round(fs * 0.8)) + 'px;');
      L.push('  top: 50%;');
      L.push('  width: ' + Math.max(6, Math.round(fs * 0.42)) + 'px;');
      L.push('  height: ' + Math.max(6, Math.round(fs * 0.42)) + 'px;');
      L.push('  background: ' + s.color + ';');
      L.push('  clip-path: polygon(0 0, 100% 50%, 0 100%);');
      L.push('  transform: translateY(-50%);');
      L.push('}');
    }

    if (style === 'bracket') {
      /* 四角夹框：hover 的链接被四只 L 角夹住（8 层背景拼角，与按钮 bracket 同一手法） */
      const lg = 'linear-gradient(' + s.borderColor + ', ' + s.borderColor + ')';
      const armL = Math.max(8, Math.round(fs * 0.5)) + 'px';
      const armW = Math.max(2, Math.round(bw * 0.5)) + 'px';
      const sz = [armL + ' ' + armW, armW + ' ' + armL];
      L.push('');
      L.push('.brutal-nav__link:hover::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: -' + Math.max(4, Math.round(bw * 0.8)) + 'px;');
      L.push('  background-image: ' + [lg, lg, lg, lg, lg, lg, lg, lg].join(', ') + ';');
      L.push('  background-size: ' + sz.concat(sz, sz, sz).join(', ') + ';');
      L.push('  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;');
      L.push('  background-repeat: no-repeat;');
      L.push('}');
    }

    L.push('.brutal-nav__cta {');
    L.push('  display: inline-block;');
    L.push('  padding: ' + Math.round(padY * 0.6) + 'px ' + Math.round(padX * 0.7) + 'px;');
    L.push('  background: ' + s.shadowColor + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-weight: ' + s.fontWeight + ';');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('  text-decoration: none;');
    L.push('}');

    L.push('.brutal-nav__cta:hover {');
    L.push('  transform: translate(-2px, -2px);');
    L.push('  box-shadow: 4px 4px 0 ' + s.borderColor + ';');
    L.push('}');

    return L;
  }

  /* ---------------- 标签页 ---------------- */

function buildNav(s) {

        const links = String(s.nvLinks || '').split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 6);
        if (!links.length) links.push('首页');
        const brand = (s.text || 'BRAND').trim();
        const cta   = (s.nvCta || '').trim();
        let h = '<nav class="brutal-nav" aria-label="主导航">\n';
        h += '  <span class="brutal-nav__brand">' + esc(brand) + '</span>\n';
        h += '  <ul class="brutal-nav__links">\n';
        links.forEach(function (t) { h += '    <li><a class="brutal-nav__link" href="#">' + esc(t) + '</a></li>\n'; });
        h += '  </ul>\n';
        if (cta) h += '  <a class="brutal-nav__cta" href="#">' + esc(cta) + '</a>\n';
        h += '</nav>';
        return h;
      
}

function randomNav(s) {
s.nvStyle = pick(['slab', 'slab', 'under', 'tag', 'bracket', 'rail', 'stamp', 'invert', 'arrow']);
      s.nvLinks = pick(['首页, 产品, 文档, 关于', '概览, 功能, 定价, 博客', 'Home, Docs, API, Contact']);
      s.nvCta = pick(['登录', '开始', 'Get Started', '订阅']);
      s.fontSize = pick([14, 15, 16, 18]);
      s.uppercase = Math.random() < 0.6;
}

COMPONENTS['nav'] = {
  label: '导航栏',
  rootSel: '.brutal-nav',
  defaults: { nvStyle: 'slab', nvLinks: '首页, 产品, 文档, 关于', nvCta: '登录' },
  enums: { nvStyle: Object.keys(NV_STYLES) },
  build: buildNav,
  css: cssNav,
  random: randomNav,
  panel: `      <h2>导航栏</h2>
      <div class="field">
        <label for="fNvStyle">激活表态</label>
        <select id="fNvStyle" data-key="nvStyle">
          <option value="slab">硬块导航 / slab</option>
          <option value="under">粗下划线 / under</option>
          <option value="tag">标签块 / tag</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="rail">左侧标条 / rail</option>
          <option value="stamp">印章歪斜 / stamp</option>
          <option value="invert">反白激活 / invert</option>
          <option value="arrow">箭头指示 / arrow</option>
        </select>
      </div>
      <div class="field">
        <label for="fNavLinks">链接（逗号分隔，最多 6 个）</label>
        <input type="text" id="fNavLinks" data-key="nvLinks" maxlength="60" placeholder="首页, 产品, 文档, 关于">
      </div>
      <div class="field">
        <label for="fNavCta">右侧动作文字（留空隐藏）</label>
        <input type="text" id="fNavCta" data-key="nvCta" maxlength="12" placeholder="登录">
      </div>`
};
