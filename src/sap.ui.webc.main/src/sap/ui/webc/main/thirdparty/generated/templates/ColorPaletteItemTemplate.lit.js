sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-cp-item" style="${(0, _LitRenderer.styleMap)(this.styles.root)}" value="${(0, _LitRenderer.ifDefined)(this.value)}" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" role="button" aria-label="${(0, _LitRenderer.ifDefined)(this.colorLabel)} - ${(0, _LitRenderer.ifDefined)(this.index)}: ${(0, _LitRenderer.ifDefined)(this.value)}" title="${(0, _LitRenderer.ifDefined)(this.colorLabel)} - ${(0, _LitRenderer.ifDefined)(this.index)}: ${(0, _LitRenderer.ifDefined)(this.value)}" ?disabled="${this._disabled}"></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});