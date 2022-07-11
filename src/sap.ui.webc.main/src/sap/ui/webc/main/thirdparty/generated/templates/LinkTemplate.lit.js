sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<a class="ui5-link-root" role="${(0, _LitRenderer.ifDefined)(context.effectiveAccRole)}" href="${(0, _LitRenderer.ifDefined)(context.parsedRef)}" target="${(0, _LitRenderer.ifDefined)(context.target)}" rel="${(0, _LitRenderer.ifDefined)(context._rel)}" tabindex="${(0, _LitRenderer.ifDefined)(context.tabIndex)}" ?disabled="${context.disabled}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(context.accessibilityAttributes.hasPopup)}" aria-expanded="${(0, _LitRenderer.ifDefined)(context.accessibilityAttributes.expanded)}" @focusin=${context._onfocusin} @focusout=${context._onfocusout} @click=${context._onclick} @keydown=${context._onkeydown} @keyup=${context._onkeyup}><slot></slot>${context.hasLinkType ? block1(context, tags, suffix) : undefined}</a>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.linkTypeText)}</span>`;

  var _default = block0;
  _exports.default = _default;
});