sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/main/thirdparty/ResponsivePopover', 'sap/ui/webc/main/thirdparty/List', 'sap/ui/webc/main/thirdparty/StandardListItem', 'sap/ui/webc/main/thirdparty/Tree', 'sap/ui/webc/main/thirdparty/TreeItem', './generated/templates/SideNavigationTemplate.lit', './generated/templates/SideNavigationItemPopoverContentTemplate.lit', './generated/themes/SideNavigation.css'], function (UI5Element, litRender, ResponsivePopover, List, StandardListItem, Tree, TreeItem, SideNavigationTemplate_lit, SideNavigationItemPopoverContentTemplate_lit, SideNavigation_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResponsivePopover__default = /*#__PURE__*/_interopDefaultLegacy(ResponsivePopover);
	var List__default = /*#__PURE__*/_interopDefaultLegacy(List);
	var StandardListItem__default = /*#__PURE__*/_interopDefaultLegacy(StandardListItem);
	var Tree__default = /*#__PURE__*/_interopDefaultLegacy(Tree);
	var TreeItem__default = /*#__PURE__*/_interopDefaultLegacy(TreeItem);

	const metadata = {
		tag: "ui5-side-navigation",
		managedSlots: true,
		properties:  {
			collapsed: {
				type: Boolean,
			},
			_popoverContent: {
				type: Object,
			},
		},
		slots:  {
			"default": {
				propertyName: "items",
				invalidateOnChildChange: true,
				type: HTMLElement,
			},
			header: {
				type: HTMLElement,
			},
			fixedItems: {
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
		},
		events:  {
			"selection-change": {
				detail: {
					item: {
						type: HTMLElement,
					},
				},
			},
		},
	};
	class SideNavigation extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return SideNavigation_css;
		}
		static get template() {
			return SideNavigationTemplate_lit;
		}
		static get staticAreaTemplate() {
			return SideNavigationItemPopoverContentTemplate_lit;
		}
		static get dependencies() {
			return [
				List__default,
				StandardListItem__default,
				Tree__default,
				TreeItem__default,
				ResponsivePopover__default,
			];
		}
		onBeforeRendering() {
			this._items = this.items.map(item => {
				return {
					item,
					selected: ((item.items.some(subItem => subItem.selected) && this.collapsed) || item.selected),
				};
			});
			this._fixedItems = this.fixedItems.map(item => {
				return {
					item,
					selected: ((item.items.some(subItem => subItem.selected) && this.collapsed) || item.selected),
				};
			});
		}
		_setSelectedItem(item) {
			this._walk(current => {
				current.selected = false;
			});
			item.selected = true;
			this.fireEvent("selection-change", { item });
		}
		_buildPopoverContent(item) {
			this._popoverContent = {
				mainItem: item,
				mainItemSelected: item.selected && !item.items.some(subItem => subItem.selected),
				subItems: item.items,
			};
		}
		handleTreeItemClick(event) {
			const treeItem = event.detail.item;
			const item = treeItem.associatedItem;
			if (!item.wholeItemToggleable) {
				item.fireEvent("click");
			} else {
				item.expanded = !item.expanded;
			}
			if (item.selected && !this.collapsed) {
				return;
			}
			if (this.collapsed && item.items.length) {
				this._buildPopoverContent(item);
				const currentTree = this._itemsTree === event.target ? this._itemsTree : this._fixedItemsTree;
				this.openPicker(currentTree._getListItemForTreeItem(treeItem));
			} else {
				this._setSelectedItem(item);
			}
		}
		handleListItemClick(event) {
			const listItem = event.detail.item;
			const item = listItem.associatedItem;
			item.fireEvent("click");
			if (item.selected) {
				return;
			}
			this._setSelectedItem(item);
			this.closePicker();
		}
		async getPicker() {
			return (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
		}
		async openPicker(opener) {
			const responsivePopover = await this.getPicker();
			responsivePopover.showAt(opener);
		}
		async closePicker(opener) {
			const responsivePopover = await this.getPicker();
			responsivePopover.close();
		}
		get hasHeader() {
			return !!this.header.length;
		}
		get showHeader() {
			return this.hasHeader && !this.collapsed;
		}
		get _itemsTree() {
			return this.getDomRef().querySelector("#ui5-sn-items-tree");
		}
		get _fixedItemsTree() {
			return this.getDomRef().querySelector("#ui5-sn-fixed-items-tree");
		}
		_walk(callback) {
			this.items.forEach(current => {
				callback(current);
				current.items.forEach(currentSubitem => {
					callback(currentSubitem);
				});
			});
			this.fixedItems.forEach(current => {
				callback(current);
				current.items.forEach(currentSubitem => {
					callback(currentSubitem);
				});
			});
		}
	}
	SideNavigation.define();

	return SideNavigation;

});
