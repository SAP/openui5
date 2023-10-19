sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-tb-separator-in-overflow ui5-tb-popover-item" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" ?visible="${this.visible}"></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});