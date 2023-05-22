sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.targetSrc ? block1.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<a class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${this._onfocusout}" @focusin="${this._onfocusin}" @mousedown="${this._onmousedown}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" tabindex=${(0, _LitRenderer.ifDefined)(this._tabIndex)} href="${(0, _LitRenderer.ifDefined)(this.targetSrc)}" target="${(0, _LitRenderer.ifDefined)(this.target)}">${this.icon ? block2.call(this, context, tags, suffix) : undefined}<span class="ui5-product-switch-item-text-content">${this.titleText ? block3.call(this, context, tags, suffix) : undefined}${this.subtitleText ? block4.call(this, context, tags, suffix) : undefined}</span></a>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></ui5-icon>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-product-switch-item-title">${(0, _LitRenderer.ifDefined)(this.titleText)}</span>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-product-switch-item-subtitle">${(0, _LitRenderer.ifDefined)(this.subtitleText)}</span>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div role="listitem" class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${this._onfocusout}" @focusin="${this._onfocusin}" @mousedown="${this._onmousedown}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" tabindex=${(0, _LitRenderer.ifDefined)(this._tabIndex)}>${this.icon ? block6.call(this, context, tags, suffix) : undefined}<span class="ui5-product-switch-item-text-content">${this.titleText ? block7.call(this, context, tags, suffix) : undefined}${this.subtitleText ? block8.call(this, context, tags, suffix) : undefined}</span></div>`;
  }
  function block6(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-product-switch-item-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></ui5-icon>`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-product-switch-item-title">${(0, _LitRenderer.ifDefined)(this.titleText)}</span>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-product-switch-item-subtitle">${(0, _LitRenderer.ifDefined)(this.subtitleText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});