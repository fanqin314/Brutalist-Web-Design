/* ===== components/input.js ===== */

  function cssInput(s) {
    let L = [];
    const style   = IN_STYLES[s.inStyle] ? s.inStyle : 'brutal';
    const pattern = getPattern(s);
    const hs      = hasShadow(s);
    const bw      = Math.max(0, s.borderWidth);
    const W       = (s.inW === undefined) ? 320 : s.inW;
    const fs      = s.fontSize;
    const r       = s.radius;
    const mk      = IN_MARKS[s.inMark] ? inMarkDecls(s.inMark) : null;
    const unit    = (s.inUnit || '').trim();
    const focus   = IN_FOCUS[s.inFocus] ? s.inFocus : 'press';
    const plate   = (style === 'label');       /* 左侧标签牌 */

    const base  = hs ? shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) : null;
    const press = shadowStr(Math.max(0, s.shadowX - 2), Math.max(0, s.shadowY - 2),
                            s.shadowBlur, s.shadowColor);
    const hOver = hoverShadow(s);
    const needHover = s.hoverStraighten || s.hoverLift || s.hoverGrowShadow || s.hoverInvert;

    /* —— 版式参数：全部随字号 / 边框粗细缩放，字号滑杆即整体放大缩小 —— */
    const ub     = bw > 0 ? Math.max(5, Math.round(bw * 1.5)) : 6;   /* 底线粗细 */
    const barH   = Math.max(15, Math.round(fs * 1.05));              /* 顶栏条高 */
    const railW  = Math.min(38, Math.max(12, Math.round(bw * 3.2))); /* 侧栏条宽 */
    const cut    = Math.max(9,  Math.round(fs * 0.62));              /* 斜切边长 */
    const ringG  = Math.max(5,  Math.round(bw * 1.2));               /* 印章内框留白 */
    const ringW  = Math.max(2,  Math.round(bw * 0.55));              /* 印章内框线宽 */
    const stripH = Math.max(8,  Math.round(fs * 0.6));               /* 斜纹带高 */
    const stripS = Math.max(4,  Math.round(stripH * 0.9));           /* 斜纹步长 */
    const brL    = Math.max(18, Math.round(fs * 1.5));               /* 角夹边长 */
    const brT    = Math.max(2, bw);                                  /* 角夹线粗 */
    const brOut  = brT + 3;                                          /* 角夹外扩量 */
    const thin   = Math.max(2, bw);

    let padT = s.padY, padR = s.padX, padB = s.padY, padL = s.padX;
    let clip = null;          /* 交给 ::before 的取形层 */
    let layerShadow = false;  /* 硬影改走 ::after 影子层（drop-shadow 会把文字也投出影） */
    let flat = false;         /* 完全不出影 */
    let useBorder = true;
    const deco  = [];         /* inset 装饰影，与悬停影并存（不能直接被覆盖） */
    const extra = [];         /* 追加到壳上的声明 */

    if (style === 'label') {
      padT = padR = padB = padL = 0;          /* 让标签牌自己顶到壳边 */

    } else if (style === 'band') {
      padT = s.padY + barH;                   /* 给顶条让位 */

    } else if (style === 'rail') {
      padL = s.padX + railW;
      useBorder = bw > 0;
      extra.push('  border-left: ' + railW + 'px solid ' + s.borderColor + ';');

    } else if (style === 'bracket') {
      useBorder = false; flat = true;         /* 靠四只角夹立住，不要边框与投影 */

    } else if (style === 'bevel') {
      useBorder = false; layerShadow = true;
      clip = 'polygon(' + cut + 'px 0, 100% 0, 100% calc(100% - ' + cut + 'px), ' +
             'calc(100% - ' + cut + 'px) 100%, 0 100%, 0 ' + cut + 'px)';

    } else if (style === 'stamp') {
      deco.push('inset 0 0 0 ' + ringG + 'px ' + s.bg);
      deco.push('inset 0 0 0 ' + (ringG + ringW) + 'px ' + s.borderColor);
      extra.push('  outline: ' + Math.max(1, Math.round(bw * 0.5)) + 'px dashed ' + s.borderColor + ';');
      extra.push('  outline-offset: 5px;');
      padT = Math.max(padT, ringG + ringW + 3);
      padB = Math.max(padB, ringG + ringW + 3);
      padL = Math.max(padL, ringG + ringW + 3);
      padR = Math.max(padR, ringG + ringW + 3);

    } else if (style === 'stripe') {
      useBorder = false;
      padB = s.padY + stripH;
      extra.push('  border-top: ' + thin + 'px solid ' + s.borderColor + ';');
      extra.push('  border-left: ' + thin + 'px solid ' + s.borderColor + ';');
      extra.push('  border-right: ' + thin + 'px solid ' + s.borderColor + ';');

    } else if (style === 'under') {
      useBorder = false;
      extra.push('  border-bottom: ' + ub + 'px solid ' + s.borderColor + ';');

    } else if (style === 'term') {
      useBorder = false;
      extra.push('  border: ' + Math.max(2, bw) + 'px solid ' + s.bg + ';');

    } else if (style === 'grid') {
      /* 网格输入框：整个壳铺一层横竖交错的网格 */
      const gInk = hexToRgba(s.color, 0.28);
      extra.push('  background-image: repeating-linear-gradient(90deg, transparent 0 7px, ' +
                 gInk + ' 7px 9px), repeating-linear-gradient(0deg, transparent 0 7px, ' +
                 gInk + ' 7px 9px);');

    } else if (style === 'tape') {
      /* 斜贴封条：整块压粗斜纹，像拿胶带斜着贴过（stripe 只在底部一条带，这里满铺） */
      extra.push('  background-image: repeating-linear-gradient(45deg, ' +
                 hexToRgba(s.borderColor, 0.5) + ' 0 9px, transparent 9px 20px);');

    } else if (style === 'notch') {
      /* 切角输入框：右上 + 左下各削一角 */
      useBorder = false; layerShadow = true;
      clip = 'polygon(0 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut + 'px, 100% 100%, ' +
             cut + 'px 100%, 0 calc(100% - ' + cut + 'px))';

    } else if (style === 'corner') {
      /* 切角输入框：四角各切一小块（notch 只削两角，这里削四角） */
      useBorder = false; layerShadow = true;
      clip = 'polygon(' + cut + 'px 0, calc(100% - ' + cut + 'px) 0, 100% ' + cut +
             'px, 100% calc(100% - ' + cut + 'px), calc(100% - ' + cut + 'px) 100%, ' + cut +
             'px 100%, 0 calc(100% - ' + cut + 'px), 0 ' + cut + 'px)';
    }
    /* brutal / double：基础边框即可，区别在聚焦与投影 */

    const shAll = (flat || layerShadow || !base) ? deco.slice() : [base].concat(deco);
    const padStr = (padT === padB && padR === padL)
      ? (padT === padR ? padT + 'px' : padT + 'px ' + padR + 'px')
      : (padT + 'px ' + padR + 'px ' + padB + 'px ' + padL + 'px');

    /* ---- 壳 ---- */
    L.push('.brutal-field {');
    L.push('  position: relative;');
    L.push('  box-sizing: border-box;');              /* inW 即外宽（含内边距与边框） */
    if (clip) L.push('  isolation: isolate;');        /* 取形层要能安全垫底 */
    L.push('  display: inline-flex;');
    L.push('  align-items: center;');
    L.push('  flex: 0 0 auto;');                       /* 预览区是 flex 容器，别被压扁 */
    L.push('  width: ' + W + 'px;');
    L.push('  max-width: 100%;');
    L.push('  padding: ' + padStr + ';');
    if (clip) L.push('  background: transparent;');    /* 填充交给取形层 */
    else if (style === 'term') {
      L.push('  background-color: #141414;');
      if (pattern) {
        L.push('  background-image: ' + pattern.image + ';');
        L.push('  background-size: ' + pattern.size + ';');
      }
    } else L = L.concat(bgLines(s, pattern));
    L.push('  color: ' + (style === 'term' ? s.bg : s.color) + ';');
    if (useBorder) L = L.concat(borderLines(s));
    else L.push('  border: none;');
    L.push('  border-radius: ' + r + 'px;');
    if (shAll.length) L.push('  box-shadow: ' + shAll.join(', ') + ';');
    L = L.concat(fontLines(s));
    L.push('  line-height: 1.2;');
    L.push('  cursor: text;');
    L.push('  transition: translate .12s ease, box-shadow .14s ease,');
    L.push('              border-color .16s ease, background-color .16s ease, color .16s ease;');
    if (s.rotate !== 0) L.push('  transform: rotate(' + s.rotate + 'deg);');
    L = L.concat(extra);
    L.push('}');

    /* ---- 内部裸 input：所有皮肤都长在壳上，input 透明 ---- */
    L.push('');
    L.push('.brutal-field .brutal-input {');
    L.push('  flex: 1 1 auto;');
    L.push('  min-width: 0;');
    L.push('  width: auto;');
    L.push('  margin: 0;');
    L.push('  padding: ' + (plate ? (s.padY + 'px ' + s.padX + 'px') : '0') + ';');
    L.push('  border: none;');
    L.push('  border-radius: 0;');
    L.push('  background: transparent;');
    L.push('  box-shadow: none;');
    L.push('  outline: none;');
    L.push('  color: inherit;');       /* 反色 / 终端反白要跟着壳走 */
    L.push('  font: inherit;');        /* 表单控件不继承字体，必须显式 */
    L.push('  line-height: 1.2;');
    L.push('  -webkit-appearance: none;');
    L.push('  appearance: none;');
    L.push('}');
    L.push('.brutal-field .brutal-input::placeholder {');
    L.push('  color: currentColor;');
    L.push('  opacity: 0.42;');
    L.push('}');

    /* ---- 左侧标签牌（label 变体） ---- */
    if (plate) {
      L.push('');
      L.push('.brutal-field__tag {');
      L.push('  display: inline-flex;');
      L.push('  align-items: center;');
      L.push('  align-self: stretch;');   /* 顶满壳高，读起来是一块牌子不是一颗按钮 */
      L.push('  flex: 0 0 auto;');
      L.push('  padding: 0 ' + s.padX + 'px;');
      L.push('  background-color: ' + s.color + ';');
      L.push('  color: ' + s.bg + ';');
      if (bw > 0) L.push('  border-right: ' + bw + 'px solid ' + s.borderColor + ';');
      L = L.concat(fontLines(s, '  ', Math.round(fs * 0.8)));
      L.push('  line-height: 1;');
      L.push('  white-space: nowrap;');
      L.push('  transition: background-color .16s ease, color .16s ease;');
      L.push('}');
    }

    /* ---- 前置标记（纯 CSS，currentColor 着色，跟随反色翻转） ---- */
    if (mk) {
      L.push('');
      L.push('.brutal-field__mark {');
      L.push('  display: inline-flex;');
      L.push('  align-items: center;');
      L.push('  justify-content: center;');
      L.push('  flex: 0 0 auto;');
      L.push('  margin-right: 0.55em;');
      L.push('  line-height: 1;');
      L.push('  opacity: 0.9;');
      L.push('}');
      L.push('.brutal-field__mark::before {');
      if (mk.kind === 'glyph') {
        L.push('  content: "' + mk.content + '";');
      } else {
        L.push("  content: '';");
        L.push('  width: ' + mk.w + ';');
        L.push('  height: ' + mk.h + ';');
        L.push('  background: currentColor;');
        if (mk.radius !== '0') L.push('  border-radius: ' + mk.radius + ';');
      }
      L.push('}');
    }

    /* ---- 后缀单位 ---- */
    if (unit) {
      L.push('');
      L.push('.brutal-field__unit {');
      L.push('  display: inline-flex;');
      L.push('  align-items: center;');
      L.push('  flex: 0 0 auto;');
      L.push('  margin-left: 0.55em;');
      L.push('  font-size: 0.9em;');
      L.push('  line-height: 1;');
      L.push('  opacity: 0.62;');
      L.push('}');
    }

    /* ---- 变体装饰层 ---- */

    if (style === 'double') {
      /* 双线硬框：内框在壳上，外框是 detached 描边，聚焦时外框往里收 */
      L.push('');
      L.push('.brutal-field {');
      L.push('  outline: ' + Math.max(2, Math.round(bw * 0.75)) + 'px solid ' + s.borderColor + ';');
      L.push('  outline-offset: ' + Math.max(4, Math.round(bw * 1.5)) + 'px;');
      L.push('}');
      L.push('.brutal-field:focus-within {');
      L.push('  outline-width: ' + Math.max(3, bw) + 'px;');
      L.push('  outline-offset: 2px;');
      L.push('}');
    }

    if (style === 'band') {
      /* 顶栏硬切：实心墨条压在顶上，标记搬进条里反白 */
      L.push('');
      L.push('.brutal-field::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: 0; left: 0; right: 0;');
      L.push('  height: ' + barH + 'px;');
      L.push('  background: ' + s.borderColor + ';');
      L.push('  pointer-events: none;');
      L.push('}');
      if (mk) {
        L.push('.brutal-field__mark {');
        L.push('  position: absolute;');   /* 绝对定位后不占文字行，条上独享一格 */
        L.push('  top: 0; left: ' + s.padX + 'px;');
        L.push('  height: ' + barH + 'px;');
        L.push('  margin: 0;');
        L.push('  color: ' + s.bg + ';');
        L.push('  z-index: 1;');
        L.push('}');
      }
    }

    if (style === 'rail' && mk) {
      /* 侧栏标条：标记竖着住进标条，同样不占文字行 */
      L.push('');
      L.push('.brutal-field__mark {');
      L.push('  position: absolute;');
      L.push('  left: -' + railW + 'px;');
      L.push('  top: -' + bw + 'px; bottom: -' + bw + 'px;');
      L.push('  width: ' + railW + 'px;');
      L.push('  margin: 0;');
      L.push('  color: ' + s.bg + ';');
      L.push('  z-index: 1;');
      L.push('}');
    }

    if (style === 'bracket') {
      /* 四角夹框：8 层背景拼出四只 L 角，夹在壳外侧；聚焦时角夹加粗换色 */
      const bars = function (th, col) {
        const g = 'linear-gradient(' + col + ', ' + col + ')';
        const sizeH = brL + 'px ' + th + 'px';
        const sizeV = th + 'px ' + brL + 'px';
        return [g + ' 0 0 / ' + sizeH + ' no-repeat',
                g + ' 0 0 / ' + sizeV + ' no-repeat',
                g + ' 100% 0 / ' + sizeH + ' no-repeat',
                g + ' 100% 0 / ' + sizeV + ' no-repeat',
                g + ' 0 100% / ' + sizeH + ' no-repeat',
                g + ' 0 100% / ' + sizeV + ' no-repeat',
                g + ' 100% 100% / ' + sizeH + ' no-repeat',
                g + ' 100% 100% / ' + sizeV + ' no-repeat'];
      };
      L.push('');
      L.push('.brutal-field::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  top: -' + brOut + 'px; right: -' + brOut + 'px;');
      L.push('  bottom: -' + brOut + 'px; left: -' + brOut + 'px;');
      L.push('  z-index: 0;');
      L.push('  pointer-events: none;');
      L.push('  background:');
      L.push('    ' + bars(brT, s.borderColor).join(',\n    ') + ';');
      L.push('}');
      L.push('.brutal-field:focus-within::before {');
      L.push('  background:');
      L.push('    ' + bars(Math.round(brT * 1.6), s.color).join(',\n    ') + ';');
      L.push('}');
    }

    if (clip) {
      /* 取形层：只给 bevel 用，垫在文字之下承载填充与纹理 */
      L.push('');
      L.push('.brutal-field::before {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  z-index: -1;');           /* 垫到文字之下（靠父级 isolation 兜住） */
      L = L.concat(bgLines(s, pattern));
      L.push('  clip-path: ' + clip + ';');
      if (r > 0) L.push('  border-radius: ' + r + 'px;');
      L.push('}');
    }

    if (layerShadow && base) {
      /* 影子层：与取形层同形，单独平移出来垫在最底下。
         比父级 filter: drop-shadow 干净 —— 后者会把壳里的文字一起投出影 */
      L.push('');
      L.push('.brutal-field::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  inset: 0;');
      L.push('  z-index: -2;');
      L.push('  background: ' + s.shadowColor + ';');
      L.push('  clip-path: ' + clip + ';');
      if (r > 0) L.push('  border-radius: ' + r + 'px;');
      L.push('  transform: translate(' + s.shadowX + 'px, ' + s.shadowY + 'px);');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    if (style === 'stripe') {
      /* 警戒条纹：底部一条斜纹带（只有此变体用 ::after，不打架） */
      L.push('');
      L.push('.brutal-field::after {');
      L.push("  content: '';");
      L.push('  position: absolute;');
      L.push('  left: 0; right: 0; bottom: 0;');
      L.push('  height: ' + stripH + 'px;');
      L.push('  border-top: ' + thin + 'px solid ' + s.borderColor + ';');
      L.push('  background-image: repeating-linear-gradient(45deg, ' +
             s.borderColor + ' 0 ' + stripS + 'px, ' + s.bg + ' ' + stripS + 'px ' +
             (stripS * 2) + 'px);');
      L.push('  pointer-events: none;');
      L.push('}');
    }

    if (style === 'term') {
      /* 终端反白：提示符闪烁 + 聚焦发硬光（solid，不是模糊光晕） */
      if (mk) {
        L.push('');
        L.push('.brutal-field__mark { animation: brutal-in-blink 1.1s steps(1, end) infinite; }');
      }
      L.push('');
      L.push('@keyframes brutal-in-blink {');
      L.push('  0%, 60% { opacity: 1; }');
      L.push('  61%, 100% { opacity: 0.15; }');
      L.push('}');
      L.push('.brutal-field:focus-within {');
      L.push('  box-shadow: ' + (base ? base + ', ' : '') +
              '0 0 14px ' + hexToRgba(s.bg, 0.72) + ';');
      L.push('}');
    }

    /* ---- 悬停：与卡片同一套开关，装饰影叠加而非覆盖 ---- */
    if (needHover) {
      const layerHover = [];
      L.push('');
      L.push('.brutal-field:hover {');
      if (s.hoverStraighten && s.rotate !== 0) L.push('  transform: rotate(0deg);');
      if (s.hoverLift) L.push('  translate: 0 -3px;');
      if (s.hoverInvert && style !== 'term') {
        L.push('  background-color: ' + s.color + ';');
        L.push('  color: ' + s.bg + ';');
        if (bw > 0 && !clip) L.push('  border-color: ' + s.bg + ';');
      }
      if (s.hoverGrowShadow && base) {
        if (layerShadow) {
          layerHover.push('  transform: translate(' + Math.round(s.shadowX * 1.6) + 'px, ' +
                          (Math.round(s.shadowY * 1.6) + (s.hoverLift ? 6 : 0)) + 'px);');
        } else if (!flat) {
          const hv = (hOver && hOver !== 'none') ? [hOver].concat(deco) : deco.slice();
          if (hv.length) L.push('  box-shadow: ' + hv.join(', ') + ';');
        }
      }
      L.push('}');
      if (layerHover.length) {
        L.push('.brutal-field:hover::after {');
        L = L.concat(layerHover);
        L.push('}');
      }
    }

    /* ---- 聚焦：变体签名态 + inFocus 附加态 ---- */
    const focusDecls = [];
    const focusLayer = [];      /* 打在 ::before 取形层上的反色 */
    const focusAfter = [];      /* 打在 ::after 影子层上的位移 */

    if (style === 'under') {
      focusDecls.push('  border-bottom-width: ' + (ub * 2) + 'px;');  /* 底边再砸厚一倍 */
    }
    if (focus === 'press' && style !== 'term') {
      focusDecls.push('  translate: 2px 2px;');
      if (layerShadow) {
        focusAfter.push('  transform: translate(' + Math.max(0, s.shadowX - 2) + 'px, ' +
                        Math.max(0, s.shadowY - 2) + 'px);');
      } else if (!flat && base) {
        const pf = (press === 'none') ? deco.slice() : [press].concat(deco);
        if (pf.length) focusDecls.push('  box-shadow: ' + pf.join(', ') + ';');
      }
    } else if (focus === 'invert' && style !== 'term' && !plate) {
      focusDecls.push('  color: ' + s.bg + ';');
      if (clip) {
        /* 取形款的填充长在 ::before 上，反色也得反那一层，否则会从多边形背后透出方块 */
        focusLayer.push('  background: ' + s.color + ';');
      } else {
        focusDecls.push('  background-color: ' + s.color + ';');
        if (bw > 0) focusDecls.push('  border-color: ' + s.bg + ';');
      }
    }

    if (plate) {
      L.push('');
      L.push('.brutal-field:focus-within .brutal-field__tag {');
      L.push('  background-color: ' + s.bg + ';');
      L.push('  color: ' + s.color + ';');
      L.push('}');
    }
    if (focusLayer.length) {
      L.push('.brutal-field:focus-within::before {');
      L = L.concat(focusLayer);
      L.push('}');
    }
    if (focusAfter.length) {
      L.push('.brutal-field:focus-within::after {');
      L = L.concat(focusAfter);
      L.push('}');
    }
    if (focusDecls.length) {
      L.push('');
      L.push('.brutal-field:focus-within {');
      L = L.concat(focusDecls);
      L.push('}');
    }

    return L;
  }

  /* ---------- BADGE ----------
     徽章与按钮的区别靠三件事拉开：① 内边距走自己的紧凑尺度（不共用按钮的 padX/padY）；
     ② 形状用缺角 / 尖角 / 锯齿 / 折角等几何取形；③ 自带前置标记。
     注意：clip-path 会把同一元素上的 box-shadow 一起剪掉，所以几何变体把填充放在
     ::before 上，硬影交给父级 filter: drop-shadow() —— 它按子层的实际轮廓出影。 */
  function markShape(mark) {
    switch (mark) {
      case 'square':
        return { w: .42, h: .42, decls: ['  background: currentColor;'] };
      case 'circle':
        return { w: .5, h: .5, decls: ['  background: currentColor;', '  border-radius: 50%;'] };
      case 'star':
        return { w: .66, h: .66, decls: ['  background: currentColor;',
                 '  clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%);'] };
      case 'bolt':
        return { w: .44, h: .64, decls: ['  background: currentColor;',
                 '  clip-path: polygon(62% 0, 16% 54%, 44% 54%, 30% 100%, 84% 42%, 54% 42%);'] };
      case 'arrow':
        return { w: .52, h: .52, decls: ['  background: currentColor;',
                 '  clip-path: polygon(0 0, 100% 50%, 0 100%, 26% 50%);'] };
      case 'bar':
        return { w: .2, h: .68, decls: ['  background: currentColor;'] };
      default:
        return null;
    }
  }


