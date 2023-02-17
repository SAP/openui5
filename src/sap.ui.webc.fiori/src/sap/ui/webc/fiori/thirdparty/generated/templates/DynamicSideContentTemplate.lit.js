sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-dsc-root" style="${(0, _LitRenderer.styleMap)(context.styles.root)}"><div class="${(0, _LitRenderer.classMap)(context.classes.main)}" style="${(0, _LitRenderer.styleMap)(context.styles.main)}"><slot></slot></div><aside role="complementary" aria-label="${(0, _LitRenderer.ifDefined)(context.accInfo.label)}" class="${(0, _LitRenderer.classMap)(context.classes.side)}" style="${(0, _LitRenderer.styleMap)(context.styles.side)}"><slot name="sideContent"></slot></aside></div>`;
  var _default = block0;
  _exports.default = _default;
});