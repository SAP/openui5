sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-file-uploader-root" @mouseover="${context._onmouseover}" @mouseout="${context._onmouseout}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><div class="ui5-file-uploader-mask">${ !context.hideInput ? block1(context) : undefined }<slot></slot></div>${ context._keepInputInShadowDOM ? block2(context) : block3() }</div>`; };
	const block1 = (context) => { return litRender.html`<ui5-input value="${ifDefined__default(context.value)}" value-state="${ifDefined__default(context.valueState)}" placeholder="${ifDefined__default(context.placeholder)}" ?disabled="${context.disabled}" tabindex="-1" class="ui5-file-uploader-input"></ui5-input>`; };
	const block2 = (context) => { return litRender.html`<input type="file" title="${ifDefined__default(context.titleText)}" accept="${ifDefined__default(context.accept)}" ?multiple="${context.multiple}" ?disabled="${context.disabled}" @change="${context._onChange}" aria-hidden="true" tabindex="-1">`; };
	const block3 = (context) => { return litRender.html`<slot name="formSupport"></slot>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
