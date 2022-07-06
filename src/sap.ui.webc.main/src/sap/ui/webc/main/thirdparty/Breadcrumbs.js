sap.ui.define(['sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/types/NavigationMode', 'sap/ui/webc/common/thirdparty/base/UI5Element', './types/BreadcrumbsDesign', './types/BreadcrumbsSeparatorStyle', './BreadcrumbsItem', './generated/i18n/i18n-defaults', './Link', './Label', './ResponsivePopover', './List', './StandardListItem', './Icon', './Button', './generated/templates/BreadcrumbsTemplate.lit', './generated/templates/BreadcrumbsPopoverTemplate.lit', './generated/themes/Breadcrumbs.css', './generated/themes/BreadcrumbsPopover.css'], function (ItemNavigation, litRender, Keys, Integer, i18nBundle, ResizeHandler, NavigationMode, UI5Element, BreadcrumbsDesign, BreadcrumbsSeparatorStyle, BreadcrumbsItem, i18nDefaults, Link, Label, ResponsivePopover, List, StandardListItem, Icon, Button, BreadcrumbsTemplate_lit, BreadcrumbsPopoverTemplate_lit, Breadcrumbs_css, BreadcrumbsPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var NavigationMode__default = /*#__PURE__*/_interopDefaultLegacy(NavigationMode);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-breadcrumbs",
		managedSlots: true,
		languageAware: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
		},
		properties:  {
			design: {
				type: BreadcrumbsDesign,
				defaultValue: BreadcrumbsDesign.Standard,
			},
			separatorStyle: {
				type: BreadcrumbsSeparatorStyle,
				defaultValue: BreadcrumbsSeparatorStyle.Slash,
			},
			_overflowSize: {
				type: Integer__default,
				noAttribute: true,
				defaultValue: 0,
			},
		},
		events:  {
			"item-click": {
				detail: {
					item: { type: HTMLElement },
					altKey: { type: Boolean	},
					ctrlKey: { type: Boolean },
					metaKey: { type: Boolean },
					shiftKey: { type: Boolean },
				},
			},
		},
	};
	class Breadcrumbs extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return BreadcrumbsTemplate_lit;
		}
		static get staticAreaTemplate() {
			return BreadcrumbsPopoverTemplate_lit;
		}
		static get styles() {
			return Breadcrumbs_css;
		}
		static get staticAreaStyles() {
			return BreadcrumbsPopover_css;
		}
		constructor() {
			super();
			this._initItemNavigation();
			this._onResizeHandler = this._updateOverflow.bind(this);
			this._breadcrumbItemWidths = new WeakMap();
			this._dropdownArrowLinkWidth = 0;
			this._labelFocusAdaptor = {
				id: `${this._id}-labelWrapper`,
				getlabelWrapper: this.getCurrentLocationLabelWrapper.bind(this),
				set _tabIndex(value) {
					const wrapper = this.getlabelWrapper();
					wrapper && wrapper.setAttribute("tabindex", value);
				},
				get _tabIndex() {
					const wrapper = this.getlabelWrapper();
					return (wrapper) ? wrapper.getAttribute("tabindex") : undefined;
				},
			};
		}
		onInvalidation(changeInfo) {
			if (changeInfo.reason === "childchange") {
				const itemIndex = this.getSlottedNodes("items").indexOf(changeInfo.child),
					isInOverflow = itemIndex < this._overflowSize;
				if (isInOverflow) {
					this._overflowSize = itemIndex;
				}
			}
		}
		onBeforeRendering() {
			this._preprocessItems();
		}
		onAfterRendering() {
			this._cacheWidths();
			this._updateOverflow();
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._onResizeHandler);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._onResizeHandler);
		}
		_initItemNavigation() {
			if (!this._itemNavigation) {
				this._itemNavigation = new ItemNavigation__default(this, {
					navigationMode: NavigationMode__default.Horizontal,
					getItemsCallback: () => this._getFocusableItems(),
				});
			}
		}
		_getFocusableItems() {
			const items = this._links;
			if (!this._isOverflowEmpty) {
				items.unshift(this._dropdownArrowLink);
			}
			if (this._endsWithCurrentLocationLabel) {
				items.push(this._labelFocusAdaptor);
			}
			return items;
		}
		_onfocusin(event) {
			const target = event.target,
				labelWrapper = this.getCurrentLocationLabelWrapper(),
				currentItem = (target === labelWrapper) ? this._labelFocusAdaptor : target;
			this._itemNavigation.setCurrentItem(currentItem);
		}
		_onkeydown(event) {
			const isDropdownArrowFocused = this._isDropdownArrowFocused;
			if (Keys.isShow(event) && isDropdownArrowFocused && !this._isOverflowEmpty) {
				event.preventDefault();
				this._toggleRespPopover();
				return;
			}
			if (Keys.isSpace(event) && isDropdownArrowFocused && !this._isOverflowEmpty && !this._isPickerOpen) {
				event.preventDefault();
				return;
			}
			if ((Keys.isEnter(event) || Keys.isSpace(event)) && this._isCurrentLocationLabelFocused) {
				this._onLabelPress();
			}
		}
		_onkeyup(event) {
			if (this._isDropdownArrowFocused && Keys.isSpace(event) && !this._isOverflowEmpty && !this._isPickerOpen) {
				this._openRespPopover();
			}
		}
		_cacheWidths() {
			const map = this._breadcrumbItemWidths,
				items = this.getSlottedNodes("items"),
				label = this._currentLocationLabel;
			for (let i = this._overflowSize; i < items.length; i++) {
				const item = items[i],
					link = this.shadowRoot.querySelector(`#${item._id}-link-wrapper`);
				map.set(item, this._getElementWidth(link) || 0);
			}
			if (items.length && this._endsWithCurrentLocationLabel && label) {
				const item = items[items.length - 1];
				map.set(item, this._getElementWidth(label));
			}
			if (!this._isOverflowEmpty) {
				this._dropdownArrowLinkWidth = this._getElementWidth(
					this.shadowRoot.querySelector(".ui5-breadcrumbs-dropdown-arrow-link-wrapper"),
				);
			}
		}
		_updateOverflow() {
			const items = this.getSlottedNodes("items"),
				availableWidth = this.shadowRoot.querySelector(".ui5-breadcrumbs-root").offsetWidth;
			let requiredWidth = this._getTotalContentWidth(),
				overflowSize = 0;
			if (requiredWidth > availableWidth) {
				requiredWidth += this._dropdownArrowLinkWidth;
			}
			while ((requiredWidth > availableWidth) && (overflowSize < this._maxAllowedOverflowSize)) {
				const itemToOverflow = items[overflowSize];
				let itemWidth = 0;
				if (this._isItemVisible(itemToOverflow)) {
					itemWidth = this._breadcrumbItemWidths.get(itemToOverflow) || 0;
				}
				requiredWidth -= itemWidth;
				overflowSize++;
			}
			this._overflowSize = overflowSize;
			if (this._isOverflowEmpty && this._isPickerOpen) {
				this.responsivePopover.close();
			}
			const focusableItems = this._getFocusableItems();
			if (!focusableItems.some(x => x._tabIndex === "0")) {
				this._itemNavigation.setCurrentItem(focusableItems[0]);
			}
		}
		_getElementWidth(element) {
			if (element) {
				return Math.ceil(element.getBoundingClientRect().width);
			}
		}
		_getTotalContentWidth() {
			const items = this.getSlottedNodes("items"),
				widthsMap = this._breadcrumbItemWidths,
				totalLinksWidth = items.reduce((sum, link) => sum + widthsMap.get(link), 0);
			return totalLinksWidth;
		}
		_onLinkPress(event) {
			const link = event.target,
				items = this.getSlottedNodes("items"),
				item = items.find(x => `${x._id}-link` === link.id);
			if (!this.fireEvent("item-click", { item, ...event.detail }, true)) {
				event.preventDefault();
			}
		}
		_onLabelPress(event) {
			const items = this.getSlottedNodes("items"),
				item = items[items.length - 1];
			this.fireEvent("item-click", { item, ...event.detail });
		}
		_onOverflowListItemSelect(event) {
			const listItem = event.detail.selectedItems[0],
				items = this.getSlottedNodes("items"),
				item = items.find(x => `${x._id}-li` === listItem.id);
			if (this.fireEvent("item-click", { item }, true)) {
				window.open(item.href, item.target || "_self", "noopener,noreferrer");
				this.responsivePopover.close();
			}
		}
		async _respPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-responsive-popover]");
		}
		async _toggleRespPopover() {
			this.responsivePopover = await this._respPopover();
			if (this._isPickerOpen) {
				this._closeRespPopover();
			} else {
				this._openRespPopover();
			}
		}
		async _closeRespPopover() {
			this.responsivePopover && this.responsivePopover.close();
		}
		async _openRespPopover() {
			this.responsivePopover = await this._respPopover();
			this.responsivePopover.showAt(this._dropdownArrowLink);
		}
		_isItemVisible(item) {
			return !item.hidden && this._hasVisibleContent(item);
		}
		_hasVisibleContent(item) {
			return item.innerText || Array.from(item.children).some(child => !child.hidden);
		}
		_preprocessItems() {
			this.items.forEach(item => {
				item._getRealDomRef = () => this.getDomRef().querySelector(`[data-ui5-stable*=${item.stableDomRef}]`);
			});
		}
		_getItemPositionText(position, size) {
			return Breadcrumbs.i18nBundle.getText(i18nDefaults.BREADCRUMB_ITEM_POS, position, size);
		}
		_getItemAccessibleName(item, position, size) {
			const positionText = this._getItemPositionText(position, size);
			let text = "";
			if (item.accessibleName) {
				text = `${item.textContent.trim()} ${item.accessibleName} ${positionText}`;
			} else {
				text = `${item.textContent.trim()} ${positionText}`;
			}
			return text;
		}
		getCurrentLocationLabelWrapper() {
			return this.shadowRoot.querySelector(".ui5-breadcrumbs-current-location > span");
		}
		get _visibleItems() {
			return this.getSlottedNodes("items")
				.slice(this._overflowSize)
				.filter(i => this._isItemVisible(i));
		}
		get _endsWithCurrentLocationLabel() {
			return this.design === BreadcrumbsDesign.Standard;
		}
		get _currentLocationText() {
			const items = this.getSlottedNodes("items");
			if (this._endsWithCurrentLocationLabel && items.length) {
				const item = items[items.length - 1];
				if (this._isItemVisible(item)) {
					return item.innerText;
				}
			}
			return "";
		}
		get _currentLocationLabel() {
			return this.shadowRoot.querySelector(".ui5-breadcrumbs-current-location [ui5-label]");
		}
		get _isDropdownArrowFocused() {
			return this._dropdownArrowLink._tabIndex === "0";
		}
		get _isCurrentLocationLabelFocused() {
			const label = this.getCurrentLocationLabelWrapper();
			return label && label.tabIndex === 0;
		}
		get _maxAllowedOverflowSize() {
			const items = this.getSlottedNodes("items").filter(item => this._isItemVisible(item));
			return items.length - 1;
		}
		get _dropdownArrowLink() {
			return this.shadowRoot.querySelector(".ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-link]");
		}
		get _overflowItemsData() {
			return this.getSlottedNodes("items")
				.slice(0, this._overflowSize)
				.filter(item => this._isItemVisible(item))
				.reverse();
		}
		get _linksData() {
			const items = this._visibleItems;
			const itemsCount = items.length;
			if (this._endsWithCurrentLocationLabel) {
				items.pop();
			}
			return items
				.map((item, index) => {
					item._accessibleNameText = this._getItemAccessibleName(item, index + 1, itemsCount);
					return item;
				});
		}
		get _currentLocationAccName() {
			const items = this._visibleItems;
			const positionText = this._getItemPositionText(items.length, items.length);
			const lastItem = items[items.length - 1];
			if (!lastItem) {
				return positionText;
			}
			if (lastItem.accessibleName) {
				return `${lastItem.textContent.trim()} ${lastItem.accessibleName} ${positionText}`;
			}
			return `${lastItem.textContent.trim()} ${positionText}`;
		}
		get _links() {
			return Array.from(this.shadowRoot.querySelectorAll(".ui5-breadcrumbs-link-wrapper [ui5-link]"));
		}
		get _isOverflowEmpty() {
			return this._overflowItemsData.length === 0;
		}
		get _ariaHasPopup() {
			if (!this._isOverflowEmpty) {
				return "listbox";
			}
			return undefined;
		}
		get _isPickerOpen() {
			return !!this.responsivePopover && this.responsivePopover.opened;
		}
		get _accessibleNameText() {
			return Breadcrumbs.i18nBundle.getText(i18nDefaults.BREADCRUMBS_ARIA_LABEL);
		}
		get _dropdownArrowAccessibleNameText() {
			return Breadcrumbs.i18nBundle.getText(i18nDefaults.BREADCRUMBS_OVERFLOW_ARIA_LABEL);
		}
		get _cancelButtonText() {
			return Breadcrumbs.i18nBundle.getText(i18nDefaults.BREADCRUMBS_CANCEL_BUTTON);
		}
		static get dependencies() {
			return [
				BreadcrumbsItem,
				Link,
				Label,
				ResponsivePopover,
				List,
				StandardListItem,
				Icon,
				Button,
			];
		}
		static async onDefine() {
			Breadcrumbs.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	Breadcrumbs.define();

	return Breadcrumbs;

});
