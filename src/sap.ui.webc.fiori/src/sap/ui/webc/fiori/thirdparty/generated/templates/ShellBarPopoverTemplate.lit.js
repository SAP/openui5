sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-popover class="ui5-shellbar-menu-popover" placement-type="Bottom" @ui5-before-open=${ifDefined__default(context._menuPopoverBeforeOpen)} @ui5-after-close=${ifDefined__default(context._menuPopoverAfterClose)}><ui5-list separators="None" mode="SingleSelect" @ui5-item-press=${ifDefined__default(context._menuItemPress)}>${ litRender.repeat(context._menuPopoverItems, (item, index) => item._id || index, (item, index) => block1(item)) }</ui5-list></ui5-popover><ui5-popover class="ui5-shellbar-overflow-popover" placement-type="Bottom" horizontal-align="${ifDefined__default(context.popoverHorizontalAlign)}" hide-arrow @ui5-before-open=${ifDefined__default(context._overflowPopoverBeforeOpen)} @ui5-after-close=${ifDefined__default(context._overflowPopoverAfterClose)}><ui5-list separators="None" @ui5-item-press="${ifDefined__default(context._actionList.itemPress)}">${ litRender.repeat(context._hiddenIcons, (item, index) => item._id || index, (item, index) => block2(item)) }</ui5-list></ui5-popover>`; };
	const block1 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block2 = (item, index, context) => { return litRender.html`<ui5-li data-ui5-external-action-item-id="${ifDefined__default(item.refItemid)}" icon="${ifDefined__default(item.icon)}" type="Active" @ui5-_press="${ifDefined__default(item.press)}">${ifDefined__default(item.text)}</ui5-li>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
