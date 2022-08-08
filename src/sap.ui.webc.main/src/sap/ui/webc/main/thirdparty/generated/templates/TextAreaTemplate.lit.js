sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-textarea-root" style="${(0, _LitRenderer.styleMap)(context.styles.main)}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}">${context.growing ? block1(context, tags, suffix) : undefined}<textarea id="${(0, _LitRenderer.ifDefined)(context._id)}-inner" class="ui5-textarea-inner" placeholder="${(0, _LitRenderer.ifDefined)(context.placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" aria-describedby="${(0, _LitRenderer.ifDefined)(context.ariaDescribedBy)}" aria-invalid="${(0, _LitRenderer.ifDefined)(context.ariaInvalid)}" aria-required="${(0, _LitRenderer.ifDefined)(context.required)}" maxlength="${(0, _LitRenderer.ifDefined)(context._exceededTextProps.calcedMaxLength)}" .value="${(0, _LitRenderer.ifDefined)(context.value)}" @input="${context._oninput}" @change="${context._onchange}" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" data-sap-focus-ref part="textarea"></textarea>${context.showExceededText ? block3(context, tags, suffix) : undefined}${context.hasValueState ? block4(context, tags, suffix) : undefined}<slot name="formSupport"></slot></div> `;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}-mirror" style="${(0, _LitRenderer.styleMap)(context.styles.mirror)}" class="ui5-textarea-mirror" aria-hidden="true">${(0, _LitRenderer.repeat)(context._mirrorText, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix))}</div>`;

  const block2 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.text)}<br />`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-textarea-exceeded-text">${(0, _LitRenderer.ifDefined)(context._exceededTextProps.exceededText)}</span>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-valueStateDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.ariaValueStateHiddenText)}</span>`;

  var _default = block0;
  _exports.default = _default;
});