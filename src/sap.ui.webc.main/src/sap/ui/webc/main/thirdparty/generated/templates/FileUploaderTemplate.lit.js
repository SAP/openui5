sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-file-uploader-root" @mouseover="${context._onmouseover}" @mouseout="${context._onmouseout}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click="${context._onclick}"><div class="ui5-file-uploader-mask">${!context.hideInput ? block1(context, tags, suffix) : undefined}<slot></slot></div>${context._keepInputInShadowDOM ? block2(context, tags, suffix) : block3(context, tags, suffix)}</div>`;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} value="${(0, _LitRenderer.ifDefined)(context.value)}" value-state="${(0, _LitRenderer.ifDefined)(context.valueState)}" placeholder="${(0, _LitRenderer.ifDefined)(context.placeholder)}" ?disabled="${context.disabled}" tabindex="-1" class="ui5-file-uploader-input"></${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-input value="${(0, _LitRenderer.ifDefined)(context.value)}" value-state="${(0, _LitRenderer.ifDefined)(context.valueState)}" placeholder="${(0, _LitRenderer.ifDefined)(context.placeholder)}" ?disabled="${context.disabled}" tabindex="-1" class="ui5-file-uploader-input"></ui5-input>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<input type="file" title="${(0, _LitRenderer.ifDefined)(context.titleText)}" accept="${(0, _LitRenderer.ifDefined)(context.accept)}" ?multiple="${context.multiple}" ?disabled="${context.disabled}" @change="${context._onChange}" aria-hidden="true" tabindex="-1">`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="formSupport"></slot>`;

  var _default = block0;
  _exports.default = _default;
});