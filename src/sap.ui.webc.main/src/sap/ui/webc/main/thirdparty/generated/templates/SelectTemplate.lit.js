sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-select-root" dir="${ifDefined__default(context.effectiveDir)}" id="${ifDefined__default(context._id)}-select" @click="${context._onclick}">${ context.selectedOptionIcon ? block1(context) : undefined }<div class="ui5-select-label-root" data-sap-focus-ref tabindex="${ifDefined__default(context.tabIndex)}" role="combobox" aria-haspopup="listbox" aria-label="${ifDefined__default(context.ariaLabelText)}" aria-describedby="${ifDefined__default(context.valueStateTextId)}" aria-disabled="${ifDefined__default(context.isDisabled)}" aria-required="${ifDefined__default(context.required)}" aria-expanded="${ifDefined__default(context._isPickerOpen)}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}">${ifDefined__default(context._text)}</div><span id="${ifDefined__default(context._id)}-selectionText" class="ui5-hidden-text" aria-live="polite" role="status"></span><ui5-icon name="slim-arrow-down" input-icon ?pressed="${context._iconPressed}" dir="${ifDefined__default(context.effectiveDir)}"></ui5-icon>${ context.hasValueState ? block2(context) : undefined }<slot name="formSupport"></slot></div>`; };
	const block1 = (context) => { return litRender.html`<ui5-icon aria-hidden="true" class="ui5-select-option-icon" name="${ifDefined__default(context.selectedOptionIcon)}" dir="${ifDefined__default(context.effectiveDir)}"></ui5-icon>`; };
	const block2 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-valueStateDesc" class="ui5-hidden-text">${ifDefined__default(context.valueStateText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
