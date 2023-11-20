sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" class="${(0, _LitRenderer.ifDefined)(this.stripClasses.itemClasses)}" tabindex="-1" role="tab" aria-roledescription="${(0, _LitRenderer.ifDefined)(this._roleDescription)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this._ariaHasPopup)}" aria-posinset="${(0, _LitRenderer.ifDefined)(this._posinset)}" aria-setsize="${(0, _LitRenderer.ifDefined)(this._setsize)}" aria-controls="ui5-tc-content" aria-selected="${(0, _LitRenderer.ifDefined)(this.effectiveSelected)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveDisabled)}" ?disabled="${this.effectiveDisabled}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.ariaLabelledBy)}" ._realTab="${(0, _LitRenderer.ifDefined)(this)}">${this.icon ? block1.call(this, context, tags, suffix) : undefined}${this._designDescription ? block2.call(this, context, tags, suffix) : undefined}<div class="ui5-tab-strip-itemContent">${!this._isInline ? block3.call(this, context, tags, suffix) : undefined}${this.text ? block4.call(this, context, tags, suffix) : undefined}</div>${this.requiresExpandButton ? block7.call(this, context, tags, suffix) : undefined} `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-tab-strip-item-icon-outer"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-tab-strip-item-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-tab-strip-item-icon-outer"><ui5-icon id="${(0, _LitRenderer.ifDefined)(this._id)}-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-tab-strip-item-icon"></ui5-icon></div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-designDescription" class="ui5-tab-strip-design-description">${(0, _LitRenderer.ifDefined)(this._designDescription)}</div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="${(0, _LitRenderer.ifDefined)(this.stripClasses.additionalTextClasses)}" id="${(0, _LitRenderer.ifDefined)(this._id)}-additionalText">${(0, _LitRenderer.ifDefined)(this.additionalText)}</span>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-tab-strip-itemText" id="${(0, _LitRenderer.ifDefined)(this._id)}-text">${this.semanticIconName ? block5.call(this, context, tags, suffix) : undefined}${(0, _LitRenderer.ifDefined)(this.displayText)}${this.isSingleClickArea ? block6.call(this, context, tags, suffix) : undefined}</span>`;
  }
  function block5(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="${(0, _LitRenderer.ifDefined)(this.semanticIconClasses)}" name="${(0, _LitRenderer.ifDefined)(this.semanticIconName)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="${(0, _LitRenderer.ifDefined)(this.semanticIconClasses)}" name="${(0, _LitRenderer.ifDefined)(this.semanticIconName)}"></ui5-icon>`;
  }
  function block6(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<span class="ui5-tab-single-click-icon"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="slim-arrow-down"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span>` : (0, _LitRenderer.html)`<span class="ui5-tab-single-click-icon"><ui5-icon name="slim-arrow-down"></ui5-icon></span>`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-tab-expand-button-separator"></div><div class="ui5-tab-expand-button" @click="${this._onTabExpandButtonClick}"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} .tab=${(0, _LitRenderer.ifDefined)(this)} icon="slim-arrow-down" design="Transparent" tabindex="-1" ?disabled="${this.disabled}" tooltip="${(0, _LitRenderer.ifDefined)(this.expandButtonTitle)}" aria-haspopup="Menu"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-tab-expand-button-separator"></div><div class="ui5-tab-expand-button" @click="${this._onTabExpandButtonClick}"><ui5-button .tab=${(0, _LitRenderer.ifDefined)(this)} icon="slim-arrow-down" design="Transparent" tabindex="-1" ?disabled="${this.disabled}" tooltip="${(0, _LitRenderer.ifDefined)(this.expandButtonTitle)}" aria-haspopup="Menu"></ui5-button></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});