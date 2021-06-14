sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}" class="ui5-step-input-root" style="${litRender.styleMap(context.styles)}" @keydown="${context._onkeydown}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}"><!-- Decrement Icon --><div class="ui5-step-icon ui5-step-dec" title="${ifDefined__default(context.decIconTitle)}"><ui5-icon id="${ifDefined__default(context._id)}-dec" name="${ifDefined__default(context.decIconName)}" tabindex="-1" accessible-name="${ifDefined__default(context.decIconTitle)}" @click="${context._decValue}" @focusout="${context._onButtonFocusOut}" @mousedown="${context._decSpin}" @mouseup="${context._resetSpin}" @mouseout="${context._resetSpinOut}" input-icon show-tooltip ?clickable="${context._decIconClickable}"></ui5-icon></div><!-- INPUT --><ui5-input id="${ifDefined__default(context._id)}-inner" class="ui5-step-input-input" placeholder="${ifDefined__default(context.placeholder)}" type="${ifDefined__default(context.type)}" value="${ifDefined__default(context._valuePrecisioned)}" ?disabled="${context.disabled}" ?required="${context.required}" ?readonly="${context.readonly}" value-state="${ifDefined__default(context.valueState)}" data-sap-focus-ref ._inputAccInfo ="${ifDefined__default(context.accInfo)}" ._nativeInputAttributes="${ifDefined__default(context.inputAttributes)}" @ui5-change="${ifDefined__default(context._onInputChange)}" @focusout="${context._onInputFocusOut}" @focusin="${context._onInputFocusIn}">${ context.valueStateMessage.length ? block1() : undefined }</ui5-input><!-- Increment Icon --><div class="ui5-step-icon ui5-step-inc" title="${ifDefined__default(context.incIconTitle)}"><ui5-icon id="${ifDefined__default(context._id)}-inc" name="${ifDefined__default(context.incIconName)}" tabindex="-1" accessible-name="${ifDefined__default(context.incIconTitle)}" @click="${context._incValue}" @focusout="${context._onButtonFocusOut}" @mousedown="${context._incSpin}" @mouseup="${context._resetSpin}" @mouseout="${context._resetSpinOut}" input-icon show-tooltip ?clickable="${context._incIconClickable}"></ui5-icon></div><slot name="formSupport"></slot></div>`; };
	const block1 = (context) => { return litRender.html`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
