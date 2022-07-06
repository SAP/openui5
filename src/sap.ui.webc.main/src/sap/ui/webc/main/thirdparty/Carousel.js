sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', './generated/i18n/i18n-defaults', './types/CarouselArrowsPlacement', './generated/templates/CarouselTemplate.lit', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-left', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-right', './Button', './Label', './generated/themes/Carousel.css'], function (UI5Element, litRender, Integer, Keys, i18nBundle, ScrollEnablement, ResizeHandler, Render, Device, AnimationMode$1, AnimationMode, i18nDefaults, CarouselArrowsPlacement, CarouselTemplate_lit, slimArrowLeft, slimArrowRight, Button, Label, Carousel_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ScrollEnablement__default = /*#__PURE__*/_interopDefaultLegacy(ScrollEnablement);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);

	const metadata = {
		tag: "ui5-carousel",
		languageAware: true,
		fastNavigation: true,
		properties:  {
			cyclic: {
				type: Boolean,
			},
			itemsPerPageS: {
				type: Integer__default,
				defaultValue: 1,
			},
			itemsPerPageM: {
				type: Integer__default,
				defaultValue: 1,
			},
			itemsPerPageL: {
				type: Integer__default,
				defaultValue: 1,
			},
			hideNavigationArrows: {
				type: Boolean,
			},
			hidePageIndicator: {
				type: Boolean,
			},
			_selectedIndex: {
				type: Integer__default,
				defaultValue: 0,
			},
			arrowsPlacement: {
				type: CarouselArrowsPlacement,
				defaultValue: CarouselArrowsPlacement.Content,
			},
			_width: {
				type: Integer__default,
			},
			_itemWidth: {
				type: Integer__default,
			},
			_visibleNavigationArrows: {
				type: Boolean,
				noAttribute: true,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "content",
				type: HTMLElement,
				individualSlots: true,
			},
		},
		events:  {
			navigate: {
				detail: {
					selectedIndex: { type: Integer__default },
				},
			},
		},
	};
	class Carousel extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Carousel_css;
		}
		static get template() {
			return CarouselTemplate_lit;
		}
		static get pageTypeLimit() {
			return 9;
		}
		constructor() {
			super();
			this._scrollEnablement = new ScrollEnablement__default(this);
			this._scrollEnablement.attachEvent("touchend", event => {
				this._updateScrolling(event);
			});
			this._onResizeBound = this._onResize.bind(this);
			this._resizing = false;
			this._lastFocusedElements = [];
			this._orderOfLastFocusedPages = [];
		}
		onBeforeRendering() {
			if (this.arrowsPlacement === CarouselArrowsPlacement.Navigation) {
				this._visibleNavigationArrows = true;
			}
			this.validateSelectedIndex();
		}
		onAfterRendering() {
			this._scrollEnablement.scrollContainer = this.getDomRef();
			this._resizing = false;
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._onResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._onResizeBound);
		}
		validateSelectedIndex() {
			if (!this.isIndexInRange(this._selectedIndex)) {
				this._selectedIndex = 0;
			}
		}
		_onResize() {
			const previousItemsPerPage = this.effectiveItemsPerPage;
			this._resizing = true;
			this._width = this.offsetWidth;
			this._itemWidth = Math.floor(this._width / this.effectiveItemsPerPage);
			if (this.effectiveItemsPerPage === previousItemsPerPage) {
				return;
			}
			if (this._selectedIndex > this.pagesCount - 1) {
				this._selectedIndex = this.pagesCount - 1;
				this.fireEvent("navigate", { selectedIndex: this._selectedIndex });
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
			if (Keys.isF7(event)) {
				this._handleF7Key(event);
				return;
			}
			if (event.target !== this.getDomRef()) {
				return;
			}
			if (Keys.isLeft(event) || Keys.isDown(event)) {
				this.navigateLeft();
				await Render.renderFinished();
				this.getDomRef().focus();
			} else if (Keys.isRight(event) || Keys.isUp(event)) {
				this.navigateRight();
				await Render.renderFinished();
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
			}
			this._lastFocusedElements[pageIndex] = event.target;
			const sortedPageIndex = this._orderOfLastFocusedPages.indexOf(pageIndex);
			if (sortedPageIndex === -1) {
				this._orderOfLastFocusedPages.unshift(pageIndex);
			} else {
				this._orderOfLastFocusedPages.splice(0, 0, this._orderOfLastFocusedPages.splice(sortedPageIndex, 1)[0]);
			}
		}
		_onmouseout() {
			if (this.arrowsPlacement === CarouselArrowsPlacement.Content) {
				this._visibleNavigationArrows = false;
			}
		}
		_onmouseover() {
			if (this.arrowsPlacement === CarouselArrowsPlacement.Content) {
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
				this.fireEvent("navigate", { selectedIndex: this._selectedIndex });
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
				this.fireEvent("navigate", { selectedIndex: this._selectedIndex });
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
		navigateTo(itemIndex) {
			this._resizing = false;
			this._selectedIndex = itemIndex;
		}
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
						width: `${this._itemWidth}px`,
					},
					classes: visible ? "" : "ui5-carousel-item--hidden",
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
		get renderNavigation() {
			if (!this.hasManyPages) {
				return false;
			}
			if (this.arrowsPlacement === CarouselArrowsPlacement.Navigation && !this.hideNavigationArrows) {
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
					transform: `translateX(${this._isRTL ? "" : "-"}${this._selectedIndex * this._itemWidth}px`,
				},
			};
		}
		get classes() {
			return {
				viewport: {
					"ui5-carousel-viewport": true,
					"ui5-carousel-viewport--single": this.pagesCount === 1,
				},
				content: {
					"ui5-carousel-content": true,
					"ui5-carousel-content-no-animation": this.suppressAnimation,
					"ui5-carousel-content-has-navigation": this.renderNavigation,
					"ui5-carousel-content-has-navigation-and-buttons": this.renderNavigation && this.arrowsPlacement === CarouselArrowsPlacement.Navigation && !this.hideNavigationArrows,
				},
				navigation: {
					"ui5-carousel-navigation-wrapper": true,
					"ui5-carousel-navigation-with-buttons": this.renderNavigation && this.arrowsPlacement === CarouselArrowsPlacement.Navigation && !this.hideNavigationArrows,
				},
				navPrevButton: {
					"ui5-carousel-navigation-button--hidden": !this.hasPrev,
				},
				navNextButton: {
					"ui5-carousel-navigation-button--hidden": !this.hasNext,
				},
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
					ariaLabel: Carousel.i18nBundle.getText(i18nDefaults.CAROUSEL_DOT_TEXT, index + 1, pages),
				});
			}
			return dots;
		}
		get arrows() {
			const showArrows = this._visibleNavigationArrows && this.hasManyPages && Device.isDesktop();
			return {
				content: !this.hideNavigationArrows && showArrows && this.arrowsPlacement === CarouselArrowsPlacement.Content,
				navigation: !this.hideNavigationArrows && showArrows && this.arrowsPlacement === CarouselArrowsPlacement.Navigation,
			};
		}
		get hasPrev() {
			return this.cyclic || this._selectedIndex - 1 >= 0;
		}
		get hasNext() {
			return this.cyclic || this._selectedIndex + 1 <= this.pagesCount - 1;
		}
		get suppressAnimation() {
			return this._resizing || AnimationMode.getAnimationMode() === AnimationMode__default.None;
		}
		get _isRTL() {
			return this.effectiveDir === "rtl";
		}
		get selectedIndexToShow() {
			return this._isRTL ? this.pagesCount - (this.pagesCount - this._selectedIndex) + 1 : this._selectedIndex + 1;
		}
		get ofText() {
			return Carousel.i18nBundle.getText(i18nDefaults.CAROUSEL_OF_TEXT);
		}
		get ariaActiveDescendant() {
			return this.content.length ? `${this._id}-carousel-item-${this._selectedIndex + 1}` : undefined;
		}
		get nextPageText() {
			return Carousel.i18nBundle.getText(i18nDefaults.CAROUSEL_NEXT_ARROW_TEXT);
		}
		get previousPageText() {
			return Carousel.i18nBundle.getText(i18nDefaults.CAROUSEL_PREVIOUS_ARROW_TEXT);
		}
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
			return [
				Button,
				Label,
			];
		}
		static async onDefine() {
			Carousel.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	Carousel.define();

	return Carousel;

});
