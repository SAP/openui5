sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}--header" class="${(0, _LitRenderer.classMap)(this.classes.root)}" role="group" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.ariaRoleDescription)}" @click="${this._click}" @keydown="${this._keydown}" @keyup="${this._keyup}" part="root"><div class="ui5-card-header-focusable-element" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.ariaLabelledBy)}" role="${(0, _LitRenderer.ifDefined)(this.ariaRoleFocusableElement)}" data-sap-focus-ref tabindex="0">${this.hasAvatar ? block1.call(this, context, tags, suffix) : undefined}<div class="ui5-card-header-text"><div class="ui5-card-header-first-line">${this.titleText ? block2.call(this, context, tags, suffix) : undefined}${this.status ? block3.call(this, context, tags, suffix) : undefined}</div>${this.subtitleText ? block4.call(this, context, tags, suffix) : undefined}</div></div>${this.hasAction ? block5.call(this, context, tags, suffix) : undefined}</div></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-avatar" class="ui5-card-header-avatar" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaCardAvatarLabel)}"><slot name="avatar"></slot></div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-title" class="ui5-card-header-title" part="title" role="heading" aria-level="3">${(0, _LitRenderer.ifDefined)(this.titleText)}</div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-card-header-status"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-status" part="status" dir="auto">${(0, _LitRenderer.ifDefined)(this.status)}</span></div>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-subtitle" class="ui5-card-header-subtitle" part="subtitle">${(0, _LitRenderer.ifDefined)(this.subtitleText)}</div>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-card-header-action" @focusin="${this._actionsFocusin}" @focusout="${this._actionsFocusout}"><slot name="action"></slot></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});