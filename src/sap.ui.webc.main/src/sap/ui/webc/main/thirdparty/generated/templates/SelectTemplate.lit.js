sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-select-root ui5-input-focusable-element" id="${(0, _LitRenderer.ifDefined)(this._id)}-select" @click="${this._onclick}">${this.selectedOptionIcon ? block1.call(this, context, tags, suffix) : undefined}<div class="ui5-select-label-root" data-sap-focus-ref tabindex="${(0, _LitRenderer.ifDefined)(this._effectiveTabIndex)}" role="combobox" aria-haspopup="listbox" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this.valueStateTextId)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.isDisabled)}" aria-required="${(0, _LitRenderer.ifDefined)(this.required)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._isPickerOpen)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this._ariaRoleDescription)}" @keydown="${this._onkeydown}" @keypress="${this._handleKeyboardNavigation}" @keyup="${this._onkeyup}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}">${this.hasCustomLabel ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="slim-arrow-down" input-icon ?pressed="${this._iconPressed}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.hasValueState ? block4.call(this, context, tags, suffix) : undefined}<slot name="formSupport"></slot></div>` : (0, _LitRenderer.html)`<div class="ui5-select-root ui5-input-focusable-element" id="${(0, _LitRenderer.ifDefined)(this._id)}-select" @click="${this._onclick}">${this.selectedOptionIcon ? block1.call(this, context, tags, suffix) : undefined}<div class="ui5-select-label-root" data-sap-focus-ref tabindex="${(0, _LitRenderer.ifDefined)(this._effectiveTabIndex)}" role="combobox" aria-haspopup="listbox" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this.valueStateTextId)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.isDisabled)}" aria-required="${(0, _LitRenderer.ifDefined)(this.required)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._isPickerOpen)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this._ariaRoleDescription)}" @keydown="${this._onkeydown}" @keypress="${this._handleKeyboardNavigation}" @keyup="${this._onkeyup}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}">${this.hasCustomLabel ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div><ui5-icon name="slim-arrow-down" input-icon ?pressed="${this._iconPressed}"></ui5-icon>${this.hasValueState ? block4.call(this, context, tags, suffix) : undefined}<slot name="formSupport"></slot></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} aria-hidden="true" class="ui5-select-option-icon" name="${(0, _LitRenderer.ifDefined)(this.selectedOptionIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon aria-hidden="true" class="ui5-select-option-icon" name="${(0, _LitRenderer.ifDefined)(this.selectedOptionIcon)}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="label"></slot>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this._text)}`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-valueStateDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.valueStateText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});