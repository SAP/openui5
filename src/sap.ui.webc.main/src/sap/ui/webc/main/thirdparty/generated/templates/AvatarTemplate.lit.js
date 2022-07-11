sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-avatar-root" tabindex="${(0, _LitRenderer.ifDefined)(context.tabindex)}" data-sap-focus-ref @keyup=${context._onkeyup} @keydown=${context._onkeydown} @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} role="${(0, _LitRenderer.ifDefined)(context._role)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(context._ariaHasPopup)}">${context.hasImage ? block1(context, tags, suffix) : block2(context, tags, suffix)}</div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot></slot>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.icon ? block3(context, tags, suffix) : block4(context, tags, suffix)}`;

  const block3 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-avatar-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}" accessible-name="${(0, _LitRenderer.ifDefined)(context.accessibleNameText)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-avatar-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}" accessible-name="${(0, _LitRenderer.ifDefined)(context.accessibleNameText)}"></ui5-icon>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.initials ? block5(context, tags, suffix) : undefined}`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-avatar-initials">${(0, _LitRenderer.ifDefined)(context.validInitials)}</span>`;

  var _default = block0;
  _exports.default = _default;
});