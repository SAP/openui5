sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-right', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './ResponsivePopover', './Button', './List', './StandardListItem', './Icon', './generated/templates/MenuTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Menu.css'], function (UI5Element, Keys, Device, i18nBundle, slimArrowRight, litRender, ResponsivePopover, Button, List, StandardListItem, Icon, MenuTemplate_lit, i18nDefaults, Menu_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-menu",
		properties:  {
			 headerText: {
				type: String,
			},
			_isSubMenu: {
				type: Boolean,
				noAttribute: true,
			},
			 _parentMenuItem: {
				type: Object,
			},
			 _openedSubMenuItem: {
				type: Object,
			},
			 _subMenuOpenerId: {
				type: String,
			},
			 _currentItems: {
				type: Object,
				multiple: true,
			},
			 _parentItemsStack: {
				type: Object,
				multiple: true,
			},
			_popover: {
				type: Object,
			},
		},
		managedSlots: true,
		slots:  {
			 "default": {
				propertyName: "items",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
		},
		events:  {
			 "item-click": {
				detail: {
					item: {
						type: Object,
					},
					text: {
						type: String,
					},
				},
			 },
		},
	};
	class Menu extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get staticAreaStyles() {
			return Menu_css;
		}
		static get staticAreaTemplate() {
			return MenuTemplate_lit;
		}
		static get dependencies() {
			return [
				ResponsivePopover,
				Button,
				List,
				StandardListItem,
				Icon,
			];
		}
		static async onDefine() {
			Menu.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get itemsWithChildren() {
			return !!this._currentItems.filter(item => item.item.items.length).length;
		}
		get itemsWithIcon() {
			return !!this._currentItems.filter(item => item.item.icon !== "").length;
		}
		get isRtl() {
			return this.effectiveDir === "rtl";
		}
		get placementType() {
			const placement = this.isRtl ? "Left" : "Right";
			return this._isSubMenu ? placement : "Bottom";
		}
		get verticalAlign() {
			return this._isSubMenu ? "Top" : "Bottom";
		}
		get labelBack() {
			return Menu.i18nBundle.getText(i18nDefaults.MENU_BACK_BUTTON_ARIA_LABEL);
		}
		get labelClose() {
			return Menu.i18nBundle.getText(i18nDefaults.MENU_CLOSE_BUTTON_ARIA_LABEL);
		}
		get isPhone() {
			return Device.isPhone();
		}
		get isSubMenuOpened() {
			return !!this._parentMenuItem;
		}
		get menuHeaderTextPhone() {
			return this.isSubMenuOpened ? this._parentMenuItem.text : this.headerText;
		}
		onBeforeRendering() {
			!Device.isPhone() && this._prepareCurrentItems(this.items);
			const itemsWithChildren = this.itemsWithChildren;
			const itemsWithIcon = this.itemsWithIcon;
			this._currentItems.forEach(item => {
				item.item._siblingsWithChildren = itemsWithChildren;
				item.item._siblingsWithIcon = itemsWithIcon;
			});
		}
		async showAt(opener) {
			if (Device.isPhone()) {
				this._prepareCurrentItems(this.items);
				this._parentItemsStack = [];
			}
			if (!this._isSubMenu) {
				this._parentMenuItem = undefined;
			}
			await this._getPopover();
			this._popover.initialFocus = "";
			for (let index = 0; index < this._currentItems.length; index++) {
				if (!this._currentItems[index].item.disabled) {
					this._popover.initialFocus = `${this._id}-menu-item-${index}`;
					break;
				}
			}
			this._popover.showAt(opener);
		}
		close() {
			if (Object.keys(this._popover).length) {
				if (Device.isPhone()) {
					this._parentItemsStack = [];
				}
				this._popover.close();
				this._popover.resetFocus();
			}
		}
		async _getPopover() {
			this._popover = (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
			return this._popover;
		}
		_beforePopoverClose() {
			if (Object.keys(this._openedSubMenuItem).length) {
				this._openedSubMenuItem._preventSubMenuClose = false;
				this._closeItemSubMenu(this._openedSubMenuItem);
			}
		}
		_navigateBack() {
			const parentMenuItem = this._parentItemsStack.pop();
			this.focus();
			if (parentMenuItem) {
				this._prepareCurrentItems(parentMenuItem.parentElement.items);
				this._parentMenuItem = this._parentItemsStack.length ? this._parentItemsStack[this._parentItemsStack.length - 1] : undefined;
			}
		}
		_prepareCurrentItems(items) {
			this._currentItems = items.map((item, index) => {
				return {
					item,
					position: index + 1,
					ariaHasPopup: item.hasChildren ? "menu" : undefined,
				};
			});
		}
		_createSubMenu(item, openerId) {
			const subMenu = document.createElement(this.constructor.getMetadata().getTag());
			const fragment = document.createDocumentFragment();
			subMenu._isSubMenu = true;
			subMenu.setAttribute("id", `submenu-${openerId}`);
			subMenu._parentMenuItem = item;
			const subItems = item.children;
			let clonedItem,
				idx;
			for (idx = 0; idx < subItems.length; idx++) {
				clonedItem = subItems[idx].cloneNode(true);
				fragment.appendChild(clonedItem);
			}
			subMenu.appendChild(fragment);
			this.staticAreaItem.shadowRoot.querySelector(".ui5-menu-submenus").appendChild(subMenu);
			item._subMenu = subMenu;
		}
		_openItemSubMenu(item, opener, actionId) {
			item._subMenu.showAt(opener);
			item._preventSubMenuClose = true;
			this._openedSubMenuItem = item;
			this._subMenuOpenerId = actionId;
		}
		_closeItemSubMenu(item, forceClose) {
			if (Object.keys(item).length) {
				if (forceClose) {
					item._preventSubMenuClose = false;
					this._closeSubMenuPopover(item._subMenu, true);
				} else {
					setTimeout(() => this._closeSubMenuPopover(item._subMenu), 0);
				}
			}
		}
		_closeSubMenuPopover(subMenu, forceClose) {
			if (subMenu && Object.keys(subMenu).length) {
				const parentItem = subMenu._parentMenuItem;
				if (forceClose || !parentItem._preventSubMenuClose) {
					subMenu.close();
					subMenu.remove();
					parentItem._subMenu = {};
					this._openedSubMenuItem = {};
					this._subMenuOpenerId = "";
				}
			}
		}
		_prepareSubMenuDesktopTablet(item, opener, actionId) {
			if (actionId !== this._subMenuOpenerId || item.hasChildren) {
				this._closeItemSubMenu(this._openedSubMenuItem, true);
			}
			if (item.hasChildren) {
				this._createSubMenu(item, actionId);
				this._openItemSubMenu(item, opener, actionId);
			}
			if (this._parentMenuItem) {
				this._parentMenuItem._preventSubMenuClose = true;
			}
		}
		_prepareSubMenuPhone(item) {
			this._prepareCurrentItems(item.items);
			this._parentMenuItem = item;
			this._parentItemsStack.push(item);
		}
		_itemMouseOver(event) {
			if (Device.isDesktop()) {
				const opener = event.target;
				const item = opener.associatedItem;
				const hoverId = opener.getAttribute("id");
				opener.focus();
				this._prepareSubMenuDesktopTablet(item, opener, hoverId);
			}
		}
		_itemMouseOut(event) {
			if (Device.isDesktop()) {
				const item = event.target.associatedItem;
				if (item.hasChildren && item._subMenu) {
					item._preventSubMenuClose = false;
					this._closeItemSubMenu(item);
				}
			}
		}
		_itemKeyDown(event) {
			const isMenuClose = this.isRtl ? Keys.isRight(event) : Keys.isLeft(event);
			const isMenuOpen = this.isRtl ? Keys.isLeft(event) : Keys.isRight(event);
			if (Keys.isEnter(event)) {
				event.preventDefault();
			}
			if (isMenuOpen) {
				const opener = event.target;
				const item = opener.associatedItem;
				const hoverId = opener.getAttribute("id");
				item.hasChildren && this._prepareSubMenuDesktopTablet(item, opener, hoverId);
			} else if (isMenuClose && this._isSubMenu && this._parentMenuItem) {
				this._parentMenuItem.parentElement._closeItemSubMenu(this._parentMenuItem, true);
			}
		}
		_itemClick(event) {
			const opener = event.detail.item;
			const item = opener.associatedItem;
			const actionId = opener.getAttribute("id");
			if (!item.hasChildren) {
				if (!this._isSubMenu) {
					if (Device.isPhone()) {
						this._parentMenuItem = undefined;
					}
					this.fireEvent("item-click", {
						"item": item,
						"text": item.text,
					});
					this._popover.close();
				} else {
					let parentMenu = item.parentElement;
					while (parentMenu._parentMenuItem) {
						parentMenu._parentMenuItem._preventSubMenuClose = false;
						this._closeItemSubMenu(parentMenu._parentMenuItem);
						parentMenu = parentMenu._parentMenuItem.parentElement;
					}
					parentMenu._itemClick(event);
				}
			} else if (Device.isPhone()) {
				this._prepareSubMenuPhone(item);
			} else if (Device.isTablet()) {
				this._prepareSubMenuDesktopTablet(item, opener, actionId);
			}
		}
	}
	Menu.define();

	return Menu;

});
