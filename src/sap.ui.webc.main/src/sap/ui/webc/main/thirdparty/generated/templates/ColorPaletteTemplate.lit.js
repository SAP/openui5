sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.colorPaletteRoot)}" @click=${this._onclick} @keyup=${this._onkeyup} @keydown=${this._onkeydown}>${this.showDefaultColor ? block1.call(this, context, tags, suffix) : undefined}<div class="ui5-cp-item-container" role="region" aria-label="${(0, _LitRenderer.ifDefined)(this.colorContainerLabel)}" @keydown="${this._onColorContainerKeyDown}">${(0, _LitRenderer.repeat)(this.displayedColors, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</div>${this._showMoreColors ? block3.call(this, context, tags, suffix) : undefined}${this.showRecentColors ? block4.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-cp-default-color-button-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-cp-default-color-button" design="Transparent" @click=${this._onDefaultColorClick} @keydown=${this._onDefaultColorKeyDown}>Default color</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}><div class="ui5-cp-separator"></div></div>` : (0, _LitRenderer.html)`<div class="ui5-cp-default-color-button-wrapper"><ui5-button class="ui5-cp-default-color-button" design="Transparent" @click=${this._onDefaultColorClick} @keydown=${this._onDefaultColorKeyDown}>Default color</ui5-button><div class="ui5-cp-separator"></div></div>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-cp-more-colors-wrapper"><div class="ui5-cp-separator"></div><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" class="ui5-cp-more-colors" @click="${this._openMoreColorsDialog}" @keydown=${this._onMoreColorsKeyDown}>${(0, _LitRenderer.ifDefined)(this.colorPaleteMoreColorsText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-cp-more-colors-wrapper"><div class="ui5-cp-separator"></div><ui5-button design="Transparent" class="ui5-cp-more-colors" @click="${this._openMoreColorsDialog}" @keydown=${this._onMoreColorsKeyDown}>${(0, _LitRenderer.ifDefined)(this.colorPaleteMoreColorsText)}</ui5-button></div>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-cp-recent-colors-wrapper"><div class="ui5-cp-separator"></div><div class="ui5-cp-recent-colors-container" @keydown="${this._onRecentColorsContainerKeyDown}">${(0, _LitRenderer.repeat)(this.recentColors, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))}</div></div>`;
  }
  function block5(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-color-palette-item", tags, suffix)} value="${(0, _LitRenderer.ifDefined)(item)}"></${(0, _LitRenderer.scopeTag)("ui5-color-palette-item", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-color-palette-item value="${(0, _LitRenderer.ifDefined)(item)}"></ui5-color-palette-item>`;
  }
  var _default = block0;
  _exports.default = _default;
});