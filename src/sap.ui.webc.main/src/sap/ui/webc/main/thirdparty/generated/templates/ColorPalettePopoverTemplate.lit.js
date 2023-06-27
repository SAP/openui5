sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} hide-arrow content-only-on-desktop placement-type="Bottom"><div slot="header" class="ui5-cp-header"><${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)} class="ui5-cp-title">${(0, _LitRenderer.ifDefined)(this._colorPaletteTitle)}</${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)}></div><div><${(0, _LitRenderer.scopeTag)("ui5-color-palette", tags, suffix)} ?show-more-colors="${this.showMoreColors}" ?show-recent-colors="${this.showRecentColors}" ?show-default-color="${this.showDefaultColor}" default-color="${(0, _LitRenderer.ifDefined)(this.defaultColor)}" popup-mode @ui5-item-click="${(0, _LitRenderer.ifDefined)(this.onSelectedColor)}">${(0, _LitRenderer.repeat)(this.colorPaletteColors, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-color-palette", tags, suffix)}></div><div slot="footer" class="ui5-cp-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${this.closePopover}">${(0, _LitRenderer.ifDefined)(this._cancelButtonLabel)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover hide-arrow content-only-on-desktop placement-type="Bottom"><div slot="header" class="ui5-cp-header"><ui5-title class="ui5-cp-title">${(0, _LitRenderer.ifDefined)(this._colorPaletteTitle)}</ui5-title></div><div><ui5-color-palette ?show-more-colors="${this.showMoreColors}" ?show-recent-colors="${this.showRecentColors}" ?show-default-color="${this.showDefaultColor}" default-color="${(0, _LitRenderer.ifDefined)(this.defaultColor)}" popup-mode @ui5-item-click="${(0, _LitRenderer.ifDefined)(this.onSelectedColor)}">${(0, _LitRenderer.repeat)(this.colorPaletteColors, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ui5-color-palette></div><div slot="footer" class="ui5-cp-footer"><ui5-button design="Transparent" @click="${this.closePopover}">${(0, _LitRenderer.ifDefined)(this._cancelButtonLabel)}</ui5-button></div></ui5-responsive-popover>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  var _default = block0;
  _exports.default = _default;
});