sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-file-uploader-root" @mouseover="${this._onmouseover}" @mouseout="${this._onmouseout}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" @click="${this._onclick}"><div class="ui5-file-uploader-mask">${!this.hideInput ? block1.call(this, context, tags, suffix) : undefined}<slot></slot></div>${this._keepInputInShadowDOM ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} value="${(0, _LitRenderer.ifDefined)(this.value)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" ?disabled="${this.disabled}" tabindex="-1" class="ui5-file-uploader-input"></${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-input value="${(0, _LitRenderer.ifDefined)(this.value)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" ?disabled="${this.disabled}" tabindex="-1" class="ui5-file-uploader-input"></ui5-input>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<input type="file" title="${(0, _LitRenderer.ifDefined)(this.titleText)}" accept="${(0, _LitRenderer.ifDefined)(this.accept)}" ?multiple="${this.multiple}" ?disabled="${this.disabled}" @change="${this._onChange}" aria-hidden="true" tabindex="-1">`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="formSupport"></slot>`;
  }
  var _default = block0;
  _exports.default = _default;
});