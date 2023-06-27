sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" class="ui5-tab-root" data-ui5-stable="${(0, _LitRenderer.ifDefined)(this.stableDomRef)}"><slot name="${(0, _LitRenderer.ifDefined)(this._defaultSlotName)}"></slot>${(0, _LitRenderer.repeat)(this.tabs, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._effectiveSlotName)}"></slot>`;
  }
  var _default = block0;
  _exports.default = _default;
});