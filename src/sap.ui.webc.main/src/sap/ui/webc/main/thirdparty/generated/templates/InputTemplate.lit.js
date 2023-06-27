sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-input-root ui5-input-focusable-element" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}"><div class="ui5-input-content"><input id="${(0, _LitRenderer.ifDefined)(this._id)}-inner" class="ui5-input-inner" style="${(0, _LitRenderer.styleMap)(this.styles.innerInput)}" type="${(0, _LitRenderer.ifDefined)(this.inputType)}" inner-input ?inner-input-with-icon="${this.icon.length}" ?disabled="${this.disabled}" ?readonly="${this._readonly}" .value="${(0, _LitRenderer.ifDefined)(this._innerValue)}" placeholder="${(0, _LitRenderer.ifDefined)(this._placeholder)}" maxlength="${(0, _LitRenderer.ifDefined)(this.maxlength)}" role="${(0, _LitRenderer.ifDefined)(this.accInfo.input.role)}" aria-controls="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaControls)}" aria-invalid="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaInvalid)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaHasPopup)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaDescribedBy)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaRoledescription)}" aria-autocomplete="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaAutoComplete)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaExpanded)}" aria-label="${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaLabel)}" aria-required="${(0, _LitRenderer.ifDefined)(this.required)}" @input="${this._handleInput}" @change="${this._handleChange}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" @click=${this._click} @focusin=${this.innerFocusIn} data-sap-focus-ref step="${(0, _LitRenderer.ifDefined)(this.nativeInputAttributes.step)}" min="${(0, _LitRenderer.ifDefined)(this.nativeInputAttributes.min)}" max="${(0, _LitRenderer.ifDefined)(this.nativeInputAttributes.max)}" />${this.effectiveShowClearIcon ? block1.call(this, context, tags, suffix) : undefined}${this.icon.length ? block2.call(this, context, tags, suffix) : undefined}<div class="ui5-input-value-state-icon">${(0, _LitRenderer.unsafeHTML)(this._valueStateInputIcon)}</div>${this.showSuggestions ? block3.call(this, context, tags, suffix) : undefined}${this.accInfo.input.ariaDescription ? block4.call(this, context, tags, suffix) : undefined}${this.hasValueState ? block5.call(this, context, tags, suffix) : undefined}</div><slot name="formSupport"></slot></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div @click=${this._clear} @mousedown=${this._iconMouseDown} class="ui5-input-clear-icon-wrapper" input-icon tabindex="-1"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} tabindex="-1" class="ui5-input-clear-icon" name="decline"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div @click=${this._clear} @mousedown=${this._iconMouseDown} class="ui5-input-clear-icon-wrapper" input-icon tabindex="-1"><ui5-icon tabindex="-1" class="ui5-input-clear-icon" name="decline"></ui5-icon></div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-input-icon-root"><slot name="icon"></slot></div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-suggestionsText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.suggestionsText)}</span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-selectionText" class="ui5-hidden-text" aria-live="polite" role="status"></span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-suggestionsCount" class="ui5-hidden-text" aria-live="polite">${(0, _LitRenderer.ifDefined)(this.availableSuggestionsCount)}</span>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-descr" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.accInfo.input.ariaDescription)}</span>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-valueStateDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaValueStateHiddenText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});