sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.wrapper)}"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-hiddenText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.tokenizerLabel)}</span><div class="${(0, _LitRenderer.classMap)(this.classes.content)}" @ui5-delete="${(0, _LitRenderer.ifDefined)(this._delete)}" @click="${this._click}" @mousedown="${this._onmousedown}" @keydown="${this._onkeydown}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onTokenSelect)}" role="listbox" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._id)}-hiddenText">${(0, _LitRenderer.repeat)(this.tokens, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div>${this.showNMore ? block2.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span @click="${this._openMorePopoverAndFireEvent}" class="ui5-tokenizer-more-text" part="n-more-text">${(0, _LitRenderer.ifDefined)(this._nMoreText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});