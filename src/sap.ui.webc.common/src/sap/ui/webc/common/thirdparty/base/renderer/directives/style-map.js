sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/lit-html/lit-html", "sap/ui/webc/common/thirdparty/lit-html/directive"], function (_exports, _litHtml, _directive) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.styleMap = void 0;
  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */

  /**
   * This is the original style-map.js directive from lit-html 2 with the only difference that "render" is not called even for the first rendering (update is used instead)
   */

  class StyleMapDirective extends _directive.Directive {
    constructor(partInfo) {
      var _a;
      super(partInfo);
      if (partInfo.type !== _directive.PartType.ATTRIBUTE || partInfo.name !== 'style' || ((_a = partInfo.strings) === null || _a === void 0 ? void 0 : _a.length) > 2) {
        throw new Error('The `styleMap` directive must be used in the `style` attribute ' + 'and must be the only part in the attribute.');
      }
    }
    render(styleInfo) {
      return "";
    }
    update(part, [styleInfo]) {
      const {
        style
      } = part.element;
      if (this._previousStyleProperties === undefined) {
        this._previousStyleProperties = new Set();
        for (const name in styleInfo) {
          this._previousStyleProperties.add(name);
        }
        // return this.render(styleInfo);
      }
      // Remove old properties that no longer exist in styleInfo
      // We use forEach() instead of for-of so that re don't require down-level
      // iteration.
      this._previousStyleProperties.forEach(name => {
        // If the name isn't in styleInfo or it's null/undefined
        if (styleInfo[name] == null) {
          this._previousStyleProperties.delete(name);
          if (name.includes('-')) {
            style.removeProperty(name);
          } else {
            // Note reset using empty string (vs null) as IE11 does not always
            // reset via null (https://developer.mozilla.org/en-US/docs/Web/API/ElementCSSInlineStyle/style#setting_styles)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style[name] = '';
          }
        }
      });
      // Add or update properties
      for (const name in styleInfo) {
        const value = styleInfo[name];
        if (value != null) {
          this._previousStyleProperties.add(name);
          if (name.includes('-')) {
            style.setProperty(name, value);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style[name] = value;
          }
        }
      }
      return _litHtml.noChange;
    }
  }
  const styleMap = (0, _directive.directive)(StyleMapDirective);
  _exports.styleMap = styleMap;
});