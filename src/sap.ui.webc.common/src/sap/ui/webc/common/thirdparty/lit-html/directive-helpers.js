sap.ui.define(["exports", "./lit-html"], function (_exports, _litHtml) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setCommittedValue = _exports.setChildPartValue = _exports.removePart = _exports.isTemplateResult = _exports.isSingleExpression = _exports.isPrimitive = _exports.isDirectiveResult = _exports.insertPart = _exports.getDirectiveClass = _exports.getCommittedValue = _exports.clearPart = _exports.TemplateResultType = void 0;
  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const {
      H: i
    } = _litHtml._$LH,
    t = o => null === o || "object" != typeof o && "function" != typeof o,
    n = {
      HTML: 1,
      SVG: 2
    },
    v = (o, i) => {
      var t, n;
      return void 0 === i ? void 0 !== (null === (t = o) || void 0 === t ? void 0 : t._$litType$) : (null === (n = o) || void 0 === n ? void 0 : n._$litType$) === i;
    },
    l = o => {
      var i;
      return void 0 !== (null === (i = o) || void 0 === i ? void 0 : i._$litDirective$);
    },
    d = o => {
      var i;
      return null === (i = o) || void 0 === i ? void 0 : i._$litDirective$;
    },
    r = o => void 0 === o.strings,
    e = () => document.createComment(""),
    u = (o, t, n) => {
      var v;
      const l = o._$AA.parentNode,
        d = void 0 === t ? o._$AB : t._$AA;
      if (void 0 === n) {
        const t = l.insertBefore(e(), d),
          v = l.insertBefore(e(), d);
        n = new i(t, v, o, o.options);
      } else {
        const i = n._$AB.nextSibling,
          t = n._$AM,
          r = t !== o;
        if (r) {
          let i;
          null === (v = n._$AQ) || void 0 === v || v.call(n, o), n._$AM = o, void 0 !== n._$AP && (i = o._$AU) !== t._$AU && n._$AP(i);
        }
        if (i !== d || r) {
          let o = n._$AA;
          for (; o !== i;) {
            const i = o.nextSibling;
            l.insertBefore(o, d), o = i;
          }
        }
      }
      return n;
    },
    c = (o, i, t = o) => (o._$AI(i, t), o),
    f = {},
    s = (o, i = f) => o._$AH = i,
    a = o => o._$AH,
    m = o => {
      var i;
      null === (i = o._$AP) || void 0 === i || i.call(o, !1, !0);
      let t = o._$AA;
      const n = o._$AB.nextSibling;
      for (; t !== n;) {
        const o = t.nextSibling;
        t.remove(), t = o;
      }
    },
    p = o => {
      o._$AR();
    };
  _exports.clearPart = p;
  _exports.removePart = m;
  _exports.getCommittedValue = a;
  _exports.setCommittedValue = s;
  _exports.setChildPartValue = c;
  _exports.insertPart = u;
  _exports.isSingleExpression = r;
  _exports.getDirectiveClass = d;
  _exports.isDirectiveResult = l;
  _exports.isTemplateResult = v;
  _exports.TemplateResultType = n;
  _exports.isPrimitive = t;
});