function buildInput(s) {

        /* 结构恒定：壳 + [标签牌] + [标记] + input + [单位]，
           标记与单位由 CSS 绘制（伪元素挂不到 <input> 上，所以它们必须是壳的子元素） */
        const hasMark = !!(IN_MARKS[s.inMark] && s.inMark !== 'none');
        const unitTxt = (s.inUnit || '').trim();
        const tagTxt  = (s.inTag  || '').trim() || 'NAME';
        let h = '<label class="brutal-field">\n';
        if (s.inStyle === 'label') h += '  <span class="brutal-field__tag">' + esc(tagTxt) + '</span>\n';
        if (hasMark) h += '  <span class="brutal-field__mark"></span>\n';
        h += '  <input class="brutal-input" type="text" placeholder="' + esc(s.text || '请输入...') + '">\n';
        if (unitTxt) h += '  <span class="brutal-field__unit">' + esc(unitTxt) + '</span>\n';
        h += '</label>';
        return h;
      
}

function randomInput(s) {
s.inStyle = pick(['brutal', 'brutal', 'double', 'under', 'label', 'term',
                            'bracket', 'bevel', 'band', 'rail', 'stamp', 'stripe', 'grid', 'notch', 'corner', 'tape']);
      s.inMark  = pick(['none', 'none', 'caret', 'prompt', 'at', 'hash',
                            'star', 'arrow', 'block', 'dot']);
      s.inFocus = pick(['press', 'press', 'invert', 'none']);
      s.inUnit  = Math.random() < 0.28 ? pick(['.com', 'kg', 'cm', 'A1', '%', 'psi']) : '';
      s.inTag   = pick(['NAME', 'EMAIL', 'USER', 'ID', 'KEY', 'NO.']);
      s.inW     = pick([240, 280, 320, 360, 400, 440]);
      s.padX    = pick([12, 16, 20, 24, 30]);
      s.padY    = pick([10, 12, 14, 16]);
      s.fontSize = pick([14, 15, 16, 17, 18]);
      s.uppercase = Math.random() < 0.25;
}

