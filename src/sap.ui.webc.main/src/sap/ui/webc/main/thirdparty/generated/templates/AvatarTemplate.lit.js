sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-avatar-root" tabindex="${(0, _LitRenderer.ifDefined)(this.tabindex)}" data-sap-focus-ref @keyup=${this._onkeyup} @keydown=${this._onkeydown} @focusout=${this._onfocusout} @focusin=${this._onfocusin} @click=${this._onclick} role="${(0, _LitRenderer.ifDefined)(this._role)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this._ariaHasPopup)}" aria-label="${(0, _LitRenderer.ifDefined)(this.accessibleNameText)}" fallback-icon="${(0, _LitRenderer.ifDefined)(this._fallbackIcon)}">${this.hasImage ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}<slot name="badge"></slot></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot></slot>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.icon ? block3.call(this, context, tags, suffix) : undefined}${this.initials ? block4.call(this, context, tags, suffix) : undefined}`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-avatar-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-avatar-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></ui5-icon>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<span class="ui5-avatar-initials">${(0, _LitRenderer.ifDefined)(this.validInitials)}</span><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-avatar-icon ui5-avatar-icon-fallback" name="${(0, _LitRenderer.ifDefined)(this.fallbackIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<span class="ui5-avatar-initials">${(0, _LitRenderer.ifDefined)(this.validInitials)}</span><ui5-icon class="ui5-avatar-icon ui5-avatar-icon-fallback" name="${(0, _LitRenderer.ifDefined)(this.fallbackIcon)}"></ui5-icon>`;
  }
  var _default = block0;
  _exports.default = _default;
});