sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/MediaRange", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/Carousel", "./MediaGalleryItem", "./types/MediaGalleryItemLayout", "./types/MediaGalleryLayout", "./types/MediaGalleryMenuHorizontalAlign", "./types/MediaGalleryMenuVerticalAlign", "./generated/templates/MediaGalleryTemplate.lit", "./generated/themes/MediaGallery.css"], function (_exports, _ItemNavigation, _ResizeHandler, _Device, _MediaRange, _LitRenderer, _Integer, _NavigationMode, _UI5Element, _Button, _Carousel, _MediaGalleryItem, _MediaGalleryItemLayout, _MediaGalleryLayout, _MediaGalleryMenuHorizontalAlign, _MediaGalleryMenuVerticalAlign, _MediaGalleryTemplate, _MediaGallery) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _MediaRange = _interopRequireDefault(_MediaRange);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _NavigationMode = _interopRequireDefault(_NavigationMode);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _Button = _interopRequireDefault(_Button);
  _Carousel = _interopRequireDefault(_Carousel);
  _MediaGalleryItem = _interopRequireDefault(_MediaGalleryItem);
  _MediaGalleryItemLayout = _interopRequireDefault(_MediaGalleryItemLayout);
  _MediaGalleryLayout = _interopRequireDefault(_MediaGalleryLayout);
  _MediaGalleryMenuHorizontalAlign = _interopRequireDefault(_MediaGalleryMenuHorizontalAlign);
  _MediaGalleryMenuVerticalAlign = _interopRequireDefault(_MediaGalleryMenuVerticalAlign);
  _MediaGalleryTemplate = _interopRequireDefault(_MediaGalleryTemplate);
  _MediaGallery = _interopRequireDefault(_MediaGallery);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Template

  // Styles

  // The allowed number of thumbnail columns on each size
  // (relevant when <code>showAllThumbnails</code> is enabled)
  const COLUMNS_COUNT = {
    "S": 1,
    "M": 2,
    "L": 3,
    "XL": 4
  };

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-media-gallery",
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.fiori.MediaGallery.prototype */{
      /**
       * Defines the component items.
       *
       * <br><br>
       * <b>Note:</b> Only one selected item is allowed.
       *
       * <br><br>
       * <b>Note:</b> Use the <code>ui5-media-gallery-item</code> component to define the desired items.
       *
       * @type {sap.ui.webcomponents.fiori.IMediaGalleryItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement,
        individualSlots: true,
        invalidateOnChildChange: true
      }
    },
    properties: /** @lends sap.ui.webcomponents.fiori.MediaGallery.prototype */{
      /**
       * If set to <code>true</code>, all thumbnails are rendered in a scrollable container.
       * If <code>false</code>, only up to five thumbnails are rendered, followed by
       * an overflow button that shows the count of the remaining thumbnails.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showAllThumbnails: {
        type: Boolean
      },
      /**
       * If enabled, a <code>display-area-click</code> event is fired
       * when the user clicks or taps on the display area.
       * <br>
       * The display area is the central area that contains
       * the enlarged content of the currently selected item.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      interactiveDisplayArea: {
        type: Boolean
      },
      /**
       * Determines the layout of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Auto</code></li>
       * <li><code>Vertical</code></li>
       * <li><code>Horizontal</code></li>
       * </ul>
       *
       * @type {MediaGalleryLayout}
       * @defaultvalue "Auto"
       * @public
       */
      layout: {
        type: _MediaGalleryLayout.default,
        defaultValue: "Auto"
      },
      /**
       * Determines the horizontal alignment of the thumbnails menu
       * vs. the central display area.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Left</code></li>
       * <li><code>Right</code></li>
       * </ul>
       *
       * @type {MediaGalleryMenuHorizontalAlign}
       * @defaultvalue "Left"
       * @public
       */
      menuHorizontalAlign: {
        type: _MediaGalleryMenuHorizontalAlign.default,
        defaultValue: _MediaGalleryMenuHorizontalAlign.default.Left
      },
      /**
       * Determines the vertical alignment of the thumbnails menu
       * vs. the central display area.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Top</code></li>
       * <li><code>Bottom</code></li>
       * </ul>
       *
       * @type {MediaGalleryMenuVerticalAlign}
       * @defaultvalue "Bottom"
       * @public
       */
      menuVerticalAlign: {
        type: _MediaGalleryMenuVerticalAlign.default,
        defaultValue: _MediaGalleryMenuVerticalAlign.default.Bottom
      },
      /**
       * Determines the actual applied layout type
       * (esp. needed when the app did not specify a fixed layout type
       * but selected <code>Auto</code> layout type).
       * <br><br>
       * Possible values are:
       * <ul>
       * <li><code>Vertical</code></li>
       * <li><code>Horizontal</code></li>
       * </ul>
       *
       * @type {MediaGalleryLayout}
       * @defaultvalue "Vertical"
       * @private
       */
      effectiveLayout: {
        type: _MediaGalleryLayout.default,
        defaultValue: "Vertical"
      },
      /**
       * Defines the current media query size.
       *
       * @private
       */
      mediaRange: {
        type: String
      },
      /**
       * The number of items in the overflow.
       *
       * @private
       */
      _overflowSize: {
        type: _Integer.default,
        noAttribute: true,
        defaultValue: 0
      }
    },
    events: /** @lends sap.ui.webcomponents.fiori.MediaGallery.prototype */{
      /**
       * Fired when selection is changed by user interaction.
       *
       * @event sap.ui.webcomponents.fiori.MediaGallery#selection-change
       * @param {HTMLElement} item the selected item.
       * @public
       */
      "selection-change": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },
      /**
       * Fired when the thumbnails overflow button is clicked.
       *
       * @event sap.ui.webcomponents.fiori.MediaGallery#overflow-click
       * @public
       */
      "overflow-click": {},
      /**
       * Fired when the display area is clicked.<br>
       * The display area is the central area that contains
       * the enlarged content of the currently selected item.
       *
       * @event sap.ui.webcomponents.fiori.MediaGallery#display-area-click
       * @public
       */
      "display-area-click": {}
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-media-gallery</code> component allows the user to browse through multimedia items. Currently,
   * the supported items are images and videos. The items should be defined using the <code>ui5-media-gallery-item</code>
   * component.
   *
   * The items are initially displayed as thumbnails. When the user selects a thumbnail, the corresponding item
   * is displayed in larger size.
   * <br>
   * The component is responsive by default and adjusts the position of the menu with respect to viewport size,
   * but the application is able to further customize the layout via the provided API.
   *
  * <h3>Keyboard Handling</h3>
   * The <code>ui5-media-gallery</code> provides advanced keyboard handling.
   * <br>
   * When the thumbnails menu is focused the following keyboard
   * shortcuts allow the user to navigate through the thumbnail items:
   * <br>
   *
   * <ul>
   * <li>[UP/DOWN] - Navigates up and down the items</li>
   * <li>[HOME] - Navigates to first item</li>
   * <li>[END] - Navigates to the last item</li>
   * <li>[SPACE/ENTER] - Select an item
   * </ul>
   * <br>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/MediaGallery";</code>
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/MediaGalleryItem";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.MediaGallery
   * @extends UI5Element
   * @tagname ui5-media-gallery
   * @appenddocs MediaGalleryItem
   * @public
   * @since 1.1.0
   */
  class MediaGallery extends _UI5Element.default {
    constructor() {
      super();
      this._onResize = this._updateLayout.bind(this);
      this._selectedItem = null;
      this._initItemNavigation();
    }
    onEnterDOM() {
      !(0, _Device.isPhone)() && _ResizeHandler.default.register(this, this._onResize);
    }
    onExitDOM() {
      !(0, _Device.isPhone)() && _ResizeHandler.default.deregister(this, this._onResize);
    }
    onAfterRendering() {
      this._updateLayout();
      this._updateSelection();
    }
    _initItemNavigation() {
      if (!this._itemNavigation) {
        this._itemNavigation = new _ItemNavigation.default(this, {
          navigationMode: _NavigationMode.default.Auto,
          getItemsCallback: () => this._getFocusableItems()
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
      this.mediaRange = _MediaRange.default.getCurrentRange(_MediaRange.default.RANGESETS.RANGE_4STEPS, width);
    }
    _updateLayout() {
      const rootNode = this.getDomRef(),
        height = rootNode.offsetHeight,
        width = rootNode.offsetWidth;
      if (!width || !height || (0, _Device.isPhone)()) {
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
      let columnHeight, columnsCount;
      if (this.showAllThumbnails) {
        return 0;
      }
      if (this.effectiveLayout === _MediaGalleryLayout.default.Horizontal) {
        columnHeight = height - marginSize;
        columnsCount = this.showAllThumbnails ? COLUMNS_COUNT[this.mediaRange] : 1;
      } else {
        columnHeight = width - marginSize * 2; // column is flexed to appear as a row in this case
        columnsCount = 1;
      }
      return this._getOverflowSize(columnHeight, columnsCount);
    }
    _toggleDisplaySquareSize(enable) {
      this._display.style.width = ""; // restore default width

      if (enable) {
        const marginSize = MediaGallery.THUMBNAIL_MARGIN,
          width = this._display.offsetWidth;
        let availableHeight = this.getDomRef().offsetHeight - 2 * marginSize;
        if (this.effectiveLayout === _MediaGalleryLayout.default.Vertical) {
          availableHeight -= MediaGallery.THUMBNAIL_HEIGHT + marginSize;
        }
        if (width > availableHeight) {
          // set to square
          this._display.style.width = `${availableHeight}px`;
        }
      }
    }
    _toggleMainItem9x16size(enable) {
      if (!this._mainItem) {
        return;
      }
      const width = this._mainItem.offsetWidth,
        contentHeight = enable ? `${width / 16 * 9}px` : "";
      this._mainItem.contentHeight = contentHeight;
    }
    _infereffectiveLayout() {
      if (this.layout === _MediaGalleryLayout.default.Auto) {
        return this._isPhoneSize ? _MediaGalleryLayout.default.Vertical : _MediaGalleryLayout.default.Horizontal;
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
      return overflowSize + 1; // overflow 1 extra item to make room for overflow btn as well
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
        this.fireEvent("selection-change", {
          item
        });
      }
      if ((0, _Device.isPhone)()) {
        this._selectItemOnPhone(item);
      } else {
        this._displayContent(item);
      }
    }
    _updateSelectedFlag(itemToSelect) {
      this.items.forEach(next => {
        next.selected = false;
      });
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
        this._selectItem(item, true /* userInteraction */);
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
      this.fireEvent("selection-change", {
        item
      });
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
      return (0, _Device.isPhone)();
    }
    get _showThumbnails() {
      return !(0, _Device.isPhone)();
    }
    get _showOverflowBtn() {
      return this._overflowSize > 0;
    }
    get _isPhoneSize() {
      return this.mediaRange === "S";
    }
    get _mainItemHasWideLayout() {
      return this._mainItem && this._mainItem.layout === _MediaGalleryItemLayout.default.Wide;
    }
    get _shouldHaveWideDisplay() {
      return this._mainItemHasWideLayout && this.showAllThumbnails && this.effectiveLayout === _MediaGalleryLayout.default.Horizontal;
    }
    get _shouldHaveSquareDisplay() {
      // by default it should be square
      // with the only exception when a wide 9*16 item should be displayed
      return !this._shouldHaveWideDisplay;
    }
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _MediaGalleryTemplate.default;
    }
    static get staticAreaTemplate() {
      return _MediaGalleryTemplate.default;
    }
    static get styles() {
      return [_MediaGallery.default];
    }
    static get staticAreaStyles() {
      return null;
    }
    static get dependencies() {
      return [_MediaGalleryItem.default, _Button.default, _Carousel.default];
    }
    static get THUMBNAIL_HEIGHT() {
      return 80; // px
    }

    static get THUMBNAIL_MARGIN() {
      return 16; // px
    }
  }

  MediaGallery.define();
  var _default = MediaGallery;
  _exports.default = _default;
});