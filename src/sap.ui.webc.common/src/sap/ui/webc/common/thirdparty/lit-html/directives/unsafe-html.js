sap.ui.define(["exports", "../lit-html", "../directive"], function (_exports, _litHtml, _directive) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.unsafeHTML = _exports.UnsafeHTMLDirective = void 0;
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  class e extends _directive.Directive {
    constructor(i) {
      if (super(i), this.it = _litHtml.nothing, i.type !== _directive.PartType.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
    }
    render(r) {
      if (r === _litHtml.nothing || null == r) return this.ft = void 0, this.it = r;
      if (r === _litHtml.noChange) return r;
      if ("string" != typeof r) throw Error(this.constructor.directiveName + "() called with a non-string value");
      if (r === this.it) return this.ft;
      this.it = r;
      const s = [r];
      return s.raw = s, this.ft = {
        _$litType$: this.constructor.resultType,
        strings: s,
        values: []
      };
    }
  }
  _exports.UnsafeHTMLDirective = e;
  e.directiveName = "unsafeHTML", e.resultType = 1;
  const o = (0, _directive.directive)(e);
  _exports.unsafeHTML = o;
});