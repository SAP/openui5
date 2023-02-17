sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-block-layer" ?hidden=${context._blockLayerHidden} tabindex="0" style="${(0, _LitRenderer.styleMap)(context.styles.blockLayer)}" @keydown="${context._preventBlockLayerFocus}" @mousedown="${context._preventBlockLayerFocus}"></div>`;
  var _default = block0;
  _exports.default = _default;
});