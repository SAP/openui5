sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-input-root ui5-input-focusable-element" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}"><div class="ui5-input-content"><input id="${(0, _LitRenderer.ifDefined)(context._id)}-inner" class="ui5-input-inner" style="${(0, _LitRenderer.styleMap)(context.styles.innerInput)}" type="${(0, _LitRenderer.ifDefined)(context.inputType)}" inner-input ?inner-input-with-icon="${context.icon.length}" ?disabled="${context.disabled}" ?readonly="${context._readonly}" .value="${(0, _LitRenderer.ifDefined)(context.value)}" placeholder="${(0, _LitRenderer.ifDefined)(context._placeholder)}" maxlength="${(0, _LitRenderer.ifDefined)(context.maxlength)}" role="${(0, _LitRenderer.ifDefined)(context.accInfo.input.role)}" aria-controls="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaControls)}" aria-invalid="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaInvalid)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaHasPopup)}" aria-describedby="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaDescribedBy)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaRoledescription)}" aria-autocomplete="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaAutoComplete)}" aria-expanded="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaExpanded)}" aria-label="${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaLabel)}" aria-required="${(0, _LitRenderer.ifDefined)(context.required)}" @input="${context._handleInput}" @change="${context._handleChange}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click=${context._click} @focusin=${context.innerFocusIn} data-sap-focus-ref step="${(0, _LitRenderer.ifDefined)(context.nativeInputAttributes.step)}" min="${(0, _LitRenderer.ifDefined)(context.nativeInputAttributes.min)}" max="${(0, _LitRenderer.ifDefined)(context.nativeInputAttributes.max)}" />${context.effectiveShowClearIcon ? block1(context, tags, suffix) : undefined}${context.icon.length ? block2(context, tags, suffix) : undefined}<div class="ui5-input-value-state-icon">${(0, _LitRenderer.unsafeHTML)(context._valueStateInputIcon)}</div>${context.showSuggestions ? block3(context, tags, suffix) : undefined}${context.accInfo.input.ariaDescription ? block4(context, tags, suffix) : undefined}${context.hasValueState ? block5(context, tags, suffix) : undefined}</div><slot name="formSupport"></slot></div>`;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} @click=${context._clear} @mousedown=${context._iconMouseDown} tabindex="-1" input-icon class="ui5-input-clear-icon" name="decline"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon @click=${context._clear} @mousedown=${context._iconMouseDown} tabindex="-1" input-icon class="ui5-input-clear-icon" name="decline"></ui5-icon>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-input-icon-root"><slot name="icon"></slot></div>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-suggestionsText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.suggestionsText)}</span><span id="${(0, _LitRenderer.ifDefined)(context._id)}-selectionText" class="ui5-hidden-text" aria-live="polite" role="status"></span><span id="${(0, _LitRenderer.ifDefined)(context._id)}-suggestionsCount" class="ui5-hidden-text" aria-live="polite">${(0, _LitRenderer.ifDefined)(context.availableSuggestionsCount)}</span>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-descr" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.accInfo.input.ariaDescription)}</span>`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-valueStateDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.ariaValueStateHiddenText)}</span>`;

  var _default = block0;
  _exports.default = _default;
});