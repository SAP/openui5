sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<tr class="ui5-table-group-row-root" part="group-row" aria-label=${(0, _LitRenderer.ifDefined)(this.ariaLabelText)} tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" @focusin="${this._onfocusin}"><td colspan=${(0, _LitRenderer.ifDefined)(this.colSpan)}><slot></slot></td></tr>`;
  }
  var _default = block0;
  _exports.default = _default;
});