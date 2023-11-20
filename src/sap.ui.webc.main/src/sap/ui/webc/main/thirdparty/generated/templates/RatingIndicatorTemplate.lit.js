sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-rating-indicator-root" role="slider" aria-roledescription="${(0, _LitRenderer.ifDefined)(this._ariaRoleDescription)}" aria-valuemin="0" aria-valuenow="${(0, _LitRenderer.ifDefined)(this.value)}" aria-valuemax="${(0, _LitRenderer.ifDefined)(this.max)}" aria-valuetext="${(0, _LitRenderer.ifDefined)(this.value)} of ${(0, _LitRenderer.ifDefined)(this.max)}" aria-orientation="horizontal" aria-disabled="${(0, _LitRenderer.ifDefined)(this._ariaDisabled)}" aria-readonly="${(0, _LitRenderer.ifDefined)(this.ariaReadonly)}" aria-description="${(0, _LitRenderer.ifDefined)(this._ariaDescription)}" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @click="${this._onclick}" @keydown="${this._onkeydown}" title="${(0, _LitRenderer.ifDefined)(this.tooltip)}" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaLabel)}"><ul class="ui5-rating-indicator-list" aria-hidden="true">${(0, _LitRenderer.repeat)(this._stars, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ul></div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.selected ? block2.call(this, context, tags, suffix, item, index) : block3.call(this, context, tags, suffix, item, index)}`;
  }
  function block2(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-sel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-sel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></ui5-icon></li>`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.halfStar ? block4.call(this, context, tags, suffix, item, index) : block5.call(this, context, tags, suffix, item, index)}`;
  }
  function block4(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-half"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}><div class="ui5-rating-indicator-half-icon-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite" class="ui5-rating-indicator-half-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div></li>` : (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-half"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></ui5-icon><div class="ui5-rating-indicator-half-icon-wrapper"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite" class="ui5-rating-indicator-half-icon"></ui5-icon></div></li>`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${this.readonly ? block6.call(this, context, tags, suffix, item, index) : block7.call(this, context, tags, suffix, item, index)}`;
  }
  function block6(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></ui5-icon></li>`;
  }
  function block7(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${this.disabled ? block8.call(this, context, tags, suffix, item, index) : block9.call(this, context, tags, suffix, item, index)}`;
  }
  function block8(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></ui5-icon></li>`;
  }
  function block9(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></ui5-icon></li>`;
  }
  var _default = block0;
  _exports.default = _default;
});