sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-sn-root">${ context.showHeader ? block1() : undefined }${ context.items.length ? block2(context) : undefined }<div class="ui5-sn-spacer"></div>${ context.fixedItems.length ? block6(context) : undefined }</div> `; };
	const block1 = (context) => { return litRender.html`<slot name="header"></slot>`; };
	const block2 = (context) => { return litRender.html`<ui5-tree id="ui5-sn-items-tree" mode="None" ?_minimal="${ifDefined__default(context.collapsed)}" _toggle-button-end @ui5-item-click="${ifDefined__default(context.handleTreeItemClick)}">${ litRender.repeat(context._items, (item, index) => item._id || index, (item, index) => block3(item, index, context)) }</ui5-tree>`; };
	const block3 = (item, index, context) => { return litRender.html`<ui5-tree-item icon="${ifDefined__default(item.item.icon)}" .associatedItem="${ifDefined__default(item.item)}" text="${ifDefined__default(item.item.text)}" ?has-children="${item.item.items.length}" ?expanded="${item.item.expanded}" ?selected="${item.selected}">${ !context.collapsed ? block4(item) : undefined }</ui5-tree-item>`; };
	const block4 = (item, index, context) => { return litRender.html`${ litRender.repeat(item.item.items, (item, index) => item._id || index, (item, index) => block5(item)) }`; };
	const block5 = (item, index, context) => { return litRender.html`<ui5-tree-item .associatedItem="${ifDefined__default(item)}" text="${ifDefined__default(item.text)}" icon="${ifDefined__default(item.icon)}" ?selected="${item.selected}"></ui5-tree-item>`; };
	const block6 = (context) => { return litRender.html`<div><div class="ui5-sn-bottom-content-border"><span></span></div><ui5-tree id="ui5-sn-fixed-items-tree" mode="None" ?_minimal="${ifDefined__default(context.collapsed)}" _toggle-button-end @ui5-item-click="${ifDefined__default(context.handleTreeItemClick)}">${ litRender.repeat(context._fixedItems, (item, index) => item._id || index, (item, index) => block7(item, index, context)) }</ui5-tree></div>`; };
	const block7 = (item, index, context) => { return litRender.html`<ui5-tree-item icon="${ifDefined__default(item.item.icon)}" .associatedItem="${ifDefined__default(item.item)}" text="${ifDefined__default(item.item.text)}" ?has-children="${item.item.items.length}" ?expanded="${item.item.expanded}" ?selected="${item.selected}">${ !context.collapsed ? block8(item) : undefined }</ui5-tree-item>`; };
	const block8 = (item, index, context) => { return litRender.html`${ litRender.repeat(item.item.items, (item, index) => item._id || index, (item, index) => block9(item)) }`; };
	const block9 = (item, index, context) => { return litRender.html`<ui5-tree-item .associatedItem="${ifDefined__default(item)}" text="${ifDefined__default(item.text)}" ?selected="${item.selected}"></ui5-tree-item>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
