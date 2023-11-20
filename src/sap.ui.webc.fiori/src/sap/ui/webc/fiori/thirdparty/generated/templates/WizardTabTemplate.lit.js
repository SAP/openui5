sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-wiz-step-root" role="listitem" tabindex="${(0, _LitRenderer.ifDefined)(this.tabIndex)}" aria-current="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaCurrent)}" aria-setsize="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaSetsize)}" aria-posinset="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaPosinset)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaDisabled)}" aria-label="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaLabel)}" @click="${this._onclick}" @keyup="${this._onkeyup}" @focusin="${this._onfocusin}"><div class="ui5-wiz-step-main"><div class="ui5-wiz-step-icon-circle">${this.icon ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}</div>${this.hasTexts ? block3.call(this, context, tags, suffix) : undefined}</div>${!this.hideSeparator ? block4.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-wiz-step-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-wiz-step-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-wiz-step-number">${(0, _LitRenderer.ifDefined)(this.number)}</span>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-wiz-step-texts"><div class="ui5-wiz-step-title-text">${(0, _LitRenderer.ifDefined)(this.titleText)}</div><div class="ui5-wiz-step-subtitle-text">${(0, _LitRenderer.ifDefined)(this.subtitleText)}</div></div>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-wiz-step-hr"></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});