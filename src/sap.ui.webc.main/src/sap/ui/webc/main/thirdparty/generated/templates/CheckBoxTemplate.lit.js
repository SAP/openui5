sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-checkbox-root ${(0, _LitRenderer.classMap)(this.classes.main)}" role="checkbox" part="root" aria-checked="${(0, _LitRenderer.ifDefined)(this.effectiveAriaChecked)}" aria-readonly="${(0, _LitRenderer.ifDefined)(this.ariaReadonly)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveAriaDisabled)}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.ariaLabelledBy)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this.ariaDescribedBy)}" aria-required="${(0, _LitRenderer.ifDefined)(this.required)}" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" @mousedown="${this._onmousedown}" @mouseup="${this._onmouseup}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" @click="${this._onclick}" @focusout="${this._onfocusout}"><div id="${(0, _LitRenderer.ifDefined)(this._id)}-CbBg" class="ui5-checkbox-inner">${this.isCompletelyChecked ? block1.call(this, context, tags, suffix) : undefined}<input id="${(0, _LitRenderer.ifDefined)(this._id)}-CB" type='checkbox' ?checked="${this.checked}" ?readonly="${this.readonly}" ?disabled="${this.disabled}" tabindex="-1" aria-hidden="true" data-sap-no-tab-ref /></div>${this.text ? block2.call(this, context, tags, suffix) : undefined}${this.hasValueState ? block3.call(this, context, tags, suffix) : undefined}<slot name="formSupport"></slot></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} aria-hidden="true" name="accept" class="ui5-checkbox-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon aria-hidden="true" name="accept" class="ui5-checkbox-icon"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-label" class="ui5-checkbox-label" wrapping-type="${(0, _LitRenderer.ifDefined)(this.wrappingType)}">${(0, _LitRenderer.ifDefined)(this.text)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-label id="${(0, _LitRenderer.ifDefined)(this._id)}-label" class="ui5-checkbox-label" wrapping-type="${(0, _LitRenderer.ifDefined)(this.wrappingType)}">${(0, _LitRenderer.ifDefined)(this.text)}</ui5-label>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-descr" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.valueStateText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});