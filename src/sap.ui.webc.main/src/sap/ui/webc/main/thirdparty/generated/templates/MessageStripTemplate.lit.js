sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}" id="${(0, _LitRenderer.ifDefined)(this._id)}" role="note" aria-live="assertive" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._id)}">${!this.hideIcon ? block1.call(this, context, tags, suffix) : undefined}<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.hiddenText)}</span><span class="ui5-message-strip-text"><slot></slot></span>${!this.hideCloseButton ? block4.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-message-strip-icon-wrapper" aria-hidden="true">${this.iconProvided ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="icon"></slot>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.standardIconName)}" class="ui5-message-strip-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(this.standardIconName)}" class="ui5-message-strip-icon"></ui5-icon>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="decline" design="Transparent" class="ui5-message-strip-close-button" tooltip="${(0, _LitRenderer.ifDefined)(this._closeButtonText)}" @click=${this._closeClick}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="decline" design="Transparent" class="ui5-message-strip-close-button" tooltip="${(0, _LitRenderer.ifDefined)(this._closeButtonText)}" @click=${this._closeClick}></ui5-button>`;
  }
  var _default = block0;
  _exports.default = _default;
});