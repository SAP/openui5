sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(context.stableDomRef)}" role="separator" class="${(0, _LitRenderer.classMap)(context.classes)}"></div>`;
  var _default = block0;
  _exports.default = _default;
});