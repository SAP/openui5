sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<a class="ui5-link-root" role="${(0, _LitRenderer.ifDefined)(this.effectiveAccRole)}" href="${(0, _LitRenderer.ifDefined)(this.parsedRef)}" target="${(0, _LitRenderer.ifDefined)(this.target)}" rel="${(0, _LitRenderer.ifDefined)(this._rel)}" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" title="${(0, _LitRenderer.ifDefined)(this.title)}" ?disabled="${this.disabled}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes.hasPopup)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes.expanded)}" @focusin=${this._onfocusin} @focusout=${this._onfocusout} @click=${this._onclick} @keydown=${this._onkeydown} @keyup=${this._onkeyup}><slot></slot>${this.hasLinkType ? block1.call(this, context, tags, suffix) : undefined}</a>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.linkTypeText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});