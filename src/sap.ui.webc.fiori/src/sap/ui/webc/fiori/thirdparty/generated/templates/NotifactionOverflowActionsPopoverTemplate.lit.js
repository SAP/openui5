sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-popover class="ui5-notification-overflow-popover" placement-type="Bottom" horizontal-align="Right" hide-arrow><div class="ui5-notification-overflow-list">${ litRender.repeat(context.overflowActions, (item, index) => item._id || index, (item, index) => block1(item)) }</div></ui5-popover>`; };
	const block1 = (item, index, context) => { return litRender.html`<ui5-button icon="${ifDefined__default(item.icon)}" design="Transparent" @click="${item.press}" ?disabled="${item.disabled}" design="${ifDefined__default(item.design)}" data-ui5-external-action-item-id="${ifDefined__default(item.refItemid)}">${ifDefined__default(item.text)}</ui5-button>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
