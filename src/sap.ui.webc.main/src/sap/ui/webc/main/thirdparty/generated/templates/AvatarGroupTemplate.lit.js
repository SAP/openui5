sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-avatar-group-root"><div class="ui5-avatar-group-items" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" @focusin="${context._onfocusin}" tabindex="${(0, _LitRenderer.ifDefined)(context._groupTabIndex)}" @click="${context._onClick}" @ui5-click="${(0, _LitRenderer.ifDefined)(context._onUI5Click)}" aria-label="${(0, _LitRenderer.ifDefined)(context._ariaLabelText)}" role="${(0, _LitRenderer.ifDefined)(context._role)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(context._containerAriaHasPopup)}"><slot></slot>${context._customOverflowButton ? block1(context, tags, suffix) : block2(context, tags, suffix)}</div></div>`;
  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="overflowButton"></slot>`;
  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(context._overflowButtonAccAttributes)}" aria-label="${(0, _LitRenderer.ifDefined)(context._overflowButtonAriaLabelText)}" ?hidden="${context._overflowBtnHidden}" ?non-interactive=${context._isGroup} class="${(0, _LitRenderer.classMap)(context.classes.overflowButton)}">${(0, _LitRenderer.ifDefined)(context._overflowButtonText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(context._overflowButtonAccAttributes)}" aria-label="${(0, _LitRenderer.ifDefined)(context._overflowButtonAriaLabelText)}" ?hidden="${context._overflowBtnHidden}" ?non-interactive=${context._isGroup} class="${(0, _LitRenderer.classMap)(context.classes.overflowButton)}">${(0, _LitRenderer.ifDefined)(context._overflowButtonText)}</ui5-button>`;
  var _default = block0;
  _exports.default = _default;
});