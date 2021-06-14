sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-list .mode="${ifDefined__default(context.mode)}" .headerText="${ifDefined__default(context.headerText)}" .footerText="${ifDefined__default(context.footerText)}" .noDataText="${ifDefined__default(context.noDataText)}" .accRole="${ifDefined__default(context._role)}" @ui5-item-click="${ifDefined__default(context._onListItemClick)}" @ui5-item-delete="${ifDefined__default(context._onListItemDelete)}" @ui5-selection-change="${ifDefined__default(context._onListSelectionChange)}" class="ui5-tree-root"><slot name="header" slot="header"></slot>${ litRender.repeat(context._listItems, (item, index) => item._id || index, (item, index) => block1(item, index, context)) }</ui5-list> `; };
	const block1 = (item, index, context) => { return litRender.html`<ui5-li-tree type="Active" level="${ifDefined__default(item.level)}" icon="${ifDefined__default(item.treeItem.icon)}" additional-text="${ifDefined__default(item.treeItem.additionalText)}" additional-text-state="${ifDefined__default(item.treeItem.additionalTextState)}" ?_toggle-button-end="${ifDefined__default(context._toggleButtonEnd)}" ?_minimal="${ifDefined__default(context._minimal)}" .treeItem="${ifDefined__default(item.treeItem)}" .expanded="${ifDefined__default(item.treeItem.expanded)}" .selected="${ifDefined__default(item.treeItem.selected)}" .showToggleButton="${ifDefined__default(item.treeItem.requiresToggleButton)}" ._posinset="${ifDefined__default(item.posinset)}" ._setsize="${ifDefined__default(item.size)}" @ui5-toggle="${ifDefined__default(context._onListItemToggle)}" @ui5-step-in="${ifDefined__default(context._onListItemStepIn)}" @ui5-step-out="${ifDefined__default(context._onListItemStepOut)}">${ifDefined__default(item.treeItem.text)}</ui5-li-tree>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
