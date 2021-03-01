sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-combobox-root">${ context.hasValueState ? block1(context) : undefined }<input id="ui5-combobox-input" .value="${ifDefined__default(context._tempValue)}" inner-input placeholder="${ifDefined__default(context.placeholder)}" ?disabled=${context.disabled} ?readonly=${context.readonly} value-state="${ifDefined__default(context.valueState)}" @input="${context._input}" @change="${context._inputChange}" @click=${context._click} @keydown="${context._keydown}" @focusin="${context._focusin}" @focusout="${context._focusout}" aria-expanded="${ifDefined__default(context.open)}" role="combobox" aria-haspopup="listbox" aria-autocomplete="both" aria-describedby="${ifDefined__default(context.valueStateTextId)}" aria-label="${ifDefined__default(context.ariaLabelText)}" aria-required="${ifDefined__default(context.required)}" />${ context.icon ? block2() : undefined }${ !context.readonly ? block3(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-valueStateDesc" class="ui5-hidden-text">${ifDefined__default(context.valueStateText)}</span>`; };
	const block2 = (context) => { return litRender.html`<slot name="icon"></slot>`; };
	const block3 = (context) => { return litRender.html`<ui5-icon name="slim-arrow-down" slot="icon" tabindex="-1" input-icon ?pressed="${context._iconPressed}" @click="${context._arrowClick}" dir="${ifDefined__default(context.effectiveDir)}" accessible-name="${ifDefined__default(context._iconAccessibleNameText)}"></ui5-icon>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
