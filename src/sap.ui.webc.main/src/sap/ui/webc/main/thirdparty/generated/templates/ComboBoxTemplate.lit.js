sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-combobox-root ui5-input-focusable-element">${this.hasValueState ? block1.call(this, context, tags, suffix) : undefined}<input id="ui5-combobox-input" .value="${(0, _LitRenderer.ifDefined)(this.value)}" inner-input placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" ?disabled=${this.disabled} ?readonly=${this.readonly} value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" @keydown="${this._keydown}" @input="${this._input}" @change="${this._inputChange}" @click=${this._click} @keyup="${this._keyup}" @focusin="${this._focusin}" @focusout="${this._focusout}" aria-expanded="${(0, _LitRenderer.ifDefined)(this.open)}" role="combobox" aria-haspopup="listbox" aria-autocomplete="both" aria-describedby="value-state-description" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-required="${(0, _LitRenderer.ifDefined)(this.required)}" data-sap-focus-ref />${this.icon ? block2.call(this, context, tags, suffix) : undefined}${!this.readonly ? block3.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="value-state-description" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaValueStateHiddenText)}</span>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="icon"></slot>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="slim-arrow-down" slot="icon" tabindex="-1" input-icon ?pressed="${this._iconPressed}" @click="${this._arrowClick}" accessible-name="${(0, _LitRenderer.ifDefined)(this._iconAccessibleNameText)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="slim-arrow-down" slot="icon" tabindex="-1" input-icon ?pressed="${this._iconPressed}" @click="${this._arrowClick}" accessible-name="${(0, _LitRenderer.ifDefined)(this._iconAccessibleNameText)}"></ui5-icon>`;
  }
  var _default = block0;
  _exports.default = _default;
});