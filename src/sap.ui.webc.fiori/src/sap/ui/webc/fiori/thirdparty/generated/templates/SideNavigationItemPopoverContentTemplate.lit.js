sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover vertical-align="Top"><ui5-list mode="None" @ui5-item-click="${ifDefined__default(context.handleListItemClick)}"><ui5-li ?selected="${context._popoverContent.mainItemSelected}" .associatedItem="${ifDefined__default(context._popoverContent.mainItem)}">${ifDefined__default(context._popoverContent.mainItem.text)}</ui5-li>${ litRender.repeat(context._popoverContent.subItems, (item, index) => item._id || index, (item, index) => block1(item)) }</ui5-list></ui5-responsive-popover>`; };
	const block1 = (item, index, context) => { return litRender.html`<ui5-li ?selected="${item.selected}" .associatedItem="${ifDefined__default(item)}">${ifDefined__default(item.text)}</ui5-li>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
