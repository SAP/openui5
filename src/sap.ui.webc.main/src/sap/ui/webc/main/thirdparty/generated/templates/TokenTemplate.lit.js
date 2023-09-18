sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" @click="${this._handleSelect}" @focusin="${this._focusin}" @focusout="${this._focusout}" @keydown="${this._keydown}" class="ui5-token--wrapper" role="option" aria-selected="${(0, _LitRenderer.ifDefined)(this.selected)}"><span class="ui5-token--text">${(0, _LitRenderer.ifDefined)(this.text)}</span>${!this.readonly ? block1.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-token--icon">${this.closeIcon.length ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="closeIcon" @click="${this._delete}"></slot>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.iconURI)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.tokenDeletableText)}" show-tooltip @click="${this._delete}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(this.iconURI)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.tokenDeletableText)}" show-tooltip @click="${this._delete}"></ui5-icon>`;
  }
  var _default = block0;
  _exports.default = _default;
});