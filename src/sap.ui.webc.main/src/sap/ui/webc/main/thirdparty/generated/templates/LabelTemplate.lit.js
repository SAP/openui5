sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<label class="ui5-label-root" @click=${this._onclick}><span class="ui5-label-text-wrapper"><bdi id="${(0, _LitRenderer.ifDefined)(this._id)}-bdi"><slot></slot></bdi></span><span aria-hidden="true" class="ui5-label-required-colon" data-colon="${(0, _LitRenderer.ifDefined)(this._colonSymbol)}"></span></label>`;
  }
  var _default = block0;
  _exports.default = _default;
});