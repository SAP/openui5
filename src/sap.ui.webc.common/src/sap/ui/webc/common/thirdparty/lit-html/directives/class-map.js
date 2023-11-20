sap.ui.define(["exports", "../lit-html", "../directive"], function (_exports, _litHtml, _directive) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.classMap = void 0;
  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const o = (0, _directive.directive)(class extends _directive.Directive {
    constructor(t) {
      var i;
      if (super(t), t.type !== _directive.PartType.ATTRIBUTE || "class" !== t.name || (null === (i = t.strings) || void 0 === i ? void 0 : i.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
    }
    render(t) {
      return " " + Object.keys(t).filter(i => t[i]).join(" ") + " ";
    }
    update(i, [s]) {
      var r, o;
      if (void 0 === this.et) {
        this.et = new Set(), void 0 !== i.strings && (this.st = new Set(i.strings.join(" ").split(/\s/).filter(t => "" !== t)));
        for (const t in s) s[t] && !(null === (r = this.st) || void 0 === r ? void 0 : r.has(t)) && this.et.add(t);
        return this.render(s);
      }
      const e = i.element.classList;
      this.et.forEach(t => {
        t in s || (e.remove(t), this.et.delete(t));
      });
      for (const t in s) {
        const i = !!s[t];
        i === this.et.has(t) || (null === (o = this.st) || void 0 === o ? void 0 : o.has(t)) || (i ? (e.add(t), this.et.add(t)) : (e.remove(t), this.et.delete(t)));
      }
      return _litHtml.noChange;
    }
  });
  _exports.classMap = o;
});