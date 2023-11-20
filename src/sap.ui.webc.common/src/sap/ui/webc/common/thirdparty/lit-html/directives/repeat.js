sap.ui.define(["exports", "../lit-html", "../directive", "../directive-helpers"], function (_exports, _litHtml, _directive, _directiveHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.repeat = void 0;
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const u = (e, s, t) => {
      const r = new Map();
      for (let l = s; l <= t; l++) r.set(e[l], l);
      return r;
    },
    c = (0, _directive.directive)(class extends _directive.Directive {
      constructor(e) {
        if (super(e), e.type !== _directive.PartType.CHILD) throw Error("repeat() can only be used in text expressions");
      }
      dt(e, s, t) {
        let r;
        void 0 === t ? t = s : void 0 !== s && (r = s);
        const l = [],
          o = [];
        let i = 0;
        for (const s of e) l[i] = r ? r(s, i) : i, o[i] = t(s, i), i++;
        return {
          values: o,
          keys: l
        };
      }
      render(e, s, t) {
        return this.dt(e, s, t).values;
      }
      update(s, [t, r, c]) {
        var d;
        const a = (0, _directiveHelpers.getCommittedValue)(s),
          {
            values: p,
            keys: v
          } = this.dt(t, r, c);
        if (!Array.isArray(a)) return this.ut = v, p;
        const h = null !== (d = this.ut) && void 0 !== d ? d : this.ut = [],
          m = [];
        let y,
          x,
          j = 0,
          k = a.length - 1,
          w = 0,
          A = p.length - 1;
        for (; j <= k && w <= A;) if (null === a[j]) j++;else if (null === a[k]) k--;else if (h[j] === v[w]) m[w] = (0, _directiveHelpers.setChildPartValue)(a[j], p[w]), j++, w++;else if (h[k] === v[A]) m[A] = (0, _directiveHelpers.setChildPartValue)(a[k], p[A]), k--, A--;else if (h[j] === v[A]) m[A] = (0, _directiveHelpers.setChildPartValue)(a[j], p[A]), (0, _directiveHelpers.insertPart)(s, m[A + 1], a[j]), j++, A--;else if (h[k] === v[w]) m[w] = (0, _directiveHelpers.setChildPartValue)(a[k], p[w]), (0, _directiveHelpers.insertPart)(s, a[j], a[k]), k--, w++;else if (void 0 === y && (y = u(v, w, A), x = u(h, j, k)), y.has(h[j])) {
          if (y.has(h[k])) {
            const e = x.get(v[w]),
              t = void 0 !== e ? a[e] : null;
            if (null === t) {
              const e = (0, _directiveHelpers.insertPart)(s, a[j]);
              (0, _directiveHelpers.setChildPartValue)(e, p[w]), m[w] = e;
            } else m[w] = (0, _directiveHelpers.setChildPartValue)(t, p[w]), (0, _directiveHelpers.insertPart)(s, a[j], t), a[e] = null;
            w++;
          } else (0, _directiveHelpers.removePart)(a[k]), k--;
        } else (0, _directiveHelpers.removePart)(a[j]), j++;
        for (; w <= A;) {
          const e = (0, _directiveHelpers.insertPart)(s, m[A + 1]);
          (0, _directiveHelpers.setChildPartValue)(e, p[w]), m[w++] = e;
        }
        for (; j <= k;) {
          const e = a[j++];
          null !== e && (0, _directiveHelpers.removePart)(e);
        }
        return this.ut = v, (0, _directiveHelpers.setCommittedValue)(s, m), _litHtml.noChange;
      }
    });
  _exports.repeat = c;
});