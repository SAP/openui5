sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}"><div class="ui5-textarea-wrapper">${this.growing ? block1.call(this, context, tags, suffix) : undefined}<textarea id="${(0, _LitRenderer.ifDefined)(this._id)}-inner" class="ui5-textarea-inner" placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" ?disabled="${this.disabled}" ?readonly="${this.readonly}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this.ariaDescribedBy)}" aria-invalid="${(0, _LitRenderer.ifDefined)(this.ariaInvalid)}" aria-required="${(0, _LitRenderer.ifDefined)(this.required)}" maxlength="${(0, _LitRenderer.ifDefined)(this._exceededTextProps.calcedMaxLength)}" .value="${(0, _LitRenderer.ifDefined)(this.value)}" @input="${this._oninput}" @change="${this._onchange}" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" data-sap-focus-ref part="textarea"></textarea></div>${this.showExceededText ? block3.call(this, context, tags, suffix) : undefined}${this.hasValueState ? block4.call(this, context, tags, suffix) : undefined}<slot name="formSupport"></slot></div> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-mirror" class="ui5-textarea-mirror" aria-hidden="true">${(0, _LitRenderer.repeat)(this._mirrorText, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</div>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.text)}<br />`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-textarea-exceeded-text">${(0, _LitRenderer.ifDefined)(this._exceededTextProps.exceededText)}</span>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-valueStateDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaValueStateHiddenText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});