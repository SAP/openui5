sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-combobox-root ui5-input-focusable-element">${context.hasValueState ? block1(context, tags, suffix) : undefined}<input id="ui5-combobox-input" .value="${(0, _LitRenderer.ifDefined)(context.value)}" inner-input placeholder="${(0, _LitRenderer.ifDefined)(context.placeholder)}" ?disabled=${context.disabled} ?readonly=${context.readonly} value-state="${(0, _LitRenderer.ifDefined)(context.valueState)}" @input="${context._input}" @change="${context._inputChange}" @click=${context._click} @keydown="${context._keydown}" @keyup="${context._keyup}" @focusin="${context._focusin}" @focusout="${context._focusout}" aria-expanded="${(0, _LitRenderer.ifDefined)(context.open)}" role="combobox" aria-haspopup="listbox" aria-autocomplete="both" aria-describedby="${(0, _LitRenderer.ifDefined)(context.valueStateTextId)}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" aria-required="${(0, _LitRenderer.ifDefined)(context.required)}" data-sap-focus-ref />${context.icon ? block2(context, tags, suffix) : undefined}${!context.readonly ? block3(context, tags, suffix) : undefined}</div>`;
  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-valueStateDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.valueStateText)}</span>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="icon"></slot>`;
  const block3 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="slim-arrow-down" slot="icon" tabindex="-1" input-icon ?pressed="${context._iconPressed}" @click="${context._arrowClick}" accessible-name="${(0, _LitRenderer.ifDefined)(context._iconAccessibleNameText)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="slim-arrow-down" slot="icon" tabindex="-1" input-icon ?pressed="${context._iconPressed}" @click="${context._arrowClick}" accessible-name="${(0, _LitRenderer.ifDefined)(context._iconAccessibleNameText)}"></ui5-icon>`;
  var _default = block0;
  _exports.default = _default;
});