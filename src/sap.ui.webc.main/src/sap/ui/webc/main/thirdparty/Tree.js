sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './TreeItem', './List', './TreeListItem', './types/ListMode', './generated/templates/TreeTemplate.lit', './generated/themes/Tree.css'], function (UI5Element, litRender, TreeItem, List, TreeListItem, ListMode, TreeTemplate_lit, Tree_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-tree",
		properties:  {
			mode: {
				type: ListMode,
				defaultValue: ListMode.None,
			},
			noDataText: {
				type: String,
			},
			headerText: {
				type: String,
			},
			footerText: {
				type: String,
			},
			_listItems: {
				type: Object,
				multiple: true,
			},
			_toggleButtonEnd: {
				type: Boolean,
			},
			_minimal: {
				type: Boolean,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				type: HTMLElement,
				propertyName: "items",
				invalidateOnChildChange: true,
			},
			header: {
				type: HTMLElement,
			},
		},
		events:  {
			"item-toggle": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"item-click": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"item-delete": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"selection-change": {
				detail: {
					selectedItems: { type: Array },
					previouslySelectedItems: { type: Array },
				},
			},
		},
	};
	class Tree extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Tree_css;
		}
		static get template() {
			return TreeTemplate_lit;
		}
		static get dependencies() {
			return [
				List,
				TreeListItem,
				TreeItem,
			];
		}
		onBeforeRendering() {
			this._listItems = [];
			buildTree(this, 1, this._listItems);
		}
		get list() {
			return this.getDomRef();
		}
		get _role() {
			return "tree";
		}
		_onListItemStepIn(event) {
			const listItem = event.detail.item;
			const treeItem = listItem.treeItem;
			if (treeItem.items.length > 0) {
				const firstChild = treeItem.items[0];
				const firstChildListItem = this.list.getSlottedNodes("items").find(li => li.treeItem === firstChild);
				firstChildListItem && this.list.focusItem(firstChildListItem);
			}
		}
		_onListItemStepOut(event) {
			const listItem = event.detail.item;
			const treeItem = listItem.treeItem;
			if (treeItem.parentElement !== this) {
				const parent = treeItem.parentElement;
				const parentListItem = this.list.getSlottedNodes("items").find(li => li.treeItem === parent);
				parentListItem && this.list.focusItem(parentListItem);
			}
		}
		_onListItemToggle(event) {
			const listItem = event.detail.item;
			const treeItem = listItem.treeItem;
			const defaultPrevented = !this.fireEvent("item-toggle", { item: treeItem }, true);
			if (!defaultPrevented) {
				treeItem.toggle();
			}
		}
		_onListItemClick(event) {
			const listItem = event.detail.item;
			const treeItem = listItem.treeItem;
			this.fireEvent("item-click", { item: treeItem });
		}
		_onListItemDelete(event) {
			const listItem = event.detail.item;
			const treeItem = listItem.treeItem;
			this.fireEvent("item-delete", { item: treeItem });
		}
		_onListSelectionChange(event) {
			const previouslySelectedItems = event.detail.previouslySelectedItems.map(item => item.treeItem);
			const selectedItems = event.detail.selectedItems.map(item => item.treeItem);
			previouslySelectedItems.forEach(item => {
				item.selected = false;
			});
			selectedItems.forEach(item => {
				item.selected = true;
			});
			this.fireEvent("selection-change", {
				previouslySelectedItems,
				selectedItems,
			});
		}
		_getListItemForTreeItem(item) {
			return this.list.items.find(listItem => listItem.treeItem === item);
		}
		walk(callback) {
			walkTree(this, 1, callback);
		}
	}
	const walkTree = (el, level, callback) => {
		el.items.forEach(item => {
			callback(item, level);
			if (item.items.length > 0) {
				walkTree(item, level + 1, callback);
			}
		});
	};
	const buildTree = (el, level, result) => {
		el.items.forEach((item, index) => {
			const listItem = {
				treeItem: item,
				size: el.items.length,
				posinset: index + 1,
				level,
			};
			result.push(listItem);
			if (item.expanded && item.items.length > 0) {
				buildTree(item, level + 1, result);
			}
		});
	};
	Tree.define();

	return Tree;

});
