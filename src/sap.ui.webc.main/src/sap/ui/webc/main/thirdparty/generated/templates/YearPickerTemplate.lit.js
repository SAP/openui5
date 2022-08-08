sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-yp-root" role="grid" aria-readonly="false" aria-multiselectable="false" @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._selectYear} @focusin=${context._onfocusin}>${(0, _LitRenderer.repeat)(context._years, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</div>`;

  const block1 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-yp-interval-container">${(0, _LitRenderer.repeat)(item, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix))}</div>`;

  const block2 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div data-sap-timestamp="${(0, _LitRenderer.ifDefined)(item.timestamp)}" tabindex="${(0, _LitRenderer.ifDefined)(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" class="${(0, _LitRenderer.ifDefined)(item.classes)}" role="gridcell" aria-selected="${(0, _LitRenderer.ifDefined)(item.ariaSelected)}">${(0, _LitRenderer.ifDefined)(item.year)}</div>`;

  var _default = block0;
  _exports.default = _default;
});