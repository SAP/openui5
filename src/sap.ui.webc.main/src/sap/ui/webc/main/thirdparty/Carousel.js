sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "./generated/i18n/i18n-defaults", "./types/CarouselArrowsPlacement", "./types/CarouselPageIndicatorStyle", "./types/BackgroundDesign", "./types/BorderDesign", "./generated/templates/CarouselTemplate.lit", "sap/ui/webc/common/thirdparty/icons/slim-arrow-left", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./Button", "./Label", "./generated/themes/Carousel.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _Integer, _Keys, _i18nBundle, _ScrollEnablement, _ResizeHandler, _Render, _Device, _AnimationMode, _AnimationMode2, _i18nDefaults, _CarouselArrowsPlacement, _CarouselPageIndicatorStyle, _BackgroundDesign, _BorderDesign, _CarouselTemplate, _slimArrowLeft, _slimArrowRight, _Button, _Label, _Carousel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _ScrollEnablement = _interopRequireDefault(_ScrollEnablement);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _CarouselArrowsPlacement = _interopRequireDefault(_CarouselArrowsPlacement);
  _CarouselPageIndicatorStyle = _interopRequireDefault(_CarouselPageIndicatorStyle);
  _BackgroundDesign = _interopRequireDefault(_BackgroundDesign);
  _BorderDesign = _interopRequireDefault(_BorderDesign);
  _CarouselTemplate = _interopRequireDefault(_CarouselTemplate);
  _Button = _interopRequireDefault(_Button);
  _Label = _interopRequireDefault(_Label);
  _Carousel = _interopRequireDefault(_Carousel);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Carousel_1;

  // Styles

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
   * <ul>
   * <li>[UP/DOWN] - Navigates to previous and next item</li>
   * <li>[LEFT/RIGHT] - Navigates to previous and next item</li>
   * </ul>
   *
   * <h3>Fast Navigation</h3>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-carousel</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>content - Used to style the content of the component</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Carousel.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Carousel
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-carousel
   * @since 1.0.0-rc.6
   * @public
   */
  let Carousel = Carousel_1 = class Carousel extends _UI5Element.default {
    static get pageTypeLimit() {
      return 9;
    }
    constructor() {
      super();
      this._scrollEnablement = new _ScrollEnablement.default(this);
      this._scrollEnablement.attachEvent("touchend", e => {
        this._updateScrolling(e);
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
      const previousItemsPerPage = this.effectiveItemsPerPage;
      // Set the resizing flag to suppress animation while resizing
      this._resizing = true;
      // Change transitively effectiveItemsPerPage by modifying _width
      this._width = this.offsetWidth;
      this._itemWidth = Math.floor(this._width / this.effectiveItemsPerPage);
      // Items per page did not change or the current,
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
    _updateScrolling(e) {
      if (!e) {
        return;
      }
      if (e.isLeft) {
        this.navigateLeft();
      } else if (e.isRight) {
        this.navigateRight();
      }
    }
    async _onkeydown(e) {
      if ((0, _Keys.isF7)(e)) {
        this._handleF7Key(e);
        return;
      }
      if (e.target !== this.getDomRef()) {
        return;
      }
      if ((0, _Keys.isLeft)(e) || (0, _Keys.isDown)(e)) {
        this.navigateLeft();
        await (0, _Render.renderFinished)();
        this.getDomRef().focus();
      } else if ((0, _Keys.isRight)(e) || (0, _Keys.isUp)(e)) {
        this.navigateRight();
        await (0, _Render.renderFinished)();
        this.getDomRef().focus();
      }
    }
    _onfocusin(e) {
      const target = e.target;
      if (target === this.getDomRef()) {
        return;
      }
      let pageIndex = -1;
      for (let i = 0; i < this.content.length; i++) {
        if (this.content[i].contains(target)) {
          pageIndex = i;
          break;
        }
      }
      if (pageIndex === -1) {
        return;
      }
      // Save reference of the last focused element for each page
      this._lastFocusedElements[pageIndex] = target;
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
    _handleF7Key(e) {
      const lastFocusedElement = this._lastFocusedElements[this._getLastFocusedActivePageIndex];
      if (e.target === this.getDomRef() && lastFocusedElement) {
        lastFocusedElement.focus();
      } else {
        this.getDomRef().focus();
      }
    }
    get _backgroundDesign() {
      return this.backgroundDesign.toLowerCase();
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
    _navButtonClick(e) {
      const button = e.target;
      if (button.hasAttribute("arrow-forward")) {
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
     * @method
     * @name sap.ui.webc.main.Carousel#navigateTo
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
          posinset: `${idx + 1}`,
          setsize: `${this.content.length}`,
          styles: {
            width: `${this._itemWidth || 0}px`
          },
          classes: visible ? "" : "ui5-carousel-item--hidden"
        };
      });
    }
    get effectiveItemsPerPage() {
      if (!this._width) {
        return this.itemsPerPageL;
      }
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
      const items = this._itemWidth || 0;
      return {
        content: {
          transform: `translateX(${this._isRTL ? "" : "-"}${this._selectedIndex * items}px`
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
          "ui5-carousel-navigation-with-buttons": this.renderNavigation && this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation && !this.hideNavigationArrows,
          [`ui5-carousel-navigation-wrapper-bg-${this.pageIndicatorBackgroundDesign.toLowerCase()}`]: true,
          [`ui5-carousel-navigation-wrapper-border-${this.pageIndicatorBorderDesign.toLowerCase()}`]: true
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
      if (this.pageIndicatorStyle === _CarouselPageIndicatorStyle.default.Numeric) {
        return false;
      }
      return this.pagesCount < Carousel_1.pageTypeLimit;
    }
    get dots() {
      const dots = [];
      const pages = this.pagesCount;
      for (let index = 0; index < pages; index++) {
        dots.push({
          active: index === this._selectedIndex,
          ariaLabel: Carousel_1.i18nBundle.getText(_i18nDefaults.CAROUSEL_DOT_TEXT, index + 1, pages)
        });
      }
      return dots;
    }
    get showArrows() {
      const displayArrows = this._visibleNavigationArrows && this.hasManyPages && (0, _Device.isDesktop)();
      return {
        content: !this.hideNavigationArrows && displayArrows && this.arrowsPlacement === _CarouselArrowsPlacement.default.Content,
        navigation: !this.hideNavigationArrows && displayArrows && this.arrowsPlacement === _CarouselArrowsPlacement.default.Navigation
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
      return Carousel_1.i18nBundle.getText(_i18nDefaults.CAROUSEL_OF_TEXT);
    }
    get ariaActiveDescendant() {
      return this.content.length ? `${this._id}-carousel-item-${this._selectedIndex + 1}` : undefined;
    }
    get nextPageText() {
      return Carousel_1.i18nBundle.getText(_i18nDefaults.CAROUSEL_NEXT_ARROW_TEXT);
    }
    get previousPageText() {
      return Carousel_1.i18nBundle.getText(_i18nDefaults.CAROUSEL_PREVIOUS_ARROW_TEXT);
    }
    /**
     * The indices of the currently visible items of the component.
     * @public
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
    static async onDefine() {
      Carousel_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], Carousel.prototype, "cyclic", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1
  })], Carousel.prototype, "itemsPerPageS", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1
  })], Carousel.prototype, "itemsPerPageM", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1
  })], Carousel.prototype, "itemsPerPageL", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Carousel.prototype, "hideNavigationArrows", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Carousel.prototype, "hidePageIndicator", void 0);
  __decorate([(0, _property.default)({
    type: _CarouselPageIndicatorStyle.default,
    defaultValue: _CarouselPageIndicatorStyle.default.Default
  })], Carousel.prototype, "pageIndicatorStyle", void 0);
  __decorate([(0, _property.default)({
    type: _BackgroundDesign.default,
    defaultValue: _BackgroundDesign.default.Translucent
  })], Carousel.prototype, "backgroundDesign", void 0);
  __decorate([(0, _property.default)({
    type: _BackgroundDesign.default,
    defaultValue: _BackgroundDesign.default.Solid
  })], Carousel.prototype, "pageIndicatorBackgroundDesign", void 0);
  __decorate([(0, _property.default)({
    type: _BorderDesign.default,
    defaultValue: _BorderDesign.default.Solid
  })], Carousel.prototype, "pageIndicatorBorderDesign", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], Carousel.prototype, "_selectedIndex", void 0);
  __decorate([(0, _property.default)({
    type: _CarouselArrowsPlacement.default,
    defaultValue: _CarouselArrowsPlacement.default.Content
  })], Carousel.prototype, "arrowsPlacement", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], Carousel.prototype, "_width", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], Carousel.prototype, "_itemWidth", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Carousel.prototype, "_visibleNavigationArrows", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    individualSlots: true
  })], Carousel.prototype, "content", void 0);
  Carousel = Carousel_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-carousel",
    languageAware: true,
    fastNavigation: true,
    renderer: _LitRenderer.default,
    styles: _Carousel.default,
    template: _CarouselTemplate.default,
    dependencies: [_Button.default, _Label.default]
  })
  /**
   * Fired whenever the page changes due to user interaction,
   * when the user clicks on the navigation arrows or while resizing,
   * based on the <code>items-per-page-l</code>, <code>items-per-page-m</code> and <code>items-per-page-s</code> properties.
   *
   * @event sap.ui.webc.main.Carousel#navigate
   * @param {Integer} selectedIndex the current selected index
   * @public
   * @since 1.0.0-rc.7
   */, (0, _event.default)("navigate", {
    detail: {
      selectedIndex: {
        type: _Integer.default
      }
    }
  })], Carousel);
  Carousel.define();
  var _default = Carousel;
  _exports.default = _default;
});