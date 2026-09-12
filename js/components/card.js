/* ===== components/card.js ===== */

  function cssCard(s) {
    let L = [];
    const pattern = getPattern(s);
    const style  = s.cardStyle || 'slab';
    const bw     = s.borderWidth;
    const fs     = s.fontSize;
    const W      = (s.cardW === undefined) ? 300 : s.cardW;
    const align  = (s.cardAlign === 'center') ? 'center' : 'left';
    const rule   = s.titleRule !== false;
    const cta    = s.ctaStyle || 'solid';
    const r      = s.radius;
    const tagR   = Math.min(r, 6);
    const base   = hasShadow(s) ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
    const hShadow = hoverShadow(s);
    const needHover = s.hoverStraighten || s.hoverLift || s.hoverGrowShadow;

    /* —— 版式参数：全部随字号 / 边框粗细缩放 —— */
    const bandH = Math.max(26, Math.round(fs * 1.7));       /* 通栏条高 */
    const cut   = Math.max(14, Math.round(fs * 1.05));      /* 斜切边长 */
    const notch = Math.max(7,  Math.round(fs * 0.6));       /* 票券缺口深 */
    const barW  = Math.min(44, Math.max(16, Math.round(bw * 4)));  /* 侧栏标条宽（要显著粗于其余三边） */
    const ringG = Math.max(6,  Math.round(bw * 1.4));       /* 印章内框留白 */
    const ringW = Math.max(2,  Math.round(bw * 0.6));       /* 印章内框线宽 */
    const brL   = Math.max(22, Math.round(fs * 1.8));       /* 角夹边长 */
    const brT   = Math.max(2, bw);                          /* 角夹线粗 */
    const brOut = brT + 4;                                  /* 角夹外扩量 */

    let padT = s.padY, padR = s.padX, padB = s.padY, padL = s.padX;
    let clip = null;          /* 交给 ::before 的取形层 */
    let viaFilter = false;    /* 硬影改走 filter: drop-shadow */
    let flat = false;         /* 完全不出影 */
    let useBorder = true;
    let deco = [];            /* 装饰性阴影（inset 内框），与悬停影并存 */
    const extra = [];         /* 追加到 .brutal-card 的声明 */

    if (style === 'band') {
      padT = s.padY + bandH;                       /* 给顶条让位 */

    } else if (style === 'bracket') {
      useBorder = false; flat = true;              /* 靠角夹立住，不要边框与投影 */

    } else if (style === 'bevel') {
      useBorder = false; viaFilter = true;
      clip = 'polygon(' + cut + 'px 0, 100% 0, 100% calc(100% - ' + cut + 'px),' +
             ' calc(100% - ' + cut + 'px) 100%, 0 100%, 0 ' + cut + 'px)';

    } else if (style === 'notch') {
      useBorder = false; viaFilter = true;
      padL = Math.max(s.padX, notch + 8);          /* 缺口之上再留 8px，免得咬到文字 */
      padR = padL;
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

    } else if (style === 'stamp') {
      deco.push('inset 0 0 0 ' + ringG + 'px ' + s.bg);
      deco.push('inset 0 0 0 ' + (ringG + ringW) + 'px ' + s.borderColor);
      extra.push('  outline: ' + Math.max(1, Math.round(bw * 0.5)) + 'px dashed ' + s.borderColor + ';');
      extra.push('  outline-offset: 5px;');

    } else if (style === 'rail') {
      useBorder = bw > 0;
      padL = Math.max(s.padX, barW + 12);
      extra.push('  border-left: ' + barW + 'px solid ' + s.borderColor + ';');

    } else if (style === 'grid') {
      /* 网格底纹：整块铺一层横竖交错的网格 */
      const gInk = hexToRgba(s.color, 0.28);
      extra.push('  background-image: repeating-linear-gradient(90deg, transparent 0 8px, ' +
                 gInk + ' 8px 10px), repeating-linear-gradient(0deg, transparent 0 8px, ' +
                 gInk + ' 8px 10px);');

    } else if (style === 'outline') {
      /* 空描边卡：底色透明，只留一圈硬边（与 slab 的实心块反着来） */
      extra.push('  background: transparent;');

    } else if (style === 'corner') {
      /* 切角卡片：四角各切一小块 —— bevel 只切右上+左下，这里四角都切 */
      useBorder = false; viaFilter = true;
      clip = 'polygon(' + cut + 'px 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut +
             'px, 100% calc(100% - ' + cut + 'px), calc(100% - ' + cut + 'px) 100%, ' + cut +
             'px 100%, 0 calc(100% - ' + cut + 'px), 0 ' + cut + 'px)';

    } else if (style === 'dash') {
      /* 虚线硬框：边框改虚线，读起来像裁剪线而不是实体块 */
      extra.push('  border-style: dashed;');
    }
    /* tape 不需要改版式，封条全在伪元素上 */
    void cut; void brOut;

    /* —— 影：装饰影（inset）与悬停影并存 —— */
    const shBase = [];
    if (!flat && !viaFilter && base) shBase.push(base);
    const shAll = shBase.concat(deco);

    L.push('.brutal-card {');
    L.push('  position: relative;');
    L.push('  box-sizing: border-box;');            /* cardW 即整体宽度（含内边距与边框） */
    if (clip) L.push('  isolation: isolate;');      /* 取形层要能安全垫底 */
    L.push('  flex: 0 0 auto;');                    /* 预览区是 flex 容器，别被压扁 */
    L.push('  width: ' + W + 'px;');
    L.push('  padding: ' + ((padT === padB && padR === padL)
      ? (padT === padR ? padT + 'px' : padT + 'px ' + padR + 'px')
      : (padT + 'px ' + padR + 'px ' + padB + 'px ' + padL + 'px')) + ';');
    if (clip) L.push('  background: transparent;'); /* 填充交给取形层 */
    else L = L.concat(bgLines(s, pattern));
    L.push('  color: ' + s.color + ';');
    if (useBorder) L = L.concat(borderLines(s));
    else L.push('  border: none;');
    L.push('  border-radius: ' + r + 'px;');
    if (viaFilter) {
      if (base) L.push('  filter: drop-shadow(' + s.shadowX + 'px ' + s.shadowY + 'px ' +
                       s.shadowBlur + 'px ' + s.shadowColor + ');');
    } else if (shAll.length) {
      L.push('  box-shadow: ' + shAll.join(', ') + ';');
    }
    L = L.concat(fontLines(s));
    L.push('  line-height: 1.5;');
    L.push('  text-align: ' + align + ';');
    L.push('  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;');
    if (s.rotate !== 0) L.push('  transform: rotate(' + s.rotate + 'deg);');
    L = L.concat(extra);
    L.push('}');

    /* 眉标：反白小色块，排在标题之上 */
    L.push('');
    L.push('.brutal-card__kicker {');
    L.push('  display: inline-block;');
    L.push('  margin-bottom: 12px;');
    L.push('  padding: 4px 9px;');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push(bw > 0 ? '  border: ' + bw + 'px solid ' + s.borderColor + ';' : '  border: none;');
    L.push('  border-radius: ' + Math.min(r, 4) + 'px;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + Math.max(9, Math.round(fs * 0.66)) + 'px;');
    L.push('  font-weight: 800;');
    L.push('  letter-spacing: 0.18em;');
    L.push('  text-transform: uppercase;');
    L.push('  line-height: 1;');
    L.push('}');
    L.push('.brutal-card__kicker:empty { display: none; }');   /* 没填眉标就整块收掉 */

    L.push('');
    L.push('.brutal-card__title {');
    L.push('  margin: 0;');
    L.push('  font-size: ' + Math.round(fs * 1.5) + 'px;');
    L.push('  font-weight: ' + s.fontWeight + ';');
    L.push('  letter-spacing: ' + s.letterSpacing + 'px;');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('  line-height: 1.1;');
    if (rule) {
      L.push('  padding-bottom: 10px;');
      L.push('  border-bottom: ' + Math.max(2, bw) + 'px solid ' + s.color + ';');
    }
    L.push('}');

    L.push('');
    L.push('.brutal-card__desc {');
    L.push('  margin: 12px 0 0;');
    L.push('  font-size: ' + Math.round(fs * 0.85) + 'px;');
    L.push('  font-weight: 500;');
    L.push('  letter-spacing: 0.02em;');
    L.push('  line-height: 1.6;');
    L.push('  opacity: 0.82;');
    L.push('}');

    L.push('');
    L.push('.brutal-card__cta {');
    L.push('  display: inline-block;');
    L.push('  margin-top: 18px;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + Math.max(10, Math.round(fs * 0.8)) + 'px;');
    L.push('  font-weight: 800;');
    L.push('  letter-spacing: 0.1em;');
    if (s.uppercase) L.push('  text-transform: uppercase;');
    L.push('  text-decoration: none;');
    L.push('  cursor: pointer;');
    if (cta === 'arrow') {
      L.push('  padding: 2px 0;');
      L.push('  color: ' + s.color + ';');
      L.push('  border-bottom: ' + Math.max(2, bw) + 'px solid ' + s.color + ';');
      L.push('  transition: transform 0.12s ease;');
    } else if (cta === 'outline') {
      L.push('  padding: 10px 16px;');
      L.push('  background: transparent;');
      L.push('  color: ' + s.color + ';');
      L.push('  border: ' + Math.max(3, bw) + 'px solid ' + s.color + ';');
      L.push('  border-radius: ' + r + 'px;');
      L.push('  transition: transform 0.12s ease, background 0.12s ease, color 0.12s ease;');
    } else {
      L.push('  padding: 10px 16px;');
      L.push('  background: ' + s.color + ';');
      L.push('  color: ' + s.bg + ';');
      L.push(bw > 0 ? '  border: ' + bw + 'px solid ' + s.borderColor + ';' : '  border: none;');
      L.push('  border-radius: ' + r + 'px;');
      L.push('  transition: transform 0.12s ease;');
    }
    L.push('}');

    if (cta === 'arrow') {
      L.push('.brutal-card__cta::before { content: "→ "; }');
    }

    L.push('');
    L.push('.brutal-card__cta:hover {');
    if (cta === 'outline') {
      L.push('  background: ' + s.color + ';');
      L.push('  color: ' + s.bg + ';');
    } else if (cta === 'arrow') {
      L.push('  transform: translateX(4px);');
    } else {
      L.push('  transform: translate(2px, 2px);');
    }
    L.push('}');

    /* 角标：顶在右上角、骑在边框上的实心小牌（留空则不渲染） */
    L.push('');
    L.push('.brutal-card__tag {');
    L.push('  position: absolute;');
    L.push('  top: 0;');
    L.push('  right: 0;');
    L.push('  transform: translate(36%, -36%);');
    L.push('  z-index: 3;');
    L.push('  padding: 3px 7px;');
    L.push('  background: ' + s.color + ';');
    L.push('  color: ' + s.bg + ';');
    L.push('  border: ' + Math.max(2, bw) + 'px solid ' + s.borderColor + ';');
    L.push('  border-radius: ' + tagR + 'px;');
    L.push('  font-family: ' + FONTS[s.fontFamily] + ';');
    L.push('  font-size: ' + Math.max(9, Math.round(fs * 0.6)) + 'px;');
    L.push('  font-weight: 800;');
    L.push('  letter-spacing: 0.12em;');
    L.push('  text-transform: uppercase;');
    L.push('  line-height: 1;');
    L.push('  white-space: nowrap;');
    L.push('  text-align: center;');
    L.push('}');

    /* —— 取形层 —— */
    if (clip) {
      L.push('');
      L.push('.brutal-card::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: 0; right: 0; bottom: 0; left: 0;');
      L.push('  z-index: -1;');
      L = L.concat(bgLines(s, pattern));
      L.push('  clip-path: ' + clip + ';');
      L.push('}');
    }

    /* —— 通栏硬切：顶条 + 把眉标塞进条里 —— */
    if (style === 'band') {
      L.push('');
      L.push('.brutal-card::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: 0; right: 0; left: 0;');
      L.push('  height: ' + bandH + 'px;');
      L.push('  background: ' + s.color + ';');
      L.push('  border-bottom: ' + Math.max(2, bw) + 'px solid ' + s.borderColor + ';');
      if (r > 0) {
        const ir = Math.max(0, r - bw);
        L.push('  border-radius: ' + ir + 'px ' + ir + 'px 0 0;');
      }
      L.push('}');

      L.push('');
      L.push('.brutal-card__kicker {');
      L.push('  position: absolute;');
      L.push('  top: 0; right: 0; left: 0;');
      L.push('  height: ' + bandH + 'px;');
      L.push('  display: flex;');
      L.push('  align-items: center;');
      L.push('  margin: 0;');
      L.push('  padding: 0 ' + s.padX + 'px;');
      L.push('  background: transparent;');
      L.push('  color: ' + s.bg + ';');
      L.push('  border: none;');
      L.push('  border-radius: 0;');
      L.push('  text-align: ' + align + ';');
      if (align === 'center') L.push('  justify-content: center;');
      L.push('}');

      /* 角标改骑在顶条右端，并反相上色，免得墨底叠墨块看不见 */
      L.push('');
      L.push('.brutal-card__tag {');
      L.push('  top: ' + Math.round(bandH / 2) + 'px;');
      L.push('  transform: translate(36%, -50%);');
      L.push('  background: ' + s.bg + ';');
      L.push('  color: ' + s.color + ';');
      L.push('}');
    }

    /* —— 四角夹框：8 层背景拼出四只 L 角，夹在卡片外侧 —— */
    if (style === 'bracket') {
      const g = 'linear-gradient(' + s.borderColor + ', ' + s.borderColor + ')';
      const sizeH = brL + 'px ' + brT + 'px';
      const sizeV = brT + 'px ' + brL + 'px';
      const bars = [
        g + ' 0 0 / ' + sizeH + ' no-repeat',
        g + ' 0 0 / ' + sizeV + ' no-repeat',
        g + ' 100% 0 / ' + sizeH + ' no-repeat',
        g + ' 100% 0 / ' + sizeV + ' no-repeat',
        g + ' 0 100% / ' + sizeH + ' no-repeat',
        g + ' 0 100% / ' + sizeV + ' no-repeat',
        g + ' 100% 100% / ' + sizeH + ' no-repeat',
        g + ' 100% 100% / ' + sizeV + ' no-repeat'
      ];
      L.push('');
      L.push('.brutal-card::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: -' + brOut + 'px;');
      L.push('  right: -' + brOut + 'px;');
      L.push('  bottom: -' + brOut + 'px;');
      L.push('  left: -' + brOut + 'px;');
      L.push('  z-index: 0;');
      L.push('  pointer-events: none;');
      L.push('  background:');
      L.push('    ' + bars.join(',\n    ') + ';');
      L.push('}');
    }

    /* —— 斜贴封条：左上 / 右下各一条，跨角对称贴住 —— */
    if (style === 'tape') {
      const tapeW = 120, tapeH = 20;
      L.push('');
      L.push('.brutal-card::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: 0;');
      L.push('  left: 0;');
      L.push('  width: ' + tapeW + 'px;');
      L.push('  height: ' + tapeH + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  transform: translate(-50%, -50%) rotate(-45deg);');
      L.push('  z-index: 0;');
      L.push('  pointer-events: none;');
      L.push('}');
      L.push('');
      L.push('.brutal-card::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  bottom: 0;');
      L.push('  right: 0;');
      L.push('  width: ' + tapeW + 'px;');
      L.push('  height: ' + tapeH + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  transform: translate(50%, 50%) rotate(-45deg);');
      L.push('  z-index: 0;');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    /* —— 悬停 —— */
    if (needHover) {
      L.push('');
      L.push('.brutal-card:hover {');
      const parts = [];
      if (s.hoverStraighten && s.rotate !== 0) {
        parts.push('rotate(0deg)');
      } else if (s.rotate !== 0) {
        parts.push('rotate(' + s.rotate + 'deg)');
      }
      if (s.hoverLift) parts.push('translateY(-4px)');
      if (parts.length) L.push('  transform: ' + parts.join(' ') + ';');

      if (viaFilter) {
        /* 取形款只能靠 filter 换影，加 box-shadow 会露出方块影子 */
        if (base) L.push('  filter: drop-shadow(' + hShadow + ');');
      } else if (!flat) {
        const hoverSh = [];
        if (hShadow && hShadow !== 'none') hoverSh.push(hShadow);
        const all = hoverSh.concat(deco);
        if (all.length) L.push('  box-shadow: ' + all.join(', ') + ';');
      }
      L.push('}');
    }

    return L;
  }

  /* ---------- CHECKBOX ---------- */
  /* ---------- CHECKBOX ----------
     骨架：28px 方块 + ::after 对勾
     变体：cbStyle（brutal / offset / invert / hatch / stamp）
     位移用独立的 translate 属性，避免与 transform 的旋转缩放打架 */
  /* ---------- 复选框勾选图案 ----------
     返回 { w, h, decls, rot, dx, dy }；全部用 currentColor 上色，
     因此两态（关闭/开启）只要切换 color 即可，尺寸单位为 em（随字号缩放）。 */
  function markLines(mark, radius) {
    const m = { w: '1', h: '1', decls: [], rot: 0, dx: '', dy: '' };
    mark = CB_MARKS[mark] ? mark : 'check';      /* 未知图案一律退回对勾 */

    if (mark === 'cross') {
      m.w = '.58'; m.h = '.58';
      m.decls.push('  background-image:');
      m.decls.push('    linear-gradient(45deg, transparent calc(50% - .07em), currentColor calc(50% - .07em) calc(50% + .07em), transparent calc(50% + .07em)),');
      m.decls.push('    linear-gradient(-45deg, transparent calc(50% - .07em), currentColor calc(50% - .07em) calc(50% + .07em), transparent calc(50% + .07em));');

    } else if (mark === 'dash') {
      m.w = '.94'; m.h = '.24';
      m.decls.push('  background: currentColor;');

    } else if (mark === 'block') {
      m.w = '.62'; m.h = '.62';
      m.decls.push('  background: currentColor;');

    } else if (mark === 'bars') {
      m.w = '.78'; m.h = '.56';
      m.decls.push('  background-image:');
      m.decls.push('    linear-gradient(0deg, currentColor 0 .18em, transparent .18em),');
      m.decls.push('    linear-gradient(0deg, transparent calc(100% - .18em), currentColor calc(100% - .18em));');

    } else if (mark === 'plus') {
      m.w = '.74'; m.h = '.74';
      m.decls.push('  background-image:');
      m.decls.push('    linear-gradient(0deg, transparent calc(50% - .1em), currentColor calc(50% - .1em) calc(50% + .1em), transparent calc(50% + .1em)),');
      m.decls.push('    linear-gradient(90deg, transparent calc(50% - .1em), currentColor calc(50% - .1em) calc(50% + .1em), transparent calc(50% + .1em));');

    } else if (mark === 'slash') {
      m.w = '.8'; m.h = '.8';
      m.decls.push('  background-image: linear-gradient(45deg, transparent calc(50% - .11em), currentColor calc(50% - .11em) calc(50% + .11em), transparent calc(50% + .11em));');

    } else if (mark === 'ring') {
      m.w = '.64'; m.h = '.64';
      m.decls.push('  border: .17em solid currentColor;');
      m.decls.push('  border-radius: ' + (radius > 0 ? '50%' : '0') + ';');

    } else if (mark === 'bolt') {
      m.w = '.5'; m.h = '.78';
      m.decls.push('  background: currentColor;');
      m.decls.push('  clip-path: polygon(62% 0, 16% 54%, 44% 54%, 30% 100%, 84% 42%, 54% 42%);');

    } else if (mark === 'notch') {
      m.w = '.84'; m.h = '.84';
      m.decls.push('  background: currentColor;');
      m.decls.push('  clip-path: polygon(0 0, 100% 0, 0 100%);');

    } else {
      /* check 对勾：右侧 + 底部两道硬边组成，旋转 45° */
      m.w = '.48'; m.h = '.88';
      m.rot = 45;
      m.dx = '-.03'; m.dy = '-.17';
      m.decls.push('  border: solid currentColor;');
      m.decls.push('  border-width: 0 .2em .2em 0;');
    }
    return m;
  }


function buildCard(s) {

        const kicker = (s.kicker || '').trim();
        const tag    = (s.cardTag || '').trim();
        let h = '<div class="brutal-card">\n';
        if (tag) h += '  <span class="brutal-card__tag">' + esc(tag) + '</span>\n';
        /* 眉标恒定输出（空则不占位），band 变体要靠它把文字塞进顶条 */
        h += '  <span class="brutal-card__kicker">' + (kicker ? esc(kicker) : '') + '</span>\n';
        h += '  <h3 class="brutal-card__title">' + esc(s.text || '标题') + '</h3>\n';
        h += '  <p class="brutal-card__desc">' + esc(s.sub || '描述文字') + '</p>\n';
        h += '  <a class="brutal-card__cta" href="#">了解更多</a>\n';
        h += '</div>';
        return h;
      
}

function randomCard(s) {
s.cardStyle = pick(['slab', 'band', 'bracket', 'bevel',
                              'notch', 'stamp', 'rail', 'tape', 'grid', 'outline', 'corner', 'dash']);
      s.ctaStyle  = pick(['solid', 'solid', 'outline', 'arrow']);
      s.cardAlign = pick(['left', 'left', 'center']);
      s.cardW     = pick([260, 280, 300, 320, 340]);
      s.titleRule = Math.random() < 0.7;
      s.kicker    = Math.random() < 0.75
                        ? pick(['SPEC 04', 'BLUEPRINT', 'CUT 45°', 'TICKET',
                                'APPROVED', 'RAIL 01', 'TAPED', 'NO.7'])
                        : '';
      s.cardTag   = Math.random() < 0.4 ? pick(['A1', 'V2', 'N°7', '01', '!!']) : '';
      s.padX      = pick([24, 28, 30, 34]);
      s.padY      = pick([18, 20, 22, 26]);
      s.fontSize  = pick([15, 16, 17, 18]);
}

COMPONENTS['card'] = {
  label: '卡片',
  rootSel: '.brutal-card',
  defaults: { cardStyle: 'slab', cardW: 300, cardAlign: 'left', titleRule: true, ctaStyle: 'solid', kicker: 'SPEC 04', cardTag: 'A1' },
  enums: { cardStyle: Object.keys(CARD_STYLES), cardAlign: ['left', 'center'], ctaStyle: Object.keys(CTA_STYLES) },
  build: buildCard,
  css: cssCard,
  random: randomCard,
  panel: `      <h2>卡片样式</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="cdBand">通栏硬切</button>
        <button class="chip" type="button" data-preset="cdBracket">四角夹框</button>
        <button class="chip" type="button" data-preset="cdBevel">斜切双边</button>
        <button class="chip" type="button" data-preset="cdNotch">缺口票卡</button>
        <button class="chip" type="button" data-preset="cdStamp">印章双框</button>
        <button class="chip" type="button" data-preset="cdRail">侧栏标条</button>
        <button class="chip" type="button" data-preset="cdTape">斜贴封条</button>
        <button class="chip" type="button" data-preset="cdGrid">网格底纹</button>
        <button class="chip" type="button" data-preset="cdOutline">空描边卡</button>
        <button class="chip" type="button" data-preset="cdCorner">切角卡片</button>
        <button class="chip" type="button" data-preset="cdDash">虚线硬框</button>
      </div>
      <div class="field">
        <label for="fCardStyle">风格变体</label>
        <select id="fCardStyle" data-key="cardStyle">
          <option value="slab">硬块卡 / slab</option>
          <option value="band">通栏硬切 / band</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="bevel">斜切双边 / bevel</option>
          <option value="notch">缺口票卡 / notch</option>
          <option value="stamp">印章双框 / stamp</option>
          <option value="rail">侧栏标条 / rail</option>
          <option value="tape">斜贴封条 / tape</option>
        
          <option value="grid">网格底纹 / grid</option>
          <option value="outline">空描边卡 / outline</option>
          <option value="corner">切角卡片 / corner</option>
          <option value="dash">虚线硬框 / dash</option></select>
      </div>
      <div class="field">
        <label for="fCtaStyle">行动按钮</label>
        <select id="fCtaStyle" data-key="ctaStyle">
          <option value="solid">实心块 / solid</option>
          <option value="outline">描边块 / outline</option>
          <option value="arrow">箭头文字 / arrow</option>
        </select>
      </div>
      <div class="field">
        <label for="fKicker">眉标文字（留空隐藏）</label>
        <input type="text" id="fKicker" data-key="kicker" maxlength="20" placeholder="SPEC 04">
      </div>
      <div class="field">
        <label for="fCardTag">角标文字（留空隐藏）</label>
        <input type="text" id="fCardTag" data-key="cardTag" maxlength="4" placeholder="A1">
      </div>
      <div class="field">
        <label for="fCardAlign">内容对齐</label>
        <select id="fCardAlign" data-key="cardAlign">
          <option value="left">左对齐 / left</option>
          <option value="center">居中 / center</option>
        </select>
      </div>
      <div class="field">
        <label>卡片宽度 <span class="val"><span data-out="cardW"></span>px</span></label>
        <input type="range" data-key="cardW" min="200" max="440" step="10">
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" data-key="titleRule"> 标题分隔线</label>
      </div>`
};
