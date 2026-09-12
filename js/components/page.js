/* ===== components/page.js · 整页构图模式 =====
   把导航 / 按钮 / 进度条 / 标签页 / 表格 用当前主题（配色 / 边框 / 阴影 /
   字体 / 纹理）组装成一张"一眼粗野"的完整页面，复用各组件自身的 build/css。
   该模式产出的是一条真实页面，不参与五态矩阵，CSS 也不用通用状态块（没有
   "禁用整页"这种说法）。 */

  function indent(str, n) {
    const pad = new Array(n + 1).join(' ');
    return str.split('\n')
      .map(function (line) { return line ? pad + line : line; })
      .join('\n') + '\n';
  }

  function buildPage(s) {
    const brand = (s.text || 'BRUTAL').trim();
    const title = (s.pgTitle || 'BUILD IT.').trim();
    const sub   = (s.pgSub || '').trim();
    const label = (s.pgLabel || '开始').trim();
    const cta   = (s.pgCta || '').trim();

    /* 各子组件沿用当前主题，但把相互撞车的共享字段（text 等）按各自用途覆盖 */
    const navS   = Object.assign({}, s, { text: brand });
    const heroS  = Object.assign({}, s, { text: label, btnStyle: 'solid', btnIcon: 'arrow', btnIconPos: 'right' });
    const ctaS   = Object.assign({}, s, { text: cta, btnStyle: 'solid', btnIcon: 'bolt', btnIconPos: 'right' });

    let h = '<div class="brutal-page">\n';

    /* 页顶跑马灯：街头电视墙式滚动标语，双份内容做无缝循环 */
    const tickTxt = esc(brand) + ' · 粗野主义 · 拒绝圆润 · ';
    const tickHtml = '<span class="brutal-marquee__item">' + tickTxt + '</span>';
    let track = '';
    for (let i = 0; i < 6; i++) track += tickHtml;
    track += track;   /* 两份相同内容，translateX(-50%) 即可无缝循环 */
    h += '  <div class="brutal-marquee">\n    <div class="brutal-marquee__track">' + track + '</div>\n  </div>\n';

    /* 顶部导航 */
    h += '  <header class="brutal-page__head">\n';
    h += indent(buildNav(navS), 4);
    h += '  </header>\n';

    /* 英雄区：巨大的主标题压着小脚注 + 一个动作按钮 */
    h += '  <section class="brutal-hero">\n';
    h += '    <p class="brutal-hero__kicker">BRUTAL · 粗野主义生成器</p>\n';
    h += '    <h1 class="brutal-hero__title">' + esc(title) + '</h1>\n';
    if (sub) h += '    <p class="brutal-hero__sub">' + esc(sub) + '</p>\n';
    h += '    <div class="brutal-hero__actions">\n';
    h += indent(buildButton(heroS), 6);
    h += '    </div>\n';
    h += '  </section>\n';

    /* 指标带：三根进度条横排 */
    h += '  <section class="brutal-strip">\n';
    [[84, '完成度'], [62, '覆盖率'], [38, '满意度']].forEach(function (st) {
      const p = Object.assign({}, s, { text: st[1], pgValue: st[0] });
      h += indent(buildProgress(p), 6);
    });
    h += '  </section>\n';

    /* 左右分栏：标签页 + 表格 */
    h += '  <section class="brutal-split">\n';
    h += '    <div class="brutal-split__cell">\n';
    h += indent(buildTabs(s), 6);
    h += '    </div>\n';
    h += '    <div class="brutal-split__cell">\n';
    h += indent(buildTable(s), 6);
    h += '    </div>\n';
    h += '  </section>\n';

    /* 底部行动带（留空则整段隐藏） */
    if (cta) {
      h += '  <section class="brutal-cta">\n';
      h += '    <h2 class="brutal-cta__head">准备好了？</h2>\n';
      h += indent(buildButton(ctaS), 4);
      h += '  </section>\n';
    }

    /* 页脚 */
    h += '  <footer class="brutal-footer">\n';
    h += '    <span>' + esc(brand) + '</span>\n';
    h += '    <span>© 2026 · 粗野主义设计工具</span>\n';
    h += '  </footer>\n';

    h += '</div>';
    return h;
  }

  function cssPage(s) {
    const parts = [cssNav(s), cssButton(s), cssProgress(s), cssTabs(s), cssTable(s)];
    parts.push(pageLayoutCSS(s));
    return Array.prototype.concat.apply([], parts);
  }

  function pageLayoutCSS(s) {
    const bw = Math.max(0, s.borderWidth);
    const fs = s.fontSize;
    const shadow = shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor);
    const fam = FONTS[s.fontFamily];
    const pattern = getPattern(s);
    let L = [];

    L.push('/* ===== 整页构图布局 ===== */');

    /* 页面外壳：沿用主题底色 / 纹理 / 边框 / 硬投影 */
    L.push('.brutal-page {');
    L.push('  max-width: 1080px;');
    L.push('  margin: 0 auto;');
    L.push('  padding: ' + s.padY + 'px ' + s.padX + 'px;');
    L.push('  box-sizing: border-box;');
    L = L.concat(bgLines(s, pattern, '  '));
    L.push('  color: ' + s.color + ';');
    L.push('  font-family: ' + fam + ';');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    if (hasShadow(s)) L.push('  box-shadow: ' + shadow + ';');
    L.push('}');

    L.push('.brutal-page__head {');
    L.push('  padding-bottom: 24px;');
    L.push('}');
    /* 让导航撑满头上这一栏 */
    L.push('.brutal-page__head .brutal-nav {');
    L.push('  width: 100%;');
    L.push('  max-width: none;');
    L.push('}');

    /* 英雄区：巨大标题压小脚注，错位偏移制造对抗感 */
    L.push('.brutal-hero {');
    L.push('  padding: ' + Math.max(28, Math.round(fs * 2)) + 'px 0 ' + Math.max(28, fs) + 'px;');
    L.push('  border-top: ' + Math.max(2, bw) + 'px solid ' + s.borderColor + ';');
    L.push('  border-bottom: ' + Math.max(2, bw) + 'px solid ' + s.borderColor + ';');
    L.push('}');
    L.push('.brutal-hero__kicker {');
    L.push('  display: inline-block;');
    L.push('  margin: 0 0 12px;');
    L.push('  padding: ' + Math.max(3, Math.round(bw * 0.5)) + 'px ' + Math.max(8, Math.round(fs * 0.7)) + 'px;');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  font-size: ' + Math.round(fs * 0.8) + 'px;');
    L.push('  letter-spacing: .12em;');
    L.push('}');
    L.push('.brutal-hero__title {');
    L.push('  margin: 0;');
    L.push('  font-size: clamp(48px, 11vw, 128px);');
    L.push('  line-height: .9;');
    L.push('  letter-spacing: -.02em;');
    L.push('  color: ' + s.color + ';');
    L.push('}');
    L.push('.brutal-hero__sub {');
    L.push('  max-width: 520px;');
    L.push('  margin: 18px 0 0;');
    L.push('  padding-left: ' + Math.max(8, Math.round(fs)) + 'px;');
    L.push('  border-left: ' + Math.max(4, Math.round(bw * 1.2)) + 'px solid ' + s.borderColor + ';');
    L.push('  font-size: ' + Math.round(fs * 1.15) + 'px;');
    L.push('  line-height: 1.4;');
    L.push('}');
    L.push('.brutal-hero__actions {');
    L.push('  display: flex;');
    L.push('  gap: 14px;');
    L.push('  flex-wrap: wrap;');
    L.push('  margin-top: 28px;');
    L.push('}');

    /* 指标带：三根进度条并排 */
    L.push('.brutal-strip {');
    L.push('  display: grid;');
    L.push('  grid-template-columns: repeat(3, 1fr);');
    L.push('  gap: ' + Math.max(14, Math.round(fs * 1.4)) + 'px;');
    L.push('  padding: 28px 0;');
    L.push('}');
    L.push('.brutal-strip .brutal-progress { width: 100%; }');

    /* 左右分栏：标签页 + 表格 */
    L.push('.brutal-split {');
    L.push('  display: grid;');
    L.push('  grid-template-columns: 1fr 1fr;');
    L.push('  gap: 28px;');
    L.push('  padding: 12px 0 28px;');
    L.push('}');
    L.push('.brutal-split__cell { min-width: 0; }');

    /* 底部行动带：深色实心条 + 大按钮 */
    L.push('.brutal-cta {');
    L.push('  display: flex;');
    L.push('  align-items: center;');
    L.push('  justify-content: space-between;');
    L.push('  gap: 18px;');
    L.push('  flex-wrap: wrap;');
    L.push('  margin-top: 12px;');
    L.push('  padding: ' + Math.max(20, Math.round(fs * 1.3)) + 'px ' + Math.max(16, fs) + 'px;');
    L.push('  background: ' + s.borderColor + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    if (hasShadow(s)) L.push('  box-shadow: ' + shadow + ';');
    L.push('}');
    L.push('.brutal-cta__head {');
    L.push('  margin: 0;');
    L.push('  font-size: clamp(22px, 4vw, 44px);');
    L.push('  line-height: 1;');
    L.push('}');

    /* 页脚 */
    L.push('.brutal-footer {');
    L.push('  display: flex;');
    L.push('  justify-content: space-between;');
    L.push('  gap: 12px;');
    L.push('  flex-wrap: wrap;');
    L.push('  margin-top: 24px;');
    L.push('  padding-top: 14px;');
    L.push('  border-top: ' + Math.max(2, bw) + 'px solid ' + s.borderColor + ';');
    L.push('  font-size: ' + Math.round(fs * 0.85) + 'px;');
    L.push('}');

    /* ===== 整页动效 ===== */

    /* 错峰弹入：整个区块按次序 springy 出场（进度条的填充已有自己的入场动画） */
    L.push('');
    L.push('.brutal-page > * { animation: secIn .5s cubic-bezier(.2, .9, .3, 1.12) both; }');
    L.push('.brutal-page > header           { animation-delay: .06s; }');
    L.push('.brutal-page > .brutal-hero     { animation-delay: .18s; }');
    L.push('.brutal-page > .brutal-strip    { animation-delay: .32s; }');
    L.push('.brutal-page > .brutal-split    { animation-delay: .44s; }');
    L.push('.brutal-page > .brutal-cta      { animation-delay: .54s; }');
    L.push('.brutal-page > .brutal-footer   { animation-delay: .64s; }');
    L.push('@keyframes secIn {');
    L.push('  from { opacity: 0; transform: translateY(16px) scale(.985); }');
    L.push('  60%  { opacity: 1; transform: translateY(-3px) scale(1.004); }');
    L.push('  to   { opacity: 1; transform: none; }');
    L.push('}');

    /* 标题冲击：主标题硬挤进场 + 横向溢出回弹 */
    L.push('.brutal-hero__title { animation: titlePunch .55s cubic-bezier(.2, .85, .3, 1.14) .18s both; }');
    L.push('@keyframes titlePunch {');
    L.push('  0%   { opacity: 0; transform: translateX(-3%) scaleX(1.35); }');
    L.push('  55%  { opacity: 1; transform: translateX(1.2%) scaleX(1); }');
    L.push('  78%  { transform: translateX(-.6%); }');
    L.push('  100% { opacity: 1; transform: none; }');
    L.push('}');

    /* 跑马灯滚动 */
    L.push('');
    L.push('.brutal-marquee {');
    L.push('  overflow: hidden;');
    L.push('  white-space: nowrap;');
    L.push('  background: ' + s.borderColor + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  border: ' + bw + 'px solid ' + s.borderColor + ';');
    L.push('  margin-bottom: 24px;');
    L.push('  padding: 6px 0;');
    L.push('}');
    L.push('.brutal-marquee__track {');
    L.push('  display: inline-flex;');
    L.push('  animation: marquee 22s linear infinite;');
    L.push('}');
    L.push('.brutal-marquee__item {');
    L.push('  padding: 0 4px;');
    L.push('  font-size: ' + Math.round(fs * 0.9) + 'px;');
    L.push('  letter-spacing: .18em;');
    L.push('}');
    L.push('.brutal-marquee:hover .brutal-marquee__track { animation-play-state: paused; }');
    L.push('@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }');

    /* 尊重系统"减弱动态"偏好，一次性关掉整页动效 */
    L.push('@media (prefers-reduced-motion: reduce) {');
    L.push('  .brutal-page > *, .brutal-hero__title, .brutal-marquee__track { animation: none; }');
    L.push('}');

    /* 窄屏降级成单列 */
    L.push('@media (max-width: 760px) {');
    L.push('  .brutal-strip { grid-template-columns: 1fr; }');
    L.push('  .brutal-split { grid-template-columns: 1fr; }');
    L.push('  .brutal-cta { flex-direction: column; align-items: flex-start; }');
    L.push('}');

    return L;
  }

  function randomPage(s) {
    s.pgTitle = pick(['BUILD IT.', 'MAKE IT LOUD', 'SAY IT PLAIN', 'JUST DO IT.', 'YES. NOW.']);
    s.pgSub   = pick(['直来直去，拒绝圆润。', '不加修饰的硬边设计。', 'Deutsch 功能主义 × 街头标语。', '']);
    s.pgLabel = pick(['开始构建', '就这么办', '走了', '继续']);
    s.pgCta   = Math.random() < 0.7 ? pick(['立刻开工', '马上用', '看方案', '加入我们']) : '';
  }

  COMPONENTS['page'] = {
    label: '整页',
    rootSel: '.brutal-page',
    defaults: {
      pgTitle: 'BUILD IT.',
      pgSub: '直来直去，拒绝圆润。不加修饰的硬边设计语言。',
      pgLabel: '开始构建',
      pgCta: '立刻开工'
    },
    build: buildPage,
    css: cssPage,
    random: randomPage,
    panel: `      <h2>整页构图</h2>
      <div class="field">
        <label for="fPgTitle">主标题</label>
        <input type="text" id="fPgTitle" data-key="pgTitle" maxlength="30" placeholder="BUILD IT.">
      </div>
      <div class="field">
        <label for="fPgSub">副标题</label>
        <input type="text" id="fPgSub" data-key="pgSub" maxlength="80" placeholder="直来直去，拒绝圆润。">
      </div>
      <div class="field">
        <label for="fPgLabel">主按钮文字</label>
        <input type="text" id="fPgLabel" data-key="pgLabel" maxlength="20" placeholder="开始构建">
      </div>
      <div class="field">
        <label for="fPgCta">底部行动文字（留空隐藏本节）</label>
        <input type="text" id="fPgCta" data-key="pgCta" maxlength="16" placeholder="立刻开工">
      </div>
      <p class="hint">整页复用当前主题（配色 / 边框 / 阴影 / 字体 / 纹理），把导航、按钮、进度条、标签页、表格组装成一张完整页面。</p>`
  };