sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-cp-item" style="${(0, _LitRenderer.styleMap)(context.styles.root)}" value="${(0, _LitRenderer.ifDefined)(context.value)}" tabindex="${(0, _LitRenderer.ifDefined)(context._tabIndex)}" role="button" aria-label="${(0, _LitRenderer.ifDefined)(context.colorLabel)} - ${(0, _LitRenderer.ifDefined)(context.index)}: ${(0, _LitRenderer.ifDefined)(context.value)}" title="${(0, _LitRenderer.ifDefined)(context.colorLabel)} - ${(0, _LitRenderer.ifDefined)(context.index)}: ${(0, _LitRenderer.ifDefined)(context.value)}" ?disabled="${context._disabled}"></div>`;

  var _default = block0;
  _exports.default = _default;
});