sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-multi-combobox-root"><span id="${ifDefined__default(context._id)}-hiddenText-nMore" class="ui5-hidden-text">${ifDefined__default(context._tokensCountText)}</span>${ context.hasValueState ? block1(context) : undefined }<ui5-tokenizer slot="_beginContent" show-more class="ui5-multi-combobox-tokenizer" ?disabled="${context.disabled}" @ui5-show-more-items-press="${ifDefined__default(context._showMorePopover)}" @ui5-token-delete="${ifDefined__default(context._tokenDelete)}" @focusout="${context._tokenizerFocusOut}" @focusin="${context._tokenizerFocusIn}" @click=${context._click} @keydown="${context._onTokenizerKeydown}" ?expanded="${context._tokenizerExpanded}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block2(item, index, context)) }</ui5-tokenizer><input id="ui5-multi-combobox-input" .value="${ifDefined__default(context.value)}" inner-input placeholder=${ifDefined__default(context._getPlaceholder)} ?disabled=${context.disabled} ?readonly=${context.readonly} value-state="${ifDefined__default(context.valueState)}" @input="${context._inputLiveChange}" @change=${context._inputChange} @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click=${context._click} @focusin=${context.inputFocusIn} @focusout=${context.inputFocusOut} role="combobox" aria-haspopup="listbox" aria-expanded="${ifDefined__default(context.open)}" aria-autocomplete="both" aria-describedby="${ifDefined__default(context.ariaDescribedByText)}" aria-required="${ifDefined__default(context.required)}" />${ context.icon ? block4() : undefined }${ !context.readonly ? block5(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-valueStateDesc" class="ui5-hidden-text">${ifDefined__default(context.valueStateText)}</span>`; };
	const block2 = (item, index, context) => { return litRender.html`${ item.selected ? block3(item, index, context) : undefined }`; };
	const block3 = (item, index, context) => { return litRender.html`<ui5-token ?readonly="${context.readonly}" class="ui5-multi-combobox-token" data-ui5-id="${ifDefined__default(item._id)}" part="token-${index}" text="${ifDefined__default(item.text)}"></ui5-token>`; };
	const block4 = (context) => { return litRender.html`<slot name="icon"></slot>`; };
	const block5 = (context) => { return litRender.html`<ui5-icon name="slim-arrow-down" input-icon slot="icon" tabindex="-1" @click="${context.togglePopover}" @mousedown="${context._onIconMousedown}" ?pressed="${context.open}" dir="${ifDefined__default(context.effectiveDir)}" accessible-name="${ifDefined__default(context._iconAccessibleNameText)}"></ui5-icon>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
