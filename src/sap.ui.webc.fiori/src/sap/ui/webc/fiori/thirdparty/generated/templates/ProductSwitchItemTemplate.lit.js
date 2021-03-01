sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`${ context.targetSrc ? block1(context) : block5(context) }`; };
	const block1 = (context) => { return litRender.html`<a class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" tabindex=${ifDefined__default(context._tabIndex)} href="${ifDefined__default(context.targetSrc)}" target="${ifDefined__default(context.target)}">${ context.icon ? block2(context) : undefined }<span class="ui5-product-switch-item-text-content">${ context.titleText ? block3(context) : undefined }${ context.subtitleText ? block4(context) : undefined }</span></a>`; };
	const block2 = (context) => { return litRender.html`<ui5-icon class="ui5-product-switch-item-icon" name="${ifDefined__default(context.icon)}"></ui5-icon>`; };
	const block3 = (context) => { return litRender.html`<span class="ui5-product-switch-item-title">${ifDefined__default(context.titleText)}</span>`; };
	const block4 = (context) => { return litRender.html`<span class="ui5-product-switch-item-subtitle">${ifDefined__default(context.subtitleText)}</span>`; };
	const block5 = (context) => { return litRender.html`<div role="listitem" class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" tabindex=${ifDefined__default(context._tabIndex)}>${ context.icon ? block6(context) : undefined }<span class="ui5-product-switch-item-text-content">${ context.titleText ? block7(context) : undefined }${ context.subtitleText ? block8(context) : undefined }</span></div>`; };
	const block6 = (context) => { return litRender.html`<ui5-icon class="ui5-product-switch-item-icon" name="${ifDefined__default(context.icon)}"></ui5-icon>`; };
	const block7 = (context) => { return litRender.html`<span class="ui5-product-switch-item-title">${ifDefined__default(context.titleText)}</span>`; };
	const block8 = (context) => { return litRender.html`<span class="ui5-product-switch-item-subtitle">${ifDefined__default(context.subtitleText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
