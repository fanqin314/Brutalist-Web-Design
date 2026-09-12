/* ===== interact.js · 预览区交互脚本（导出时也内联同一份） ===== */

  const SELECT_JS = `(function(){
  var doc = document;
  function closeAll(except){
    var a = doc.querySelectorAll('.brutal-select.is-open');
    for(var i=0;i<a.length;i++){ if(a[i]!==except){ a[i].classList.remove('is-open'); a[i].setAttribute('aria-expanded','false'); } }
  }
  function open(sel){
    closeAll(sel);
    sel.classList.add('is-open');
    sel.setAttribute('aria-expanded','true');
    var opts = sel.querySelectorAll('.brutal-select__opt');
    var cur = sel.querySelector('.brutal-select__opt[aria-selected="true"]') || opts[0] || null;
    sel._active = cur;
    for(var i=0;i<opts.length;i++){ opts[i].classList.toggle('is-active', opts[i]===cur); }
  }
  function close(sel){ sel.classList.remove('is-open'); sel.setAttribute('aria-expanded','false'); }
  function choose(sel, opt){
    var opts = sel.querySelectorAll('.brutal-select__opt');
    for(var i=0;i<opts.length;i++){ opts[i].removeAttribute('aria-selected'); }
    opt.setAttribute('aria-selected','true');
    var val = sel.querySelector('.brutal-select__value');
    if(val) val.textContent = opt.textContent;
    close(sel);
  }
  doc.addEventListener('click', function(e){
    var t = e.target;
    var sel = t && t.closest ? t.closest('.brutal-select') : null;
    if(!sel){ closeAll(null); return; }
    if(sel.hasAttribute('disabled') || sel.getAttribute('aria-disabled')==='true' || sel.classList.contains('is-disabled')) return;
    var opt = t && t.closest ? t.closest('.brutal-select__opt') : null;
    if(opt){ choose(sel, opt); return; }
    if(sel.classList.contains('is-open')) close(sel); else open(sel);
  });
  doc.addEventListener('keydown', function(e){
    var t = e.target;
    var sel = t && t.closest ? t.closest('.brutal-select') : null;
    if(!sel) return;
    if(sel.hasAttribute('disabled') || sel.getAttribute('aria-disabled')==='true' || sel.classList.contains('is-disabled')) return;
    if(e.key==='Escape'){ close(sel); sel.focus(); return; }
    var opts = [].slice.call(sel.querySelectorAll('.brutal-select__opt'));
    if(!opts.length) return;
    if(sel.classList.contains('is-open')){
      var idx = opts.indexOf(sel._active || opts[0]);
      if(e.key==='ArrowDown'){ e.preventDefault(); idx=Math.min(opts.length-1, idx+1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); idx=Math.max(0, idx-1); }
      else if(e.key==='Home'){ e.preventDefault(); idx=0; }
      else if(e.key==='End'){ e.preventDefault(); idx=opts.length-1; }
      else if(e.key==='Enter' || e.key===' '){ e.preventDefault(); choose(sel, sel._active||opts[0]); return; }
      else return;
      sel._active = opts[idx];
      for(var i=0;i<opts.length;i++){ opts[i].classList.toggle('is-active', opts[i]===sel._active); }
      opts[idx].scrollIntoView({block:'nearest'});
    } else {
      if(e.key==='ArrowDown' || e.key==='Enter' || e.key===' '){ e.preventDefault(); open(sel); }
    }
  });
})();`;

  /* 滑块交互：拖拽时让填充（CSS var(--val)）与数值标签实时跟随滑块。
     事件委托只绑一次，预览区与导出的独立 HTML 通用同一份。 */

  const SLIDER_JS = `(function(){
    var doc = document;
    function sync(input){
      if(!input || !input.classList || !input.classList.contains('brutal-slider__input')) return;
      var v = input.value;
      input.style.setProperty('--val', v + '%');
      var root = input.closest ? input.closest('.brutal-slider') : null;
      var val = root && root.querySelector('.brutal-slider__val');
      if(val) val.textContent = v;
    }
    doc.addEventListener('input', function(e){ sync(e.target); }, true);
    doc.querySelectorAll('.brutal-slider__input').forEach(sync);
  })();`;

  /* 标签页交互：点击切换面板 + 左右方向键导航（ARIA tablist 规范）。
     事件委托只绑一次，预览区与导出的独立 HTML 通用同一份。 */

  const TABS_JS = `(function(){
    var doc = document;
    doc.addEventListener('click', function(e){
      var t = e.target;
      var tab = t && t.closest ? t.closest('.brutal-tabs__tab') : null;
      if(!tab) return;
      var panelId = tab.getAttribute('aria-controls');
      var root = tab.closest('.brutal-tabs');
      if(!root) return;
      root.querySelectorAll('.brutal-tabs__tab').forEach(function(x){
        x.setAttribute('aria-selected', x === tab ? 'true' : 'false');
      });
      root.querySelectorAll('.brutal-tabs__panel').forEach(function(p){
        p.hidden = (p.id !== panelId);
      });
    });
    doc.addEventListener('keydown', function(e){
      var t = e.target;
      var tab = t && t.closest ? t.closest('.brutal-tabs__tab') : null;
      if(!tab) return;
      var tabs = [].slice.call(tab.parentElement.querySelectorAll('.brutal-tabs__tab'));
      var i = tabs.indexOf(tab);
      if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        e.preventDefault();
        var n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        tabs[n].focus();
        tabs[n].click();
      }
    });
  })();`;

