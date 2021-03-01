sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-tli-root" dir="${ifDefined__default(context.effectiveDir)}"><div class="ui5-tli-indicator">${ context.icon ? block1(context) : undefined }</div><div class="ui5-tli-bubble" tabindex="${ifDefined__default(context._tabIndex)}" role="option" data-sap-focus-ref><div class="ui5-tli-title">${ context.itemName ? block2(context) : undefined }<span>${ifDefined__default(context.titleText)}</span></div><div class="ui5-tli-subtitle">${ifDefined__default(context.subtitleText)}</div>${ context.textContent ? block5() : undefined }<span class="ui5-tli-bubble-arrow ui5-tli-bubble-arrow--left"></span></div></div> `; };
	const block1 = (context) => { return litRender.html`<div class="ui5-tli-icon-outer"><ui5-icon class="ui5-tli-icon" name="${ifDefined__default(context.icon)}"></ui5-icon></div>`; };
	const block2 = (context) => { return litRender.html`${ context.itemNameClickable ? block3(context) : undefined }${ !context.itemNameClickable ? block4(context) : undefined }`; };
	const block3 = (context) => { return litRender.html`<ui5-link @click="${context.onItemNamePress}">${ifDefined__default(context.itemName)}</ui5-link>`; };
	const block4 = (context) => { return litRender.html`<span>${ifDefined__default(context.itemName)}</span>`; };
	const block5 = (context) => { return litRender.html`<div class="ui5-tli-desc"><slot></slot></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
