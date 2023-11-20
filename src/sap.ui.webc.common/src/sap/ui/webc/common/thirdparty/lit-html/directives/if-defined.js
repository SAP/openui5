sap.ui.define(["exports", "../lit-html"], function (_exports, _litHtml) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ifDefined = void 0;
  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const l = l => null != l ? l : _litHtml.nothing;
  _exports.ifDefined = l;
});