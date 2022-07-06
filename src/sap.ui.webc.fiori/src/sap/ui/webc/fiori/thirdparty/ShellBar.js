sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/main/thirdparty/StandardListItem', 'sap/ui/webc/main/thirdparty/List', 'sap/ui/webc/main/thirdparty/Popover', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/types/HasPopup', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/search', 'sap/ui/webc/common/thirdparty/icons/bell', 'sap/ui/webc/common/thirdparty/icons/overflow', 'sap/ui/webc/common/thirdparty/icons/grid', './generated/i18n/i18n-defaults', './generated/templates/ShellBarTemplate.lit', './generated/templates/ShellBarPopoverTemplate.lit', './generated/themes/ShellBar.css', './generated/themes/ShellBarPopover.css'], function (UI5Element, litRender, ResizeHandler, FeaturesRegistry, AnimationMode$1, AnimationMode, Keys, Render, StandardListItem, List, Popover, Button, HasPopup, i18nBundle, search, bell, overflow, grid, i18nDefaults, ShellBarTemplate_lit, ShellBarPopoverTemplate_lit, ShellBar_css, ShellBarPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);
	var StandardListItem__default = /*#__PURE__*/_interopDefaultLegacy(StandardListItem);
	var List__default = /*#__PURE__*/_interopDefaultLegacy(List);
	var Popover__default = /*#__PURE__*/_interopDefaultLegacy(Popover);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var HasPopup__default = /*#__PURE__*/_interopDefaultLegacy(HasPopup);

	const HANDLE_RESIZE_DEBOUNCE_RATE = 200;
	const metadata = {
		tag: "ui5-shellbar",
		languageAware: true,
		fastNavigation: true,
		properties:  {
			primaryTitle: {
				type: String,
			},
			secondaryTitle: {
				type: String,
			},
			notificationsCount: {
				type: String,
			},
			showNotifications: {
				type: Boolean,
			},
			showProductSwitch: {
				type: Boolean,
			},
			showCoPilot: {
				type: Boolean,
			},
			 accessibilityTexts: {
				type: Object,
			},
			breakpointSize: {
				type: String,
			},
			showSearchField: {
				type: Boolean,
			},
			coPilotActive: {
				type: Boolean,
			},
			withLogo: {
				type: Boolean,
			},
			_itemsInfo: {
				type: Object,
			},
			_header: {
				type: Object,
			},
			_menuPopoverItems: {
				type: String,
				multiple: true,
			},
			_menuPopoverExpanded: {
				type: Boolean,
				noAttribute: true,
			},
			_overflowPopoverExpanded: {
				type: Boolean,
				noAttribute: true,
			},
			_fullWidthSearch: {
				type: Boolean,
				noAttribute: true,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
			profile: {
				type: HTMLElement,
			},
			logo: {
				type: HTMLElement,
			},
			menuItems: {
				type: HTMLElement,
			},
			searchField: {
				type: HTMLElement,
			},
			startButton: {
				type: HTMLElement,
			},
		},
		events:  {
			"notifications-click": {
				detail: {
					targetRef: { type: HTMLElement },
				},
			},
			"profile-click": {
				detail: {
					targetRef: { type: HTMLElement },
				},
			},
			"product-switch-click": {
				detail: {
					targetRef: { type: HTMLElement },
				},
			},
			"logo-click": {
				detail: {
					targetRef: { type: HTMLElement },
				},
			},
			"co-pilot-click": {
				detail: {
					targetRef: { type: HTMLElement },
				},
			},
			"menu-item-click": {
				detail: {
					item: { type: HTMLElement },
				},
			},
		},
	};
	class ShellBar extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return ShellBarTemplate_lit;
		}
		static get staticAreaTemplate() {
			return ShellBarPopoverTemplate_lit;
		}
		static get styles() {
			return ShellBar_css;
		}
		static get staticAreaStyles() {
			return [ShellBarPopover_css];
		}
		static get FIORI_3_BREAKPOINTS() {
			return [
				599,
				1023,
				1439,
				1919,
				10000,
			];
		}
		static get FIORI_3_BREAKPOINTS_MAP() {
			return {
				"599": "S",
				"1023": "M",
				"1439": "L",
				"1919": "XL",
				"10000": "XXL",
			};
		}
		constructor() {
			super();
			this._itemsInfo = [];
			this._isInitialRendering = true;
			this._focusedItem = null;
			this._defaultItemPressPrevented = false;
			this.menuItemsObserver = new MutationObserver(() => {
				this._updateClonedMenuItems();
			});
			this._header = {
				press: async () => {
					this._updateClonedMenuItems();
					if (this.hasMenuItems) {
						const menuPopover = await this._getMenuPopover();
						menuPopover.showAt(this.shadowRoot.querySelector(".ui5-shellbar-menu-button"));
					}
				},
			};
			this._handleResize = async event => {
				this._debounce(async () => {
					await this._getResponsivePopover();
					this.overflowPopover.close();
					this._overflowActions();
				}, HANDLE_RESIZE_DEBOUNCE_RATE);
			};
		}
		_debounce(fn, delay) {
			clearTimeout(this._debounceInterval);
			this._debounceInterval = setTimeout(() => {
				this._debounceInterval = null;
				fn();
			}, delay);
		}
		_menuItemPress(event) {
			this.menuPopover.close();
			this.fireEvent("menu-item-click", {
				item: event.detail.selectedItems[0],
			}, true);
		}
		_logoPress() {
			this.fireEvent("logo-click", {
				targetRef: this.shadowRoot.querySelector(".ui5-shellbar-logo"),
			});
		}
		_menuPopoverBeforeOpen() {
			this._menuPopoverExpanded = true;
		}
		_menuPopoverAfterClose() {
			this._menuPopoverExpanded = false;
		}
		_overflowPopoverBeforeOpen() {
			this._overflowPopoverExpanded = true;
		}
		_overflowPopoverAfterClose() {
			this._overflowPopoverExpanded = false;
		}
		_logoKeyup(event) {
			if (Keys.isSpace(event)) {
				this._logoPress();
			}
		}
		_logoKeydown(event) {
			if (Keys.isSpace(event)) {
				event.preventDefault();
				return;
			}
			if (Keys.isEnter(event)) {
				this._logoPress();
			}
		}
		_fireCoPilotClick() {
			this.fireEvent("co-pilot-click", {
				targetRef: this.shadowRoot.querySelector(".ui5-shellbar-coPilot"),
			});
		}
		_coPilotClick() {
			this._fireCoPilotClick();
		}
		_coPilotKeydown(event) {
			if (Keys.isSpace(event)) {
				this.coPilotActive = true;
				event.preventDefault();
				return;
			}
			if (Keys.isEnter(event)) {
				this.coPilotActive = true;
				this._fireCoPilotClick();
			}
		}
		_coPilotKeyup(event) {
			if (Keys.isSpace(event)) {
				this._fireCoPilotClick();
			}
			this.coPilotActive = false;
		}
		onBeforeRendering() {
			const animationsOn = AnimationMode.getAnimationMode() === AnimationMode__default.Full;
			const coPilotAnimation = FeaturesRegistry.getFeature("CoPilotAnimation");
			this.coPilot = coPilotAnimation && animationsOn ? coPilotAnimation : { animated: false };
			this.withLogo = this.hasLogo;
			this._hiddenIcons = this._itemsInfo.filter(info => {
				const isHidden = (info.classes.indexOf("ui5-shellbar-hidden-button") !== -1);
				const isSet = info.classes.indexOf("ui5-shellbar-invisible-button") === -1;
				const isOverflowIcon = info.classes.indexOf("ui5-shellbar-overflow-button") !== -1;
				const isImageIcon = info.classes.indexOf("ui5-shellbar-image-button") !== -1;
				const shouldStayOnScreen = isOverflowIcon || (isImageIcon && this.hasProfile);
				return isHidden && isSet && !shouldStayOnScreen;
			});
			this._observeMenuItems();
		}
		onAfterRendering() {
			this._overflowActions();
			this._fullWidthSearch = this._showFullWidthSearch;
		}
		closeOverflow() {
			if (this.overflowPopover) {
				this.overflowPopover.close();
			}
		}
		_handleBarBreakpoints() {
			const width = this.getBoundingClientRect().width;
			const breakpoints = ShellBar.FIORI_3_BREAKPOINTS;
			const size = breakpoints.find(bp1 => width < bp1) || ShellBar.FIORI_3_BREAKPOINTS[ShellBar.FIORI_3_BREAKPOINTS.length - 1];
			const mappedSize = ShellBar.FIORI_3_BREAKPOINTS_MAP[size];
			if (this.breakpointSize !== mappedSize) {
				this.breakpointSize = mappedSize;
			}
			return mappedSize;
		}
		_handleSizeS() {
			const hasIcons = this.showNotifications || this.showProductSwitch || this.searchField.length || this.items.length;
			const newItems = this._getAllItems(hasIcons).map(info => {
				const isOverflowIcon = info.classes.indexOf("ui5-shellbar-overflow-button") !== -1;
				const isImageIcon = info.classes.indexOf("ui5-shellbar-image-button") !== -1;
				const shouldStayOnScreen = isOverflowIcon || (isImageIcon && this.hasProfile);
				return {
					...info,
					classes: `${info.classes} ${shouldStayOnScreen ? "" : "ui5-shellbar-hidden-button"} ui5-shellbar-button`,
					styles: {
						order: shouldStayOnScreen ? 1 : -1,
					},
				};
			});
			this._updateItemsInfo(newItems);
		}
		_handleActionsOverflow() {
			const rightContainerRect = this.shadowRoot.querySelector(".ui5-shellbar-overflow-container-right").getBoundingClientRect();
			let overflowSelector = ".ui5-shellbar-button:not(.ui5-shellbar-overflow-button):not(.ui5-shellbar-invisible-button)";
			if (this.showSearchField) {
				overflowSelector += ",.ui5-shellbar-search-field";
			}
			const elementsToOverflow = this.shadowRoot.querySelectorAll(overflowSelector);
			const isRTL = this.effectiveDir === "rtl";
			let overflowCount = [].filter.call(elementsToOverflow, icon => {
				const iconRect = icon.getBoundingClientRect();
				if (isRTL) {
					return (iconRect.left + iconRect.width) > (rightContainerRect.left + rightContainerRect.width);
				}
				return iconRect.left < rightContainerRect.left;
			});
			overflowCount = overflowCount.length;
			const items = this._getAllItems(!!overflowCount).filter(item => item.show);
			const itemsByPriority = items.sort((item1, item2) => {
				if (item1.priority > item2.priority) {
					return 1;
				}
				if (item1.priority < item2.priority) {
					return -1;
				}
				return 0;
			});
			for (let i = 0; i < itemsByPriority.length; i++) {
				if (i < overflowCount) {
					itemsByPriority[i].classes = `${itemsByPriority[i].classes} ui5-shellbar-hidden-button`;
					itemsByPriority[i].styles = {
						order: -1,
					};
				}
			}
			return itemsByPriority;
		}
		_overflowActions() {
			const size = this._handleBarBreakpoints();
			if (size === "S") {
				return this._handleSizeS();
			}
			const newItems = this._handleActionsOverflow();
			this._updateItemsInfo(newItems);
		}
		async _toggleActionPopover() {
			const overflowButton = this.shadowRoot.querySelector(".ui5-shellbar-overflow-button");
			const overflowPopover = await this._getOverflowPopover();
			overflowPopover.showAt(overflowButton);
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResize);
		}
		onExitDOM() {
			this.menuItemsObserver.disconnect();
			ResizeHandler__default.deregister(this, this._handleResize);
			clearTimeout(this._debounceInterval);
			this._debounceInterval = null;
		}
		_handleSearchIconPress(event) {
			this.showSearchField = !this.showSearchField;
			if (!this.showSearchField) {
				return;
			}
			const input = this.searchField[0];
			if (input) {
				input.focused = true;
			}
			setTimeout(() => {
				if (input) {
					input.focus();
				}
			}, 100);
		}
		async _handleActionListClick(event) {
			if (!this._defaultItemPressPrevented) {
				this.closeOverflow();
				await Render.renderFinished();
			}
			this._defaultItemPressPrevented = false;
		}
		_handleCustomActionPress(event) {
			const refItemId = event.target.getAttribute("data-ui5-external-action-item-id");
			if (refItemId) {
				const shellbarItem = this.items.find(item => {
					return item._id === refItemId;
				});
				const prevented = !shellbarItem.fireEvent("click", { targetRef: event.target }, true);
				this._defaultItemPressPrevented = prevented;
			}
		}
		_handleOverflowPress(event) {
			this._toggleActionPopover();
		}
		_handleNotificationsPress(event) {
			const notificationIconRef = this.shadowRoot.querySelector(".ui5-shellbar-bell-button");
			this._defaultItemPressPrevented = !this.fireEvent("notifications-click", {
				targetRef: notificationIconRef.classList.contains("ui5-shellbar-hidden-button") ? event.target : notificationIconRef,
			}, true);
		}
		_handleProfilePress(event) {
			this.fireEvent("profile-click", {
				targetRef: this.shadowRoot.querySelector(".ui5-shellbar-image-button"),
			});
		}
		_handleCancelButtonPress() {
			this.showSearchField = false;
		}
		_handleProductSwitchPress(event) {
			const buttonRef = this.shadowRoot.querySelector(".ui5-shellbar-button-product-switch");
			this._defaultItemPressPrevented = !this.fireEvent("product-switch-click", {
				targetRef: buttonRef.classList.contains("ui5-shellbar-hidden-button") ? event.target : buttonRef,
			}, true);
		}
		get logoDomRef() {
			return this.shadowRoot.querySelector(`*[data-ui5-stable="logo"]`);
		}
		get copilotDomRef() {
			return this.shadowRoot.querySelector(`*[data-ui5-stable="copilot"]`);
		}
		get notificationsDomRef() {
			return this.shadowRoot.querySelector(`*[data-ui5-stable="notifications"]`);
		}
		get overflowDomRef() {
			return this.shadowRoot.querySelector(`*[data-ui5-stable="overflow"]`);
		}
		get profileDomRef() {
			return this.shadowRoot.querySelector(`*[data-ui5-stable="profile"]`);
		}
		get productSwitchDomRef() {
			return this.shadowRoot.querySelector(`*[data-ui5-stable="product-switch"]`);
		}
		_getAllItems(showOverflowButton) {
			let domOrder = -1;
			const items = [
				{
					icon: "search",
					text: "Search",
					classes: `${this.searchField.length ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-search-button ui5-shellbar-button`,
					priority: 4,
					domOrder: this.searchField.length ? (++domOrder) : -1,
					styles: {
						order: this.searchField.length ? 1 : -10,
					},
					id: `${this._id}-item-${1}`,
					press: this._handleSearchIconPress.bind(this),
					show: !!this.searchField.length,
				},
				...this.items.map((item, index) => {
					item._getRealDomRef = () => this.getDomRef().querySelector(`*[data-ui5-stable=${item.stableDomRef}]`);
					return {
						icon: item.icon,
						id: item._id,
						count: item.count || undefined,
						refItemid: item._id,
						text: item.text,
						classes: "ui5-shellbar-custom-item ui5-shellbar-button",
						priority: 1,
						domOrder: (++domOrder),
						styles: {
							order: 2,
						},
						show: true,
						press: this._handleCustomActionPress.bind(this),
						custom: true,
						title: item.title,
						stableDomRef: item.stableDomRef,
					};
				}),
				{
					icon: "bell",
					text: "Notifications",
					classes: `${this.showNotifications ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-bell-button ui5-shellbar-button`,
					priority: 3,
					styles: {
						order: this.showNotifications ? 3 : -10,
					},
					id: `${this._id}-item-${2}`,
					show: this.showNotifications,
					domOrder: this.showNotifications ? (++domOrder) : -1,
					press: this._handleNotificationsPress.bind(this),
				},
				{
					icon: "overflow",
					text: "Overflow",
					classes: `${showOverflowButton ? "" : "ui5-shellbar-hidden-button"} ui5-shellbar-overflow-button-shown ui5-shellbar-overflow-button ui5-shellbar-button`,
					priority: 5,
					order: 4,
					styles: {
						order: showOverflowButton ? 4 : -1,
					},
					domOrder: showOverflowButton ? (++domOrder) : -1,
					id: `${this.id}-item-${5}`,
					press: this._handleOverflowPress.bind(this),
					show: true,
				},
				{
					text: "Person",
					classes: `${this.hasProfile ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-image-button ui5-shellbar-button`,
					priority: 4,
					styles: {
						order: this.hasProfile ? 5 : -10,
					},
					profile: true,
					id: `${this._id}-item-${3}`,
					domOrder: this.hasProfile ? (++domOrder) : -1,
					show: this.hasProfile,
					press: this._handleProfilePress.bind(this),
				},
				{
					icon: "grid",
					text: "Product Switch",
					classes: `${this.showProductSwitch ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-button ui5-shellbar-button-product-switch`,
					priority: 2,
					styles: {
						order: this.showProductSwitch ? 6 : -10,
					},
					id: `${this._id}-item-${4}`,
					show: this.showProductSwitch,
					domOrder: this.showProductSwitch ? (++domOrder) : -1,
					press: this._handleProductSwitchPress.bind(this),
				},
			];
			return items;
		}
		_updateItemsInfo(newItems) {
			const isDifferent = JSON.stringify(this._itemsInfo) !== JSON.stringify(newItems);
			if (isDifferent) {
				this._itemsInfo = newItems;
			}
		}
		_updateClonedMenuItems() {
			this._menuPopoverItems = [];
			this.menuItems.forEach(item => {
				const clonedItem = item.cloneNode(true);
				clonedItem.removeAttribute("slot");
				this._menuPopoverItems.push(clonedItem);
			});
		}
		_observeMenuItems() {
			this.menuItems.forEach(item => {
				this.menuItemsObserver.observe(item, {
					characterData: true,
					childList: true,
					subtree: true,
					attributes: true,
				});
			});
		}
		async _getResponsivePopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			this.overflowPopover = staticAreaItem.querySelector(".ui5-shellbar-overflow-popover");
			this.menuPopover = staticAreaItem.querySelector(".ui5-shellbar-menu-popover");
		}
		async _getOverflowPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(".ui5-shellbar-overflow-popover");
		}
		async _getMenuPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(".ui5-shellbar-menu-popover");
		}
		isIconHidden(name) {
			const itemInfo = this._itemsInfo.find(item => item.icon === name);
			if (!itemInfo) {
				return false;
			}
			return itemInfo.classes.indexOf("ui5-shellbar-hidden-button") !== -1;
		}
		get classes() {
			return {
				wrapper: {
					"ui5-shellbar-root": true,
					"ui5-shellbar-with-searchfield": this.searchField.length,
				},
				button: {
					"ui5-shellbar-menu-button--interactive": this.hasMenuItems,
					"ui5-shellbar-menu-button": true,
				},
				items: {
					notification: {
						"ui5-shellbar-hidden-button": this.isIconHidden("bell"),
					},
					product: {
						"ui5-shellbar-hidden-button": this.isIconHidden("grid"),
					},
					search: {
						"ui5-shellbar-hidden-button": this.isIconHidden("search"),
					},
					overflow: {
						"ui5-shellbar-hidden-button": this.isIconHidden("overflow"),
					},
				},
			};
		}
		get styles() {
			return {
				items: {
					notification: {
						"order": this.isIconHidden("bell") ? "-1" : "3",
					},
					overflow: {
						"order": this.isIconHidden("overflow") ? "-1" : "4",
					},
					profile: {
						"order": this.hasProfile ? "5" : "-1",
					},
					product: {
						"order": this.isIconHidden("grid") ? "-1" : "6",
					},
				},
				searchField: {
					"display": this.correctSearchFieldStyles,
				},
			};
		}
		get correctSearchFieldStyles() {
			if (this.showSearchField) {
				return "flex";
			}
			return "none";
		}
		get customItemsInfo() {
			return this._itemsInfo.filter(itemInfo => !!itemInfo.custom);
		}
		get hasLogo() {
			return !!this.logo.length;
		}
		get showLogoInMenuButton() {
			return this.hasLogo && this.breakpointSize === "S";
		}
		get showTitleInMenuButton() {
			return this.primaryTitle && !(this.showLogoInMenuButton);
		}
		get showMenuButton() {
			return this.primaryTitle || this.showLogoInMenuButton;
		}
		get popoverHorizontalAlign() {
			return this.effectiveDir === "rtl" ? "Left" : "Right";
		}
		get hasSearchField() {
			return !!this.searchField.length;
		}
		get hasProfile() {
			return !!this.profile.length;
		}
		get hasMenuItems() {
			return this.menuItems.length > 0;
		}
		get _shellbarText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_LABEL);
		}
		get _logoText() {
			return this.accessibilityTexts.logoTitle || ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_LOGO);
		}
		get _copilotText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_COPILOT);
		}
		get _notificationsText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_NOTIFICATIONS, this.notificationsCount);
		}
		get _cancelBtnText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_CANCEL);
		}
		get _showFullWidthSearch() {
			const size = this._handleBarBreakpoints();
			const searchBtnHidden = !!this.shadowRoot.querySelector(".ui5-shellbar-search-button.ui5-shellbar-hidden-button");
			return ((size === "S") || searchBtnHidden);
		}
		get _profileText() {
			return this.accessibilityTexts.profileButtonTitle || ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_PROFILE);
		}
		get _productsText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_PRODUCTS);
		}
		get _searchText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_SEARCH);
		}
		get _overflowText() {
			return ShellBar.i18nBundle.getText(i18nDefaults.SHELLBAR_OVERFLOW);
		}
		get accInfo() {
			return {
				notifications: {
					"title": this._notificationsText,
				},
				profile: {
					"title": this._profileText,
				},
				products: {
					"title": this._productsText,
				},
				search: {
					"title": this._searchText,
					"accessibilityAttributes": {
						expanded: this.showSearchField,
					},
				},
				overflow: {
					"title": this._overflowText,
					"accessibilityAttributes": {
						hasPopup: HasPopup__default.Menu,
						expanded: this._overflowPopoverExpanded,
					},
				},
			};
		}
		static get dependencies() {
			return [
				Button__default,
				List__default,
				Popover__default,
				StandardListItem__default,
			];
		}
		static async onDefine() {
			ShellBar.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
	}
	ShellBar.define();

	return ShellBar;

});
