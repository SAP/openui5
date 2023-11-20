sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<button type="button" class="ui5-button-root" ?disabled="${this.disabled}" data-sap-focus-ref  @focusout=${this._onfocusout} @focusin=${this._onfocusin} @click=${this._onclick} @mousedown=${this._onmousedown} @mouseup=${this._onmouseup} @keydown=${this._onkeydown} @keyup=${this._onkeyup} @touchstart="${this._ontouchstart}" @touchend="${this._ontouchend}" tabindex=${(0, _LitRenderer.ifDefined)(this.tabIndexValue)} aria-expanded="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes.expanded)}" aria-controls="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes.controls)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes.hasPopup)}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" title="${(0, _LitRenderer.ifDefined)(this.buttonTitle)}" part="button">${this.icon ? block1.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span>${this.hasButtonType ? block2.call(this, context, tags, suffix) : undefined}</button> `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-button-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" accessible-role="${(0, _LitRenderer.ifDefined)(this.iconRole)}" part="icon" ?show-tooltip=${this.showIconTooltip}></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-button-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" accessible-role="${(0, _LitRenderer.ifDefined)(this.iconRole)}" part="icon" ?show-tooltip=${this.showIconTooltip}></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.buttonTypeText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});