COMPONENTS['input'] = {
  label: '输入框',
  rootSel: '.brutal-field',
  defaults: { inStyle: 'brutal', inMark: 'none', inUnit: '', inTag: 'NAME', inW: 320, inFocus: 'press' },
  enums: { inStyle: Object.keys(IN_STYLES), inMark: Object.keys(IN_MARKS), inFocus: Object.keys(IN_FOCUS) },
  build: buildInput,
  css: cssInput,
  random: randomInput,
  panel: `      <h2>输入框样式</h2>
      <div class="presets">
        <button class="chip" type="button" data-preset="inUnder">粗底线</button>
        <button class="chip" type="button" data-preset="inTag">标签硬块</button>
        <button class="chip" type="button" data-preset="inTerm">终端反白</button>
        <button class="chip" type="button" data-preset="inBracket">四角夹框</button>
        <button class="chip" type="button" data-preset="inBevel">斜切双边</button>
        <button class="chip" type="button" data-preset="inBand">顶栏硬切</button>
        <button class="chip" type="button" data-preset="inRail">侧栏标条</button>
        <button class="chip" type="button" data-preset="inStamp">印章双框</button>
        <button class="chip" type="button" data-preset="inStripe">警戒条纹</button>
      </div>
      <div class="field">
        <label for="fInStyle">风格变体</label>
        <select id="fInStyle" data-key="inStyle">
          <option value="brutal">粗野硬块 / brutal</option>
          <option value="double">双线硬框 / double</option>
          <option value="under">粗底线 / underline</option>
          <option value="label">标签硬块 / label</option>
          <option value="term">终端反白 / terminal</option>
          <option value="bracket">四角夹框 / bracket</option>
          <option value="bevel">斜切双边 / bevel</option>
          <option value="band">顶栏硬切 / band</option>
          <option value="rail">侧栏标条 / rail</option>
          <option value="stamp">印章双框 / stamp</option>
          <option value="stripe">警戒条纹 / stripe</option>
        
          <option value="grid">网格输入框 / grid</option>
          <option value="notch">切角输入框 / notch</option>
          <option value="corner">四角切角 / corner</option>
          <option value="tape">斜贴封条 / tape</option></select>
      </div>
      <div class="field">
        <label for="fInMark">前置标记</label>
        <select id="fInMark" data-key="inMark">
          <option value="none">无 / none</option>
          <option value="caret">尖角 / caret</option>
          <option value="prompt">提示符 / prompt</option>
          <option value="at">艾特 / at</option>
          <option value="hash">井号 / hash</option>
          <option value="star">星号 / star</option>
          <option value="arrow">箭头 / arrow</option>
          <option value="block">实心块 / block</option>
          <option value="dot">圆点 / dot</option>
        </select>
      </div>
      <div class="field">
        <label for="fInFocus">聚焦反馈</label>
        <select id="fInFocus" data-key="inFocus">
          <option value="press">下沉 / sink</option>
          <option value="invert">反白 / invert</option>
          <option value="none">不动 / none</option>
        </select>
      </div>
      <div class="field">
        <label for="fInTag">标签牌文字（label 变体）</label>
        <input type="text" id="fInTag" data-key="inTag" maxlength="14" placeholder="NAME">
      </div>
      <div class="field">
        <label for="fInUnit">后缀单位（留空隐藏）</label>
        <input type="text" id="fInUnit" data-key="inUnit" maxlength="8" placeholder=".com">
      </div>
      <div class="field">
        <label>输入框宽度 <span class="val"><span data-out="inW"></span>px</span></label>
        <input type="range" data-key="inW" min="160" max="520" step="10">
      </div>`
};
