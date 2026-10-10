
(function(){
var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
function get(expr, scope){
  expr = expr.trim();
  if (expr === 'true') return true; if (expr === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
  var parts = expr.split('.'), v = scope;
  for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
  return v;
}
function single(str){ var m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str || ''); return m ? m[1] : null; }
function interp(str, scope){ return str.replace(HOLE, function(_, e){ var v = get(e, scope); return v == null ? '' : String(v); }); }
var SVGNS='http://www.w3.org/2000/svg';
function render(node, scope, out){
  if (node.nodeType === 3) { out.appendChild(document.createTextNode(interp(node.nodeValue, scope))); return; }
  if (node.nodeType !== 1) return;
  var tag = node.tagName.toLowerCase();
  if (tag === 'sc-for') {
    var list = get(single(node.getAttribute('list')) || '', scope) || [];
    var as = node.getAttribute('as') || 'item';
    list.forEach(function(item, i){ var s = Object.create(scope); s[as] = item; s.index = i; kids(node, s, out); });
    return;
  }
  if (tag === 'sc-if') { if (get(single(node.getAttribute('value')) || 'false', scope)) kids(node, scope, out); return; }
  var inSvg = tag === 'svg' || (out.namespaceURI === SVGNS);
  var el = inSvg ? document.createElementNS(SVGNS, node.tagName) : document.createElement(tag);
  for (var a = 0; a < node.attributes.length; a++) {
    var at = node.attributes[a], name = at.name, val = at.value, one = single(val);
    if (name.indexOf('hint-') === 0) continue;
    if (name.indexOf('on') === 0 && one) {
      var fn = get(one, scope); if (typeof fn !== 'function') continue;
      var ev = name.slice(2);
      if (ev === 'change' && tag === 'input' && (node.getAttribute('type') || 'text') !== 'checkbox') ev = 'input';
      (function(f){ el.addEventListener(ev, function(e){ f(e); }); })(fn);
      continue;
    }
    if ((name === 'checked' || name === 'value') && one) { el[name] = name === 'checked' ? !!get(one, scope) : (get(one, scope) == null ? '' : get(one, scope)); continue; }
    el.setAttribute(name, interp(val, scope));
  }
  kids(node.content || node, scope, el);
  out.appendChild(el);
}
function kids(node, scope, out){ for (var c = node.firstChild; c; c = c.nextSibling) render(c, scope, out); }
window.DCLogic = function(props){ this.props = props || {}; this.state = {}; };
DCLogic.prototype.setState = function(p){ Object.assign(this.state, typeof p === 'function' ? p(this.state) : p); schedule(); };
DCLogic.prototype.renderVals = function(){ return {}; };
var comp, pending = false, root, tpl;
function schedule(){ if (pending) return; pending = true; Promise.resolve().then(draw); }
function draw(){
  pending = false;
  var act = document.activeElement, fid = act && act.id, sel = null;
  try { if (fid && act.selectionStart != null) sel = act.selectionStart; } catch (e) {}
  var frag = document.createDocumentFragment();
  kids(tpl.content, comp.renderVals(), frag);
  root.replaceChildren(frag);
  if (fid) { var n = document.getElementById(fid); if (n) { n.focus(); try { if (sel != null) n.setSelectionRange(sel, sel); } catch (e) {} } }
}
window.__dcStart = function(Cls){ root = document.getElementById('dc-root'); tpl = document.getElementById('dc-tpl'); comp = new Cls({}); draw(); };
})();
