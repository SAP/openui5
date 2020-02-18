/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/delegate/ScrollEnablement',
	'./AccButton',
	'./TabStripItem',
	'sap/m/Select',
	'sap/m/SelectList',
	'sap/ui/Device',
	'sap/ui/core/Renderer',
	'sap/ui/core/ResizeHandler',
	'sap/m/library',
	'sap/ui/core/Icon',
	'sap/m/Image',
	'sap/m/SelectRenderer',
	'sap/m/SelectListRenderer',
	'./TabStripRenderer',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control",
	// jQuery Plugin "scrollLeftRTL"
	"sap/ui/dom/jquery/scrollLeftRTL"
],
function(
	Control,
	IconPool,
	ItemNavigation,
	ManagedObject,
	ScrollEnablement,
	AccButton,
	TabStripItem,
	Select,
	SelectList,
	Device,
	Renderer,
	ResizeHandler,
	library,
	Icon,
	Image,
	SelectRenderer,
	SelectListRenderer,
	TabStripRenderer,
	Log,
	jQuery
) {
		"use strict";

		// shortcut for sap.m.SelectType
		var SelectType = library.SelectType;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		/**
		 * Constructor for a new <code>TabStrip</code>.
		 *
		 * @param {string} [sID] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * This control displays a number of tabs. If the available horizontal
		 * space is exceeded, a horizontal scrollbar appears.
		 *
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.34
		 * @alias sap.m.TabStrip
		 */
		var TabStrip = Control.extend("sap.m.TabStrip", /** @lends sap.m.TabStrip.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {

					/**
					 * Defines whether the button <code>Opened Tabs</code> for showing all the tabs in a dropdown menu is present.
					 */
					hasSelect : {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations : {

					/**
					 * The tabs displayed in the <code>TabStrip</code>.
					 */
					items : {type : "sap.m.TabStripItem", multiple : true, singularName : "item"},

					/**
					 * The <code>Add New Tab</code> button displayed in the <code>TabStrip</code>.
					 */
					addButton : {type : "sap.m.Button", multiple : false, singularName : "addButton"},

					/**
					 * Holds the instance of the select when <code>hasSelect</code> is set to <code>true</code>.
					 */
					_select : {type: 'sap.m.Select', multiple : false, visibility : "hidden"},

					/**
					 * Holds the right arrow scrolling button.
					 */
					_rightArrowButton : {type: 'sap.m.AccButton', multiple : false, visibility : "hidden"},

					/**
					 * Holds the right arrow scrolling button.
					 */
					_leftArrowButton : {type: 'sap.m.AccButton', multiple : false, visibility : "hidden"}
				},
				associations: {

					/**
					 * Sets or retrieves the selected item from the <code>items</code> aggregation..
					 */
					selectedItem: {type : 'sap.m.TabStripItem', group : "Misc"}
				},
				events : {

					/**
					 * Fired when an item is closed.
					 */
					itemClose: {
						allowPreventDefault: true,
						parameters: {

							/**
							 * The closed item.
							 */
							item: {type: "sap.m.TabStripItem"}
						}
					},

					/**
					 * Fired when an item is pressed.
					 */
					itemPress: {
						parameters: {

							/**
							 * The pressed item.
							 */
							item: { type: "sap.m.TabStripItem" }
						}
					},

					/**
					 * Fired when an item is pressed.
					 * @since 1.38
					 */
					itemSelect: {
						allowPreventDefault: true,
						parameters: {

							/**
							 * The selected item.
							 */
							item: { type: "sap.m.TabContainerItem" }
						}
					}
				}
			},
			constructor : function (vId, mSettings) {
				var bHasSelect = false;
				// normalize the expected arguments
				if (!mSettings && typeof vId === 'object') {
					mSettings = vId;
				}

				/* Stash the 'hasSelect' setting for later in order to have all items added to the tabstrip
				* before the "select" control is instantiated. */
				if (mSettings) {
					bHasSelect = mSettings['hasSelect'];
					delete mSettings['hasSelect'];
				}

				ManagedObject.prototype.constructor.apply(this, arguments);

				// after the tabstrip is instantiated, add the select
				this.setProperty('hasSelect', bHasSelect, true);
			}
		});

		/**
		 * Library internationalization resource bundle.
		 *
		 * @type {jQuery.sap.util.ResourceBundle}
		 */
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		/**
		 * Icon buttons used in <code>TabStrip</code>.
		 *
		 * @enum
		 * @type {{LeftArrowButton: string, RightArrowButton: string, DownArrowButton: string, AddButton: string}}
		 */
		TabStrip.ICON_BUTTONS = {
			LeftArrowButton: "slim-arrow-left",
			RightArrowButton: "slim-arrow-right",
			DownArrowButton: "slim-arrow-down",
			AddButton: "add"
		};

		/**
		 * <code>TabStripSelect</code> ID prefix.
		 *
		 * @type {string}
		 */
		TabStrip.SELECT_ITEMS_ID_SUFFIX = '-SelectItem';

		/**
		 * ScrollLeft constant.
		 *
		 * @type {number}
		 */
		TabStrip.SCROLL_SIZE = 320;

		/**
		 * The minimum horizontal offset threshold for drag/swipe.
		 * @type {number}
		 */
		TabStrip.MIN_DRAG_OFFSET = Device.support.touch ? 15 : 5;

		/**
		 * Scrolling animation duration constant
		 *
		 * @type {number}
		 */
		TabStrip.SCROLL_ANIMATION_DURATION = sap.ui.getCore().getConfiguration().getAnimation() ? 500 : 0;


		/**
		 * Initializes the control.
		 *
		 * @override
		 * @public
		 */
		TabStrip.prototype.init = function () {
			this._bDoScroll = !Device.system.phone;
			this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
			this._iCurrentScrollLeft = 0;
			this._iMaxOffsetLeft = null;
			this._scrollable = null;
			this._oTouchStartX = null;

			if (!Device.system.phone) {
				this._oScroller = new ScrollEnablement(this, this.getId() + "-tabs", {
					horizontal: true,
					vertical: false,
					nonTouchScrolling: true
				});
			}
		};

		/**
		 * Called from parent if the control is destroyed.
		 *
		 * @override
		 * @public
		 */
		TabStrip.prototype.exit = function () {
			this._bRtl = null;
			this._iCurrentScrollLeft = null;
			this._iMaxOffsetLeft = null;
			this._scrollable = null;
			this._oTouchStartX = null;
			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}
			if (this._sResizeListenerId) {
				ResizeHandler.deregister(this._sResizeListenerId);
				this._sResizeListenerId = null;
			}
			this._removeItemNavigation();
		};

		/**
		 * Called before the rendering of the control is started.
		 *
		 * @override
		 * @public
		 */
		TabStrip.prototype.onBeforeRendering = function () {
			if (this._sResizeListenerId) {
				ResizeHandler.deregister(this._sResizeListenerId);
				this._sResizeListenerId = null;
			}
		};

		/**
		 * Called when the rendering of the control is completed.
		 *
		 * @override
		 * @public
		 */
		TabStrip.prototype.onAfterRendering = function () {
			if (this._oScroller) {
				this._oScroller.setIconTabBar(this, jQuery.proxy(this._handleOverflowButtons, this), null);
			}
			//use ItemNavigation for keyboardHandling
			this._addItemNavigation();

			if (!Device.system.phone) {
				// workaround for the problem that the scrollEnablement obtains this reference only after its hook to onAfterRendering of the TabStrip is called
				this._oScroller._$Container = this.$("tabsContainer");

				this._adjustScrolling();

				if (this.getSelectedItem()) {
					if (!sap.ui.getCore().isThemeApplied()) {
						sap.ui.getCore().attachThemeChanged(this._handleInititalScrollToItem, this);
					} else {
						this._handleInititalScrollToItem();
					}
				}

				this._sResizeListenerId = ResizeHandler.register(this.getDomRef(),  jQuery.proxy(this._adjustScrolling, this));
			}
		};

		/**
		 * Scrolls to initially selected item by setting it after the theme is applied
		 * and on after rendering the Tab Strip.
		 *
		 * @private
		 */
		TabStrip.prototype._handleInititalScrollToItem = function() {
			var $oItem = sap.ui.getCore().byId(this.getSelectedItem());
			if ($oItem && $oItem.$().length > 0) { // check if the item is already in the DOM
				this._scrollIntoView($oItem, 500);
			}
			sap.ui.getCore().detachThemeChanged(this._handleInititalScrollToItem, this);
		};

		/**
		 * Finds the DOM element that should get the focus.
		 *
		 * @returns {null | Element} The element that have to receive the focus or null
		 * @public
		 * @override
		 */
		TabStrip.prototype.getFocusDomRef = function () {
			var oTab = sap.ui.getCore().byId(this.getSelectedItem());

			if (!oTab) {
				return null;
			}

			return oTab.getDomRef();
		};

		/**
		 * Returns an object representing the serialized focus information.
		 *
		 * @param {Object} oFocusInfo The focus information to be applied
		 * @override
		 * @public
		 */
		TabStrip.prototype.applyFocusInfo = function (oFocusInfo) {
			if (oFocusInfo.focusDomRef) {
				jQuery(oFocusInfo.focusDomRef).focus();
			}
		};

		/**
		 * Adds item navigation functionality.
		 *
		 * @private
		 */
		TabStrip.prototype._addItemNavigation = function () {
			var oHeadDomRef = this.getDomRef("tabsContainer"),
				aItems = this.getItems(),
				aTabDomRefs = [];

			aItems.forEach(function(oItem) {
				var oItemDomRef = oItem.getDomRef();
				jQuery(oItemDomRef).attr("tabindex", "-1");
				aTabDomRefs.push(oItemDomRef);
			});

			if (!this._oItemNavigation) {
				//Initialize the ItemNavigation
				this._oItemNavigation = new ItemNavigation();
			}
			//Setup the ItemNavigation
			this._oItemNavigation.setRootDomRef(oHeadDomRef);
			this._oItemNavigation.setItemDomRefs(aTabDomRefs);
			this._oItemNavigation.setCycling(false);
			this._oItemNavigation.setPageSize(5);
			//alt+right/left is used for browser navigation
			this._oItemNavigation.setDisabledModifiers({
				sapnext: ["alt"],
				sapprevious: ["alt"]
			});

			//Attach ItemNavigation to the control delegate queue
			this.addDelegate(this._oItemNavigation);
		};

		/**
		 * Checks if scrolling is needed.
		 *
		 * @returns {boolean} Whether scrolling is needed
		 * @private
		 */
		TabStrip.prototype._checkScrolling = function() {
			var oTabsDomRef = this.getDomRef("tabs"),
				bScrollNeeded = oTabsDomRef && (oTabsDomRef.scrollWidth > this.getDomRef("tabsContainer").offsetWidth);

			this.$().toggleClass("sapMTSScrollable", bScrollNeeded);

			return bScrollNeeded;
		};

		TabStrip.prototype._handleOverflowButtons = function() {
			var oTabsDomRef = this.getDomRef("tabs"),
				oTabsContainerDomRef = this.getDomRef("tabsContainer"),
				iScrollLeft,
				realWidth,
				availableWidth,
				bScrollBack = false,
				bScrollForward = false,
				bScrollNeeded = this._checkScrolling();

			// in case there is something to be scrolled and the left and right "scrolling" buttons are not initialized
			// we should initialize and render them
			if (bScrollNeeded && !this.getAggregation("_rightArrowButton") && !this.getAggregation("_leftArrowButton")) {
				this._getLeftArrowButton();
				this._getRightArrowButton();
				var oRm = sap.ui.getCore().createRenderManager();
				this.getRenderer().renderRightOverflowButtons(oRm, this, true);
				this.getRenderer().renderLeftOverflowButtons(oRm, this, true);
				oRm.destroy();
			}

			if (bScrollNeeded && oTabsDomRef && oTabsContainerDomRef) {
				if (this._bRtl) {
					iScrollLeft = jQuery(oTabsContainerDomRef).scrollLeftRTL();
				} else {
					iScrollLeft = oTabsContainerDomRef.scrollLeft;
				}

				realWidth = oTabsDomRef.scrollWidth;
				availableWidth = oTabsContainerDomRef.clientWidth;
				if (Math.abs(realWidth - availableWidth) === 1) {
					realWidth = availableWidth;
				}

				if (iScrollLeft > 0) {
					if (this._bRtl) {
						bScrollForward = true;
					} else {
						bScrollBack = true;
					}
				}
				if ((realWidth > availableWidth) && (iScrollLeft + availableWidth < realWidth)) {
					if (this._bRtl) {
						bScrollBack = true;
					} else {
						bScrollForward = true;
					}
				}

				this.$().toggleClass("sapMTSScrollBack", bScrollBack)
						.toggleClass("sapMTSScrollForward", bScrollForward);
			} else {
				this.$().toggleClass("sapMTSScrollBack", false)
						.toggleClass("sapMTSScrollForward", false);
			}
		};

		/**
		 * Calculates the maximum <code>OffsetLeft</code> and performs an overflow check.
		 *
		 * @private
		 */
		TabStrip.prototype._adjustScrolling = function() {

			this._iMaxOffsetLeft = Math.abs(this.$("tabsContainer").width() - this.$("tabs").width());

			this._handleOverflowButtons();
		};

		/**
		 * Lazily initializes the <code>_leftArrowButton</code> aggregation.
		 * @private
		 * @returns {sap.m.AccButton} The newly created control
		 */
		TabStrip.prototype._getLeftArrowButton = function () {
			return this._getArrowButton("_leftArrowButton", oRb.getText("TABSTRIP_SCROLL_BACK"), TabStrip.ICON_BUTTONS.LeftArrowButton, -TabStrip.SCROLL_SIZE);
		};

		/**
		 * Lazily initializes the <code>_leftArrowButton</code> aggregation.
		 * @private
		 * @returns {sap.m.AccButton} The newly created control
		 */
		TabStrip.prototype._getRightArrowButton = function () {
			return this._getArrowButton("_rightArrowButton", oRb.getText("TABSTRIP_SCROLL_FORWARD"), TabStrip.ICON_BUTTONS.RightArrowButton, TabStrip.SCROLL_SIZE);
		};

		/**
		 * Lazily initializes the left or right arrows aggregation.
		 * @private
		 * @param {string} sButton The button to be initialized
		 * @param {string} sTooltip The tooltip to be set
		 * @param {string} sIcon The icon to be set
		 * @param {int} iDelta The delta of the scroll
		 * @returns {sap.m.AccButton} The newly created control
		 */
		TabStrip.prototype._getArrowButton = function (sButton, sTooltip, sIcon, iDelta) {
			var oControl = this.getAggregation(sButton),
				that = this;

			if (!oControl) {
				oControl = new AccButton({
					type: ButtonType.Transparent,
					icon: IconPool.getIconURI(sIcon),
					tooltip: sTooltip,
					tabIndex: "-1",
					ariaHidden: "true",
					press: function (oEvent) {
						that._scroll(iDelta, TabStrip.SCROLL_ANIMATION_DURATION);
					}
				});

				this.setAggregation(sButton, oControl, true);
			}
			return oControl;
		};

		/**
		 * Removes the item navigation delegate.
		 *
		 * @private
		 */
		TabStrip.prototype._removeItemNavigation = function () {
			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				delete this._oItemNavigation;
			}
		};

		/**
		 * Performs horizontal scroll.
		 *
		 * @param {int} iDelta The target scrollLeft value
		 * @param {int} iDuration Scroll animation duration
		 * @private
		 */
		TabStrip.prototype._scroll = function(iDelta, iDuration) {
			var iScrollLeft = this.getDomRef("tabsContainer").scrollLeft,
				bIE_Edge = Device.browser.internet_explorer || Device.browser.edge,// TODO remove after the end of support for Internet Explorer
				iScrollTarget;

			if (this._bRtl && !bIE_Edge) {// TODO remove after the end of support for Internet Explorer
				iScrollTarget = iScrollLeft - iDelta;

				if (Device.browser.firefox) {
					// Avoid out ofRange situation
					if (iScrollTarget < -this._iMaxOffsetLeft) {
						iScrollTarget = -this._iMaxOffsetLeft;
					}
					if (iScrollTarget > 0) {
						iScrollTarget = 0;
					}
				}
			} else {
				iScrollTarget = iScrollLeft + iDelta;

				if (iScrollTarget < 0) {
					iScrollTarget = 0;
				}
				if (iScrollTarget > this._iMaxOffsetLeft) {
					iScrollTarget = this._iMaxOffsetLeft;
				}
			}

			this._oScroller.scrollTo(iScrollTarget, 0, iDuration);
			this._iCurrentScrollLeft = iScrollTarget;
		};

		/**
		 * Scrolls to a particular item.
		 *
		 * @param {sap.m.TabStripItem} oItem The item to be scrolled to
		 * @param {int} iDuration Duration of the scrolling animation
		 * @private
		 */
		TabStrip.prototype._scrollIntoView = function (oItem, iDuration) {
			var $tabs = this.$("tabs"),
				$item = oItem.$(),
				iTabsPaddingWidth = $tabs.innerWidth() - $tabs.width(),
				iItemWidth = $item.outerWidth(true),
				iItemPosLeft = $item.position().left - iTabsPaddingWidth / 2,
				oTabsContainerDomRef = this.getDomRef("tabsContainer"),
				iScrollLeft = oTabsContainerDomRef.scrollLeft,
				iContainerWidth = this.$("tabsContainer").width(),
				iNewScrollLeft = iScrollLeft,
				bIE_Edge = Device.browser.internet_explorer || Device.browser.edge;

			// check if item is outside of viewport
			if (iItemPosLeft < 0 || iItemPosLeft > iContainerWidth - iItemWidth) {

				if (this._bRtl && Device.browser.firefox) {
					if (iItemPosLeft < 0) { // right side: make this the last item
						iNewScrollLeft += iItemPosLeft + iItemWidth - iContainerWidth;
					} else { // left side: make this the first item
						iNewScrollLeft += iItemPosLeft;
					}
				} else if (this._bRtl && bIE_Edge) {
					if (iItemPosLeft < 0) { // right side: make this the first item
						iNewScrollLeft -= iItemPosLeft;
					} else { // left side: make this the last item
						iNewScrollLeft -= iItemPosLeft + iItemWidth - iContainerWidth;
					}
				} else {
					if (iItemPosLeft < 0) { // left side: make this the first item
						iNewScrollLeft += iItemPosLeft;
					} else { // right side: make this the last item
						iNewScrollLeft += iItemPosLeft + iItemWidth - iContainerWidth;
					}
				}

				// store current scroll state to set it after re-rendering
				this._iCurrentScrollLeft = iNewScrollLeft;
				this._oScroller.scrollTo(iNewScrollLeft, 0, iDuration);

			}
		};


		/**
		 * Create the instance of the <code>TabStripSelect</code>.
		 *
		 * @param { array<sap.m.TabStripItem> } aTabStripItems Array with the <code>TabStripItems</code>
		 * @returns {CustomSelect} The created <code>CustomSelect</code>
		 * @private
		 */
		TabStrip.prototype._createSelect = function (aTabStripItems) {
			var oSelect,
				oSelectedSelectItem,
				oSelectedTabStripItem,
				oConstructorSettings = {
					type: Device.system.phone ? SelectType.Default : SelectType.IconOnly,
					autoAdjustWidth : true,
					maxWidth: Device.system.phone ? "100%" : "2.5rem",
					icon: IconPool.getIconURI(TabStrip.ICON_BUTTONS.DownArrowButton),
					tooltip: oRb.getText("TABSTRIP_OPENED_TABS"),
					change: function (oEvent) {
						oSelectedSelectItem = oEvent.getParameters()['selectedItem'];
						oSelectedTabStripItem = this._findTabStripItemFromSelectItem(oSelectedSelectItem);
						if (oSelectedTabStripItem instanceof TabStripItem) {
							this._activateItem(oSelectedTabStripItem, oEvent);
						}
					}.bind(this)
				};

			oSelect = new CustomSelect(oConstructorSettings).addStyleClass("sapMTSOverflowSelect");

			this._addItemsToSelect(oSelect, aTabStripItems);

			return oSelect;
		};


		/**
		 * Handles when the Space or Enter key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 */
		TabStrip.prototype.onsapselect = function(oEvent) {
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
			oEvent.preventDefault();
			/* Fire activate item only if select is on an Item.*/
			if (oEvent.srcControl instanceof TabStripItem) {
				this._activateItem(oEvent.srcControl, oEvent);
			}
		};

		/**
		 * Handles the delete keyboard event.
		 * @param {jQuery.Event} oEvent The event object
		 */
		TabStrip.prototype.onsapdelete = function(oEvent) {
			var oItem = jQuery("#" + oEvent.target.id).control(0),
				bShouldChangeSelection = oItem.getId() === this.getSelectedItem(),
				fnSelectionCallback = function() {
					this._moveToNextItem(bShouldChangeSelection);
				};

				this._removeItem(oItem, fnSelectionCallback);
		};

		/**
		 * Calculates the next item to be focused and selected and applies the focus and selection when an item is removed.
		 *
		 * @param {boolean} bSetAsSelected Whether the next item to be selected
		 * @private
		 */
		TabStrip.prototype._moveToNextItem = function (bSetAsSelected) {
			if (!this._oItemNavigation) {
				return;
			}

			var iItemsCount = this.getItems().length,
				iCurrentFocusedIndex = this._oItemNavigation.getFocusedIndex(),
				iNextIndex = iItemsCount === iCurrentFocusedIndex ? --iCurrentFocusedIndex : iCurrentFocusedIndex,
				oNextItem = this.getItems()[iNextIndex],
				fnFocusCallback = function () {
					if (this._oItemNavigation) {
						this._oItemNavigation.focusItem(iNextIndex);
					}
				};


				//ToDo: Might be reconsidered when TabStrip is released for standalone usage
				// Selection (causes invalidation)
				if (bSetAsSelected) {
					this.setSelectedItem(oNextItem);
					//Notify the subscriber
					this.fireItemPress({item: oNextItem});
				}
				// Focus (force to wait until invalidated)
				setTimeout(fnFocusCallback.bind(this), 0);
		};

		/**
		 * Activates an item on the <code>TabStrip</code>.
		 *
		 * @param {sap.m.TabStripItem} oItem The item to be activated
		 * @param {jQuery.Event} oEvent  Event object that probably will be present as the item activation is bubbling
		 * @private
		 */
		TabStrip.prototype._activateItem = function(oItem, oEvent) {
			/* As the '_activateItem' is part of a bubbling selection change event, allow the final event handler
			 * to prevent it.*/
			if (this.fireItemSelect({item: oItem})) {
				if (!this.getSelectedItem() || this.getSelectedItem() !== oItem.getId()) {
					this.setSelectedItem(oItem);
				}
				this.fireItemPress({
					item: oItem
				});
			} else if (oEvent && !oEvent.isDefaultPrevented()) {
				oEvent.preventDefault();
			}
		};

		/**
		 * Adds an entity <code>oObject</code> to the aggregation identified by <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of the aggregation where the new entity is to be added
		 * @param {any} oObject The value of the aggregation to be added
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._handleItemsAggregation(['addAggregation', oObject, bSuppressInvalidate], true);
			}
			return Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		/**
		 * Inserts an entity to the aggregation named <code>sAggregationName</code> at position <code>iIndex</code>.
		 *
		 * @param {string} sAggregationName The name of the aggregation
		 * @param {any} oObject The value of the aggregation to be inserted
		 * @param {int} iIndex The index to be inserted in
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._handleItemsAggregation(['insertAggregation', oObject, iIndex, bSuppressInvalidate], true);
			}
			return Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		};

		/**
		 * Removes an entity from the aggregation named <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of the aggregation
		 * @param {any} oObject The value of aggregation to be removed
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._handleItemsAggregation(['removeAggregation', oObject, bSuppressInvalidate]);
			}
			return Control.prototype.removeAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		/**
		 * Removes all objects from the aggregation named <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of aggregation
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._handleItemsAggregation(['removeAllAggregation', null, bSuppressInvalidate]);
			}
			return Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
		};

		/**
		 * Destroys all the entities in the aggregation named <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of aggregation
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._handleItemsAggregation(['destroyAggregation', bSuppressInvalidate]);
			}
			return Control.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
		};

		/*
		 * Sets a <code>TabStripItem</code> as current.
		 *
		 * @param {sap.m.TabStripItem} oSelectedItem the item that should be set as current
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.setSelectedItem = function(oSelectedItem) {
			if (!oSelectedItem) {
				return this;
			}

			if (oSelectedItem.$().length > 0) {
				this._scrollIntoView(oSelectedItem, 500);
			}

			this._updateAriaSelectedAttributes(this.getItems(), oSelectedItem);
			this._updateSelectedItemClasses(oSelectedItem.getId());

			// propagate the selection change to the select aggregation
			if (this.getHasSelect()) {
				var oSelectItem = this._findSelectItemFromTabStripItem(oSelectedItem);
				this.getAggregation('_select').setSelectedItem(oSelectItem);
			}

			return this.setAssociation("selectedItem", oSelectedItem, true); //render manually;
		};

		/**
		 * Overrides the default method to make sure a <code>TabStripSelect</code> instance is created when needed.
		 *
		 * @param {string} sPropertyName The property name to be set
		 * @param {any} vValue The property value to be set
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining
		 * @override
		 */
		TabStrip.prototype.setProperty = function(sPropertyName, vValue, bSuppressInvalidate) {
			var vRes;
			vRes = Control.prototype.setProperty.call(this, sPropertyName, vValue, bSuppressInvalidate);

			// handle the _select aggregation instance
			if (sPropertyName === 'hasSelect') {
				if (vValue) {
					if (!this.getAggregation('_select')) {
						vRes = this.setAggregation('_select', this._createSelect(this.getItems()));
					}
				} else {
					vRes = this.destroyAggregation('_select');
				}
			}

			return vRes;
		};

		/**
		 * Attaches any previously added event handlers.
		 *
		 * @param {object} oObject The <code>TabStripItem</code> instance on which events will be detached/attached
		 * @private
		 */
		TabStrip.prototype._attachItemEventListeners = function (oObject) {
			if (oObject instanceof TabStripItem) {
				var aEvents = [
						'itemClosePressed',
						'itemPropertyChanged'
					];
				aEvents.forEach(function (sEventName) {
					sEventName = sEventName.charAt(0).toUpperCase() + sEventName.slice(1); // Capitalize

					// detach any listeners - make sure we always have one listener at a time only
					oObject['detach' + sEventName](this['_handle' + sEventName]);
					//e.g. oObject['detachItemClosePressed'](this.['_handleItemClosePressed'])

					// attach the listeners
					oObject['attach' + sEventName](this['_handle' + sEventName].bind(this));
				}, this);
			}
		};

		/**
		 * Detaches any previously added event handlers.
		 *
		 * @param {object} oObject The <code>TabStripItem</code> instance on which events will be detached/attached.
		 * @private
		 */
		TabStrip.prototype._detachItemEventListeners = function (oObject) {
			// !oObject check is needed because "null" is an object
			if (!oObject || typeof oObject !== 'object' || !(oObject instanceof TabStripItem)) {
				// in case of no concrete item object, remove the listeners from all items
				// ToDo: confirm that the listeners removal is needed ..?
				var aItems = this.getItems();
				aItems.forEach(function (oItem) {
					if (typeof oItem !== 'object' || !(oItem instanceof TabStripItem)) {
						// because of recursion, make sure it never goes into endless loop
						return;
					}
					return this._detachItemEventListeners(oItem);
				}.bind(this));
			}
		};

		/**
		 * Propagates the property change from a <code>TabStrip</code> item instance to the <code>TabStrip</code> select item copy instance.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TabStrip.prototype._handleItemPropertyChanged = function (oEvent) {
			var oSelectItem = this._findSelectItemFromTabStripItem(oEvent.getSource());
			var sPropertyKey = oEvent['mParameters'].propertyKey;
			// call it directly with the setter name so overwritten functions can be called and not setProperty method directly
			var sMethodName = "set" + sPropertyKey.substr(0,1).toUpperCase() + sPropertyKey.substr(1);
			oSelectItem[sMethodName](oEvent['mParameters'].propertyValue);
		};

		/**
		 * Fires an item close request event based on an item close button press.
		 *
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		TabStrip.prototype._handleItemClosePressed = function (oEvent) {
			this._removeItem(oEvent.getSource());
		};

		/**
		 * Request the given item to be closed and removes it from the <code>items</code> aggregation if permitted.
		 *
		 * @param {sap.m.TabStripItem} oItem The item which will disappear
		 * @param {function} fnCallback A callback function to be called after the item is removed
		 * @private
		 */
		TabStrip.prototype._removeItem = function(oItem, fnCallback) {
			var oTabStripItem;
			/* this method is handling the close pressed event on all item instances (TabStrip and the
			 * CustomSelect copy), so when it's handling the press on the CustomSelect item, it needs to determine the TabStrip item out of the event and vice-versa */
			if (!(oItem instanceof TabStripItem)) {
				Log.error('Expecting instance of a TabStripSelectItem, given: ', oItem);
			}
			if (oItem.getId().indexOf(TabStrip.SELECT_ITEMS_ID_SUFFIX) !== -1) {
				oTabStripItem = this._findTabStripItemFromSelectItem(oItem);

			} else {
				oTabStripItem = oItem;
			}

			if (this.fireItemClose({item: oTabStripItem})) {
				this.removeAggregation('items', oTabStripItem); // the select item will also get removed
				this._moveToNextItem(oItem.getId() === this.getSelectedItem());

				if (fnCallback) {
					fnCallback.call(this);
				}
			}
		};

		/**
		 * Ensures proper handling of <code>TabStrip</code> <code>items</code> aggregation> and proxies to the <code>TabStripSelect</code> <code>items</code> aggregation.
		 *
		 * @param {array} aArgs
		 * @param {boolean} bIsAdding
		 * @returns {sap.m.TabStrip} <code>this</code> instance for chaining
		 */
		TabStrip.prototype._handleItemsAggregation = function (aArgs, bIsAdding) {
			var sAggregationName = 'items', // name of the aggregation in CustomSelect
				sFunctionName = aArgs[0],
				oObject = aArgs[1],
				aNewArgs = [sAggregationName];

			/* remove the function name from the args array */
			aArgs.forEach(function (iItem, iIndex) {
				if (iIndex > 0) {
					aNewArgs.push(iItem);
				}
			});

			if (bIsAdding) {
				// attach and detach (or only detach if not adding) event listeners for the item
				this._attachItemEventListeners(oObject);
			} else {
				this._detachItemEventListeners(oObject);
			}

			// no need to handle anything else for other aggregations than 'items'
			if (sAggregationName !== "items") {
				return this;
			}

			if (this.getHasSelect()) {
				this._handleSelectItemsAggregation(aNewArgs,  bIsAdding, sFunctionName, oObject);
			}
			return this;
		};

		/**
		 * Ensures proper handling of <code>TabStrip</code> <code>items</code> aggregation and proxies to the <code>TabStripSelect</code> <code>items</code> aggregation.
		 *
		 * @param {array} aArgs
		 * @param {boolean} bIsAdding
		 * @param {string} sFunctionName
		 * @param {object} oObject
		 * @returns {*}
		 */
		TabStrip.prototype._handleSelectItemsAggregation = function (aArgs, bIsAdding, sFunctionName, oObject) {
			var oSelect = this.getAggregation('_select'),
				// a new instance, holding a copy of the TabStripItem which is given to the CustomSelect instance
				oDerivedObject;

			if (sFunctionName === 'destroyAggregation' && !oSelect) {
				/* ToDo : For some reason aggregation _select may be already deleted (e.g. TabStrip.destroy will destroy all children including _select */
				return;
			}
			// ToDo: test this functionality
			// destroyAggregation and removeAllAggregation no not need oObject, action can be directly taken
			if (oObject === null || typeof oObject !== 'object') {
				return oSelect[sFunctionName]['apply'](oSelect, aArgs);
			}

			if (bIsAdding) {
				oDerivedObject = this._createSelectItemFromTabStripItem(oObject);
			} else {
				oDerivedObject = this._findSelectItemFromTabStripItem(oObject);
			}

			// substitute the TabStrip item instance with the TabStripSelectItem instance
			aArgs.forEach(function (iItem, iIndex) {
				if (typeof iItem === 'object') {
					aArgs[iIndex] = oDerivedObject;
				}
			});

			return oSelect[sFunctionName]['apply'](oSelect, aArgs);
		};

		/**
		 * Creates <code>TabStripItem</code> in context of <code>TabStripSelect</code>.
		 *
		 * @param {Object} oSelect The select object to which the items will be added
		 * @param {array} aItems The items to be added
		 */
		TabStrip.prototype._addItemsToSelect = function (oSelect, aItems) {
			aItems.forEach(function (oItem) {
				var oSelectItem = this._createSelectItemFromTabStripItem(oItem);
				oSelect.addAggregation('items', oSelectItem);

				// make sure to set the correct select item
				if (oItem.getId() === this.getSelectedItem()) {
					oSelect.setSelectedItem(oSelectItem);
				}
			}, this);
		};

		/**
		 * Ensures proper <code>TabStripItem</code> inheritance in context of <code>TabStripSelect</code>.
		 *
		 * @param {sap.m.TabStripItem} oTabStripItem The source item for which a TabStripSelect will be created
		 * @returns {sap.ui.core.Element} The TabStripSelect item created
		 */
		TabStrip.prototype._createSelectItemFromTabStripItem = function (oTabStripItem) {
			var oSelectItem;

			if (!oTabStripItem && !(oTabStripItem instanceof sap.m.TabContainerItem)) {
				Log.error('Expecting instance of "sap.m.TabContainerItem": instead of ' + oTabStripItem + ' given.');
				return;
			}

			oSelectItem = new TabStripItem({
				id: oTabStripItem.getId() + TabStrip.SELECT_ITEMS_ID_SUFFIX,
				text: oTabStripItem.getText(),
				additionalText: oTabStripItem.getAdditionalText(),
				icon: oTabStripItem.getIcon(),
				iconTooltip: oTabStripItem.getIconTooltip(),
				modified: oTabStripItem.getModified(),
				itemClosePressed: function (oEvent) {
					this._handleItemClosePressed(oEvent);
				}.bind(this)
			});

			oSelectItem.addEventDelegate({
				ontap: function (oEvent) {
					var oTarget = oEvent.srcControl;
					// if we clicked on the image/icon change the target to be the parent,
					// so the change event in the select can be handled properly
					if (oEvent.target.id === oTarget.getParent().getId() + "-img") {
						oEvent.srcControl = oTarget = oTarget.getParent();
					}
					if ((oTarget instanceof AccButton || oTarget instanceof Icon)) {
						this.fireItemClosePressed({item: this});
					}
				}
			}, oSelectItem);

			return oSelectItem;
		};

		/**
		 * Finds the correct <code>TabStripItem</code> in context of <code>TabStrip</code> by a given <code>TabStripItem</code> instance.
		 *
		 * @param {sap.m.TabStripItem} oTabStripSelectItem The <code>TabStripItem</code> instance which analogue is to be found
		 * @returns {sap.m.TabStripItem} The <code>TabStripItem</code> in context of <code>TabStripSelect</code> found (if any)
		 */
		TabStrip.prototype._findTabStripItemFromSelectItem = function (oTabStripSelectItem) {
			var iIndex,
				sTabStripItemId = oTabStripSelectItem.getId().replace(TabStrip.SELECT_ITEMS_ID_SUFFIX , ''),
				aTabStripItems = this.getItems();

			for (iIndex = 0; iIndex < aTabStripItems.length; iIndex++) {
				if (aTabStripItems[iIndex].getId() === sTabStripItemId) {
					return aTabStripItems[iIndex];
				}
			}
		};

		/**
		 * Finds the correct <code>TabStripItem</code> in context of <code>TabStripSelect</code> by a given <code>TabStripItem</code> instance.
		 *
		 * @param {sap.m.TabStripItem} oTabStripItem The <code>TabStripItem</code> instance which analogue is to be found
		 * @returns {sap.m.TabStripItem} The <code>TabStripItem</code> in context of <code>TabStripSelect</code> found (if any)
		 */
		TabStrip.prototype._findSelectItemFromTabStripItem = function (oTabStripItem) {
			var iIndex,
				aSelectItems,
				sSelectItemId = oTabStripItem.getId() + TabStrip.SELECT_ITEMS_ID_SUFFIX;

			if (this.getHasSelect()) {
				aSelectItems = this.getAggregation('_select').getItems();

				for (iIndex = 0; iIndex < aSelectItems.length; iIndex++) {
					if (aSelectItems[iIndex].getId() === sSelectItemId) {
						return aSelectItems[iIndex];
					}
				}
			}
		};

		/**
		 * Handles ARIA-selected attributes depending on the currently selected item.
		 *
		 * @param {Array.<sap.m.TabStripItem>} aItems The whole set of items
		 * @param {sap.m.TabStripItem} oSelectedItem Currently selected item
		 * @private
		 */
		TabStrip.prototype._updateAriaSelectedAttributes = function(aItems, oSelectedItem) {
			var sAriaSelected;
			aItems.forEach(function (oItem) {
				sAriaSelected = "false";
				if (oItem.$()) {
					if (oSelectedItem && oSelectedItem.getId() === oItem.getId()) {
						sAriaSelected = "true";
					}
					oItem.$().attr("aria-selected", sAriaSelected);
				}
			});
		};

		/**
		 * Handles the proper update of the <code>TabStripItem</code> selection class.
		 *
		 * @param {string} sSelectedItemId The ID of the selected item
		 */
		TabStrip.prototype._updateSelectedItemClasses = function(sSelectedItemId) {
			if (this.$("tabs")) {
				this.$("tabs").children(".sapMTabStripItemSelected").removeClass("sapMTabStripItemSelected");
				jQuery("#" + sSelectedItemId).addClass("sapMTabStripItemSelected");
			}
		};

		/**
		 * ToDo: This method doesn't work because the rendering works with ::after pseudo element - better to alter the
		 * renderer, so this logic would work the same way for the select item and tabstrip item. */

		/**
		 * Changes the visibility of the item "state" symbol.
		 * @param {any} vItemId The ID of the item
		 * @param {boolean} bShowState If the state must be shown
		 */
		TabStrip.prototype.changeItemState = function(vItemId, bShowState) {
			var $oItemState;

			// optimisation to not invalidate and rerender the whole parent DOM, but only manipulate the CSS class
			// for invisibility on the concrete DOM element that needs to change
			var aItems = this.getItems();
			aItems.forEach(function (oItem) {
				if (vItemId === oItem.getId()) {
					$oItemState = jQuery(oItem.$());
					if (bShowState === true && !$oItemState.hasClass(TabStripItem.CSS_CLASS_MODIFIED)) {
						$oItemState.addClass(TabStripItem.CSS_CLASS_MODIFIED);
					} else {
						$oItemState.removeClass(TabStripItem.CSS_CLASS_MODIFIED);
					}
				}
			});
		};

		/**
		 * Handles the <code>onTouchStart</code> event.
		 * @param {jQuery.Event} oEvent  Event object
		 */
		TabStrip.prototype.ontouchstart = function (oEvent) {
			var oTargetItem = jQuery(oEvent.target).control(0);
			if (oTargetItem instanceof TabStripItem ||
				oTargetItem instanceof AccButton ||
				oTargetItem instanceof Icon ||
				oTargetItem instanceof Image ||
				oTargetItem instanceof CustomSelect) {
				// Support only single touch
				// Store the pageX coordinate for for later usage in touchend
				this._oTouchStartX = oEvent.changedTouches[0].pageX;
			}
		};

		/**
		 * Handles the <code>onTouchEnd</code> event.
		 * @param {jQuery.Event} oEvent  Event object
		 */
		TabStrip.prototype.ontouchend = function (oEvent) {
			var oTarget,
				iDeltaX;

			if (!this._oTouchStartX) {
				return;
			}

			oTarget = jQuery(oEvent.target).control(0);
			// check if we click on the item Icon and if so, give the parent as a target
			if (oEvent.target.id === oTarget.getParent().getId() + "-img") {
				oTarget = oTarget.getParent();
			}
			// Support only single touch
			iDeltaX = Math.abs(oEvent.changedTouches[0].pageX - this._oTouchStartX);

			if (iDeltaX < TabStrip.MIN_DRAG_OFFSET) {
				if (oTarget instanceof TabStripItem) {
					// TabStripItem clicked
					this._activateItem(oTarget, oEvent);
				} else if (oTarget instanceof AccButton) {
					// TabStripItem close button clicked
					if (oTarget && oTarget.getParent && oTarget.getParent() instanceof TabStripItem) {
						oTarget = oTarget.getParent();
						this._removeItem(oTarget);
					}
				} else if (oTarget instanceof Icon) {
					// TabStripItem close button icon clicked
					if (oTarget && oTarget.getParent && oTarget.getParent().getParent && oTarget.getParent().getParent() instanceof TabStripItem) {
						oTarget = oTarget.getParent().getParent();
						this._removeItem(oTarget);
					}
				}
				// Not needed anymore
				this._oTouchStartX = null;
			}
		};

		/*
		 * Destroys all <code>TabStripItem</code> entities from the <code>items</code> aggregation of the <code>TabStrip</code>.
		 *
		 * @returns {sap.m.TabStrip} This instance for chaining
		 * @override
		 */
		TabStrip.prototype.destroyItems = function() {
			this.setAssociation("selectedItem", null);
			return this.destroyAggregation("items");
		};

		/****************************************** CUSTOM SELECT CONTROL **********************************************/

		var CustomSelectRenderer = Renderer.extend(SelectRenderer);

		CustomSelectRenderer.apiVersion = 2;

		var CustomSelect = Select.extend("sap.m.internal.TabStripSelect", {
			metadata: {
				library: "sap.m"
			},
			renderer: CustomSelectRenderer
		});

		CustomSelect.prototype.onAfterRendering = function (){
			Select.prototype.onAfterRendering.apply(this, arguments);
			this.$().attr("tabindex", "-1");
		};

		CustomSelect.prototype.onAfterRenderingPicker = function() {
			var oPicker = this.getPicker();

			Select.prototype.onAfterRenderingPicker.call(this);

			// on phone the picker is a dialog and does not have an offset
			if (Device.system.phone) {
				return;
			}


			oPicker.setOffsetX(Math.round(
				sap.ui.getCore().getConfiguration().getRTL() ?
					this.getPicker().$().width() - this.$().width() :
					this.$().width() - this.getPicker().$().width()
			)); // LTR or RTL mode considered
			oPicker.setOffsetY(this.$().parents().hasClass('sapUiSizeCompact') ? 2 : 3);
			oPicker._calcPlacement(); // needed to apply the new offset after the popup is open

		};

		CustomSelect.prototype.createList = function() {
			// list to use inside the picker
			this._oList = new CustomSelectList({
				width: "100%"
			}).attachSelectionChange(this.onSelectionChange, this)
				.addEventDelegate({
					ontap: function(oEvent) {
						this.close();
					}
				}, this);

			return this._oList;
		};

		CustomSelect.prototype.setValue = function(sValue) {
			Select.prototype.setValue.apply(this, arguments);

			this.$("label").toggleClass("sapMTSOverflowSelectLabelModified",
				this.getSelectedItem() && this.getSelectedItem().getProperty("modified"));

			return this;
		};

		CustomSelect.prototype._getValueIcon = function() {
			// our select will not show neither image nor icon on the left of the text
			return null;
		};

		/****************************************** CUSTOM SELECT LIST CONTROL *****************************************/

		var CustomSelectListRenderer = Renderer.extend(SelectListRenderer);

		CustomSelectListRenderer.apiVersion = 2;

		CustomSelectListRenderer.renderItem = function(oRm, oList, oItem, mStates) {
			oRm.openStart("li", oItem);
			oRm.class(SelectListRenderer.CSS_CLASS + "ItemBase");
			oRm.class(SelectListRenderer.CSS_CLASS + "Item");
			oRm.class("sapMTSOverflowSelectListItem");
			if (oItem.getProperty("modified")) {
				oRm.class("sapMTSOverflowSelectListItemModified");
			}
			if (Device.system.desktop) {
				oRm.class(SelectListRenderer.CSS_CLASS + "ItemBaseHoverable");
			}
			if (oItem === oList.getSelectedItem()) {
				oRm.class(SelectListRenderer.CSS_CLASS + "ItemBaseSelected");
			}
			oRm.attr("tabindex", 0);
			this.writeItemAccessibilityState.apply(this, arguments);
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapMSelectListItemText");
			oRm.openEnd();

			// write icon
			if (oItem.getIcon()) {
				oRm.renderControl(oItem._getImage());
			}

			oRm.openStart("div"); // Start texts container
			oRm.class("sapMTSTexts");
			oRm.openEnd();
			// write additional text
			this.renderItemText(oRm, oItem.getAdditionalText(), TabStripItem.CSS_CLASS_TEXT);

			// write label text
			this.renderItemText(oRm, oItem.getText(), TabStripItem.CSS_CLASS_LABEL);

			oRm.close("div");
			oRm.close("div");

			oRm.renderControl(oItem.getAggregation('_closeButton'));

			oRm.close("li");
		};

		CustomSelectListRenderer.renderItemText = function (oRm, sItemText, sCssClass) {
			oRm.openStart("div");
			oRm.class(sCssClass);
			oRm.openEnd();
			oRm.text(sItemText.slice(0, (Device.system.phone ? sItemText.length : TabStripItem.DISPLAY_TEXT_MAX_LENGTH)));
			// add three dots "..." at the end if not the whole additional text is shown
			if (!Device.system.phone && sItemText.length > TabStripItem.DISPLAY_TEXT_MAX_LENGTH) {
				oRm.text('...');
			}
			oRm.close("div");
		};

		var CustomSelectList = SelectList.extend("sap.m.internal.TabStripSelectList", {
			metadata: {
				library: "sap.m"
			},
			renderer: CustomSelectListRenderer
		});

		return TabStrip;
	});