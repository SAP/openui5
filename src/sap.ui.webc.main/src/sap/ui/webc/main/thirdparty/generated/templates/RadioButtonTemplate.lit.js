sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-radio-root" role="radio" aria-checked="${(0, _LitRenderer.ifDefined)(this.checked)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveAriaDisabled)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this.effectiveAriaDescribedBy)}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" @click="${this._onclick}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" @mousedown="${this._onmousedown}" @mouseup="${this._onmouseup}" @focusout="${this._onfocusout}"><div class='ui5-radio-inner ${(0, _LitRenderer.classMap)(this.classes.inner)}'><svg class="ui5-radio-svg" focusable="false" aria-hidden="true">${blockSVG1.call(this, context, tags, suffix)}</svg><input type='radio' ?required="${this.required}" ?checked="${this.checked}" ?readonly="${this.readonly}" ?disabled="${this.effectiveAriaDisabled}" name="${(0, _LitRenderer.ifDefined)(this.name)}"  data-sap-no-tab-ref/></div>${this.text ? block1.call(this, context, tags, suffix) : undefined}${this.hasValueState ? block2.call(this, context, tags, suffix) : undefined}<slot name="formSupport"></slot></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-label" class="ui5-radio-label" for="${(0, _LitRenderer.ifDefined)(this._id)}" wrapping-type="${(0, _LitRenderer.ifDefined)(this.wrappingType)}">${(0, _LitRenderer.ifDefined)(this.text)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-label id="${(0, _LitRenderer.ifDefined)(this._id)}-label" class="ui5-radio-label" for="${(0, _LitRenderer.ifDefined)(this._id)}" wrapping-type="${(0, _LitRenderer.ifDefined)(this.wrappingType)}">${(0, _LitRenderer.ifDefined)(this.text)}</ui5-label>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-descr" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.valueStateText)}</span>`;
  }
  function blockSVG1(context, tags, suffix) {
    return (0, _LitRenderer.svg)`<circle class="ui5-radio-svg-outer" cx="50%" cy="50%" r="50%" /><circle class="ui5-radio-svg-inner" cx="50%" cy="50%" />`;
  }
  ;
  var _default = block0;
  _exports.default = _default;
});