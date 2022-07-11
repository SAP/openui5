sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} hide-arrow content-only-on-desktop placement-type="Bottom"><div slot="header" class="ui5-cp-header"><${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)} class="ui5-cp-title">${(0, _LitRenderer.ifDefined)(context._colorPaletteTitle)}</${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)}></div><div><${(0, _LitRenderer.scopeTag)("ui5-color-palette", tags, suffix)} ?show-more-colors="${context.showMoreColors}" ?show-recent-colors="${context.showRecentColors}" ?show-default-color="${context.showDefaultColor}" default-color="${(0, _LitRenderer.ifDefined)(context.defaultColor)}" popup-mode @ui5-item-click="${(0, _LitRenderer.ifDefined)(context.onSelectedColor)}">${(0, _LitRenderer.repeat)(context.colorPaletteColors, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</${(0, _LitRenderer.scopeTag)("ui5-color-palette", tags, suffix)}></div><div slot="footer" class="ui5-cp-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${context.closePopover}">${(0, _LitRenderer.ifDefined)(context._cancelButtonLabel)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover hide-arrow content-only-on-desktop placement-type="Bottom"><div slot="header" class="ui5-cp-header"><ui5-title class="ui5-cp-title">${(0, _LitRenderer.ifDefined)(context._colorPaletteTitle)}</ui5-title></div><div><ui5-color-palette ?show-more-colors="${context.showMoreColors}" ?show-recent-colors="${context.showRecentColors}" ?show-default-color="${context.showDefaultColor}" default-color="${(0, _LitRenderer.ifDefined)(context.defaultColor)}" popup-mode @ui5-item-click="${(0, _LitRenderer.ifDefined)(context.onSelectedColor)}">${(0, _LitRenderer.repeat)(context.colorPaletteColors, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</ui5-color-palette></div><div slot="footer" class="ui5-cp-footer"><ui5-button design="Transparent" @click="${context.closePopover}">${(0, _LitRenderer.ifDefined)(context._cancelButtonLabel)}</ui5-button></div></ui5-responsive-popover>`;

  const block1 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;

  var _default = block0;
  _exports.default = _default;
});