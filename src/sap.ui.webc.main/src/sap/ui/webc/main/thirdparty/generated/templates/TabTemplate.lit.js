sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}" class="ui5-tab-root"><slot name="${(0, _LitRenderer.ifDefined)(context._defaultSlotName)}"></slot>${(0, _LitRenderer.repeat)(context.tabs, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</div>`;
  const block1 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._effectiveSlotName)}"></slot>`;
  var _default = block0;
  _exports.default = _default;
});