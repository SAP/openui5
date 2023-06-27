sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li-custom", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-li" class="${(0, _LitRenderer.ifDefined)(this.overflowClasses)}" type="${(0, _LitRenderer.ifDefined)(this.overflowState)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveDisabled)}" aria-selected="${(0, _LitRenderer.ifDefined)(this.effectiveSelected)}" ._realTab="${(0, _LitRenderer.ifDefined)(this)}" style="${(0, _LitRenderer.styleMap)(this._style)}"><div class="ui5-tab-overflow-itemContent-wrapper"><div class="ui5-tab-overflow-itemContent">${this.semanticIconName ? block1.call(this, context, tags, suffix) : undefined}${this.icon ? block2.call(this, context, tags, suffix) : undefined}${(0, _LitRenderer.ifDefined)(this.text)}${this.additionalText ? block3.call(this, context, tags, suffix) : undefined}${this._designDescription ? block4.call(this, context, tags, suffix) : undefined}</div></div></${(0, _LitRenderer.scopeTag)("ui5-li-custom", tags, suffix)}>${(0, _LitRenderer.repeat)(this.subTabs, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))} ` : (0, _LitRenderer.html)`<ui5-li-custom id="${(0, _LitRenderer.ifDefined)(this._id)}-li" class="${(0, _LitRenderer.ifDefined)(this.overflowClasses)}" type="${(0, _LitRenderer.ifDefined)(this.overflowState)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveDisabled)}" aria-selected="${(0, _LitRenderer.ifDefined)(this.effectiveSelected)}" ._realTab="${(0, _LitRenderer.ifDefined)(this)}" style="${(0, _LitRenderer.styleMap)(this._style)}"><div class="ui5-tab-overflow-itemContent-wrapper"><div class="ui5-tab-overflow-itemContent">${this.semanticIconName ? block1.call(this, context, tags, suffix) : undefined}${this.icon ? block2.call(this, context, tags, suffix) : undefined}${(0, _LitRenderer.ifDefined)(this.text)}${this.additionalText ? block3.call(this, context, tags, suffix) : undefined}${this._designDescription ? block4.call(this, context, tags, suffix) : undefined}</div></div></ui5-li-custom>${(0, _LitRenderer.repeat)(this.subTabs, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))} `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="${(0, _LitRenderer.ifDefined)(this.semanticIconClasses)}" name="${(0, _LitRenderer.ifDefined)(this.semanticIconName)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="${(0, _LitRenderer.ifDefined)(this.semanticIconClasses)}" name="${(0, _LitRenderer.ifDefined)(this.semanticIconName)}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(this.icon)}"></ui5-icon>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)` (${(0, _LitRenderer.ifDefined)(this.additionalText)}) `;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-designDescription" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._designDescription)}</div>`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.overflowPresentation)}`;
  }
  var _default = block0;
  _exports.default = _default;
});