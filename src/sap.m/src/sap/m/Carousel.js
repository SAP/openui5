/*!
 * ${copyright}
 */

// Provides control sap.m.Carousel.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/library',
	'./CarouselRenderer',
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/events/F6Navigation",
	"sap/ui/thirdparty/jquery",
	'sap/ui/thirdparty/mobify-carousel',
	'sap/ui/core/IconPool'
],
function(
	library,
	Control,
	Device,
	ResizeHandler,
	coreLibrary,
	CarouselRenderer,
	KeyCodes,
	Log,
	F6Navigation,
	jQuery
	/*, mobifycarousel, IconPool (indirect dependency, kept for compatibility with tests, to be fixed in ImageHelper) */
) {
	"use strict";

	//shortcut for sap.ui.core.BusyIndicatorSize
	var BusyIndicatorSize = coreLibrary.BusyIndicatorSize;

	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = library.CarouselArrowsPlacement;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;



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
	 * <li><code>pageIndicatorPlacement</code> - determines where the indicator is located. Default (<code>sap.m.PlacementType.Bottom</code>) - below the content.</li>
	 *</ul>
	 * Additionally, you can also change the location of the navigation arrows.
	 * By setting <code>arrowsPlacement</code> to <code>sap.m.CarouselArrowsPlacement.PageIndicator</code>, the arrows will be located at the bottom by the paging indicator.
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Carousel = Control.extend("sap.m.Carousel", /** @lends sap.m.Carousel.prototype */ { metadata : {

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
			 * Defines where the carousel's page indicator is displayed. Possible values are sap.m.PlacementType.Top, sap.m.PlacementType.Bottom. Other values are ignored and the default value will be applied. The default value is sap.m.PlacementType.Bottom.
			 */
			pageIndicatorPlacement : {type : "sap.m.PlacementType", group : "Appearance", defaultValue : PlacementType.Bottom},

			/**
			 * Show or hide busy indicator in the carousel when loading pages after swipe.
			 * @deprecated Since version 1.18.7.
			 * Since 1.18.7 pages are no longer loaded or unloaded. Therefore busy indicator is not necessary any longer.
			 */
			showBusyIndicator : {type : "boolean", group : "Appearance", defaultValue : true, deprecated: true},

			/**
			 * Defines where the carousel's arrows are placed. Default is <code>sap.m.CarouselArrowsPlacement.Content</code> used to
			 * place the arrows on the sides of the carousel. Alternatively <code>sap.m.CarouselArrowsPlacement.PageIndicator</code> can
			 * be used to place the arrows on the sides of the page indicator.
			 */
			arrowsPlacement : {type : "sap.m.CarouselArrowsPlacement", group : "Appearance", defaultValue : CarouselArrowsPlacement.Content}
		},
		defaultAggregation : "pages",
		aggregations : {

			/**
			 * The content which the carousel displays.
			 */
			pages : {type : "sap.ui.core.Control", multiple : true, singularName : "page"}
		},
		associations : {

			/**
			 * Provides getter and setter for the currently displayed page. For the setter, argument may be the control itself, which must be member of the carousel's page list, or the control's id.
			 * The getter will return the control id
			 */
			activePage : {type : "sap.ui.core.Control", multiple : false}
		},
		events : {

			/**
			 * Carousel requires a new page to be loaded. This event may be used to fill the content of that page
			 * @deprecated Since version 1.18.7.
			 * Since 1.18.7 pages are no longer loaded or unloaded
			 */
			loadPage : {deprecated: true,
				parameters : {

					/**
					 * Id of the page which will be loaded
					 */
					pageId : {type : "string"}
				}
			},

			/**
			 * Carousel does not display a page any longer and unloads it. This event may be used to clean up the content of that page.
			 * @deprecated Since version 1.18.7.
			 * Since 1.18.7 pages are no longer loaded or unloaded
			 */
			unloadPage : {deprecated: true,
				parameters : {

					/**
					 * Id of the page which will be unloaded
					 */
					pageId : {type : "string"}
				}
			},

			/**
			 * This event is fired after a carousel swipe has been completed. It is triggered both by physical swipe events and through API carousel manipulations such as calling 'next', 'previous' or 'setActivePageId' functions.
			 */
			pageChanged : {
				parameters : {

					/**
					 * Id of the page which was active before the page change.
					 */
					oldActivePageId : {type : "string"},

					/**
					 * Id of the page which is active after the page change.
					 */
					newActivePageId : {type : "string"}
				}
			}
		}
	}});


	//Constants convenient class selections
	Carousel._INNER_SELECTOR = ".sapMCrslInner";
	Carousel._PAGE_INDICATOR_SELECTOR = ".sapMCrslBulleted";
	Carousel._PAGE_INDICATOR_ARROWS_SELECTOR = ".sapMCrslIndicatorArrow";
	Carousel._CONTROLS = ".sapMCrslControls";
	Carousel._ITEM_SELECTOR = ".sapMCrslItem";
	Carousel._LEFTMOST_CLASS = "sapMCrslLeftmost";
	Carousel._RIGHTMOST_CLASS = "sapMCrslRightmost";
	Carousel._LATERAL_CLASSES = "sapMCrslLeftmost sapMCrslRightmost";
	Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING = 10; // The number 10 is by keyboard specification
	Carousel._BULLETS_TO_NUMBERS_THRESHOLD = 9; //The number 9 is by visual specification. Less than 9 pages - bullets for page indicator. 9 or more pages - numeric page indicator.
	Carousel._PREVIOUS_CLASS_ARROW = "sapMCrslPrev";
	Carousel._NEXT_CLASS_ARROW = "sapMCrslNext";
	/**
	 * Initialize member variables which are needed later on.
	 *
	 * @private
	 */
	Carousel.prototype.init = function() {
		//Scroll container list for clean- up
		this._aScrollContainers = [];

		//Initialize '_fnAdjustAfterResize' to be used by window
		//'resize' event
		this._fnAdjustAfterResize = jQuery.proxy(function() {
			var $carouselInner = this.$().find(Carousel._INNER_SELECTOR);
			this._oMobifyCarousel.resize($carouselInner);
		}, this);

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};



	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	Carousel.prototype.exit = function() {
		if (this._oMobifyCarousel) {
			this._oMobifyCarousel.destroy();
			delete this._oMobifyCarousel;
		}

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

		this._cleanUpScrollContainer();
		this._fnAdjustAfterResize = null;
		this._aScrollContainers = null;
		this._$InnerDiv = null;
	};

	/**
	 * Housekeeping for scroll containers: Removes content for each container,
	 * destroys the contianer and clears the local container list.
	 *
	 * @private
	 */
	Carousel.prototype._cleanUpScrollContainer = function() {
		var oScrollCont;
		while (this._aScrollContainers && this._aScrollContainers.length > 0) {
			oScrollCont = this._aScrollContainers.pop();
			oScrollCont.destroyContent();
			if (oScrollCont && typeof oScrollCont.destroy === 'function') {
				oScrollCont.destroy();
			}
		}
	};

	/**
	 * Delegates 'touchstart' event to mobify carousel
	 *
	 * @param oEvent
	 */
	Carousel.prototype.ontouchstart = function(oEvent) {
		if (this._oMobifyCarousel) {
			this._oMobifyCarousel.touchstart(oEvent);
		}
	};

	/**
	 * Delegates 'touchmove' event to mobify carousel
	 *
	 * @param oEvent
	 */
	Carousel.prototype.ontouchmove = function(oEvent) {
		if (this._oMobifyCarousel) {
			this._oMobifyCarousel.touchmove(oEvent);
		}
	};

	/**
	 * Delegates 'touchend' event to mobify carousel
	 *
	 * @param oEvent
	 */
	Carousel.prototype.ontouchend = function(oEvent) {
		if (this._oMobifyCarousel) {

			if (this._oMobifyCarousel.hasActiveTransition()) {
				this._oMobifyCarousel.onTransitionComplete();
			}
			this._oMobifyCarousel.touchend(oEvent);
		}
	};



	/**
	 * Cleans up bindings
	 *
	 * @private
	 */
	Carousel.prototype.onBeforeRendering = function() {
		//make sure, active page has an initial value
		var sActivePage = this.getActivePage();
		if (!sActivePage && this.getPages().length > 0) {
			//if no active page is specified, set first page.
			this.setAssociation("activePage", this.getPages()[0].getId(), true);
		}
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		return this;
	};

	/**
	 * When this method is called for the first time, a swipe-view instance is created which is renders
	 * itself into its dedicated spot within the DOM tree. This instance is used throughout the
	 * Carousel instance's lifecycle.
	 *
	 * @private
	 */
	Carousel.prototype.onAfterRendering = function() {

		//Check if carousel has been initialized
		if (this._oMobifyCarousel) {
			//Clean up existing mobify carousel
			this._oMobifyCarousel.unbind();
		}
		//Create and initialize new carousel
		this.$().carousel();
		this._oMobifyCarousel = this.getDomRef()._carousel;
		this._oMobifyCarousel.setLoop(this.getLoop());
		this._oMobifyCarousel.setRTL(sap.ui.getCore().getConfiguration().getRTL());

		//Go to active page: this may be necessary after adding or
		//removing pages
		var sActivePage = this.getActivePage();

		if (sActivePage) {
			var iIndex = this._getPageNumber(sActivePage);
			if (isNaN(iIndex) || iIndex == 0) {
				if (this.getPages().length > 0) {
					//First page is always shown as default
					//Do not fire page changed event, though
					this.setAssociation("activePage", this.getPages()[0].getId(), true);
					this._adjustHUDVisibility(1);
				}
			} else {

				var oCore = sap.ui.getCore();

				if (oCore.isThemeApplied()) {
					// mobify carousel is 1-based
					this._moveToPage(iIndex + 1);
				} else {
					oCore.attachThemeChanged(this._handleThemeLoad, this);
				}

				// BCP: 1580078315
				if (sap.zen && sap.zen.commons && this.getParent() instanceof sap.zen.commons.layout.PositionContainer) {
					if (this._isCarouselUsedWithCommonsLayout === undefined){
						setTimeout(this["invalidate"].bind(this), 0);
						this._isCarouselUsedWithCommonsLayout = true;
					}
				}
			}
		}



		//attach delegate for firing 'PageChanged' events to mobify carousel's
		//'afterSlide'
		this.$().on('afterSlide', jQuery.proxy(function(e, iPreviousSlide, iNextSlide) {
			//the event might bubble up from another carousel inside of this one.
			//in this case we ignore the event
			if (e.target !== this.getDomRef()) {
				return;
			}

			if (iNextSlide > 0) {
				this._changePage(iPreviousSlide, iNextSlide);
			}
		}, this));

		this._$InnerDiv = this.$().find(Carousel._INNER_SELECTOR)[0];

		this._sResizeListenerId = ResizeHandler.register(this._$InnerDiv, this._fnAdjustAfterResize);

		// Fixes wrong focusing in IE// TODO remove after 1.62 version
		// BCP: 1670008915
		this.$().find('.sapMCrslItemTableCell').focus(function(e) {

			e.preventDefault();

			jQuery(e.target).parents('.sapMCrsl').focus();

			return false;
		});


		// Fixes displaying correct page after carousel become visible in an IconTabBar
		// BCP: 1680019792
		var sClassName = 'sap.m.IconTabBar';
		var oParent = this.getParent();
		while (oParent) {
			if (oParent.getMetadata().getName() == sClassName) {
				var that = this;

				/*eslint-disable no-loop-func */
				oParent.attachExpand(function (oEvt) {
					var bExpand = oEvt.getParameter('expand');
					if (bExpand && iIndex > 0) {
						// mobify carousel is 1-based
						that._moveToPage(iIndex + 1);
					}
				});
				break;
			}

			oParent = oParent.getParent();
		}
	};

	/**
	 * Fired when the theme is loaded
	 *
	 * @private
	 */
	Carousel.prototype._handleThemeLoad = function() {

		var oCore,
			sActivePage = this.getActivePage();

		if (sActivePage) {
			var iIndex = this._getPageNumber(sActivePage);
			if (iIndex > 0) {
				// mobify carousel is 1-based
				this._moveToPage(iIndex + 1);
			}
		}

		oCore = sap.ui.getCore();
		oCore.detachThemeChanged(this._handleThemeLoad, this);
	};

	/**
	 * Moves carousel and mobify carousel to specific page
	 *
	 * @private
	 */
	Carousel.prototype._moveToPage = function(iIndex) {
		this._oMobifyCarousel.changeAnimation('sapMCrslNoTransition');
		this._oMobifyCarousel.move(iIndex);
		this._changePage(undefined, iIndex);
	};

	/**
	 * Private method which adjusts the Hud visibility and fires a page change
	 * event when the active page changes
	 *
	 * @param {int} [iOldPageIndex] Optional index of the old page. If not specified, the current active page index will be taken.
	 * @param {int} iNewPageIndex index of new page in 'pages' aggregation.
	 * @private
	 */
	Carousel.prototype._changePage = function(iOldPageIndex, iNewPageIndex) {
		this._adjustHUDVisibility(iNewPageIndex);
		var sOldActivePageId = this.getActivePage();

		// If setActivePage is called through API, getActivePage will return the wrong page.
		// In this case iOldPageIndex must be passed.
		if (iOldPageIndex) {
			sOldActivePageId = this.getPages()[iOldPageIndex - 1].getId();
		}

		var sNewActivePageId = this.getPages()[iNewPageIndex - 1].getId();
		this.setAssociation("activePage", sNewActivePageId, true);
		var sTextBetweenNumbers = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [iNewPageIndex, this.getPages().length]);

		Log.debug("sap.m.Carousel: firing pageChanged event: old page: " + sOldActivePageId
				+ ", new page: " + sNewActivePageId);

		// close the soft keyboard
		if (!Device.system.desktop) {
			jQuery(document.activeElement).blur();
		}

		this.firePageChanged( { oldActivePageId: sOldActivePageId,
			newActivePageId: sNewActivePageId});

		// change the number in the page indicator
		this.$('slide-number').text(sTextBetweenNumbers);
	};

	/**
	 * Sets HUD control's visibility after page has changed
	 *
	 * @param {int} iNextSlide index of the next active page
	 * @private
	 *
	 */
	Carousel.prototype._adjustHUDVisibility = function(iNextSlide) {
		if (Device.system.desktop && !this.getLoop() && this.getPages().length > 1) {
			//update HUD arrow visibility for left- and
			//rightmost pages
			var $HUDContainer = this.$('hud');

			//clear marker classes first
			$HUDContainer.removeClass(Carousel._LATERAL_CLASSES);

			if (iNextSlide === 1) {
				$HUDContainer.addClass(Carousel._LEFTMOST_CLASS);
				this._focusCarouselContainer($HUDContainer, Carousel._PREVIOUS_CLASS_ARROW);
			} else if (iNextSlide === this.getPages().length) {
				$HUDContainer.addClass(Carousel._RIGHTMOST_CLASS);
				this._focusCarouselContainer($HUDContainer, Carousel._NEXT_CLASS_ARROW);
			}
		}
	};

	/*
	 * Focus Carousel container.
	 * Focus is moved to carousel container if clicked arrow is first or last from carousel
	 * @param {object} $HUDContainer Arrow container inside Carousel
	 * @param {string} sArrowClassName Arrow class name
	 * @private
	 *
	 */
	Carousel.prototype._focusCarouselContainer = function($HUDContainer, sArrowClassName) {
		if ($HUDContainer.find('.' + sArrowClassName)[0] === document.activeElement) {
			this.focus();
		}
	};

	/*
	 * API method to set carousel's active page during runtime.
	 *
	 * @param vPage Id of the page or page which shall become active
	 * @override
	 *
	 */
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
			var iPageNr = this._getPageNumber(sPageId);

			if (!isNaN(iPageNr)) {
				if (this._oMobifyCarousel) {
					//mobify carousel's move function is '1' based
					this._oMobifyCarousel.move(iPageNr + 1);
				}
				// if oMobifyCarousel is not present yet, move takes place
				// 'onAfterRendering', when oMobifyCarousel is created
			}
		}
		this.setAssociation("activePage", sPageId, true);

		return this;
	};



	/*
	 * API method to set the carousel's height
	 *
	 * @param {sap.ui.core.CSSSize} oHeight the new height as CSSSize
	 * @public
	 * @override
	 */
	Carousel.prototype.setHeight = function(oHeight) {
		//do suppress rerendering
		this.setProperty("height", oHeight, true);
		this.$().css("height", oHeight);
		return this;
	};

	/*
	 * API method to set the carousel's width
	 *
	 * @param {sap.ui.core.CSSSize} oWidth the new width as CSSSize
	 * @public
	 * @override
	 */
	Carousel.prototype.setWidth = function(oWidth) {
		//do suppress rerendering
		this.setProperty("width", oWidth, true);
		this.$().css("width", oWidth);
		return this;
	};

	/*
	 * API method to set whether the carousel should loop, i.e
	 * show the first page after the last page is reached and vice
	 * versa.
	 *
	 * @param {boolean} bLoop the new loop property
	 * @public
	 * @override
	 */
	Carousel.prototype.setLoop = function(bLoop) {
		//do suppress rerendering
		this.setProperty("loop", bLoop, true);
		if (this._oMobifyCarousel) {
			this._oMobifyCarousel.setLoop(bLoop);
		}
		return this;
	};

	/**
	 * Gets the icon of the requested arrow (left/right).
	 * @private
	 * @param {string} sName left or right
	 * @returns icon of the requested arrow
	 */
	Carousel.prototype._getNavigationArrow = function(sName) {
		var mProperties = {
			src: "sap-icon://slim-arrow-" + sName,
			useIconTooltip : false
		};

		if (sName === "left") {
			if (!this._oArrowLeft) {
				this._oArrowLeft = ImageHelper.getImageControl(this.getId() + "-arrowScrollLeft", this._oArrowLeft, this, mProperties);
			}
			return this._oArrowLeft;
		} else if (sName === "right") {
			if (!this._oArrowRight) {
				this._oArrowRight = ImageHelper.getImageControl(this.getId() + "-arrowScrollRight", this._oArrowRight, this, mProperties);
			}
			return this._oArrowRight;
		}
	};


	/**
	 * Private method that places a given page control into
	 * a scroll container which does not scroll. That container does
	 * not scroll itself. This is necessary to achieve the 100% height
	 * effect with an offset for the page indicator.
	 *
	 * @param oPage the page to check
	 * @private
	 */
	Carousel.prototype._createScrollContainer = function (oPage) {
		var imgClass;
		var bShowIndicatorArrows = Device.system.desktop && this.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator;
		if (bShowIndicatorArrows) {
			imgClass = "sapMCrslImg";
		} else {
			imgClass = "sapMCrslImgNoArrows";
		}


		var cellClasses = oPage instanceof sap.m.Image ? "sapMCrslItemTableCell " + imgClass : "sapMCrslItemTableCell",
			oContent = new sap.ui.core.HTML({
			content :	"<div class='sapMCrslItemTable'>" +
							"<div class='" + cellClasses + "'></div>" +
						"</div>",
			afterRendering : function(e) {
				var rm = sap.ui.getCore().createRenderManager();
				rm.render(oPage, this.getDomRef().firstChild);
				rm.destroy();
				oPage = null;
			}
		});

		var oScrollContainer = new sap.m.ScrollContainer({
			horizontal: false,
			vertical: false,
			content:[oContent],
			width:'100%',
			height:'100%'
		});
		oScrollContainer.setParent(this, null, true);
		this._aScrollContainers.push(oScrollContainer);
		return oScrollContainer;
	};

	/**
	 * Call this method to display the previous page (corresponds to a swipe left). Returns 'this' for method chaining.
	 *
	 * @type sap.m.Carousel
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Carousel.prototype.previous = function () {
		if (this._oMobifyCarousel) {
			this._oMobifyCarousel.prev();
		} else {
			Log.warning("Unable to execute sap.m.Carousel.previous: carousel must be rendered first.");
		}
		return this;
	};

	/**
	 * Call this method to display the next page (corresponds to a swipe right). Returns 'this' for method chaining.
	 *
	 * @type sap.m.Carousel
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Carousel.prototype.next = function () {
		if (this._oMobifyCarousel) {
			this._oMobifyCarousel.next();
		} else {
			Log.warning("Unable to execute sap.m.Carousel.next: carousel must be rendered first.");
		}
		return this;
	};

	/**
	 * Determines the position of a given page in the carousel's page list
	 *
	 * @return the position of a given page in the carousel's page list or 'undefined' if it does not exist in the list.
	 * @private
	 */
	Carousel.prototype._getPageNumber = function(sPageId) {
		var i, result;

		for (i = 0; i < this.getPages().length; i++) {
			if (this.getPages()[i].getId() == sPageId) {
				result = i;
				break;
			}
		}
		return result;
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
		this._fnOnTabPress(oEvent);
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
		this._fnOnTabPress(oEvent);
	};

	/**
	 * Handler for focus event
	 *
	 * @param {Object} oEvent - The event object
	 */
	Carousel.prototype.onfocusin = function(oEvent) {
		// Save focus reference
		this.saveLastFocusReference(oEvent);
		// Reset the reference for future use
		this._bDirection = undefined;
	};

	/**
	 * Handler for F6
	 *
	 * @param {Object} oEvent - The event object
	 */
	Carousel.prototype.onsapskipforward = function(oEvent) {
		oEvent.preventDefault();
		this._handleGroupNavigation(oEvent, false);
	};

	/**
	 * Handler for Shift + F6
	 *
	 * @param {Object} oEvent - The event object
	 */
	Carousel.prototype.onsapskipback = function(oEvent) {
		oEvent.preventDefault();
		this._handleGroupNavigation(oEvent, true);
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

		// Exit the function if the event is not from the Carousel
		if (oEvent.target != this.getDomRef()) {
			return;
		}

		switch (oEvent.keyCode) {

			// Minus keys
			// TODO  jQuery.sap.KeyCodes.MINUS is not returning 189
			case 189:
			case KeyCodes.NUMPAD_MINUS:
				this._fnSkipToIndex(oEvent, -1);
				break;

			// Plus keys
			case KeyCodes.PLUS:
			case KeyCodes.NUMPAD_PLUS:
				this._fnSkipToIndex(oEvent, 1);
				break;
		}
	};

	/**
	 * Set carousel back to the first position it had.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapescape = function(oEvent) {
		var lastActivePageNumber;

		if (oEvent.target === this.$()[0] && this._lastActivePageNumber) {
			lastActivePageNumber = this._lastActivePageNumber + 1;

			this._oMobifyCarousel.move(lastActivePageNumber);
			this._changePage(undefined, lastActivePageNumber);
		}
	};

	/**
	 * Move focus to the next item. If focus is on the last item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapright = function(oEvent) {
		this._fnSkipToIndex(oEvent, 1);
	};

	/**
	 * Move focus to the previous item. If focus is on the first item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapup = function(oEvent) {
		this._fnSkipToIndex(oEvent, -1);
	};

	/**
	 * Move focus to the previous item. If focus is on the first item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapleft = function(oEvent) {
		this._fnSkipToIndex(oEvent, -1);
	};

	/**
	 *
	 * Move focus to the next item. If focus is on the last item, do nothing.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapdown = function(oEvent) {
		this._fnSkipToIndex(oEvent, 1);
	};

	/**
	 * Move focus to the first item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsaphome = function(oEvent) {
		this._fnSkipToIndex(oEvent, 0);
	};

	/**
	 * Move focus to the last item.
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype.onsapend = function(oEvent) {
		this._fnSkipToIndex(oEvent, this.getPages().length);
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
			this._fnSkipToIndex(oEvent, Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING);
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
			this._fnSkipToIndex(oEvent, Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING);
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
		this._fnSkipToIndex(oEvent, Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING);
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
			this._fnSkipToIndex(oEvent, -Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING);
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
			this._fnSkipToIndex(oEvent, -Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING);
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
		this._fnSkipToIndex(oEvent, -Carousel._MODIFIERNUMBERFORKEYBOARDHANDLING);
	};

	/**
	 * Called on tab or shift+tab key press
	 *
	 * @param {Object} oEvent - key event
	 * @private
	 */
	Carousel.prototype._fnOnTabPress = function(oEvent) {
		// Check if the focus is received form the Carousel
		if (oEvent.target === this.$()[0]) {
			// Save reference for [ESC]
			this._lastActivePageNumber = this._getPageNumber(this.getActivePage());
		}
	};

	/**
	 * Handler for F6 and Shift + F6 group navigation
	 *
	 * @param {Object} oEvent - The event object
	 * @param {boolean} bShiftKey serving as a reference if shift is used
	 * @private
	 */
	Carousel.prototype._handleGroupNavigation = function(oEvent, bShiftKey) {
		var oEventF6 = jQuery.Event("keydown");

		// Prevent the event and focus Carousel control
		oEvent.preventDefault();
		this.$().focus();

		oEventF6.target = oEvent.target;
		oEventF6.keyCode = KeyCodes.F6;
		oEventF6.shiftKey = bShiftKey;

		F6Navigation.handleF6GroupNavigation(oEventF6);
	};

	/**
	 * Save reference of the last focused element for each page
	 *
	 * @param {Object} oEvent - The event object
	 * @private
	 */
	Carousel.prototype.saveLastFocusReference = function(oEvent) {
		// Don't save focus references triggered from the mouse
		if (this._bDirection === undefined) {
			return;
		}

		if (this._lastFocusablePageElement === undefined) {
			this._lastFocusablePageElement = {};
		}

		this._lastFocusablePageElement[this.getActivePage()] = oEvent.target;
	};

	/**
	 * Returns the last element that has been focus in the curent active page
	 * @returns {Element | undefined}  HTML DOM or undefined
	 * @private
	 */
	Carousel.prototype._getActivePageLastFocusedElement = function() {
		if (this._lastFocusablePageElement) {
			return this._lastFocusablePageElement[this.getActivePage()];
		}
	};

	/**
	 * Change Carousel Active Page from given page index.
	 *
	 * @param {Object} oEvent - The event object
	 * @param {number} nIndex - The index of the page that need to be shown.
	 *	  If the index is 0 the next shown page will be the first in the Carousel
	 * @private
	 */
	Carousel.prototype._fnSkipToIndex = function(oEvent, nIndex) {
		var nNewIndex = nIndex;

		// Exit the function if the event is not from the Carousel
		if (oEvent.target !== this.getDomRef()) {
			return;
		}

		oEvent.preventDefault();

		if (this._oMobifyCarousel.hasActiveTransition()) {
			this._oMobifyCarousel.onTransitionComplete();
		}

		// Calculate the index of the next page that will be shown
		if (nIndex !== 0) {
			nNewIndex = this._getPageNumber(this.getActivePage()) + 1 + nIndex;
		}

		this._oMobifyCarousel.move(nNewIndex);
	};

	/**
	 * Handler for F7 key
	 * @param {Object} oEvent - key object
	 * @private
	 */
	Carousel.prototype._handleF7Key = function (oEvent) {
		var oActivePageLastFocusedElement;

		// Needed for IE// TODO remove after 1.62 version
		oEvent.preventDefault();

		oActivePageLastFocusedElement = this._getActivePageLastFocusedElement();

		// If focus is on an interactive element inside a page, move focus to the Carousel.
		// As long as the focus remains on the Carousel, a consecutive press on [F7]
		// moves the focus back to the interactive element which had the focus before.
		if (oEvent.target === this.$()[0] && oActivePageLastFocusedElement) {
			oActivePageLastFocusedElement.focus();
		} else {
			this.$().focus();
		}
	};

	//================================================================================
	// DEPRECATED METHODS
	//================================================================================

	/*
	 * API method to set whether the carousel should display the busy indicators.
	 * This property has been deprecated since 1.18.7. Does nothing and returns the carousel reference.
	 *
	 * @deprecated
	 * @public
	 */
	Carousel.prototype.setShowBusyIndicator = function() {
		Log.warning("sap.m.Carousel: Deprecated function 'setShowBusyIndicator' called. Does nothing.");
		return this;
	};

	/*
	 * API method to check whether the carousel should display the busy indicators.
	 * This property has been deprecated since 1.18.7. Always returns false,
	 *
	 * @deprecated
	 * @public
	 */
	Carousel.prototype.getShowBusyIndicator = function() {
		Log.warning("sap.m.Carousel: Deprecated function 'getShowBusyIndicator' called. Does nothing.");
		return false;
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

	return Carousel;
});