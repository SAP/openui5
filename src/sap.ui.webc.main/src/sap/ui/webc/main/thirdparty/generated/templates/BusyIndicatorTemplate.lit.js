sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.root)}">${context._isBusy ? block1(context, tags, suffix) : undefined}<slot></slot>${context._isBusy ? block3(context, tags, suffix) : undefined}</div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-busy-indicator-busy-area" title="${(0, _LitRenderer.ifDefined)(context.ariaTitle)}" tabindex="0" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuetext="Busy" aria-labelledby="${(0, _LitRenderer.ifDefined)(context.labelId)}" data-sap-focus-ref><div class="ui5-busy-indicator-circles-wrapper"><div class="ui5-busy-indicator-circle circle-animation-0"></div><div class="ui5-busy-indicator-circle circle-animation-1"></div><div class="ui5-busy-indicator-circle circle-animation-2"></div></div>${context.text ? block2(context, tags, suffix) : undefined}</div>`;

  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(context._id)}-label" class="ui5-busy-indicator-text">${(0, _LitRenderer.ifDefined)(context.text)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-label id="${(0, _LitRenderer.ifDefined)(context._id)}-label" class="ui5-busy-indicator-text">${(0, _LitRenderer.ifDefined)(context.text)}</ui5-label>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<span data-ui5-focus-redirect tabindex="0" @focusin="${context._redirectFocus}"></span>`;

  var _default = block0;
  _exports.default = _default;
});