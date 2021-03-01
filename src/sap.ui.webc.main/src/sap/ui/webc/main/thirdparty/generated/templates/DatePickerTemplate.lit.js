sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-date-picker-root" style="${litRender.styleMap(context.styles.main)}"><!-- INPUT --><ui5-input id="${ifDefined__default(context._id)}-inner" class="ui5-date-picker-input" placeholder="${ifDefined__default(context._placeholder)}" type="${ifDefined__default(context.type)}" value="${ifDefined__default(context.value)}" ?disabled="${context.disabled}" ?required="${context.required}" ?readonly="${context.readonly}" value-state="${ifDefined__default(context.valueState)}" data-sap-focus-ref ._inputAccInfo ="${ifDefined__default(context.accInfo)}" @ui5-change="${ifDefined__default(context._onInputChange)}" @ui5-input="${ifDefined__default(context._onInputInput)}" @ui5-submit="${ifDefined__default(context._onInputSubmit)}" @keydown="${context._onkeydown}">${ context.valueStateMessage.length ? block1() : undefined }${ !context.readonly ? block2(context) : undefined }</ui5-input><slot name="formSupport"></slot></div>`; };
	const block1 = (context) => { return litRender.html`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`; };
	const block2 = (context) => { return litRender.html`<ui5-icon slot="icon" name="${ifDefined__default(context.openIconName)}" tabindex="-1" accessible-name="${ifDefined__default(context.openIconTitle)}" show-tooltip @click="${context.togglePicker}" input-icon ?pressed="${context._isPickerOpen}" dir="${ifDefined__default(context.effectiveDir)}"></ui5-icon>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
