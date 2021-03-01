sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-yp-root" role="grid" aria-readonly="false" aria-multiselectable="false" @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._selectYear} @focusin=${context._onfocusin}>${ litRender.repeat(context._years, (item, index) => item._id || index, (item, index) => block1(item)) }</div>`; };
	const block1 = (item, index, context) => { return litRender.html`<div class="ui5-yp-interval-container">${ litRender.repeat(item, (item, index) => item._id || index, (item, index) => block2(item)) }</div>`; };
	const block2 = (item, index, context) => { return litRender.html`<div data-sap-timestamp="${ifDefined__default(item.timestamp)}" tabindex="${ifDefined__default(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" class="${ifDefined__default(item.classes)}" role="gridcell" aria-selected="${ifDefined__default(item.ariaSelected)}">${ifDefined__default(item.year)}</div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
