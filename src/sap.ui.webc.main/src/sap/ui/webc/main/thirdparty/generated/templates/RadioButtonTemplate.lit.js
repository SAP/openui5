sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-radio-root ${(0, _LitRenderer.classMap)(context.classes.main)}" role="radio" aria-checked="${(0, _LitRenderer.ifDefined)(context.checked)}" aria-readonly="${(0, _LitRenderer.ifDefined)(context.ariaReadonly)}" aria-disabled="${(0, _LitRenderer.ifDefined)(context.ariaDisabled)}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" aria-describedby="${(0, _LitRenderer.ifDefined)(context.ariaDescribedBy)}" tabindex="${(0, _LitRenderer.ifDefined)(context.tabIndex)}" @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @mousedown="${context._onmousedown}" @mouseup="${context._onmouseup}" @focusout="${context._onfocusout}"><div class='ui5-radio-inner ${(0, _LitRenderer.classMap)(context.classes.inner)}'><svg class="ui5-radio-svg" focusable="false" aria-hidden="true">${blockSVG1(context, tags, suffix)}</svg><input type='radio' ?checked="${context.checked}" ?readonly="${context.readonly}" ?disabled="${context.disabled}" name="${(0, _LitRenderer.ifDefined)(context.name)}" data-sap-no-tab-ref/></div>${context.text ? block1(context, tags, suffix) : undefined}${context.hasValueState ? block2(context, tags, suffix) : undefined}</div>`;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(context._id)}-label" class="ui5-radio-label" for="${(0, _LitRenderer.ifDefined)(context._id)}" wrapping-type="${(0, _LitRenderer.ifDefined)(context.wrappingType)}">${(0, _LitRenderer.ifDefined)(context.text)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-label id="${(0, _LitRenderer.ifDefined)(context._id)}-label" class="ui5-radio-label" for="${(0, _LitRenderer.ifDefined)(context._id)}" wrapping-type="${(0, _LitRenderer.ifDefined)(context.wrappingType)}">${(0, _LitRenderer.ifDefined)(context.text)}</ui5-label>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-descr" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.valueStateText)}</span>`;

  const blockSVG1 = (context, tags, suffix) => (0, _LitRenderer.svg)`<circle class="ui5-radio-svg-outer" cx="50%" cy="50%" r="50%" /><circle class="ui5-radio-svg-inner" cx="50%" cy="50%" />`;

  var _default = block0;
  _exports.default = _default;
});