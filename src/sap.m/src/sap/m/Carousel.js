/*!
 * ${copyright}
 */

// Provides control sap.m.Carousel.
sap.ui.define([
	"./library",
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Theming",
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/library",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"./CarouselRenderer",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/base/util/isPlainObject",
	"sap/m/ImageHelper",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/IconPool",
	"./CarouselLayout",
	// provides jQuery custom selector ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
], function(
	library,
	Localization,
	Control,
	Element,
	Theming,
	Device,
	Library,
	ResizeHandler,
	coreLibrary,
	IllustratedMessage,
	IllustratedMessageType,
	CarouselRenderer,
	KeyCodes,
	Log,
	isPlainObject,
	ImageHelper,
	jQuery
	/*, IconPool (indirect dependency, kept for compatibility with tests, to be fixed in ImageHelper) */
) {
	"use strict";

	//shortcut for sap.ui.core.BusyIndicatorSize
	var BusyIndicatorSize = coreLibrary.BusyIndicatorSize;

	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = library.CarouselArrowsPlacement;

	//shortcut for sap.m.CarouselPageIndicatorPlacementType
	var CarouselPageIndicatorPlacementType = library.CarouselPageIndicatorPlacementType;

	//shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	//shortcut for sap.m.BorderDesign
	var BorderDesign = library.BorderDesign;

	//shortcut for sap.m.CarouselScrollMode
	var CarouselScrollMode = library.CarouselScrollMode;

	var iDragRadius = 10;
	var iMoveRadius = 20;
	var bRtl = Localization.getRTL();

	function getCursorPosition(e) {
		e = e.originalEvent || e;
		var oTouches = e.touches && e.touches[0];

		return {
			x: oTouches ? oTouches.clientX : e.clientX,
			y: oTouches ? oTouches.clientY : e.clientY
		};
	}

	function translateX(element, delta) {
		element.style["transform"] = 'translate3d(' + delta + 'px, 0, 0)';
	}

	/**
	 * Constructor for a new Carousel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The carousel allows the user to browse through a set of items by swiping right or left.
	 * <h3>Overview</h3>
	 * The control is mostly used for showing a gallery of images, but can hold any sap.m control.
	 * <h3>Structure</h3>
	 * The carousel consists of a the following elements:
	 * <ul>
	 * <li>Content area - displays the different items.</li>
	 * <li>Navigation - arrows to the left and right for switching between items.</li>
	 * <li>(optional) Paging - indicator at the bottom to show the current position in the set.</li>
	 * </ul>
	 * The paging indicator can be configured as follows:
	 * <ul>
	 * <li><code>showPageIndicator</code> - determines if the indicator is displayed.</li>
	 * <li>If the pages are less than 9, the page indicator is represented with bullets.</li>
	 * <li>If the pages are 9 or more, the page indicator is numeric.</li>
	 * <li><code>pageIndicatorPlacement</code> - determines where the indicator is located. Default (<code>sap.m.CarouselPageIndicatorPlacementType.Bottom</code>) - below the content.</li>
	 *</ul>
	 * Additionally, you can also change the location of the navigation arrows.
	 * By setting <code>arrowsPlacement</code> to <code>sap.m.CarouselArrowsPlacement.PageIndicator</code>, the arrows will be located at the bottom by the paging indicator.
	 * Note: When the content is of type <code>sap.m.Image</code> add "Image" text at the end of the <code>"alt"</code> description in order to provide accessibility info for the UI element.
	 * <h3>Usage</h3>
	 * <h4> When to use</h4>
	 * <ul>
	 * <li>The items you want to display are very different from each other.</li>
	 * <li>You want to display the items one after the other.</li>
	 * </ul>
	 * <h4> When not to use</h4>
	 * <ul>
	 * <li>The items you want to display need to be visible at the same time.</li>
	 * <li>The items you want to display are uniform and very similar</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li>On touch devices, navigation is performed with swipe gestures (swipe right or swipe left).</li>
	 * <li>On desktop, navigation is done with the navigation arrows.</li>
	 * <li>The paging indicator (when activated) is visible on each form factor.</li>
	 * </ul>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Carousel
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/carousel/ Carousel}
	 */
	var Carousel = Control.extend("sap.m.Carousel", /** @lends sap.m.Carousel.prototype */ {
		metadata : {

			library : "sap.m",
			designtime: "sap/m/designtime/Carousel.designtime",
			properties : {
				/**
				 * The height of the carousel. Note that when a percentage value is used, the height of the surrounding container must be defined.
				 */
				height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

				/**
				 * The width of the carousel. Note that when a percentage value is used, the height of the surrounding container must be defined.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

				/**
				 * Defines whether the carousel should loop, i.e show the first page after the last page is reached and vice versa.
				 */
				loop : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Show or hide carousel's page indicator.
				 */
				showPageIndicator : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Defines where the carousel's page indicator is displayed.
				 * Possible values are sap.m.CarouselPageIndicatorPlacementType.Top, sap.m.CarouselPageIndicatorPlacementType.Bottom,
				 * CarouselPageIndicatorPlacementType.OverContentTop and CarouselPageIndicatorPlacementType.OverContentBottom.
				 *
				 * <b>Note:</b> when the page indicator is placed over the carousel's content (values "OverContentBottom" and "OverContentTop"),
				 * the properties <code>pageIndicatorBackgroundDesign</code> and <code>pageIndicatorBorderDesign</code> will not take effect.
				 *
				 * <b>Note:</b> We recommend using a page indicator placed over the carousel's content (values "OverContentBottom" and "OverContentTop")
				 * only if the content consists of images.
				 */
				pageIndicatorPlacement : {type : "sap.m.CarouselPageIndicatorPlacementType", group : "Appearance", defaultValue : CarouselPageIndicatorPlacementType.Bottom},

				/**
				 * Defines where the carousel's arrows are placed. Default is <code>sap.m.CarouselArrowsPlacement.Content</code> used to
				 * place the arrows on the sides of the carousel. Alternatively <code>sap.m.CarouselArrowsPlacement.PageIndicator</code> can
				 * be used to place the arrows on the sides of the page indicator.
				 */
				arrowsPlacement : {type : "sap.m.CarouselArrowsPlacement", group : "Appearance", defaultValue : CarouselArrowsPlacement.Content},

				/**
				 * Defines the carousel's background design. Default is <code>sap.m.BackgroundDesign.Translucent</code>.
				 * @public
				 * @since 1.110
				 */
				backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Translucent},

				/**
				 * Defines the carousel page indicator background design. Default is <code>sap.m.BackgroundDesign.Solid</code>.
				 * @public
				 * @since 1.115
				 */
				pageIndicatorBackgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid},

				/**
				 * Defines the carousel page indicator border design. Default is <code>sap.m.BorderDesign.Solid</code>.
				 * @public
				 * @since 1.115
				 */
				pageIndicatorBorderDesign : {type : "sap.m.BorderDesign", group : "Appearance", defaultValue : BorderDesign.Solid}
			},
			defaultAggregation : "pages",
			aggregations : {

				/**
				 * The content which the carousel displays.
				 */
				pages : {type : "sap.ui.core.Control", multiple : true, singularName : "page"},

				/**
				 * Defines how many pages are displayed in the visible area of the <code>Carousel</code> control.
				 *
				 * <b>Note:</b> When this property is used, the <code>loop</code> property is ignored.
				 * @since 1.62
				 */
				customLayout: { type: "sap.m.CarouselLayout", multiple: false },

				/**
				 * Message page, that is shown when no pages are loaded or provided
				 */
				_emptyPage: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" }
			},
			associations : {

				/**
				 * Provides getter and setter for the currently displayed page. For the setter, argument may be the control itself, which must be member of the carousel's page list, or the control's id.
				 * The getter will return the control id
				 */
				activePage : {type : "sap.ui.core.Control", multiple : false},

				/**
				 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
				 * @since 1.125
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"
				}
			},
			events : {
				/**
				 * This event is fired after a carousel swipe has been completed.
				 * It is triggered both by physical swipe events and through API carousel manipulations such as calling
				 * 'next', 'previous' or 'setActivePage' functions.
				 */
				pageChanged : {
					parameters : {

						/**
						 * ID of the page which was active before the page change.
						 */
						oldActivePageId : {type : "string"},

						/**
						 * ID of the page which will be active after the page change.
						 */
						newActivePageId : {type : "string"},

						/**
						 * Indexes of all active pages after the page change.
						 * @since 1.62
						 */
						activePages : {type : "array"}
					}
				},

				/**
				 * This event is fired before a carousel swipe has been completed.
				 * It is triggered both by physical swipe events and through API carousel manipulations such as calling
				 * 'next', 'previous' or 'setActivePage' functions.
				 */
				beforePageChanged : {
					parameters : {

						/**
						 * Indexes of all active pages after the page change.
						 * @since 1.63
						 */
						activePages : {type : "array"}
					}
				}
			}
		},

		renderer: CarouselRenderer
	});

	//Constants convenient class selections
	Carousel._INNER_SELECTOR = ".sapMCrslInner";
	Carousel._PAGE_INDICATOR_SELECTOR = ".sapMCrslBulleted";
	Carousel._PAGE_INDICATOR_ARROWS_SELECTOR = ".sapMCrslIndicatorArrow";
	Carousel._CONTROLS = ".sapMCrslControls";
	Carousel._ITEM_SELECTOR = ".sapMCrslItem";
	Carousel._LEFTMOST_CLASS = "sapMCrslLeftmost";
	Carousel._RIGHTMOST_CLASS = "sapMCrslRightmost";
	Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING = 10; // The number 10 is by keyboard specification
	Carousel._BULLETS_TO_NUMBERS_THRESHOLD = 9; //The number 9 is by visual specification. Less than 9 pages - bullets for page indicator. 9 or more pages - numeric page indicator.

	/**
	 * Initialize member variables which are needed later on.
	 *
	 * @private
	 */
	Carousel.prototype.init = function() {
		this._aAllActivePages = [];
		this._aAllActivePagesIndexes = [];
		this._iFocusedPageIndex = -1;
		this._bShouldFireEvent = true;
		this._handleThemeAppliedBound = this._handleThemeApplied.bind(this);

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._oRb = Library.getResourceBundleFor("sap.m");
	};

	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	Carousel.prototype.exit = function() {
		if (this._oArrowLeft) {
			this._oArrowLeft.destroy();
			delete this._oArrowLeft;
		}
		if (this._oArrowRight) {
			this._oArrowRight.destroy();
			delete this._oArrowRight;
		}

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		this.$().off('afterSlide');

		this._aAllActivePages = null;
		this._aAllActivePagesIndexes = null;

		if (this._bThemeAppliedAttached) {
			Theming.detachApplied(this._handleThemeAppliedBound);
			this._bThemeAppliedAttached = false;
		}
	};

	Carousel.prototype.onBeforeRendering = function() {
		if (!this.getActivePage() && this.getPages().length > 0) {
			//if no active page is specified, set first page.
			this.setAssociation("activePage", this.getPages()[0].getId(), true);
		}

		var sActivePage = this.getActivePage();

		if (sActivePage) {
			this._updateActivePages(sActivePage);

			if (this._iFocusedPageIndex === -1) {
				this._iFocusedPageIndex = this._aAllActivePagesIndexes[0];
			}
		}

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		return this;
	};

	Carousel.prototype._resize = function() {
		var $inner = this.$().find('> .sapMCrslInner');

		if (this._iResizeTimeoutId) {
			clearTimeout(this._iResizeTimeoutId);
			delete this._iResizeTimeoutId;
		}

		$inner.addClass("sapMCrslNoTransition");
		$inner.addClass("sapMCrslHideNonActive");

		if (this.getPages().length > 1) {
			this._setWidthOfPages(this._getNumberOfItemsToShow());
		}

		this._updateTransformValue();

		this._iResizeTimeoutId = setTimeout(function () {
			$inner.removeClass("sapMCrslNoTransition");
			$inner.removeClass("sapMCrslHideNonActive");
		});
	};

	/**
	 * Returns the number of items displayed in <code>Carousel</code>, depending on the <code>CarouselLayout</code> aggregation settings and pages count.
	 *
	 * @private
	 */
	Carousel.prototype._getNumberOfItemsToShow = function () {
		var iPagesCount = this.getPages().length,
			oCarouselLayout = this.getCustomLayout(),
			iNumberOfItemsToShow = 1;

		// If someone sets visiblePagesCount <= 0 to the CarouselLayout aggregation, the default value of 1 is returned instead.
		if (oCarouselLayout && oCarouselLayout.isA("sap.m.CarouselLayout")) {
			iNumberOfItemsToShow = Math.max(oCarouselLayout.getVisiblePagesCount(), 1);
		}

		// Carousel cannot show more items than its total pages count
		if (iNumberOfItemsToShow > 1 && iPagesCount < iNumberOfItemsToShow) {
			return iPagesCount;
		}

		return iNumberOfItemsToShow;
	};

	/**
	 * When this method is called for the first time, a swipe-view instance is created which is renders
	 * itself into its dedicated spot within the DOM tree. This instance is used throughout the
	 * Carousel instance's lifecycle.
	 *
	 * @private
	 */
	Carousel.prototype.onAfterRendering = function() {
		var iActivePageIndex = this._getActivePageIndex();
		var $innerDiv = this.$().find(Carousel._INNER_SELECTOR)[0];
		var iPagesLength = this.getPages().length;
		if (!iPagesLength) {
			return;
		}

		this._iCurrSlideIndex = Math.min(iActivePageIndex, iPagesLength - this._getNumberOfItemsToShow());

		if (this.getPages().length &&
			this.getPages()[this._getPageIndex(this.getActivePage())].getId() !== this.getActivePage()) {
			this.setAssociation("activePage", this.getPages()[iActivePageIndex].getId(), true);
		}

		if (!this._bThemeAppliedAttached) {
			this._bThemeAppliedAttached = true;
			Theming.attachApplied(this._handleThemeAppliedBound);
		}

		this._sResizeListenerId = ResizeHandler.register($innerDiv, this._resize.bind(this));
	};

	Carousel.prototype.getFocusDomRef = function () {
		if (!this.getPages().length) {
			return this.getDomRef("noData");
		}

		if (this._iFocusedPageIndex === -1) {
			return null;
		}

		const sPageId = this.getPages()[this._iFocusedPageIndex].getId();

		return this.getDomRef(sPageId + "-slide");
	};

	/**
	 * Fired when the theme is changed.
	 *
	 * @private
	 */
	Carousel.prototype._handleThemeApplied = function () {
		this._initialize();
		Theming.detachApplied(this._handleThemeAppliedBound);
		this._bThemeAppliedAttached = false;
	};

	/**
	 * Calls logic for updating active pages and fires 'beforePageChanged' event with the new active pages.
	 *
	 * @param {int} iPreviousSlide carousel index of the previous active slide
	 * @param {int} iNextSlide carousel index of the next active slide
	 * @private
	 */
	Carousel.prototype._onBeforePageChanged = function (iPreviousSlide, iNextSlide) {
		var sNewActivePageId = this.getPages()[iNextSlide].getId();
		this._updateActivePages(sNewActivePageId);

		this.fireBeforePageChanged({
			activePages: this._aAllActivePagesIndexes
		});
	};

	/**
	 * Sets the width of the visible pages, rendered in the <code>Carousel</code> control.
	 *
	 * @param {int} iNumberOfItemsToShow number of items to be shown from 'pages' aggregation.
	 * @private
	 */
	Carousel.prototype._setWidthOfPages = function (iNumberOfItemsToShow) {
		var $items = this.$().find(".sapMCrslItem"),
			iItemWidth;

		if (!$items.length) {
			// pages are not yet rendered, calculation will be done in the next onAfterRendering
			return;
		}

		iItemWidth = this._calculatePagesWidth(iNumberOfItemsToShow);

		$items.each(function (iIndex, oPage) {
			oPage.style.width = iItemWidth  + "%";
		});
	};

	/**
	 * Calculates the correct width of the visible pages, rendered in the <code>Carousel</code> control.
	 *
	 * @param {int} iNumberOfItemsToShow number of items to be shown from 'pages' aggregation.
	 * @returns {float} width of each page in percentage
	 * @private
	 */
	Carousel.prototype._calculatePagesWidth = function (iNumberOfItemsToShow) {
		var iWidth = this.$().width(),
			oSlide = this.getDomRef().querySelector(".sapMCrslFluid .sapMCrslItem"),
			iMargin = parseFloat(window.getComputedStyle(oSlide).marginRight),
			iItemWidth = (iWidth - (iMargin * (iNumberOfItemsToShow - 1))) / iNumberOfItemsToShow,
			iItemWidthPercent = (iItemWidth / iWidth) * 100;

		return iItemWidthPercent;
	};

	/**
	 * Moves carousel to specific slide and changes the active page after the move has been completed.
	 * Each  carousel slide can hold multiple carousel pages.
	 *
	 * @param {int} iNewIndex index of the new active slide
	 * @private
	 */
	Carousel.prototype._moveToPage = function(iNewIndex, iFocusPageIndex) {
		if (!this._bIsInitialized || this.getPages().length === 0) {
			return;
		}

		var $element = this.$(),
			$inner = $element.find('> .sapMCrslInner'),
			$items = $inner.children(),
			iIndex = this._iCurrSlideIndex,
			iLength = $items.length,
			iNumberOfItemsToShow = this._getNumberOfItemsToShow(),
			bLoop = this.getLoop(),
			bIsCarouselActive = this.getDomRef().contains(document.activeElement);

		// prevent loop when carousel shows more pages than 1
		if (bLoop && iNumberOfItemsToShow !== 1 &&
			(iNewIndex < 0 || iNewIndex > iLength - 1)) { // new index out of range - will cause loop
			return;
		}

		// Bound Values between [1, length];
		if (iNewIndex < 0) {
			//if looping move to last index
			if (bLoop) {
				iNewIndex = iLength - 1;
			} else {
				iNewIndex = 0;
			}
		} else if (iNewIndex > iLength - 1) {
			// if looping move to first index
			if (bLoop) {
				iNewIndex = 0;
			} else {
				iNewIndex = iLength - 1;
			}
		}

		if (iNewIndex + iNumberOfItemsToShow > iLength - 1) {
			iNewIndex = iLength - iNumberOfItemsToShow;
		}

		// Bail out early if no move is necessary.
		var bTriggerEvents = true;
		if (iNewIndex === iIndex) {
			//only trigger events if index changes
			bTriggerEvents = false;
		}

		// Trigger beforeSlide event
		if (bTriggerEvents) {
			this._onBeforePageChanged(iIndex, iNewIndex);
		}

		this._iOffsetDrag = 0;
		this._iCurrSlideIndex = iNewIndex;

		this._updateTransformValue();
		this._initActivePages();
		this._updateItemsAttributes(iFocusPageIndex);

		if (bTriggerEvents) {
			this._changeActivePage(this._aAllActivePagesIndexes[0]);
		}

		// focus the new page after transition if the focus was in the carousel
		if (bIsCarouselActive || this._bPageIndicatorArrowPress) {
			this._focusPage(iFocusPageIndex);
			this._bPageIndicatorArrowPress = false;
		}
	};

	/**
	 * Private method which adjusts the Hud visibility and fires a page change
	 * event when the active page changes
	 *
	 * @param {int} iNewPageIndex index of new page in 'pages' aggregation.
	 * @private
	 */
	Carousel.prototype._changeActivePage = function(iNewPageIndex) {
		var sOldActivePageId = this.getActivePage();

		if (this._sOldActivePageId) {
			sOldActivePageId = this._sOldActivePageId;
			delete this._sOldActivePageId;
		}

		var sNewActivePageId = this.getPages()[iNewPageIndex].getId();

		this.setAssociation("activePage", sNewActivePageId, true);

		// close the soft keyboard
		if (!Device.system.desktop) {
			jQuery(document.activeElement).trigger("blur");
		}

		if (this._bShouldFireEvent) {
			Log.debug("sap.m.Carousel: firing pageChanged event: old page: " + sOldActivePageId + ", new page: " + sNewActivePageId);
			this.firePageChanged({
				oldActivePageId: sOldActivePageId,
				newActivePageId: sNewActivePageId,
				activePages: this._aAllActivePagesIndexes
			});
		}

		this._adjustArrowsVisibility();
		this._updatePageIndicator();
	};

	Carousel.prototype._focusPage = function(sPageIndex) {
		this._iFocusedPageIndex = sPageIndex;

		const oPageDomRef = this.getDomRef(this.getPages()[sPageIndex].getId() + "-slide");

		// focus the new page if the is not on some of the page children
		if (!oPageDomRef.contains(document.activeElement)) {
			oPageDomRef.focus({ preventScroll: true });
		}
	};

	Carousel.prototype._updateItemsAttributes = function (iSelectedPageIndex) {
		this.$().find(Carousel._ITEM_SELECTOR).each(function (iIndex, oPage) {
			var bSelected = iIndex === iSelectedPageIndex;

			oPage.setAttribute("aria-selected", bSelected);
			oPage.setAttribute("aria-hidden", !this._isPageDisplayed(iIndex));
			oPage.setAttribute("tabindex", bSelected ? 0 : -1);
		}.bind(this));
	};

	Carousel.prototype._updatePageIndicator = function () {
		// change the number in the page indicator
		this.$("slide-number").text(this._getPageIndicatorText(this._iCurrSlideIndex + 1));
	};

	/**
	 * Returns page indicator text.
	 *
	 * @param {int} iNewPageIndex carousel slide index
	 * @returns {string} page indicator text
	 * @private
	 */
	Carousel.prototype._getPageIndicatorText = function (iNewPageIndex) {
		return this._oRb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [iNewPageIndex, this.getPages().length  - this._getNumberOfItemsToShow() + 1]);
	};

	/**
	 * Sets Arrows' visibility after page has changed
	 *
	 * @private
	 */
	Carousel.prototype._adjustArrowsVisibility = function() {
		if (Device.system.desktop && !this._loops() && this.getPages().length > 1) {
			//update HUD arrow visibility for left- and rightmost pages
			var $HUDContainer = this.$('hud');
			var $ArrowPrev = this.$("arrow-previous");
			var $ArrowNext = this.$("arrow-next");
			var iFirstDisplayedPageIndex = this._aAllActivePagesIndexes[0];
			var iLastDisplayedPageIndex = this._aAllActivePagesIndexes[this._aAllActivePagesIndexes.length - 1];

			//clear marker classes first
			if (this.getArrowsPlacement() === CarouselArrowsPlacement.Content) {
				$HUDContainer.removeClass(Carousel._LEFTMOST_CLASS).removeClass(Carousel._RIGHTMOST_CLASS);
			} else {
				$ArrowPrev.removeClass(Carousel._LEFTMOST_CLASS);
				$ArrowNext.removeClass(Carousel._RIGHTMOST_CLASS);
			}

			if (iFirstDisplayedPageIndex === 0) {
				if (this.getArrowsPlacement() === CarouselArrowsPlacement.Content) {
					$HUDContainer.addClass(Carousel._LEFTMOST_CLASS);
				} else {
					$ArrowPrev.addClass(Carousel._LEFTMOST_CLASS);
				}
			}

			if (iLastDisplayedPageIndex === this.getPages().length - 1) {
				if (this.getArrowsPlacement() === CarouselArrowsPlacement.Content) {
					$HUDContainer.addClass(Carousel._RIGHTMOST_CLASS);
				} else {
					$ArrowNext.addClass(Carousel._RIGHTMOST_CLASS);

				}
			}
		}
	};

	Carousel.prototype.setActivePage = function (vPage) {
		var sPageId = null;
		if (typeof (vPage) == 'string') {
			sPageId = vPage;
		} else if (vPage instanceof Control) {
			sPageId = vPage.getId();
		}

		if (sPageId) {
			if (sPageId === this.getActivePage()) {
				//page has not changed, nothing to do, return
				return this;
			}
			var iPageNr = this._getPageIndex(sPageId);
			this._sOldActivePageId = this.getActivePage();
			this._moveToPage(iPageNr, iPageNr);
		}

		this.setAssociation("activePage", sPageId, true);

		return this;
	};

	/**
	 * Returns the icon of the requested direction (left/right).
	 * @private
	 * @param {string} sDirection Left or Right
	 * @returns {sap.ui.core.Control} icon of the requested arrow
	 */
	Carousel.prototype._getNavigationArrow = function (sDirection) {
		if (!this["_oArrow" + sDirection]) {
			this["_oArrow" + sDirection] = ImageHelper.getImageControl(
				this.getId() + "-arrowScroll" + sDirection,
				this["_oArrow" + sDirection],
				this,
				{ src: "sap-icon://slim-arrow-" + sDirection.toLowerCase(), useIconTooltip: false }
			);
		}

		return this["_oArrow" + sDirection];
	};

	/**
	 * Private method that creates message page when no pages are loaded or provided
	 *
	 * @private
	 */
	Carousel.prototype._getEmptyPage = function () {
		if (!this.getAggregation("_emptyPage")) {
			var emptyPage = new IllustratedMessage({
				illustrationType: IllustratedMessageType.NoData
			});

			this.setAggregation("_emptyPage", emptyPage);
		}

		return this.getAggregation("_emptyPage");
	};

	/**
	 * Returns the index of the slide that should be shown
	 * @private
	 * @param {int} iCurrentSlideIndex Current slide index
	 * @param {int} iDefaultIndexStep Index that shows if previous or next arrow is pressed
	 * @returns {int} Index of the slide
	 */
	Carousel.prototype._calculateSlideIndex = function (iCurrentSlideIndex, iDefaultIndexStep) {
		const oCarouselLayout = this.getCustomLayout();
		let iSlideIndex;

		if (oCarouselLayout && oCarouselLayout.getScrollMode() === CarouselScrollMode.VisiblePages) {
			const iNumberOfItemsOnPage =  this._getNumberOfItemsToShow();
			iSlideIndex = iDefaultIndexStep > 0 ? iCurrentSlideIndex + iNumberOfItemsOnPage : Math.max(0, iCurrentSlideIndex - iNumberOfItemsOnPage);
		} else {
			iSlideIndex = iDefaultIndexStep > 0 ? iCurrentSlideIndex + 1 : iCurrentSlideIndex - 1;
		}

		return iSlideIndex;
	};

	/**
	 * Call this method to display the previous page (corresponds to a swipe left).
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Carousel.prototype.previous = function () {
		const iSlideIndex = this._calculateSlideIndex(this._iCurrSlideIndex, -1);
		let iFocusPageIndex = this._iFocusedPageIndex;

		if (this._aAllActivePagesIndexes.at(-1) === this._iFocusedPageIndex) {
			iFocusPageIndex = this._iFocusedPageIndex - 1;
		}

		this._moveToPage(iSlideIndex, this._makeInRange(iFocusPageIndex, false));

		return this;
	};

	/**
	 * Call this method to display the next page (corresponds to a swipe right).
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Carousel.prototype.next = function () {
		const iSlideIndex = this._calculateSlideIndex(this._iCurrSlideIndex, 1);
		let iFocusPageIndex = this._iFocusedPageIndex;

		if (this._aAllActivePagesIndexes[0] === this._iFocusedPageIndex) {
			iFocusPageIndex = this._iFocusedPageIndex + 1;
		}

		this._moveToPage(iSlideIndex, this._makeInRange(iFocusPageIndex, false));

		return this;
	};

	/**
	 * Determines the position of a given page in the carousel's page list
	 *
	 * @return the position of a given page in the carousel's page list or 'undefined' if it does not exist in the list.
	 * @private
	 */
	Carousel.prototype._getPageIndex = function(sPageId) {
		var i, result = 0;

		for (i = 0; i < this.getPages().length; i++) {
			if (this.getPages()[i].getId() === sPageId) {
				result = i;
				break;
			}
		}
		return result;
	};

	Carousel.prototype._getActivePageIndex = function () {
		var iActivePageIndex = 0,
			sActivePage = this.getActivePage();

		if (sActivePage) {
			iActivePageIndex = this._getPageIndex(sActivePage);
		}

		return iActivePageIndex;
	};

	/**
	 * Handles 'touchstart' event
	 *
	 * @param oEvent
	 */
	Carousel.prototype.ontouchstart = function(oEvent) {
		if (!this.getPages().length || !this._bIsInitialized) {
			return;
		}

		const sTargetTag = oEvent.target.tagName.toLowerCase();

		if (["input", "textarea", "select"].indexOf(sTargetTag) > -1 || oEvent.target.isContentEditable) {
			return;
		}

		if (this._isPageIndicatorArrow(oEvent.target)) {
			// prevent upcoming focusin event on the arrow and focusout on the active page
			this._bPageIndicatorArrowPress = true;
			oEvent.preventDefault();
			return;
		}

		if (oEvent.target.draggable) {
			// Some elements like images are draggable by default.
			// When swiped they begin dragging as ghost images (eg. dragstart event).
			// This dragging behavior is not desired when inside a Carousel, so we disable it.
			// Note that preventDefault() prevents next events to happen (in particular focusin), so disable the dragging via property
			oEvent.target.draggable = false;
		}

		if (oEvent.isMarked("delayedMouseEvent")) {
			return;
		}

		//add event handler flags
		var oElement = Element.closestTo(oEvent.target);
		if (oElement &&
			(oElement.isA("sap.m.Slider") ||
			oElement.isA("sap.m.Switch") ||
			oElement.isA("sap.m.IconTabBar"))) {
			//Make sure that swipe is executed for all controls except those that
			//themselves require horizontal swiping
			this._bDragCanceled = true;
			return;
		}

		this._bDragging = true;
		this._bDragCanceled = false;

		this._mCurrentXY = getCursorPosition(oEvent);
		this._iDx = 0;
		this._iDy = 0;
		this._bDragThresholdMet = false;

		// Disable smooth transitions
		this.$().addClass("sapMCrslDragging");

		this._bLockLeft = this._iCurrSlideIndex === 1;
		this._bLockRight = this._iCurrSlideIndex === this.getPages().length - 1;
	};

	/**
	 * Handles 'touchmove' event
	 *
	 * @param oEvent
	 */
	Carousel.prototype.ontouchmove = function(oEvent) {
		if (this._isPageIndicatorArrow(oEvent.target)) {
			return;
		}

		if (!this._bDragging || this._bDragCanceled || oEvent.isMarked("delayedMouseEvent")) {
			return;
		}

		// mark the event for components that need to know if the event was handled by the carousel
		oEvent.setMarked();

		var iDragLimit = this.$().width();

		var mNewXY = getCursorPosition(oEvent);
		this._iDx = this._mCurrentXY.x - mNewXY.x;
		this._iDy = this._mCurrentXY.y - mNewXY.y;

		if (this._bDragThresholdMet || Math.abs(this._iDx) > Math.abs(this._iDy) && (Math.abs(this._iDx) > iDragRadius)) {
			this._bDragThresholdMet = true;

			// prevent default action when mouse drag is used
			if (isPlainObject(oEvent.touches[0])) {
				oEvent.preventDefault();
			}

			if (this._bLockLeft && (this._iDx < 0)) {
				this._iDx = this._iDx * (-iDragLimit) / (this._iDx - iDragLimit);
			} else if (this._bLockRight && (this._iDx > 0)) {
				this._iDx = this._iDx * (iDragLimit) / (this._iDx + iDragLimit);
			}
			this._iOffsetDrag = -this._iDx;
			this._updateTransformValue();
		} else if ((Math.abs(this._iDy) > Math.abs(this._iDx)) && (Math.abs(this._iDy) > iDragRadius)) {
			this._bDragCanceled = true;
		}
	};

	/**
	 * Handles 'touchend' event
	 *
	 * @param oEvent
	 */
	Carousel.prototype.ontouchend = function(oEvent) {
		if (this._isPageIndicatorArrow(oEvent.target)) {
			return;
		}

		if (!this._bDragging || oEvent.isMarked("delayedMouseEvent")) {
			return;
		}

		this._bDragging = false;

		this.$().removeClass("sapMCrslDragging");

		if (!this._bDragCanceled && Math.abs(this._iDx) > iMoveRadius) {
			// Move to the next slide if necessary
			if (this._iDx > 0) {
				bRtl ? this.previous() : this.next();
			} else {
				bRtl ? this.next() : this.previous();
			}
		} else {
			// Reset back to regular position
			this._iOffsetDrag = 0;
			this._updateTransformValue();
		}
	};

	//================================================================================
	// Keyboard handling
	//================================================================================

	/**
	 * Handler for 'tab previous' key event.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 *
	 */
	Carousel.prototype.onsaptabprevious = function(oEvent) {
		this._bDirection = false;

		if (this._isSlide(oEvent.target) || oEvent.target === this.getDomRef("noData")) {
			this._forwardTab(false);
		}
	};

	/**
	 * Handler for 'tab next' key event.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 *
	 */
	Carousel.prototype.onsaptabnext = function(oEvent) {
		this._bDirection = true;

		var $activePageTabbables = this._getActivePageTabbables();

		if (!$activePageTabbables.length || oEvent.target === $activePageTabbables.get(-1)) {
			this._forwardTab(true);
		}
	};

	Carousel.prototype._forwardTab = function (bForward) {
		this.getDomRef(bForward ? "after" : "before").focus();
	};

	Carousel.prototype._getActivePageTabbables = function () {
		return this.$(this.getPages()[this._iFocusedPageIndex].getId() + "-slide").find(":sapTabbable");
	};

	/**
	 * Focus the last interactive element inside the active page, or the page itself
	 * @param {jQuery.Event} oEvent the event
	 */
	Carousel.prototype._focusPrevious = function(oEvent) {
	   var oActivePageDomRef = this.getFocusDomRef();

	   if (!oActivePageDomRef) {
		   return;
	   }

	   var $activePage = jQuery(oActivePageDomRef);
	   var $activePageTabbables = this._getActivePageTabbables();

	   $activePage.add($activePageTabbables).eq(-1).trigger("focus");
   };

	/**
	 * Handler for focus event
	 *
	 * @param {Object} oEvent - The event object
	 */
	Carousel.prototype.onfocusin = function(oEvent) {
		if (oEvent.target === this.getDomRef("before") && !this.getDomRef().contains(oEvent.relatedTarget)) {
			this.getFocusDomRef().focus();
			return;
		}

		if (oEvent.target === this.getDomRef("after") && !this.getDomRef().contains(oEvent.relatedTarget)) {
			this._focusPrevious(oEvent);
			return;
		}

		if (this._isSlide(oEvent.target)) {
			this.addStyleClass("sapMCrslShowArrows");
		}

		this._handlePageElemFocus(oEvent.target);
		this._updateItemsAttributes(this._iFocusedPageIndex);

		// Save focus reference
		this.saveLastFocusReference(oEvent);
		// Reset the reference for future use
		this._bDirection = undefined;
	};

	Carousel.prototype.onfocusout = function(oEvent) {
		if (this._isSlide(oEvent.target)) {
			this.removeStyleClass("sapMCrslShowArrows");
		}
	};

	/**
	 * When any element is focused with mouse set its containing page focused page
	 * @param {HTMLElement} oFocusedElement The focused element
	 */
	Carousel.prototype._handlePageElemFocus = function(oFocusedElement) {
		var oPage;

		if (this._isSlide(oFocusedElement)) {
			oPage = Element.closestTo(jQuery(oFocusedElement).find(".sapMCrsPage")[0]);
		} else {
			oPage = this._getClosestPage(oFocusedElement);
		}

		if (oPage) {
			var sPageId = oPage.getId();

			this._iFocusedPageIndex = this._getPageIndex(sPageId);
		}
	};

	/**
	 * Handler for key down
	 *
	 * @param {Object} oEvent - key object
	 */
	Carousel.prototype.onkeydown = function(oEvent) {

		if (oEvent.keyCode == KeyCodes.F7) {
			this._handleF7Key(oEvent);
			return;
		}

		if (!this._isSlide(oEvent.target)) {
			return;
		}

		switch (oEvent.keyCode) {

			// Minus keys
			// TODO  KeyCodes.MINUS is not returning 189
			case 189:
			case KeyCodes.NUMPAD_MINUS:
				this._fnSkipToIndex(oEvent, -1, false);
				break;

			// Plus keys
			case KeyCodes.PLUS:
			case KeyCodes.NUMPAD_PLUS:
				this._fnSkipToIndex(oEvent, 1, false);
				break;
		}
	};

	/**
	 * Move focus to the next item. If focus is on the last item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapright = function(oEvent) {
		this._fnSkipToIndex(oEvent, 1, false);
	};

	/**
	 * Move focus to the next item. If focus is on the last item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapup = function(oEvent) {
		this._fnSkipToIndex(oEvent, 1, false);
	};

	/**
	 * Move focus to the previous item. If focus is on the first item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapleft = function(oEvent) {
		this._fnSkipToIndex(oEvent, -1, false);
	};

	/**
	 *
	 * Move focus to the next item. If focus is on the last item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapdown = function(oEvent) {
		this._fnSkipToIndex(oEvent, -1, false);
	};

	/**
	 * Move focus to the first item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsaphome = function(oEvent) {
		this._fnSkipToIndex(oEvent, -this._iFocusedPageIndex, true);
	};

	/**
	 * Move focus to the last item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapend = function(oEvent) {
		this._fnSkipToIndex(oEvent, this.getPages().length - this._iFocusedPageIndex - 1, true);
	};

	/**
	 * Move focus 10 items to the right. If there are less than 10 items right, move
	 * focus to last item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsaprightmodifiers = function(oEvent) {
		if (oEvent.ctrlKey) {
			this._fnSkipToIndex(oEvent, Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING, true);
		}
	};

	/**
	 * Move focus 10 items to the right. If there are less than 10 items right, move
	 * focus to last item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapupmodifiers = function(oEvent) {
		if (oEvent.ctrlKey) {
			this._fnSkipToIndex(oEvent, Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING, true);
		}
	};

	/**
	 * Move focus 10 items to the right. If there are less than 10 items right, move
	 * focus to last item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsappageup = function(oEvent) {
		this._fnSkipToIndex(oEvent, Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING, true);
	};

	/**
	 * Move focus 10 items to the left. If there are less than 10 items left, move
	 * focus to first item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapleftmodifiers = function(oEvent) {
		if (oEvent.ctrlKey) {
			this._fnSkipToIndex(oEvent, -Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING, true);
		}
	};

	/**
	 * Move focus 10 items to the left. If there are less than 10 items left, move
	 * focus to first item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapdownmodifiers = function(oEvent) {
		if (oEvent.ctrlKey) {
			this._fnSkipToIndex(oEvent, -Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING, true);
		}
	};

	/**
	 * Move focus 10 items to the left. If there are less than 10 items left, move
	 * focus to first item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsappagedown = function(oEvent) {
		this._fnSkipToIndex(oEvent, -Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING, true);
	};

	/**
	 * Save reference of the last focused element for each page
	 *
	 * @param {Object} oEvent - The event object
	 * @private
	 */
	Carousel.prototype.saveLastFocusReference = function(oEvent) {
		var oClosestPage = this._getClosestPage(oEvent.target),
			sFocusedPageId;

		// Don't save focus references triggered from the mouse
		if (this._bDirection === undefined) {
			return;
		}

		if (this._lastFocusablePageElement === undefined) {
			this._lastFocusablePageElement = {};
		}

		if (oClosestPage) {
			sFocusedPageId = oClosestPage.getId();
			this._lastFocusablePageElement[sFocusedPageId] = oEvent.target;
		}
	};

	/**
	 * Returns the last element that has been focused in the last focused active page.
	 * @returns {Element | undefined}  HTML DOM or undefined
	 * @private
	 */
	Carousel.prototype._getActivePageLastFocusedElement = function() {
		if (this._lastFocusablePageElement) {
			return this._lastFocusablePageElement[this.getActivePage()];
		}
	};

	/**
	 * Updates the currently active (visible) pages.
	 * @param {number} sNewActivePageId - The new active page ID
	 * @private
	 */
	Carousel.prototype._updateActivePages = function(sNewActivePageId) {
		var iNewPageIndex = this._getPageIndex(sNewActivePageId),
			iNumberOfItemsToShown = this._getNumberOfItemsToShow(),
			aAllPages = this.getPages(),
			iLastPageIndex;

		if (!aAllPages.length) {
			return;
		}

		// When CarouselLayout is used, the index of the activePage should not exceed allPages count minus the number of visible pages
		if (iNewPageIndex > aAllPages.length - iNumberOfItemsToShown) {
			iNewPageIndex = aAllPages.length - iNumberOfItemsToShown;
		}

		iLastPageIndex = iNewPageIndex + iNumberOfItemsToShown;

		this._aAllActivePages = [];
		this._aAllActivePagesIndexes = [];

		for (var i = iNewPageIndex; i < iLastPageIndex; i++) {
			this._aAllActivePages.push(aAllPages[i].getId());
			this._aAllActivePagesIndexes.push(i);
		}
	};

	/**
	 * Change active page via keyboard
	 *
	 * @param {Object} oEvent - The event object
	 * @param {int} iOffset - The index offset from the currently active page.
	 * @param {int} bPreventLoop Whether to prevent potential loop
	 * @private
	 */
	Carousel.prototype._fnSkipToIndex = function(oEvent, iOffset, bPreventLoop) {
		if (!this._isSlide(oEvent.target)) {
			return;
		}

		oEvent.preventDefault();

		var iSkipToIndex = this._makeInRange(this._iFocusedPageIndex + iOffset, bPreventLoop);
		var sOldActivePageId = this.getActivePage();
		var iNewSlideIndex = this._iCurrSlideIndex + iOffset;

		if (bPreventLoop) {
			iNewSlideIndex = Math.max(0, Math.min(iNewSlideIndex, this.getPages().length - this._getNumberOfItemsToShow()));
		}

		if (!this._isPageDisplayed(iSkipToIndex)) {
			this._bShouldFireEvent = false;
			this._moveToPage(iNewSlideIndex, iSkipToIndex);
			this._bShouldFireEvent = true;
			this._sOldActivePageId = sOldActivePageId;
		}

		this._changeActivePage(this._aAllActivePagesIndexes[0]);
		this._updateItemsAttributes(iSkipToIndex);
		this._focusPage(iSkipToIndex);
	};

	Carousel.prototype._isPageDisplayed = function (iIndex) {
		return this._aAllActivePagesIndexes.includes(iIndex);
	};

	/**
	 * Handler for F7 key
	 * @param {Object} oEvent - key object
	 * @private
	 */
	Carousel.prototype._handleF7Key = function (oEvent) {
		var oActivePageLastFocusedElement = this._getActivePageLastFocusedElement();

		if (this._isSlide(oEvent.target) && oActivePageLastFocusedElement) {
			oActivePageLastFocusedElement.focus();
		} else {
			this.getFocusDomRef().focus();
		}
	};

	Carousel.prototype._isSlide = function (oElement) {
		return oElement.id.endsWith("slide") && oElement.parentElement === this.getDomRef().querySelector(Carousel._INNER_SELECTOR);
	};

	Carousel.prototype._isPageIndicatorArrow = function (oElement) {
		return oElement.classList.contains("sapMCrslArrow");
	};

	Carousel.prototype._loops = function () {
		return this.getLoop() && this._getNumberOfItemsToShow() === 1;
	};

	/**
	 * @param {int} iIndex Page index
	 * @param {boolean} bPreventLoop Whether to prevent loop if index is out of range
	 * @returns {int} index in range of pages aggregation
	 */
	Carousel.prototype._makeInRange = function (iIndex, bPreventLoop) {
		var iPagesLength = this.getPages().length;
		var iIndexInRange = iIndex;
		var bLoops = this._loops();

		if (iIndex >= iPagesLength) {
			if (bLoops && !bPreventLoop) {
				iIndexInRange = 0;
			} else {
				iIndexInRange = iPagesLength - 1;
			}
		} else if (iIndex < 0) {
			if (bLoops && !bPreventLoop) {
				iIndexInRange = iPagesLength - 1;
			} else {
				iIndexInRange = 0;
			}
		}

		return iIndexInRange;
	};

	/**
	 * Searches for the parent page of the given child element
	 * @param {HTMLElement} oElement The child element
	 * @returns {sap.ui.core.Control} The page
	 */
	Carousel.prototype._getClosestPage = function (oElement) {
		return Element.closestTo(oElement.closest(".sapMCrsPage"));
	};

	/*
	 * @see sap.ui.core.Control#setBusyIndicatorSize
	 * Original property was depracated so we removed it, but made it failsafe
	 * by mapping a 'wrong' input value to the new enum.
	 *
	 * @public
	 */
	Carousel.prototype.setBusyIndicatorSize = function(sSize) {
		if (!(sSize in BusyIndicatorSize)) {
			sSize = BusyIndicatorSize.Medium;
		}
		return Control.prototype.setBusyIndicatorSize.call(this, sSize);
	};

	Carousel.prototype.onclick = function (oEvent) {
		var oTarget = oEvent.target;

		switch (oTarget.id) {
			case this.getId() + "-arrow-next":
				this.next();
				break;
			case this.getId() + "-arrow-previous":
				this.previous();
				break;
		}
	};

	Carousel.prototype._initialize  = function () {
		var $inner = this.$().find('> .sapMCrslInner'),
			iNumberOfItemsToShow = this._getNumberOfItemsToShow();

		this._bIsInitialized = false;

		if (this._iTimeoutId) {
			clearTimeout(this._iTimeoutId);
			delete this._iTimeoutId;
		}

		$inner.addClass("sapMCrslNoTransition");

		this._iOffsetDrag = 0;

		this._initActivePages();

		this._bIsInitialized = true;

		if (iNumberOfItemsToShow > 1) {
			this._setWidthOfPages(iNumberOfItemsToShow);
		}

		this._adjustArrowsVisibility();
		this._updateItemsAttributes(this._getActivePageIndex());
		this._updatePageIndicator();

		this._updateTransformValue();

		this._iTimeoutId = setTimeout(function () {
			$inner.removeClass("sapMCrslNoTransition");
		}, 50);
	};

	Carousel.prototype._updateTransformValue = function () {
		if (this.getPages().length === 0) {
			return;
		}

		var $element = this.$(),
			$inner = $element.find('> .sapMCrslInner'),
			$items = $inner.children(),
			$start = $items.eq(0),
			$current = $items.eq(this._iCurrSlideIndex),
			currentOffset,
			startOffset,
			iOffset,
			x;

		if (!$inner.length) {
			return;
		}

		currentOffset = $current.prop('offsetLeft') + $current.prop('clientWidth');
		startOffset = $start.prop('offsetLeft') + $start.prop('clientWidth');

		iOffset = startOffset - currentOffset;
		x = Math.round(iOffset + this._iOffsetDrag);

		translateX($inner[0], x);
	};

	Carousel.prototype._initActivePages = function () {
		var sActiveClass = "sapMCrslActive",
			$element = this.$(),
			$inner = $element.find('> .sapMCrslInner'),
			$items = $inner.children(),
			sId = this.getDomRef().id,
			sPageIndicatorId = sId.replace(/(:|\.)/g,'\\$1') + '-pageIndicator',
			iIndex = this._iCurrSlideIndex,
			i;

		for (i = 0; i < $items.length; i++) {
			if (i < iIndex || i > iIndex + this._getNumberOfItemsToShow() - 1) {
				$items.eq(i).removeClass(sActiveClass);
			} else {
				$items.eq(i).addClass(sActiveClass);
			}
		}

		$element.find('span[data-slide]').removeClass(sActiveClass);
		$element.find('#' + sPageIndicatorId + ' > [data-slide=\'' + (iIndex + 1) + '\']').addClass(sActiveClass);
	};

	return Carousel;
});
