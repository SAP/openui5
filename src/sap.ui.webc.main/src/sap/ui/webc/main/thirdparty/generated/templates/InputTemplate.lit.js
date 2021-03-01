sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-input-root" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}"><div class="ui5-input-content"><input id="${ifDefined__default(context._id)}-inner" class="ui5-input-inner" style="${litRender.styleMap(context.styles.innerInput)}" type="${ifDefined__default(context.inputType)}" inner-input ?inner-input-with-icon="${context.icon.length}" ?disabled="${context.disabled}" ?readonly="${context._readonly}" .value="${ifDefined__default(context.value)}" placeholder="${ifDefined__default(context._placeholder)}" maxlength="${ifDefined__default(context.maxlength)}" role="${ifDefined__default(context.accInfo.input.role)}" aria-controls="${ifDefined__default(context.accInfo.input.ariaControls)}" ?aria-invalid="${context.accInfo.input.ariaInvalid}" aria-haspopup="${ifDefined__default(context.accInfo.input.ariaHasPopup)}" aria-describedby="${ifDefined__default(context.accInfo.input.ariaDescribedBy)}" aria-roledescription="${ifDefined__default(context.accInfo.input.ariaRoledescription)}" aria-autocomplete="${ifDefined__default(context.accInfo.input.ariaAutoComplete)}" aria-expanded="${ifDefined__default(context.accInfo.input.ariaExpanded)}" aria-label="${ifDefined__default(context.accInfo.input.ariaLabel)}" aria-required="${ifDefined__default(context.required)}" @input="${context._handleInput}" @change="${context._handleChange}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click=${context._click} @focusin=${context.innerFocusIn} data-sap-no-tab-ref data-sap-focus-ref step="${ifDefined__default(context.nativeInputAttributes.step)}" min="${ifDefined__default(context.nativeInputAttributes.min)}" max="${ifDefined__default(context.nativeInputAttributes.max)}" />${ context.icon.length ? block1() : undefined }${ context.showSuggestions ? block2(context) : undefined }${ context.accInfo.input.ariaDescription ? block3(context) : undefined }${ context.hasValueState ? block4(context) : undefined }</div><slot name="formSupport"></slot></div>`; };
	const block1 = (context) => { return litRender.html`<div class="ui5-input-icon-root"><slot name="icon"></slot></div>`; };
	const block2 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-suggestionsText" class="ui5-hidden-text">${ifDefined__default(context.suggestionsText)}</span><span id="${ifDefined__default(context._id)}-selectionText" class="ui5-hidden-text" aria-live="polite" role="status"></span><span id="${ifDefined__default(context._id)}-suggestionsCount" class="ui5-hidden-text" aria-live="polite">${ifDefined__default(context.availableSuggestionsCount)}</span>`; };
	const block3 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-descr" class="ui5-hidden-text">${ifDefined__default(context.accInfo.input.ariaDescription)}</span>`; };
	const block4 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-valueStateDesc" class="ui5-hidden-text">${ifDefined__default(context.ariaValueStateHiddenText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
