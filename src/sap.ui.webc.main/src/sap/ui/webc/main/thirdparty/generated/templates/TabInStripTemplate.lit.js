sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}" class="${(0, _LitRenderer.ifDefined)(context.stripClasses)}" tabindex="${(0, _LitRenderer.ifDefined)(context._tabIndex)}" role="tab" aria-posinset="${(0, _LitRenderer.ifDefined)(context._posinset)}" aria-setsize="${(0, _LitRenderer.ifDefined)(context._setsize)}" aria-controls="ui5-tc-content" aria-selected="${(0, _LitRenderer.ifDefined)(context.effectiveSelected)}" aria-disabled="${(0, _LitRenderer.ifDefined)(context.effectiveDisabled)}" ?disabled="${context.effectiveDisabled}" aria-labelledby="${(0, _LitRenderer.ifDefined)(context.ariaLabelledBy)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(context.stableDomRef)}" ._realTab="${(0, _LitRenderer.ifDefined)(context)}">${context.icon ? block1(context, tags, suffix) : undefined}<div class="ui5-tab-strip-itemContent">${!context._isInline ? block2(context, tags, suffix) : undefined}${context.text ? block4(context, tags, suffix) : undefined}</div>${context.requiresExpandButton ? block7(context, tags, suffix) : undefined} `;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<div class="ui5-tab-strip-item-icon-outer"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(context.icon)}" class="ui5-tab-strip-item-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-tab-strip-item-icon-outer"><ui5-icon name="${(0, _LitRenderer.ifDefined)(context.icon)}" class="ui5-tab-strip-item-icon"></ui5-icon></div>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.additionalText ? block3(context, tags, suffix) : undefined}`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-tab-strip-itemAdditionalText" id="${(0, _LitRenderer.ifDefined)(context._id)}-additionalText">${(0, _LitRenderer.ifDefined)(context.additionalText)}</span>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-tab-strip-itemText" id="${(0, _LitRenderer.ifDefined)(context._id)}-text">${context.semanticIconName ? block5(context, tags, suffix) : undefined}${(0, _LitRenderer.ifDefined)(context.displayText)}${context.isSingleClickArea ? block6(context, tags, suffix) : undefined}</span>`;

  const block5 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="${(0, _LitRenderer.ifDefined)(context.semanticIconClasses)}" name="${(0, _LitRenderer.ifDefined)(context.semanticIconName)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="${(0, _LitRenderer.ifDefined)(context.semanticIconClasses)}" name="${(0, _LitRenderer.ifDefined)(context.semanticIconName)}"></ui5-icon>`;

  const block6 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<span class="ui5-tab-single-click-icon"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="slim-arrow-down"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span>` : (0, _LitRenderer.html)`<span class="ui5-tab-single-click-icon"><ui5-icon name="slim-arrow-down"></ui5-icon></span>`;

  const block7 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<div class="ui5-tab-expand-button" @click="${context._onTabExpandButtonClick}"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} .tab=${(0, _LitRenderer.ifDefined)(context)} icon="slim-arrow-down" design="Transparent" tabindex="-1" ?disabled="${context.disabled}" aria-haspopup="true"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-tab-expand-button" @click="${context._onTabExpandButtonClick}"><ui5-button .tab=${(0, _LitRenderer.ifDefined)(context)} icon="slim-arrow-down" design="Transparent" tabindex="-1" ?disabled="${context.disabled}" aria-haspopup="true"></ui5-button></div>`;

  var _default = block0;
  _exports.default = _default;
});