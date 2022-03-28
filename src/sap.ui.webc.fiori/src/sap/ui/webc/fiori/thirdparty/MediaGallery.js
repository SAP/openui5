sap.ui.define(['sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/MediaRange', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/types/NavigationMode', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/Carousel', './MediaGalleryItem', './types/MediaGalleryItemLayout', './types/MediaGalleryLayout', './types/MediaGalleryMenuHorizontalAlign', './types/MediaGalleryMenuVerticalAlign', './generated/templates/MediaGalleryTemplate.lit', './generated/themes/MediaGallery.css'], function (ItemNavigation, ResizeHandler, Device, MediaRange, litRender, Integer, NavigationMode, UI5Element, Button, Carousel, MediaGalleryItem, MediaGalleryItemLayout, MediaGalleryLayout, MediaGalleryMenuHorizontalAlign, MediaGalleryMenuVerticalAlign, MediaGalleryTemplate_lit, MediaGallery_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var MediaRange__default = /*#__PURE__*/_interopDefaultLegacy(MediaRange);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var NavigationMode__default = /*#__PURE__*/_interopDefaultLegacy(NavigationMode);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var Carousel__default = /*#__PURE__*/_interopDefaultLegacy(Carousel);

	const COLUMNS_COUNT = {
		"S": 1,
		"M": 2,
		"L": 3,
		"XL": 4,
	};
	const metadata = {
		tag: "ui5-media-gallery",
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				individualSlots: true,
				invalidateOnChildChange: true,
			},
		},
		properties:  {
			showAllThumbnails: {
				type: Boolean,
			},
			interactiveDisplayArea: {
				type: Boolean,
			},
			layout: {
				type: MediaGalleryLayout,
				defaultValue: "Auto",
			},
			menuHorizontalAlign: {
				type: MediaGalleryMenuHorizontalAlign,
				defaultValue: MediaGalleryMenuHorizontalAlign.Left,
			},
			menuVerticalAlign: {
				type: MediaGalleryMenuVerticalAlign,
				defaultValue: MediaGalleryMenuVerticalAlign.Bottom,
			},
			effectiveLayout: {
				type: MediaGalleryLayout,
				defaultValue: "Vertical",
			},
			mediaRange: {
				type: String,
			},
			_overflowSize: {
				type: Integer__default,
				noAttribute: true,
				defaultValue: 0,
			},
		},
		events:  {
			 "selection-change": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"overflow-click": {},
			"display-area-click": {},
		},
	};
	class MediaGallery extends UI5Element__default {
		constructor() {
			super();
			this._onResize = this._updateLayout.bind(this);
			this._selectedItem = null;
			this._initItemNavigation();
		}
		onEnterDOM() {
			!Device.isPhone() && ResizeHandler__default.register(this, this._onResize);
		}
		onExitDOM() {
			!Device.isPhone() && ResizeHandler__default.deregister(this, this._onResize);
		}
		onAfterRendering() {
			this._updateLayout();
			this._updateSelection();
		}
		_initItemNavigation() {
			if (!this._itemNavigation) {
				this._itemNavigation = new ItemNavigation__default(this, {
					navigationMode: NavigationMode__default.Auto,
					getItemsCallback: () => this._getFocusableItems(),
				});
			}
		}
		_updateSelection() {
			let itemToSelect = this.items.find(item => item.selected);
			if (!itemToSelect || !this._isSelectableItem(itemToSelect)) {
				itemToSelect = this._findSelectableItem();
			}
			if (itemToSelect && itemToSelect !== this._selectedItem) {
				this._selectItem(itemToSelect);
			}
		}
		_isSelectableItem(item) {
			return !item.disabled && !item.hidden;
		}
		_findSelectableItem() {
			return this.items.find(this._isSelectableItem);
		}
		_updateMediaRange(width) {
			this.mediaRange = MediaRange__default.getCurrentRange(MediaRange__default.RANGESETS.RANGE_4STEPS, width);
		}
		_updateLayout() {
			const rootNode = this.getDomRef(),
				height = rootNode.offsetHeight,
				width = rootNode.offsetWidth;
			if (!width || !height || Device.isPhone()) {
				return;
			}
			this._updateMediaRange(width);
			this.effectiveLayout = this._infereffectiveLayout();
			this._overflowSize = this._calculateOverflowSize(width, height);
			this._toggleDisplaySquareSize(this._shouldHaveSquareDisplay);
			this._toggleMainItem9x16size(this._shouldHaveWideDisplay);
		}
		_calculateOverflowSize(width, height) {
			const marginSize = MediaGallery.THUMBNAIL_MARGIN;
			let columnHeight,
				columnsCount;
			if (this.showAllThumbnails) {
				return 0;
			}
			if (this.effectiveLayout === MediaGalleryLayout.Horizontal) {
				columnHeight = height - marginSize;
				columnsCount = this.showAllThumbnails ? COLUMNS_COUNT[this.mediaRange] : 1;
			} else {
				columnHeight = width - (marginSize * 2);
				columnsCount = 1;
			}
			return this._getOverflowSize(columnHeight, columnsCount);
		}
		_toggleDisplaySquareSize(enable) {
			this._display.style.width = "";
			if (enable) {
				const marginSize = MediaGallery.THUMBNAIL_MARGIN,
					width = this._display.offsetWidth;
				let availableHeight = this.getDomRef().offsetHeight - (2 * marginSize);
				if (this.effectiveLayout === MediaGalleryLayout.Vertical) {
					availableHeight -= (MediaGallery.THUMBNAIL_HEIGHT + marginSize);
				}
				if (width > availableHeight) {
					this._display.style.width = `${availableHeight}px`;
				}
			}
		}
		_toggleMainItem9x16size(enable) {
			if (!this._mainItem) {
				return;
			}
			const width = this._mainItem.offsetWidth,
				contentHeight = enable ? `${(width / 16) * 9}px` : "";
			this._mainItem.contentHeight = contentHeight;
		}
		_infereffectiveLayout() {
			if (this.layout === MediaGalleryLayout.Auto) {
				return (this._isPhoneSize) ? MediaGalleryLayout.Vertical
					: MediaGalleryLayout.Horizontal;
			}
			return this.layout;
		}
		_getMaxAllowedThumbnailsInColumn(columnHeight) {
			let maxAllowedItems = Math.floor(columnHeight / MediaGallery.THUMBNAIL_HEIGHT);
			if (!this.showAllThumbnails) {
				maxAllowedItems = Math.min(maxAllowedItems, 5);
			}
			return maxAllowedItems;
		}
		_getOverflowSize(columnHeight, columnsCount) {
			const maxAlowedThumbnailsInColumn = this._getMaxAllowedThumbnailsInColumn(columnHeight),
				overflowSize = Math.max(0, this.items.length - maxAlowedThumbnailsInColumn * columnsCount);
			if (overflowSize === this.items.length || overflowSize === 0) {
				return overflowSize;
			}
			return overflowSize + 1;
		}
		_getFocusableItems() {
			if (!this._showThumbnails) {
				return [];
			}
			const items = this._visibleItems.filter(item => !item.disabled);
			if (this._overflowBtn) {
				items.push(this._overflowBtn);
			}
			return items;
		}
		_selectItem(item, userInteraction) {
			if (item === this._selectedItem) {
				return;
			}
			this._selectedItem = item;
			this._updateSelectedFlag(item);
			this._itemNavigation.setCurrentItem(item);
			if (userInteraction) {
				this.fireEvent("selection-change", { item });
			}
			if (Device.isPhone()) {
				this._selectItemOnPhone(item);
			} else {
				this._displayContent(item);
			}
		}
		_updateSelectedFlag(itemToSelect) {
			this.items.forEach(next => { next.selected = false; });
			itemToSelect.selected = true;
		}
		_selectItemOnPhone(item) {
			const selectableItemIndex = this._selectableItems.indexOf(item),
				carousel = this._carousel;
			carousel && carousel.navigateTo(selectableItemIndex);
		}
		_displayContent(item) {
			let clone;
			const mainItem = this._mainItem,
				oldContent = mainItem._content,
				newContent = item._content;
			mainItem._thumbnailDesign = false;
			oldContent && oldContent.remove();
			if (newContent) {
				clone = newContent.cloneNode(true);
				mainItem.layout = item.layout;
				mainItem.appendChild(clone);
			}
		}
		_onThumbnailClick(event) {
			const item = event.target.closest("[ui5-media-gallery-item]");
			if (item.disabled) {
				return;
			}
			if (item !== this._selectedItem) {
				this._selectItem(item, true );
			}
		}
		_onOverflowBtnClick() {
			this.fireEvent("overflow-click");
		}
		_onDisplayAreaClick(event) {
			if (!this.interactiveDisplayArea) {
				return;
			}
			this.fireEvent("display-area-click");
		}
		_onCarouselNavigate(event) {
			const selectedIndex = event.detail.selectedIndex,
				item = this._selectableItems[selectedIndex];
			this.fireEvent("selection-change", { item });
		}
		get _mainItemTabIndex() {
			return this.interactiveDisplayArea ? 0 : undefined;
		}
		get _selectableItems() {
			return this.items.filter(this._isSelectableItem);
		}
		get _carousel() {
			return this.shadowRoot.querySelector("[ui5-carousel]");
		}
		get _display() {
			return this.shadowRoot.querySelector(".ui5-media-gallery-display");
		}
		get _mainItem() {
			return this.shadowRoot.querySelector(".ui5-media-gallery-display [ui5-media-gallery-item]");
		}
		get _overflowBtn() {
			return this.shadowRoot.querySelector(".ui5-media-gallery-overflow [ui5-button]");
		}
		get _visibleItems() {
			const visibleItemsCount = this.items.length - this._overflowSize;
			return this.items.slice(0, visibleItemsCount);
		}
		get _isPhonePlatform() {
			return Device.isPhone();
		}
		get _showThumbnails() {
			return !Device.isPhone();
		}
		get _showOverflowBtn() {
			return this._overflowSize > 0;
		}
		get _isPhoneSize() {
			return this.mediaRange === "S";
		}
		get _mainItemHasWideLayout() {
			return this._mainItem && (this._mainItem.layout === MediaGalleryItemLayout.Wide);
		}
		get _shouldHaveWideDisplay() {
			return this._mainItemHasWideLayout
				&& this.showAllThumbnails
				&& (this.effectiveLayout === MediaGalleryLayout.Horizontal);
		}
		get _shouldHaveSquareDisplay() {
			return !this._shouldHaveWideDisplay;
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return MediaGalleryTemplate_lit;
		}
		static get staticAreaTemplate() {
			return MediaGalleryTemplate_lit;
		}
		static get styles() {
			return [MediaGallery_css];
		}
		static get staticAreaStyles() {
			return null;
		}
		static get dependencies() {
			return [
				MediaGalleryItem,
				Button__default,
				Carousel__default,
			];
		}
		static get THUMBNAIL_HEIGHT() {
			return 80;
		}
		static get THUMBNAIL_MARGIN() {
			return 16;
		}
	}
	MediaGallery.define();

	return MediaGallery;

});
