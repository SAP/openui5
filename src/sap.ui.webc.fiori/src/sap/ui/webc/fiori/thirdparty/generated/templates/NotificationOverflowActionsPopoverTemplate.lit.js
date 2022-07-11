sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} class="ui5-notification-overflow-popover" placement-type="Bottom" horizontal-align="Right" hide-arrow><div class="ui5-notification-overflow-list">${(0, _LitRenderer.repeat)(context.overflowActions, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover class="ui5-notification-overflow-popover" placement-type="Bottom" horizontal-align="Right" hide-arrow><div class="ui5-notification-overflow-list">${(0, _LitRenderer.repeat)(context.overflowActions, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</div></ui5-popover>`;

  const block1 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(item.icon)}" design="Transparent" @click="${item.press}" ?disabled="${item.disabled}" design="${(0, _LitRenderer.ifDefined)(item.design)}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(item.refItemid)}">${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(item.icon)}" design="Transparent" @click="${item.press}" ?disabled="${item.disabled}" design="${(0, _LitRenderer.ifDefined)(item.design)}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(item.refItemid)}">${(0, _LitRenderer.ifDefined)(item.text)}</ui5-button>`;

  var _default = block0;
  _exports.default = _default;
});