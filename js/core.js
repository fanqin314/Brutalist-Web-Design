/* ===== core.js · 共享常量 + 工具函数 + 组件注册表 ===== */

  const FONTS = {
    mono:       "ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace",
    sans:       "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    serif:      "Georgia, 'Times New Roman', serif",
    impact:     "Impact, 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
    arialblack: "'Arial Black', 'Arial Bold', Gadget, sans-serif"
  };

  /* ---------------- 模式文字标签 ---------------- */
  const TEXT_LABELS = {
    button:   '按钮文字',
    card:     '卡片标题',
    checkbox: '标签文字',
    switch:   '标签文字',
    input:    '占位文字',
    badge:    '徽章文字',
    radio:    '选项一文字',
    progress: '进度标签',
    slider:   '滑块标签',
    select:   '前置标签（留空隐藏）',
    alert:    '警告标题',
    table:    '表格标题（可留空）',
    nav:      '品牌名',
    tabs:     '面板内容',
    page:     '品牌名'
  };

  /* ---------------- 纹理名称 ---------------- */
  const PATTERN_LABELS = {
    none:    '纯色 / solid',
    stripes: '斜条纹 / stripes',
    grid:    '网格 / grid',
    dots:    '圆点 / dots'
  };

  /* ---------------- 开关风格变体 ----------------
     全部限定在粗野主义语汇内：硬边、硬阴影、实心色块、硬切分区、
     无模糊光晕、无柔和渐变、无拟物高光 */
  const SW_STYLES = {
    brutal: '粗野硬块 / brutal',
    offset: '错位叠影 / offset',
    stripe: '警戒条纹 / stripe',
    skew:   '斜切块 / skew',
    slab:   '厚板镂空 / slab',
    double: '双框硬描 / double',
    split:  '对半硬切 / split',
    tape:   '条带封条 / tape',
    flip:   '反相硬块 / flip',
    grid:    '网格轨道 / grid',
    notch:   '缺口开关 / notch',
    bevel:   '斜切开关 / bevel',
    ring:    '圆环滑块 / ring'
  };

  /* ---------------- 复选框风格变体 ---------------- */
  const CB_STYLES = {
    brutal: '粗野硬块 / brutal',
    offset: '错位双框 / offset',
    invert: '反白填充 / invert',
    hatch:  '警戒斜纹 / hatch',
    stamp:  '印章弹入 / stamp',
    grid:    '网格复选框 / grid',
    notch:   '切角复选框 / notch',
    bevel:   '斜切复选框 / bevel',
    bracket: '四角夹框 / bracket'
  };

  /* ---------------- 复选框勾选图案（纯 CSS，单伪元素 + currentColor） ----------------
     全部用直线与硬角构成，与粗野主义语汇一致 */
  const CB_MARKS = {
    check: '对勾 / check',
    cross: '叉号 / cross',
    dash:  '横杠 / dash',
    block: '实心块 / block',
    bars:  '双横线 / bars',
    plus:  '加号 / plus',
    slash: '斜杠 / slash',
    ring:  '方环 / ring',
    bolt:  '闪电 / bolt',
    notch: '折角 / notch'
  };

  /* ---------------- 输入框风格变体 ----------------
     输入框是「一个槽」：结构统一为 壳（.brutal-field）+ 内部裸 input，
     差异全部落在壳的轮廓 / 分区 / 取形上。
     轮廓（brutal / double / under）/ 分区（band / rail）/ 取形（bracket / bevel /
     stamp / stripe）/ 结构（label / term） */
  const IN_STYLES = {
    brutal:  '粗野硬块 / brutal',
    double:  '双线硬框 / double',
    under:   '粗底线 / underline',
    label:   '标签硬块 / label',
    term:    '终端反白 / terminal',
    bracket: '四角夹框 / bracket',
    bevel:   '斜切双边 / bevel',
    band:    '顶栏硬切 / band',
    rail:    '侧栏标条 / rail',
    stamp:   '印章双框 / stamp',
    stripe:  '警戒条纹 / stripe',
    grid:    '网格输入框 / grid',
    notch:   '切角输入框 / notch',
    corner:  '切角输入框 / corner',
    tape:    '斜贴封条 / tape'
  };

  /* ---------------- 输入框前置标记（纯 CSS 绘制，currentColor 着色） ---------------- */
  const IN_MARKS = {
    none:   '无 / none',
    caret:  '尖角 / caret',
    prompt: '提示符 / prompt',
    at:     '艾特 / at',
    hash:   '井号 / hash',
    star:   '星号 / star',
    arrow:  '箭头 / arrow',
    block:  '实心块 / block',
    dot:    '圆点 / dot'
  };

  /* ---------------- 聚焦反馈 ---------------- */
  const IN_FOCUS = {
    press:  '下沉 / sink',
    invert: '反白 / invert',
    none:   '不动 / none'
  };

  /* ---------------- 徽章风格变体 ----------------
     徽章不是按钮：形状优先（缺角 / 尖角 / 锯齿 / 折角 / 印章 / 空章 / 侧栏），
     矩形族保留描边与硬投影，几何取形的变体用 ::before 承载填充、由父级 drop-shadow 出硬影 */
  const BD_STYLES = {
    slab:    '硬块标签 / slab',
    ticket:  '票券缺口 / ticket',
    banner:  '缎带旗标 / banner',
    zigzag:  '锯齿封条 / zigzag',
    fold:    '折角贴纸 / fold',
    stamp:   '印章双框 / stamp',
    outline: '描边空章 / outline',
    side:    '侧栏标条 / side',
    grid:    '网格底纹 / grid',
    corner:  '切角徽章 / corner',
    notch:   '缺口徽章 / notch',
    double:  '双线徽章 / double'
  };

  /* ---------------- 徽章前置标记（纯 CSS，currentColor 着色，跟随文字色翻转） ---------------- */
  const BD_MARKS = {
    none:   '无 / none',
    square: '方点 / square',
    circle: '圆点 / circle',
    star:   '星标 / star',
    bolt:   '闪电 / bolt',
    arrow:  '箭头 / arrow',
    bar:    '竖条 / bar'
  };

  /* ---------------- 卡片风格变体 ----------------
     卡片是「面」，差异必须落在版式与轮廓上，而不是换个投影了事：
     分区（band / rail）/ 取形（bevel / notch）/ 骨架（bracket / stamp）/ 贴条（tape） */
  const CARD_STYLES = {
    slab:    '硬块卡 / slab',
    band:    '通栏硬切 / band',
    bracket: '四角夹框 / bracket',
    bevel:   '斜切双边 / bevel',
    notch:   '缺口票卡 / notch',
    stamp:   '印章双框 / stamp',
    rail:    '侧栏标条 / rail',
    tape:    '斜贴封条 / tape',
    grid:    '网格底纹 / grid',
    outline: '空描边卡 / outline',
    corner:  '切角卡片 / corner',
    dash:    '虚线硬框 / dash'
  };

  /* ---------------- 卡片行动按钮 ----------------
     量级比按钮小一号：实心块 / 描边块 / 纯文字箭头 */
  const CTA_STYLES = {
    solid:   '实心块 / solid',
    outline: '描边块 / outline',
    arrow:   '箭头文字 / arrow'
  };

  /* ---------------- 按钮轮廓变体 ----------------
     按钮是「动作」，差异落在轮廓与体量上：
       实心（solid）/ 空描边（outline）/ 双线（double）/ 取形（skew · corner）
       / 分区（rail）/ 骨架（bracket）/ 立体（push） */
  const BTN_STYLES = {
    solid:   '硬块 / solid',
    outline: '空描边 / outline',
    double:  '双线硬框 / double',
    skew:    '斜切块 / skew',
    corner:  '切角块 / corner',
    rail:    '侧栏标条 / rail',
    bracket: '四角夹框 / bracket',
    push:    '厚底立体 / push',
    grid:    '网格底纹 / grid',
    tape:    '斜贴封条 / tape',
    notch:   '缺口按钮 / notch',
    stamp:   '印章双框 / stamp'
  };

  /* ---------------- 按钮图标（纯 CSS 绘制，跟随 currentColor） ---------------- */
  const BTN_ICONS = {
    none:    '无 / none',
    arrow:   '箭头 / arrow',
    plus:    '加号 / plus',
    check:   '对勾 / check',
    bolt:    '闪电 / bolt',
    star:    '星形 / star',
    chevron: '尖括号 / chevron',
    dot:     '圆点 / dot'
  };

  /* 图标形状：clip-path 多边形（dot 走 border-radius） */
  const ICON_POLY = {
    arrow:   'polygon(0 34%, 58% 34%, 58% 0, 100% 50%, 58% 100%, 58% 66%, 0 66%)',
    plus:    'polygon(38% 0, 62% 0, 62% 38%, 100% 38%, 100% 62%, 62% 62%, 62% 100%, 38% 100%, 38% 62%, 0 62%, 0 38%, 38% 38%)',
    check:   'polygon(0 52%, 14% 38%, 36% 62%, 86% 6%, 100% 18%, 36% 92%)',
    bolt:    'polygon(56% 0, 12% 56%, 44% 56%, 40% 100%, 88% 42%, 54% 42%)',
    star:    'polygon(50% 0%, 62% 34%, 98% 34%, 69% 56%, 79% 90%, 50% 70%, 21% 90%, 31% 56%, 2% 34%, 38% 34%)',
    chevron: 'polygon(10% 0%, 70% 50%, 10% 100%, 32% 100%, 52% 50%, 32% 0%)'
  };

  /* ---------------- 单选组轮廓变体 ----------------
     单选组是「一组里挑一个」，差异落在"选中长什么样"上：
       标记取形（box · dot · skew）/ 整行表态（invert · stamp）/ 分区（dash） */
  const RD_STYLES = {
    box:     '方框方标 / box',
    dot:     '圆框圆点 / dot',
    dash:    '左侧粗标 / dash',
    invert:  '选中反白 / invert',
    skew:    '斜切标记 / skew',
    stamp:   '印章歪斜 / stamp',
    notch:   '切角标记 / notch',
    block:   '实心方块 / block',
    bar:     '底部粗条 / bar',
    frame:   '双线外框 / frame'
  };

  /* ---------------- 进度条变体 ----------------
     进度条是「填充」，差异落在轨道与填充的质感上 */
  const PG_STYLES = {
    slab:    '硬块实心 / slab',
    stripe:  '警戒斜纹 / stripe',
    segment: '分段格子 / segment',
    notch:   '箭头缺口 / notch',
    double:  '双线内框 / double',
    tick:    '刻度轨道 / tick',
    grid:    '网格轨道 / grid',
    pill:    '圆头胶囊 / pill',
    chevron: '尖角推进 / chevron',
    tape:    '斜贴封条 / tape'
  };

  /* ---------------- 滑块变体 ----------------
     滑块是「拖拽」，差异落在轨道分界与滑块形状上。
     注意：滑块用真 <input type="range">，靠 -webkit- 伪元素上妆 */
  const SL_STYLES = {
    slab:    '方头滑块 / slab',
    double:  '双线轨道 / double',
    tick:    '刻度轨道 / tick',
    skew:    '斜切滑块 / skew',
    hatch:   '未填充斜纹 / hatch',
    invert:  '反色填充 / invert',
    block:   '大方块滑块 / block',
    notch:   '缺口滑块 / notch',
    grid:    '网格轨道 / grid',
    ring:    '圆环滑块 / ring'
  };

  /* ---------------- 下拉变体 ---------------- */
  const SE_STYLES = {
    slab:    '硬块方箭 / slab',
    double:  '双线硬框 / double',
    rail:    '侧栏标条 / rail',
    bracket: '四角夹框 / bracket',
    band:    '通栏硬切 / band',
    stamp:   '印章双框 / stamp',
    notch:   '切角硬框 / notch',
    tape:    '斜贴封条 / tape',
    bevel:   '斜切硬框 / bevel',
    grid:    '网格底纹 / grid'
  };

  /* ---------------- 表格版式变体（table 此前无风格维度） ---------------- */
  const TB_STYLES = {
    slab:    '硬块表格 / slab',
    band:    '通栏表头 / band',
    rule:    '粗分隔线 / rule',
    grid:    '全网格 / grid',
    stamp:   '印章外框 / stamp',
    bevel:   '斜切表头 / bevel',
    rail:    '左侧标条 / rail',
    tape:    '斜贴表头 / tape'
  };

  /* ---------------- 导航栏激活表态变体（nav 此前无风格维度） ---------------- */
  const NV_STYLES = {
    slab:    '硬块导航 / slab',
    under:   '粗下划线 / under',
    tag:     '标签块 / tag',
    bracket: '四角夹框 / bracket',
    rail:    '左侧标条 / rail',
    stamp:   '印章歪斜 / stamp',
    invert:  '反白激活 / invert',
    arrow:   '箭头指示 / arrow'
  };

  /* ---------------- 标签页变体（tabs 此前无风格维度） ---------------- */
  const TS_STYLES = {
    slab:    '硬块标签 / slab',
    under:   '粗下划线 / under',
    bracket: '四角夹框 / bracket',
    notch:   '缺口标签 / notch',
    invert:  '反白标签 / invert',
    stamp:   '印章标签 / stamp',
    rail:    '侧栏标签 / rail',
    tape:    '斜贴标签 / tape'
  };

  /* ---------------- 警告条轮廓变体（alert 此前只有语义级别，无轮廓维度） ---------------- */
  const AL_STYLES = {
    slab:    '硬块警告 / slab',
    banner:  '通栏横幅 / banner',
    rail:    '左侧粗条 / rail',
    bracket: '四角夹框 / bracket',
    stamp:   '印章歪斜 / stamp',
    notch:   '切角警告 / notch',
    tape:    '斜贴封条 / tape',
    outline: '空描边 / outline'
  };

  const MX_STATES = [
    { cls: '',            label: '默认 / default'  },
    { cls: 'is-hover',    label: '悬停 / hover'    },
    { cls: 'is-active',   label: '按下 / active'   },
    { cls: 'is-focus',    label: '聚焦 / focus'    },
    { cls: 'is-disabled', label: '禁用 / disabled' }
  ];

  const MOTION = {
    step:   { ease: 'steps(1, end)',                   dur: 0.12 },
    linear: { ease: 'linear',                          dur: 0.18 },
    smooth: { ease: 'cubic-bezier(.4, 0, .2, 1)',       dur: 0.24 },
    spring: { ease: 'cubic-bezier(.34, 1.56, .64, 1)',  dur: 0.34 },
    bounce: { ease: 'cubic-bezier(.85, .05, .18, 1.35)', dur: 0.46 }
  };

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* 表格示例数据：按列取不同词池，按行错位取，保证看起来像真实表格 */
  function demoCell(c, r) {
    const A = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    const B = ['默认', '主要', '成功', '警告', '危险', '信息'];
    const C = ['就绪', '运行中', '已完成', '待处理', '异常', '离线'];
    const D = ['编辑', '查看', '删除', '更多', '复制', '导出'];
    const pools = [A, B, C, D];
    const pool = pools[c % pools.length];
    return pool[r % pool.length] || ('单元' + (r + 1) + '-' + (c + 1));
  }

  function hexToRgba(hex, alpha) {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return 'rgba(0,0,0,' + alpha + ')';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }

  function shadowStr(x, y, b, color) {
    if (x === 0 && y === 0 && b === 0) return 'none';
    return x + 'px ' + y + 'px ' + b + 'px ' + color;
  }

  function hasShadow(s) {
    return !(s.shadowX === 0 && s.shadowY === 0 && s.shadowBlur === 0);
  }

  /* 相对亮度 + 对比色挑选：滑块图标压在滑块上，自动选对比更强的那个色 */
  function luminance(hex) {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return 0.5;
    const ch = [0, 2, 4].map(function (i) {
      const v = parseInt(h.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  function contrastOn(baseHex, a, b) {
    const lb = luminance(baseHex);
    return Math.abs(lb - luminance(a)) >= Math.abs(lb - luminance(b)) ? a : b;
  }

  /* ---------------- 背景纹理 ----------------
     alpha 默认为 0.16（正文用，很淡）；缩略图可以传更大的值让它看得清 */
  function getPattern(s, alpha) {
    const a = (alpha === undefined) ? 0.16 : alpha;
    const ink = hexToRgba(s.color, a);
    switch (s.pattern) {
      case 'stripes':
        return {
          image: 'repeating-linear-gradient(45deg, transparent 0 7px, ' + ink + ' 7px 14px)',
          size: 'auto'
        };
      case 'grid':
        return {
          image: 'linear-gradient(' + ink + ' 1.5px, transparent 1.5px), ' +
                 'linear-gradient(90deg, ' + ink + ' 1.5px, transparent 1.5px)',
          size: '13px 13px'
        };
      case 'dots':
        return {
          image: 'radial-gradient(' + ink + ' 1.6px, transparent 1.8px)',
          size: '11px 11px'
        };
      default:
        return null;
    }
  }

  /* ---------------- 背景属性行 ---------------- */
  function bgLines(s, pattern, indent) {
    const p = indent || '  ';
    if (pattern) {
      return [
        p + 'background-color: ' + s.bg + ';',
        p + 'background-image: ' + pattern.image + ';',
        p + 'background-size: ' + pattern.size + ';'
      ];
    }
    return [p + 'background: ' + s.bg + ';'];
  }

  /* ---------------- 边框属性行 ---------------- */
  function borderLines(s, indent) {
    const p = indent || '  ';
    if (s.borderWidth > 0) {
      return [p + 'border: ' + s.borderWidth + 'px solid ' + s.borderColor + ';'];
    }
    return [p + 'border: none;'];
  }

  /* ---------------- 字体属性行 ---------------- */
  function fontLines(s, indent, sizeOverride) {
    const p = indent || '  ';
    const fs = sizeOverride || s.fontSize;
    const L = [
      p + 'font-family: ' + FONTS[s.fontFamily] + ';',
      p + 'font-size: ' + fs + 'px;',
      p + 'font-weight: ' + s.fontWeight + ';',
      p + 'letter-spacing: ' + s.letterSpacing + 'px;'
    ];
    if (s.uppercase) L.push(p + 'text-transform: uppercase;');
    return L;
  }

  /* ---------------- 阴影 + 旋转属性行 ---------------- */
  function boxLines(s, indent) {
    const p = indent || '  ';
    let L = [];
    if (hasShadow(s)) L.push(p + 'box-shadow: ' + shadowStr(s.shadowX, s.shadowY, s.shadowBlur, s.shadowColor) + ';');
    if (s.rotate !== 0) L.push(p + 'transform: rotate(' + s.rotate + 'deg);');
    return L;
  }

  /* ---------------- 计算悬停阴影 ---------------- */
  function hoverShadow(s) {
    let hx = s.shadowX, hy = s.shadowY, hb = s.shadowBlur;
    if (s.hoverGrowShadow) {
      hx = Math.round(hx * 1.6);
      hy = Math.round(hy * 1.6);
      hb = Math.round(hb * 1.6);
    }
    if (s.hoverLift) hy += 6;
    return shadowStr(hx, hy, hb, s.shadowColor);
  }

  function stateAliases(L) {
    const MAP = [
      { re: /:hover/g,           cls: '.is-hover'  },
      { re: /:active/g,          cls: '.is-active' },
      { re: /:focus-visible/g,   cls: '.is-focus'  },
      { re: /:focus-within/g,    cls: '.is-focus'  },
      { re: /:focus(?![-a-z])/g, cls: '.is-focus'  }
    ];
    const out = [];
    for (let i = 0; i < L.length; i++) {
      const line = L[i];
      const t = line.trim();
      if (!t || t.charAt(0) === '@' || t.charAt(t.length - 1) !== '{') { out.push(line); continue; }
      const parts = t.slice(0, -1).trim().split(',')
        .map(function (x) { return x.trim(); }).filter(Boolean);
      const add = [];
      parts.forEach(function (pt) {
        MAP.forEach(function (m) {
          m.re.lastIndex = 0;
          let mm = null, last = null;
          while ((mm = m.re.exec(pt)) !== null) last = mm;
          if (!last) return;
          const alias = pt.slice(0, last.index) + m.cls + pt.slice(last.index + last[0].length);
          if (parts.indexOf(alias) < 0 && add.indexOf(alias) < 0) add.push(alias);
        });
      });
      if (!add.length) { out.push(line); continue; }
      out.push(parts.concat(add).join(', ') + ' {');
    }
    return out;
  }

  /* ---------------- 通用状态块 ----------------
     禁用 / 键盘焦点 / 降低动效 —— 这三个状态原来是全空的：
     生成的组件没有禁用态，Tab 键走过去看不见焦点，也没照顾 prefers-reduced-motion。 */

  function universalStates(s) {
    const root = ROOT_SEL[s.mode] || '.brutal-btn';
    const L = [];

    L.push('');
    L.push('/* 禁用态：原生 :disabled / aria-disabled / 手动 .is-disabled 任选其一 */');
    L.push(root + ':disabled,');
    L.push(root + '[aria-disabled="true"],');
    L.push(root + '.is-disabled,');
    L.push(root + ':has(input:disabled),');
    L.push(root + ':has([aria-disabled="true"]) {');
    L.push('  opacity: .35;');
    L.push('  filter: grayscale(1);');
    L.push('  box-shadow: none;');
    L.push('  transform: none;');
    L.push('  cursor: not-allowed;');
    L.push('  pointer-events: none;');
    L.push('}');

    L.push('');
    L.push('/* 键盘焦点：仅键盘 Tab 过来时显示，鼠标点击不显示 */');
    L.push(root + ':focus-visible,');
    L.push(root + ':has(input:focus-visible),');
    L.push(root + '.is-focus {');
    L.push('  outline: 3px solid ' + s.color + ';');
    L.push('  outline-offset: 3px;');
    L.push('}');

    L.push('');
    L.push('/* 降低动效：系统开启「减少动态效果」时，过渡与动画几乎瞬时完成 */');
    L.push('@media (prefers-reduced-motion: reduce) {');
    L.push('  ' + root + ',');
    L.push('  ' + root + '::before,');
    L.push('  ' + root + '::after {');
    L.push('    transition-duration: .01ms !important;');
    L.push('    animation-duration: .01ms !important;');
    L.push('    animation-iteration-count: 1 !important;');
    L.push('  }');
    L.push('}');

    return L;
  }


/* ---------------- 组件注册表 ---------------- */
const COMPONENTS = {};
const MODE_ORDER = ['button', 'card', 'checkbox', 'switch', 'input', 'badge',
                    'radio', 'progress', 'slider', 'select',
                    'alert', 'table', 'nav', 'tabs', 'page'];

/* 所有模式共享的默认状态（组件专属默认写在各组件文件里） */
const GLOBAL_DEFAULTS = {
  mode: 'button',
  text: 'BRUTAL',
  sub: '直接、粗粝、不加修饰的粗野主义设计语言。',
  bg: '#ffe94a',
  color: '#0a0a0a',
  borderColor: '#0a0a0a',
  shadowColor: '#0a0a0a',
  borderWidth: 4,
  radius: 0,
  rotate: -2,
  shadowX: 8,
  shadowY: 8,
  shadowBlur: 0,
  padX: 30,
  padY: 16,
  fontSize: 16,
  fontWeight: '900',
  fontFamily: 'mono',
  letterSpacing: 1.5,
  uppercase: true,
  pattern: 'none',
  showMatrix: true,
  hoverStraighten: true,
  hoverLift: false,
  hoverGrowShadow: true,
  hoverInvert: false,
  pressShake: false
};

/* 共享枚举（组件专属枚举写在各组件文件里，运行时并入 ENUMS） */
const GLOBAL_ENUMS = {
  pattern:    Object.keys(PATTERN_LABELS),
  fontFamily: Object.keys(FONTS),
  fontWeight: ['400', '500', '600', '700', '800', '900']
};

let DEFAULTS, ROOT_SEL, ENUMS, MODES;

/* 启动前由各组件文件登记后调用一次：把分散在组件里的 defaults/enums/rootSel 汇总 */
function deriveConfig() {
  const gd = Object.assign({}, GLOBAL_DEFAULTS);
  const ge = Object.assign({}, GLOBAL_ENUMS);
  const rs = {};
  MODES = MODE_ORDER.filter(function (m) { return COMPONENTS[m]; });
  ge.mode = MODES;
  MODES.forEach(function (m) {
    const c = COMPONENTS[m];
    if (c.defaults) Object.assign(gd, c.defaults);
    if (c.rootSel) rs[m] = c.rootSel;
    if (c.enums)   Object.assign(ge, c.enums);
  });
  DEFAULTS = gd;
  ROOT_SEL = rs;
  ENUMS    = ge;
}
