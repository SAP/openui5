sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.directive = _exports.PartType = _exports.Directive = void 0;
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t = {
      ATTRIBUTE: 1,
      CHILD: 2,
      PROPERTY: 3,
      BOOLEAN_ATTRIBUTE: 4,
      EVENT: 5,
      ELEMENT: 6
    },
    e = t => (...e) => ({
      _$litDirective$: t,
      values: e
    });
  _exports.directive = e;
  _exports.PartType = t;
  class i {
    constructor(t) {}
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(t, e, i) {
      this._$Ct = t, this._$AM = e, this._$Ci = i;
    }
    _$AS(t, e) {
      return this.update(t, e);
    }
    update(t, e) {
      return this.render(...e);
    }
  }
  _exports.Directive = i;
});