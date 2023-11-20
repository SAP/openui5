sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-avatar-group-root"><div class="ui5-avatar-group-items" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" @focusin="${this._onfocusin}" tabindex="${(0, _LitRenderer.ifDefined)(this._groupTabIndex)}" @click="${this._onClick}" @ui5-click="${(0, _LitRenderer.ifDefined)(this._onUI5Click)}" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaLabelText)}" role="${(0, _LitRenderer.ifDefined)(this._role)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this._containerAriaHasPopup)}"><slot></slot>${this._customOverflowButton ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}</div></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="overflowButton"></slot>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(this._overflowButtonAccAttributes)}" aria-label="${(0, _LitRenderer.ifDefined)(this._overflowButtonAriaLabelText)}" ?hidden="${this._overflowBtnHidden}" ?non-interactive=${this._isGroup} class="${(0, _LitRenderer.classMap)(this.classes.overflowButton)}">${(0, _LitRenderer.ifDefined)(this._overflowButtonText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(this._overflowButtonAccAttributes)}" aria-label="${(0, _LitRenderer.ifDefined)(this._overflowButtonAriaLabelText)}" ?hidden="${this._overflowBtnHidden}" ?non-interactive=${this._isGroup} class="${(0, _LitRenderer.classMap)(this.classes.overflowButton)}">${(0, _LitRenderer.ifDefined)(this._overflowButtonText)}</ui5-button>`;
  }
  var _default = block0;
  _exports.default = _default;
});