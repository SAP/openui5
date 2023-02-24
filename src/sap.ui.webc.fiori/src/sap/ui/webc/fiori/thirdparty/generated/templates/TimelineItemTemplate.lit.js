sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-tli-root" dir="${(0, _LitRenderer.ifDefined)(context.effectiveDir)}"><div class="${(0, _LitRenderer.classMap)(context.classes.indicator)}"><div class="ui5-tli-icon-outer">${context.icon ? block1(context, tags, suffix) : block2(context, tags, suffix)}</div></div><div class="ui5-tli-bubble" tabindex="${(0, _LitRenderer.ifDefined)(context._tabIndex)}" data-sap-focus-ref><div class="ui5-tli-title">${context.name ? block3(context, tags, suffix) : undefined}<span>${(0, _LitRenderer.ifDefined)(context.titleText)}</span></div><div class="ui5-tli-subtitle">${(0, _LitRenderer.ifDefined)(context.subtitleText)}</div>${context.textContent ? block6(context, tags, suffix) : undefined}<span class="${(0, _LitRenderer.classMap)(context.classes.bubbleArrowPosition)}"></span></div></div>`;
  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-tli-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-tli-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></ui5-icon>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-tli-dummy-icon-container"></div>`;
  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.nameClickable ? block4(context, tags, suffix) : block5(context, tags, suffix)}`;
  const block4 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)} @click="${context.onNamePress}" class="ui5-tli-title-name-clickable">${(0, _LitRenderer.ifDefined)(context.name)}&nbsp;</${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-link @click="${context.onNamePress}" class="ui5-tli-title-name-clickable">${(0, _LitRenderer.ifDefined)(context.name)}&nbsp;</ui5-link>`;
  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-tli-title-name">${(0, _LitRenderer.ifDefined)(context.name)}&nbsp;</span>`;
  const block6 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-tli-desc"><slot></slot></div>`;
  var _default = block0;
  _exports.default = _default;
});