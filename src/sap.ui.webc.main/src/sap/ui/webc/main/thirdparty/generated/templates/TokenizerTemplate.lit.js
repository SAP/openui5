sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.wrapper)}"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-hiddenText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.tokenizerLabel)}</span><div class="${(0, _LitRenderer.classMap)(context.classes.content)}" @ui5-delete="${(0, _LitRenderer.ifDefined)(context._delete)}" @click="${context._click}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" role="listbox" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._id)}-hiddenText">${(0, _LitRenderer.repeat)(context.tokens, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</div>${context.showNMore ? block2(context, tags, suffix) : undefined}</div>`;
  const block1 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<span @click="${context._openOverflowPopover}" class="ui5-tokenizer-more-text" part="n-more-text">${(0, _LitRenderer.ifDefined)(context._nMoreText)}</span>`;
  var _default = block0;
  _exports.default = _default;
});