sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.targetSrc ? block1(context, tags, suffix) : block5(context, tags, suffix)}`;
  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<a class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" tabindex=${(0, _LitRenderer.ifDefined)(context._tabIndex)} href="${(0, _LitRenderer.ifDefined)(context.targetSrc)}" target="${(0, _LitRenderer.ifDefined)(context.target)}">${context.icon ? block2(context, tags, suffix) : undefined}<span class="ui5-product-switch-item-text-content">${context.titleText ? block3(context, tags, suffix) : undefined}${context.subtitleText ? block4(context, tags, suffix) : undefined}</span></a>`;
  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></ui5-icon>`;
  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-product-switch-item-title">${(0, _LitRenderer.ifDefined)(context.titleText)}</span>`;
  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-product-switch-item-subtitle">${(0, _LitRenderer.ifDefined)(context.subtitleText)}</span>`;
  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<div role="listitem" class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" tabindex=${(0, _LitRenderer.ifDefined)(context._tabIndex)}>${context.icon ? block6(context, tags, suffix) : undefined}<span class="ui5-product-switch-item-text-content">${context.titleText ? block7(context, tags, suffix) : undefined}${context.subtitleText ? block8(context, tags, suffix) : undefined}</span></div>`;
  const block6 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></ui5-icon>`;
  const block7 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-product-switch-item-title">${(0, _LitRenderer.ifDefined)(context.titleText)}</span>`;
  const block8 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-product-switch-item-subtitle">${(0, _LitRenderer.ifDefined)(context.subtitleText)}</span>`;
  var _default = block0;
  _exports.default = _default;
});