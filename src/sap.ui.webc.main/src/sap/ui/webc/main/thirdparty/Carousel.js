sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "./generated/i18n/i18n-defaults", "./types/CarouselArrowsPlacement", "./generated/templates/CarouselTemplate.lit", "sap/ui/webc/common/thirdparty/icons/slim-arrow-left", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./Button", "./Label", "./generated/themes/Carousel.css"], function (_exports, _UI5Element, _LitRenderer, _Integer, _Keys, _i18nBundle, _ScrollEnablement, _ResizeHandler, _Render, _Device, _AnimationMode, _AnimationMode2, _i18nDefaults, _CarouselArrowsPlacement, _CarouselTemplate, _slimArrowLeft, _slimArrowRight, _Button, _Label, _Carousel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _ScrollEnablement = _interopRequireDefault(_ScrollEnablement);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _CarouselArrowsPlacement = _interopRequireDefault(_CarouselArrowsPlacement);
  _CarouselTemplate = _interopRequireDefault(_CarouselTemplate);
  _Button = _interopRequireDefault(_Button);
  _Label = _interopRequireDefault(_Label);
  _Carousel = _interopRequireDefault(_Carousel);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-carousel",
    languageAware: true,
    fastNavigation: true,
    properties:
    /** @lends sap.ui.webcomponents.main.Carousel.prototype */
    {
      /**
       * Defines whether the carousel should loop, i.e show the first page after the last page is reached and vice versa.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      cyclic: {
        type: Boolean
      },

      /**
       * Defines the number of items per page on small size (up to 640px). One item per page shown by default.
       * @type {Integer}
       * @defaultvalue 1
       * @public
       */
      itemsPerPageS: {
        type: _Integer.default,
        defaultValue: 1
      },

      /**
       * Defines the number of items per page on medium size (from 640px to 1024px). One item per page shown by default.
       * @type {Integer}
       * @defaultvalue 1
       * @public
       */
      itemsPerPageM: {
        type: _Integer.default,
        defaultValue: 1
      },

      /**
       * Defines the number of items per page on large size (more than 1024px). One item per page shown by default.
       * @type {Integer}
       * @defaultvalue 1
       * @public
       */
      itemsPerPageL: {
        type: _Integer.default,
        defaultValue: 1
      },

      /**
       * Defines the visibility of the navigation arrows.
       * If set to true the navigation arrows will be hidden.
       * <br><br>
       * <b>Note:</b> The navigation arrows are never displayed on touch devices.
       * In this case, the user can swipe to navigate through the items.
       * @type {boolean}
       * @since 1.0.0-rc.15
       * @defaultvalue false
       * @public
       */
      hideNavigationArrows: {
        type: Boolean
      },

      /**
       * Defines the visibility of the paging indicator.
       * If set to true the page indicator will be hidden.
       * @type {boolean}
       * @since 1.0.0-rc.15
       * @defaultvalue false
       * @public
       */
      hidePageIndicator: {
        type: Boolean
      },

      /**
       * Defines the index of the initially selected item.
       * @type {Integer}
       * @defaultvalue 0
       * @private
       */
      _selectedIndex: {
        type: _Integer.default,
        defaultValue: 0
      },

      /**
       * Defines the position of arrows.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Content</code></li>
       * <li><code>Navigation</code></li>
       * </ul>
       * <br>
       * When set to "Content", the arrows are placed on the sides of the current page.
       * <br>
       * When set to "Navigation", the arrows are placed on the sides of the page indicator.
       * @type {CarouselArrowsPlacement}
       * @defaultvalue "Content"
       * @public
       */
      arrowsPlacement: {
        type: _CarouselArrowsPlacement.default,
        defaultValue: _CarouselArrowsPlacement.default.Content
      },

      /**
       * Defines the carousel width in pixels.
       * @private
       */
      _width: {
        type: _Integer.default
      },

      /**
       * Defines the carousel item width in pixels.
       * @private
       */
      _itemWidth: {
        type: _Integer.default
      },

      /**
       * If set to true navigation arrows are shown.
       * @private
       * @since 1.0.0-rc.15
       */
      _visibleNavigationArrows: {
        type: Boolean,
        noAttribute: true
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Carousel.prototype */
    {
      /**
       * Defines the content of the component.
       * @type {HTMLElement[]}
       * @slot content
       * @public
       */
      "default": {
        propertyName: "content",
        type: HTMLElement,
        individualSlots: true
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Carousel.prototype */
    {
      /**
       * Fired whenever the page changes due to user interaction,
       * when the user clicks on the navigation arrows or while resizing,
       * based on the <code>items-per-page-l</code>, <code>items-per-page-m</code> and <code>items-per-page-s</code> properties.
       *
       * @event
       * @param {Integer} selectedIndex the current selected index
       * @public
       * @since 1.0.0-rc.7
       */
      navigate: {
        detail: {
          selectedIndex: {
            type: _Integer.default
          }
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The Carousel allows the user to browse through a set of items.
   * The component is mostly used for showing a gallery of images, but can hold any other HTML element.
   * <br>
   * There are several ways to perform navigation:
   * <ul>
   * <li>on desktop - the user can navigate using the navigation arrows or with keyboard shorcuts.</li>
   * <li>on mobile - the user can use swipe gestures.</li>
   * </ul>
   *
   * <h3>Usage</h3>
   *
   * <h4>When to use:</h4>
   *
   * <ul>
   * <li>The items you want to display are very different from each other.</li>
   * <li>You want to display the items one after the other.</li>
   * </ul>
   *
   * <h4>When not to use:</h4>
   *
   * <ul>
   * <li>The items you want to display need to be visible at the same time.</li>
   * <li>The items you want to display are uniform and very similar.</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Basic Navigation</h4>
   * When the <code>ui5-carousel</code> is focused the user can navigate between the items
   * with the following keyboard shortcuts:
   * <br>
   *
   * * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <ul>
   * <li>[UP/DOWN] - Navigates to previous and next item</li>
   * <li>[LEFT/RIGHT] - Navigates to previous and next item</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Carousel.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Carousel
   * @extends UI5Element
   * @tagname ui5-carousel
   * @since 1.0.0-rc.6
   * @public
   */

  class Carousel extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _Carousel.default;
    }

    static get template() {
      return _CarouselTemplate.default;
    }

    static get pageTypeLimit() {
      return 9;
    }

    constructor() {
      super();
      this._scrollEnablement = new _ScrollEnablement.default(this);

      this._scrollEnablement.attachEvent("touchend", event => {
        this._updateScrolling(event);
      });

      this._onResizeBound = this._onResize.bind(this);
      this._resizing = false; // indicates if the carousel is in process of resizing

      this._lastFocusedElements = [];
      this._orderOfLastFocusedPages = [];
    }

    onBeforeRendering() {
      if (this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation) {
        this._visibleNavigationArrows = true;
      }

      this.validateSelectedIndex();
    }

    onAfterRendering() {
      this._scrollEnablement.scrollContainer = this.getDomRef();
      this._resizing = false; // not invalidating
    }

    onEnterDOM() {
      _ResizeHandler.default.register(this, this._onResizeBound);
    }

    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._onResizeBound);
    }

    validateSelectedIndex() {
      if (!this.isIndexInRange(this._selectedIndex)) {
        this._selectedIndex = 0;
      }
    }

    _onResize() {
      const previousItemsPerPage = this.effectiveItemsPerPage; // Set the resizing flag to suppress animation while resizing

      this._resizing = true; // Change transitively effectiveItemsPerPage by modifying _width

      this._width = this.offsetWidth;
      this._itemWidth = Math.floor(this._width / this.effectiveItemsPerPage); // Items per page did not change or the current,
      // therefore page index does not need to be re-adjusted

      if (this.effectiveItemsPerPage === previousItemsPerPage) {
        return;
      }

      if (this._selectedIndex > this.pagesCount - 1) {
        this._selectedIndex = this.pagesCount - 1;
        this.fireEvent("navigate", {
          selectedIndex: this._selectedIndex
        });
      }
    }

    _updateScrolling(event) {
      if (!event) {
        return;
      }

      if (event.isLeft) {
        this.navigateLeft();
      } else if (event.isRight) {
        this.navigateRight();
      }
    }

    async _onkeydown(event) {
      if ((0, _Keys.isF7)(event)) {
        this._handleF7Key(event);

        return;
      }

      if (event.target !== this.getDomRef()) {
        return;
      }

      if ((0, _Keys.isLeft)(event) || (0, _Keys.isDown)(event)) {
        this.navigateLeft();
        await (0, _Render.renderFinished)();
        this.getDomRef().focus();
      } else if ((0, _Keys.isRight)(event) || (0, _Keys.isUp)(event)) {
        this.navigateRight();
        await (0, _Render.renderFinished)();
        this.getDomRef().focus();
      }
    }

    _onfocusin(event) {
      if (event.target === this.getDomRef()) {
        return;
      }

      let pageIndex = -1;

      for (let i = 0; i < this.content.length; i++) {
        if (this.content[i].contains(event.target)) {
          pageIndex = i;
          break;
        }
      }

      if (pageIndex === -1) {
        return;
      } // Save reference of the last focused element for each page


      this._lastFocusedElements[pageIndex] = event.target;

      const sortedPageIndex = this._orderOfLastFocusedPages.indexOf(pageIndex);

      if (sortedPageIndex === -1) {
        this._orderOfLastFocusedPages.unshift(pageIndex);
      } else {
        this._orderOfLastFocusedPages.splice(0, 0, this._orderOfLastFocusedPages.splice(sortedPageIndex, 1)[0]);
      }
    }

    _onmouseout() {
      if (this.arrowsPlacement === _CarouselArrowsPlacement.default.Content) {
        this._visibleNavigationArrows = false;
      }
    }

    _onmouseover() {
      if (this.arrowsPlacement === _CarouselArrowsPlacement.default.Content) {
        this._visibleNavigationArrows = true;
      }
    }

    _handleF7Key(event) {
      const lastFocusedElement = this._lastFocusedElements[this._getLastFocusedActivePageIndex];

      if (event.target === this.getDomRef() && lastFocusedElement) {
        lastFocusedElement.focus();
      } else {
        this.getDomRef().focus();
      }
    }

    get _getLastFocusedActivePageIndex() {
      for (let i = 0; i < this._orderOfLastFocusedPages.length; i++) {
        const pageIndex = this._orderOfLastFocusedPages[i];

        if (this.isItemInViewport(pageIndex)) {
          return pageIndex;
        }
      }

      return this._selectedIndex;
    }

    navigateLeft() {
      this._resizing = false;
      const previousSelectedIndex = this._selectedIndex;

      if (this._selectedIndex - 1 < 0) {
        if (this.cyclic) {
          this._selectedIndex = this.pagesCount - 1;
        }
      } else {
        --this._selectedIndex;
      }

      if (previousSelectedIndex !== this._selectedIndex) {
        this.fireEvent("navigate", {
          selectedIndex: this._selectedIndex
        });
      }
    }

    navigateRight() {
      this._resizing = false;
      const previousSelectedIndex = this._selectedIndex;

      if (this._selectedIndex + 1 > this.pagesCount - 1) {
        if (this.cyclic) {
          this._selectedIndex = 0;
        } else {
          return;
        }
      } else {
        ++this._selectedIndex;
      }

      if (previousSelectedIndex !== this._selectedIndex) {
        this.fireEvent("navigate", {
          selectedIndex: this._selectedIndex
        });
      }
    }

    _navButtonClick(event) {
      if (event.target.hasAttribute("arrow-forward")) {
        this.navigateRight();
      } else {
        this.navigateLeft();
      }

      this.focus();
    }
    /**
     * Changes the currently displayed page.
     * @param {Integer} itemIndex The index of the target page
     * @since 1.0.0-rc.15
     * @public
     */


    navigateTo(itemIndex) {
      this._resizing = false;
      this._selectedIndex = itemIndex;
    }
    /**
     * Assuming that all items have the same width
     * @private
     */


    get items() {
      return this.content.map((item, idx) => {
        const visible = this.isItemInViewport(idx);
        return {
          id: `${this._id}-carousel-item-${idx + 1}`,
          item,
          tabIndex: visible ? "0" : "-1",
          posinset: idx + 1,
          setsize: this.content.length,
          styles: {
            width: `${this._itemWidth}px`
          },
          classes: visible ? "" : "ui5-carousel-item--hidden"
        };
      });
    }

    get effectiveItemsPerPage() {
      if (this._width <= 640) {
        return this.itemsPerPageS;
      }

      if (this._width <= 1024) {
        return this.itemsPerPageM;
      }

      return this.itemsPerPageL;
    }

    isItemInViewport(index) {
      return index >= this._selectedIndex && index <= this._selectedIndex + this.effectiveItemsPerPage - 1;
    }

    isIndexInRange(index) {
      return index >= 0 && index <= this.pagesCount - 1;
    }
    /**
     * @private
     */


    get renderNavigation() {
      if (!this.hasManyPages) {
        return false;
      }

      if (this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation && !this.hideNavigationArrows) {
        return true;
      }

      if (this.hidePageIndicator) {
        return false;
      }

      return true;
    }

    get hasManyPages() {
      return this.pagesCount > 1;
    }

    get styles() {
      return {
        content: {
          transform: `translateX(${this._isRTL ? "" : "-"}${this._selectedIndex * this._itemWidth}px`
        }
      };
    }

    get classes() {
      return {
        viewport: {
          "ui5-carousel-viewport": true,
          "ui5-carousel-viewport--single": this.pagesCount === 1
        },
        content: {
          "ui5-carousel-content": true,
          "ui5-carousel-content-no-animation": this.suppressAnimation,
          "ui5-carousel-content-has-navigation": this.renderNavigation,
          "ui5-carousel-content-has-navigation-and-buttons": this.renderNavigation && this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation && !this.hideNavigationArrows
        },
        navigation: {
          "ui5-carousel-navigation-wrapper": true,
          "ui5-carousel-navigation-with-buttons": this.renderNavigation && this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation && !this.hideNavigationArrows
        },
        navPrevButton: {
          "ui5-carousel-navigation-button--hidden": !this.hasPrev
        },
        navNextButton: {
          "ui5-carousel-navigation-button--hidden": !this.hasNext
        }
      };
    }

    get pagesCount() {
      const items = this.content.length;
      return items > this.effectiveItemsPerPage ? items - this.effectiveItemsPerPage + 1 : 1;
    }

    get isPageTypeDots() {
      return this.pagesCount < Carousel.pageTypeLimit;
    }

    get dots() {
      const dots = [];
      const pages = this.pagesCount;

      for (let index = 0; index < pages; index++) {
        dots.push({
          active: index === this._selectedIndex,
          ariaLabel: Carousel.i18nBundle.getText(_i18nDefaults.CAROUSEL_DOT_TEXT, index + 1, pages)
        });
      }

      return dots;
    }

    get arrows() {
      const showArrows = this._visibleNavigationArrows && this.hasManyPages && (0, _Device.isDesktop)();
      return {
        content: !this.hideNavigationArrows && showArrows && this.arrowsPlacement === _CarouselArrowsPlacement.default.Content,
        navigation: !this.hideNavigationArrows && showArrows && this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation
      };
    }

    get hasPrev() {
      return this.cyclic || this._selectedIndex - 1 >= 0;
    }

    get hasNext() {
      return this.cyclic || this._selectedIndex + 1 <= this.pagesCount - 1;
    }

    get suppressAnimation() {
      return this._resizing || (0, _AnimationMode2.getAnimationMode)() === _AnimationMode.default.None;
    }

    get _isRTL() {
      return this.effectiveDir === "rtl";
    }

    get selectedIndexToShow() {
      return this._isRTL ? this.pagesCount - (this.pagesCount - this._selectedIndex) + 1 : this._selectedIndex + 1;
    }

    get ofText() {
      return Carousel.i18nBundle.getText(_i18nDefaults.CAROUSEL_OF_TEXT);
    }

    get ariaActiveDescendant() {
      return this.content.length ? `${this._id}-carousel-item-${this._selectedIndex + 1}` : undefined;
    }

    get nextPageText() {
      return Carousel.i18nBundle.getText(_i18nDefaults.CAROUSEL_NEXT_ARROW_TEXT);
    }

    get previousPageText() {
      return Carousel.i18nBundle.getText(_i18nDefaults.CAROUSEL_PREVIOUS_ARROW_TEXT);
    }
    /**
     * The indices of the currently visible items of the component.
     * @readonly
     * @since 1.0.0-rc.15
     * @returns {Integer[]} the indices of the visible items
     */


    get visibleItemsIndices() {
      const visibleItemsIndices = [];
      this.items.forEach((item, index) => {
        if (this.isItemInViewport(index)) {
          visibleItemsIndices.push(index);
        }
      });
      return visibleItemsIndices;
    }

    static get dependencies() {
      return [_Button.default, _Label.default];
    }

    static async onDefine() {
      Carousel.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  Carousel.define();
  var _default = Carousel;
  _exports.default = _default;
});