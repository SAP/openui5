sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}" class="ui5-time-picker-root" @keydown="${context._onkeydown}"><ui5-input id="${ifDefined__default(context._id)}-inner" value="${ifDefined__default(context.value)}" placeholder="${ifDefined__default(context._placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" value-state="${ifDefined__default(context.valueState)}" ._inputAccInfo="${ifDefined__default(context.accInfo)}" @click="${context._handleInputClick}" @ui5-change="${ifDefined__default(context._handleInputChange)}" @ui5-input="${ifDefined__default(context._handleInputLiveChange)}" class="ui5-time-picker-input">${ context.valueStateMessage.length ? block1() : undefined }${ !context.readonly ? block2(context) : undefined }</ui5-input></div>`; };
	const block1 = (context) => { return litRender.html`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`; };
	const block2 = (context) => { return litRender.html`<ui5-icon slot="icon" name="${ifDefined__default(context.openIconName)}" tabindex="-1" show-tooltip @click="${context.togglePicker}" input-icon ?pressed="${context._isPickerOpen}" class="ui5-time-picker-input-icon-button"></ui5-icon>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
