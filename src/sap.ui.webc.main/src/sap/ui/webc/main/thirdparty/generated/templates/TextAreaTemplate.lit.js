sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-textarea-root" style="${litRender.styleMap(context.styles.main)}" ?aria-invalid="${context.ariaInvalid}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}">${ context.growing ? block1(context) : undefined }<textarea id="${ifDefined__default(context._id)}-inner" class="ui5-textarea-inner" placeholder="${ifDefined__default(context.placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" aria-label="${ifDefined__default(context.ariaLabelText)}" aria-describedby="${ifDefined__default(context.ariaDescribedBy)}" aria-required="${ifDefined__default(context.required)}" maxlength="${ifDefined__default(context._exceededTextProps.calcedMaxLength)}" .value="${ifDefined__default(context.value)}" @input="${context._oninput}" @change="${context._onchange}" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" data-sap-focus-ref part="textarea"></textarea>${ context.showExceededText ? block3(context) : undefined }${ context.hasValueState ? block4(context) : undefined }<slot name="formSupport"></slot></div> `; };
	const block1 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-mirror" style="${litRender.styleMap(context.styles.mirror)}" class="ui5-textarea-mirror" aria-hidden="true">${ litRender.repeat(context._mirrorText, (item, index) => item._id || index, (item, index) => block2(item)) }</div>`; };
	const block2 = (item, index, context) => { return litRender.html`${ifDefined__default(item.text)}<br />`; };
	const block3 = (context) => { return litRender.html`<span class="ui5-textarea-exceeded-text">${ifDefined__default(context._exceededTextProps.exceededText)}</span>`; };
	const block4 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-valueStateDesc" class="ui5-hidden-text">${ifDefined__default(context.ariaValueStateHiddenText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
