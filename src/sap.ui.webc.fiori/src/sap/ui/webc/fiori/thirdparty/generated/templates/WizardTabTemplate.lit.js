sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-wiz-step-root" role="listitem" tabindex="${(0, _LitRenderer.ifDefined)(context.tabIndex)}" aria-current="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaCurrent)}" aria-setsize="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaSetsize)}" aria-posinset="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaPosinset)}" aria-disabled="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaDisabled)}" aria-label="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaLabel)}" @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @focusin="${context._onfocusin}"><div class="ui5-wiz-step-main"><div class="ui5-wiz-step-icon-circle">${context.icon ? block1(context, tags, suffix) : block2(context, tags, suffix)}</div>${context.hasTexts ? block3(context, tags, suffix) : undefined}</div>${!context.hideSeparator ? block4(context, tags, suffix) : undefined}</div>`;
  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-wiz-step-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-wiz-step-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}"></ui5-icon>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-wiz-step-number">${(0, _LitRenderer.ifDefined)(context.number)}</span>`;
  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-wiz-step-texts"><div class="ui5-wiz-step-title-text">${(0, _LitRenderer.ifDefined)(context.titleText)}</div><div class="ui5-wiz-step-subtitle-text">${(0, _LitRenderer.ifDefined)(context.subtitleText)}</div></div>`;
  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-wiz-step-hr"></div>`;
  var _default = block0;
  _exports.default = _default;
});