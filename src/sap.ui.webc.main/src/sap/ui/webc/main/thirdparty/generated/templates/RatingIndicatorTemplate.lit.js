sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-rating-indicator-root" role="slider" aria-roledescription="${(0, _LitRenderer.ifDefined)(context._ariaRoleDescription)}" aria-valuemin="0" aria-valuenow="${(0, _LitRenderer.ifDefined)(context.value)}" aria-valuemax="${(0, _LitRenderer.ifDefined)(context.max)}" aria-valuetext="${(0, _LitRenderer.ifDefined)(context.value)} of ${(0, _LitRenderer.ifDefined)(context.max)}" aria-orientation="horizontal" aria-disabled="${(0, _LitRenderer.ifDefined)(context._ariaDisabled)}" aria-readonly="${(0, _LitRenderer.ifDefined)(context.ariaReadonly)}" tabindex="${(0, _LitRenderer.ifDefined)(context.tabIndex)}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @click="${context._onclick}" @keydown="${context._onkeydown}" title="${(0, _LitRenderer.ifDefined)(context.tooltip)}" aria-label="${(0, _LitRenderer.ifDefined)(context.accessibleName)}"><ul class="ui5-rating-indicator-list" aria-hidden="true">${(0, _LitRenderer.repeat)(context._stars, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</ul></div>`;

  const block1 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${item.selected ? block2(item, index, context, tags, suffix) : block3(item, index, context, tags, suffix)}`;

  const block2 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-sel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-sel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></ui5-icon></li>`;

  const block3 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${item.halfStar ? block4(item, index, context, tags, suffix) : block5(item, index, context, tags, suffix)}`;

  const block4 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-half"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}><div class="ui5-rating-indicator-half-icon-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite" class="ui5-rating-indicator-half-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div></li>` : (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-half"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></ui5-icon><div class="ui5-rating-indicator-half-icon-wrapper"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite" class="ui5-rating-indicator-half-icon"></ui5-icon></div></li>`;

  const block5 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${context.readonly ? block6(item, index, context, tags, suffix) : block7(item, index, context, tags, suffix)}`;

  const block6 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></ui5-icon></li>`;

  const block7 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${context.disabled ? block8(item, index, context, tags, suffix) : block9(item, index, context, tags, suffix)}`;

  const block8 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="favorite"></ui5-icon></li>`;

  const block9 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" class="ui5-rating-indicator-item ui5-rating-indicator-item-unsel"><ui5-icon data-ui5-value="${(0, _LitRenderer.ifDefined)(item.index)}" name="unfavorite"></ui5-icon></li>`;

  var _default = block0;
  _exports.default = _default;
});