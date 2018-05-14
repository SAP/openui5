/*
 * ! ${copyright}
 */
// Provides control sap.ui.dt.ContextMenu.
/* globals sap */
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/unified/Menu',
	'sap/ui/core/Control',
	'sap/m/Popover',
	'sap/m/VBox',
	'sap/m/HBox',
	'sap/m/Button',
	'sap/m/FlexItemData'
], function (
	jQuery,
	library,
	Menu,
	Control,
	Popover,
	VBox,
	HBox,
	Button,
	FlexItemData
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.dt.ContextMenu control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple ContextMenu.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @experimental
	 * @alias sap.ui.dt.ContextMenu
	 */
	var ContextMenu = Control.extend('sap.ui.dt.ContextMenuControl', {

		metadata: {
			properties: {

				/**
				 * Defines the maximum number of buttons displayed in the non-expanded version of the control.
				 * If more than n buttons are added an overflow button will be displayed instead of the nth button (n = maxButtonsDisplayed).
				 */
				"maxButtonsDisplayed": {
					type: "int",
					defaultValue: 4
				},
				/**
				 * Defines the buttons on the ContextMenu
				 * The objects should have the following properties:
				 * text - for the button text in the expanded version and the tooltip in the non-expanded version
				 * icon - the url of the butons icon
				 * handler - the function to call when the button is pressed
				 */
				"buttons": {
					type: "object[]",
					defaultValue: []
				},
				/**
				 * The Style class which should be added to the ContextMenu
				 */
				styleClass: {
					type: "string"
				}
			},

			events: {
				/**
				 * This event is fired after opening the ContextMenu
				 */
				Opened: {},
				/**
				 * This event is fired after closing the ContextMenu
				 */
				Closed: {},
				/**
				 * This event is fired when the overfow button is pressed
				 */
				OverflowButtonPressed: {}
			}
		},

		/**
		 * initializes the ContextMenu by adding a sap.m.Popover (with a sap.m.Flexbox as a content aggregation) as a Dependent of the ContextMenu
		 */
		init: function () {

			var sPopId = this.getId() + "-popover";

			var oPopover = new Popover(sPopId, {
				showHeader: false,
				verticalScrolling: false,
				horizontalScrolling: false,
				content: new HBox(sPopId + "ContentBox", {
					renderType: "Bare"
				})
			});

			// Returns the duration for the Popover's closing animation.
			// It particularily concerns the setting of the focus within the contextMenu
			oPopover._getAnimationDuration = function() {
				return 0;
			};

			oPopover.attachBrowserEvent("keydown", this._changeFocusOnKeyStroke, this);
			oPopover.oPopup.attachClosed(this._popupClosed, this);
			this.addDependent(oPopover);
			oPopover.addStyleClass("sapUiDtContextMenu");

			var sPopExpId = this.getId() + "-popoverExp";

			var oPopoverExpanded = new Popover(sPopExpId, {
				showHeader: false,
				verticalScrolling: false,
				horizontalScrolling: false,
				content: new VBox(sPopExpId + "ContentBox", {
					renderType: "Bare"
				})
			});

			// Returns the duration for the Popover's closing animation.
			// It particularily concerns the setting of the focus within the contextMenu
			oPopoverExpanded._getAnimationDuration = function() {
				return 0;
			};

			oPopoverExpanded.attachBrowserEvent("keydown", this._changeFocusOnKeyStroke, this);
			oPopoverExpanded.oPopup.attachClosed(this._popupClosed, this);
			this.addDependent(oPopoverExpanded);
			oPopoverExpanded.addStyleClass("sapUiDtContextMenu");

			oPopover.attachBrowserEvent("contextmenu", this._onContextMenu, this);
			oPopoverExpanded.attachBrowserEvent("contextmenu", this._onContextMenu, this);
			this.bOnInit = true;

			var oStatic;
			try {
				oStatic = sap.ui.getCore().getStaticAreaRef();
				oStatic = sap.ui.getCore().getUIArea(oStatic);
			} catch (e) {
				jQuery.sap.log.error(e);
				throw new Error("Popup cannot be opened because static UIArea cannot be determined.");
			}

			oStatic.addContent(this, true);

		},

		exit: function () {
			this.getPopover(true).oPopup.detachClosed(this._popupClosed, this);
			this.getPopover(false).oPopup.detachClosed(this._popupClosed, this);
			this.getPopover(true).detachBrowserEvent("contextmenu", this._onContextMenu, this);
			this.getPopover(false).detachBrowserEvent("contextmenu", this._onContextMenu, this);
		},

		/**
		 * Opens the ContextMenu and sets the ContextMenu position by the oSource parameter.
		 * Note: this gets called before the old Menu is closed because of asynchronus animations.
		 * @param {sap.ui.core.Control} oSource - The control by which the Popover will be placed.
		 * @param {boolean} bContextMenu - If the ContextMenu should appear as Context Menu
		 * @param {Object} oContextMenuPosition - The position of the ContextMenu if it should be opened as Context Menu (only needed if bContextMenu)
		 * @public
		 */
		show: function (oSource, bContextMenu, oContextMenuPosition) {
			if (this._bUseExpPop === undefined) {
				this._bUseExpPop = !!bContextMenu;
			}

			this._bCompactMode = jQuery(oSource.getDomRef()).attr("class").indexOf("sapUiSizeCompact") > -1;

			this._bOpenAsContextMenu = bContextMenu;
			this._oContextMenuPosition = oContextMenuPosition;
			this.getPopover(true).addStyleClass(this.getStyleClass() || "");
			this.getPopover(false).addStyleClass(this.getStyleClass() || "");

			// creates buttons specified in objects in property buttons
			var aButtons = this.getButtons();
			this._oTarget = oSource;

			if (!this._bOpenAsContextMenu) {

				this._setButtonsForContextMenu(aButtons, oSource);

			} else {
				this._makeAllButtonsVisible(aButtons);
			}

			if (this.bOnInit || !this.getPopover().isOpen()) { // if there was no other ContextMenu open before

				this.finalizeOpening();
				this.bOnInit = false;
			}
		},

		/**
		 * Finalizes the Opening of the ContextMenu. Is called by "_popupClosed" (when the old Menu is closed) or by "show" if there was no ContextMenu opened before
		 * Is needed to prevent flickering (wait for old ContextMenu to close)
		 */
		finalizeOpening: function () {
			if (this._bOpenAsContextMenu && this._oContextMenuPosition.x === null && this._oContextMenuPosition.y === null) {
				this._bOpenAsContextMenu = false;
			}

			// fires the open event after popover is opened
			this.getPopover().attachAfterOpen(this._handleAfterOpen, this);

			this._oTarget = this._placeContextMenu(this._oTarget, this._bOpenAsContextMenu, this._bUseExpPop);

			this.getPopover().openBy(this._oTarget);

			this._placeContextMenuWrapper();

			this.getPopover().setVisible(true);
			this.bOpen = true;
			this.bOpenNew = false;
		},

		/**
		 * Sets all parameters of the buttons in the non-expanded ContextMenu
		 * @param {array} aButtons some buttons
		 * @param {Overlay} oSource the source
		 */
		_setButtonsForContextMenu: function (aButtons, oSource) {

			var iButtonsEnabled = this._getNumberOfEnabledButtons(aButtons);

			if (iButtonsEnabled !== 0) {

				this._hideDisabledButtons(aButtons);
			}

			this._iButtonsVisible = this._hideButtonsInOverflow(aButtons);

			if (this._iButtonsVisible === this.getMaxButtonsDisplayed() && this._iButtonsVisible !== aButtons.length) {

				this._replaceLastVisibleButtonWithOverflowButton(aButtons);

			} else if (iButtonsEnabled < aButtons.length && iButtonsEnabled != 0) {

				this.addOverflowButton();
			}

			iButtonsEnabled = null;
		},

		/**
		 * Makes all buttons and their text visible
		 * @param {array} aButtons some buttons
		 */
		_makeAllButtonsVisible: function (aButtons) {

			this._iFirstVisibleButtonIndex = 0;

			aButtons.forEach(function (oButton) {
				oButton.setVisible(true);
				oButton._bInOverflow = true;
			});
		},

		/**
		 * Returns the number of enabled button
		 * Sets firstVisibleButtonIndex
		 * @param {array} aButtons some buttons
		 * @return {int} number of enabled buttons
		 */
		_getNumberOfEnabledButtons: function (aButtons) {

			var iButtonsEnabled = 0;

			for (var i = 0; i < aButtons.length; i++) {
				if (aButtons[i].getEnabled()) {
					iButtonsEnabled++;
					if (!this._iFirstVisibleButtonIndex) {
						this._iFirstVisibleButtonIndex = i;
					}
				}
			}

			return iButtonsEnabled;
		},

		/**
		 * Hiddes all disabled buttons and returns the number if visible buttons
		 * @param {array} aButtons some Buttons
		 * @return {int} the number of visible buttons
		 */
		_hideDisabledButtons: function (aButtons) {

			var iVisibleButtons = 0;

			aButtons.forEach(function (oButton) {

				oButton.setVisible(oButton.getEnabled());

				if (oButton.getEnabled()) {
					iVisibleButtons++;
				}
			});

			return iVisibleButtons;
		},

		/**
		 * Hides the buttons in overflow
		 * @param {array} aButtons some Buttons
		 * @return {int} the number of visible buttons
		 */
		_hideButtonsInOverflow: function (aButtons) {

			var iVisibleButtons = 0;

			for (var i = 0; i < aButtons.length; i++) {

				if (iVisibleButtons < this.getMaxButtonsDisplayed() && aButtons[i].getVisible()) {
					iVisibleButtons++;
				} else {
					aButtons[i].setVisible(false);
				}
			}

			return iVisibleButtons;
		},

		/**
		 * Hides the last visible button and adds an OverflowButton
		 * @param {array} aButtons some buttons
		 */
		_replaceLastVisibleButtonWithOverflowButton: function (aButtons) {

			for (var i = aButtons.length - 1; i >= 0; i--) {
				if (aButtons[i].getVisible()) {

					aButtons[i].setVisible(false);
					this.addOverflowButton();

					return;
				}
			}
		},

		/**
		 * Works out how the ContextMenu shall be placed
		 * Sets the placement property of the popover
		 * Places a "fakeDiv" in the DOM which the popover can be opened by
		 * @param {sap.m.Control} oSource the overlay
		 * @param {boolean} bContextMenu whether the ContextMenu should be opened as a context menu
		 * @param {boolean} bExpanded whether the ContextMenu is expanded
		 * @return {div} the "fakeDiv"
		 * @private
		 */
		_placeContextMenu: function (oSource, bContextMenu, bExpanded) {
			this.getPopover().setShowArrow(true);

			var sOverlayId = (oSource.getId && oSource.getId()) || oSource.getAttribute("overlay");
			var sFakeDivId = "contextMenuFakeDiv";

			var oPopoverDimensions = this._getPopoverDimensions(bExpanded, !bContextMenu);
			var oOverlayDimensions = this._getOverlayDimensions(sOverlayId);
			var oViewportDimensions = this._getViewportDimensions();

			var oPosition = {};

			if (bContextMenu) {
				oPosition = this._placeAsExpandedContextMenu(this._oContextMenuPosition, oPopoverDimensions, oViewportDimensions);
			} else {
				oPosition = this._placeAsCompactContextMenu(oOverlayDimensions, oPopoverDimensions, oViewportDimensions);
			}

			oPosition.top -= oOverlayDimensions.top;
			oPosition.left -= oOverlayDimensions.left;

			jQuery("#" + sFakeDivId).remove();
			jQuery("#" + sOverlayId).append("<div id=\"" + sFakeDivId + "\" overlay=\"" + sOverlayId + "\" style = \"position:absolute;top:" + oPosition.top + "px;left:" + oPosition.left + "px;\" />");
			sOverlayId = null;

			return document.getElementById(sFakeDivId);
		},

		/**
		 * Works out how the ContextMenu shall be placed
		 * @param {object} oContPos the context menu position
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeAsExpandedContextMenu: function (oContPos, oPopover, oViewport) {

			this.getPopover().setShowArrow(false);

			var oPos = {};

			if (oViewport.height - oContPos.y >= oPopover.height) {
				oPos.top = oContPos.y;
				this.getPopover().setPlacement("Bottom");
			} else if (oContPos.y >= oPopover.height) {
				oPos.top = oContPos.y;
				this.getPopover().setPlacement("Top");
			} else if (oViewport.height >= oPopover.height) {
				oPos.top = oViewport.height - oPopover.height;
				this.getPopover().setPlacement("Bottom");
			} else {
				jQuery.error("Your screen size is not supported!");
			}

			if (oViewport.width - oContPos.x >= oPopover.width) {
				oPos.left = oContPos.x;
			} else if (oContPos.x >= oPopover.width) {
				oPos.left = oContPos.x - oPopover.width;
			} else if (oViewport.width >= oPopover.width) {
				oPos.left = oViewport.width - oPopover.width;
			} else {
				jQuery.error("Your screen size is not supported!");
			}

			return oPos;
		},

		/**
		 * Works out how the ContextMenu shall be placed
		 * @param {object} oOverlay the dimensions of the overlay
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeAsCompactContextMenu: function (oOverlay, oPopover, oViewport) {

			this.getPopover().setShowArrow(true);

			var oPos = {
				top: null,
				left: null
			};

			if (oOverlay.top >= oPopover.height && oViewport.width >= oPopover.width && !oOverlay.isOverlappedAtTop) {
				oPos = this._placeContextMenuOnTop(oOverlay);
			} else if (oViewport.height - oOverlay.top >= oPopover.height + 5 && oViewport.height >= oPopover.height + 5 && oViewport.width >= oPopover.width) {
				oPos = this._placeContextMenuAtTheBottom(oOverlay, oPopover, oViewport);
			} else if (oViewport.height >= oPopover.height && oViewport.width >= oPopover.width) {
				oPos = this._placeContextMenuSideways(oOverlay, oPopover, oViewport);
			} else {
				jQuery.error("Your screen size is not supported!");
			}

			return oPos;
		},

		/**
		 * Works out how the ContextMenu shall be placed on top of the overlay
		 * @param {object} oOverlay the dimensions of the overlay
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeContextMenuOnTop: function (oOverlay) {

			var oPos = {};

			this.getPopover().setPlacement("Top");
			oPos.top = oOverlay.top;
			oPos.left = oOverlay.left + oOverlay.width / 2;

			return oPos;
		},

		/**
		 * Works out how the ContextMenu shall be placed at the bottom of the overlay
		 * @param {object} oOverlay the dimensions of the overlay
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeContextMenuAtTheBottom: function (oOverlay, oPopover, oViewport) {

			this.getPopover().setPlacement("Bottom");

			var oPos = {},
				iRtaToolbarHeight = jQuery(".sapUiRtaToolbar").height(),
				iViewportTop = iRtaToolbarHeight ? iRtaToolbarHeight : oViewport.top,
				iViewportHeight = iRtaToolbarHeight ? oViewport.height - iRtaToolbarHeight : oViewport.height;

			oPos.left = oOverlay.left + oOverlay.width / 2;

			if ((oOverlay.height < 60 || oOverlay.isOverlappedAtTop) && iViewportHeight - oOverlay.top - oOverlay.height >= oPopover.height) {
				oPos.top = oOverlay.bottom;
			} else if (oOverlay.top >= iViewportTop) {
				oPos.top = oOverlay.top + 5;
			} else {
				// position on top of the viewport but below the RTAToolbar
				oPos.top = iViewportTop + 5;
			}
			return oPos;
		},

		/**
		 * Works out how the ContextMenu shall be placed sideways
		 * @param {object} oOverlay the dimensions of the overlay
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeContextMenuSideways: function (oOverlay, oPopover, oViewport) {

			var oPos = {};

			oPos.left = this._getContextMenuSidewaysPlacement(oOverlay, oPopover, oViewport);

			oPos.top = this._getMiddleOfOverlayAndViewportEdges(oOverlay, oViewport);

			return oPos;
		},

		/**
		 * Works out whether the ContextMenu shall be placed on the right, on the left or from the middle of the overlay
		 * @param {object} oOverlay the dimensions of the overlay
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {integer} the left position of the "fakeDiv"
		 */
		_getContextMenuSidewaysPlacement: function (oOverlay, oPopover, oViewport) {

			var iLeft;

			if (oViewport.width - oOverlay.right >= oPopover.width) {

				this.getPopover().setPlacement("Right");
				iLeft = oOverlay.right;

			} else if (oOverlay.left >= oPopover.width) {

				this.getPopover().setPlacement("Left");
				iLeft = oOverlay.left;

			} else {

				this.getPopover().setPlacement("Right");

				if (oPopover.width <= oViewport.width - (oOverlay.left + oOverlay.width / 2)) {
					iLeft = (oOverlay.left + oOverlay.width / 2);
				} else {
					iLeft = oViewport.width - oPopover.width;
				}
			}

			return iLeft;
		},

		/**
		 * Works out the middle of the overlay and viewport edges incase the overlay edges are outside of the viewport
		 * @param {object} oOverlay the dimensions of the overlay
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {integer} the top position of the "fakeDiv"
		 */
		_getMiddleOfOverlayAndViewportEdges: function (oOverlay, oViewport) {

			var iTop;

			if (oViewport.top > oOverlay.top) {
				iTop = oViewport.top;
			} else {
				iTop = oOverlay.top;
			}

			if (oViewport.bottom < oOverlay.bottom) {
				iTop += oViewport.bottom;
			} else {
				iTop += oOverlay.bottom;
			}

			iTop /= 2;

			return iTop;
		},

		/**
		 * Places a wrapper behind the ContextMenu to prevent the ContextMenu from being closed by hover
		 */
		_placeContextMenuWrapper: function () {

			jQuery("#ContextMenuWrapper").remove();

			var $Popover = jQuery(this.getPopover().getDomRef());

			var iArr = parseInt(jQuery("#" + this.getPopover().getId() + "-arrow").height(), 10);

			var iPopTop = parseInt($Popover.css("top"), 10) - $Popover.position().top - iArr;
			var iPopLeft = parseInt($Popover.css("left"), 10) - $Popover.position().left - iArr;
			var iPopWidth = parseInt($Popover.css("width"), 10) + 2 * iArr;
			var iPopHeight = parseInt($Popover.css("height"), 10) + 2 * iArr;
			var iPopZIndex = $Popover.css("z-index") - 1;

			jQuery(sap.ui.getCore().getStaticAreaRef()).append("<div id=\"ContextMenuWrapper\" style = \"position:absolute;top:" + iPopTop + "px;left:" + iPopLeft + "px;width:" + iPopWidth + "px;height:" + iPopHeight + "px;z-index:" + iPopZIndex + "\" />");

		},

		/**
		 * Gets the dimensions of the ContextMenu's popover
		 * @param {boolean} bExpanded whether the ContextMenu is expanded
		 * @param {boolean} bWithArrow whether the arrow width should be added
		 * @return {object} the dimensions of the ContextMenu's popover
		 */
		_getPopoverDimensions: function (bExpanded, bWithArrow) {

			var oPopover = {};

			var bCompact = this._bCompactMode;

			var fButtonHeight = this._getButtonHeight(bCompact);

			var fButtonWidth = this._getButtonWidth(bCompact);

			var fArrowHeight = this._getArrowHeight(bCompact);

			var iBaseFontsize = this._getBaseFontSize();

			oPopover.height = iBaseFontsize * fButtonHeight;
			this._iFirstVisibleButtonIndex = null;

			if (bExpanded) {
				oPopover.height *= this.getButtons().length - 1;
				oPopover.width = parseInt(jQuery("#" + this.getPopover().getId()).css("width"), 10) || 80;
			} else {
				oPopover.width = iBaseFontsize * fButtonWidth * this._iButtonsVisible;
			}

			if (bWithArrow) {
				var iArr = iBaseFontsize * fArrowHeight;
				if (iArr) {
					oPopover.height += 2 * iArr;
					oPopover.width += 2 * iArr;
				}
			}

			return oPopover;
		},

		/**
		 * Returns the height of a button in rem
		 * @param {boolean} bCompact wheter ContextMenu is compact
		 * @return {float} the height of a button in rem
		 */
		_getButtonHeight: function (bCompact) {
			return bCompact ? 2 : 3;
		},

		/**
		 * Returns the width of a button with only an icon in rem
		 * @param {boolean} bCompact wheter ContextMenu is compact
		 * @return {float} the width of a button in rem
		 */
		_getButtonWidth: function (bCompact) {
			return bCompact ? 2 : 2.5;
		},

		/**
		 * Returns the height of a popover arrow
		 * @param {boolean} bCompact wheter ContextMenu is compact
		 * @return {float} the height of a popover arrow
		 */
		_getArrowHeight: function (bCompact) {
			if (sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.edge) {
				return bCompact ? 0.5 : 0.5;
			} else {
				return bCompact ? 0.5625 : 0.5625;
			}
		},

		/**
		 * Returns the base font size in px
		 * @return {int} the base font size in px
		 */
		_getBaseFontSize: function () {
			return parseInt(jQuery(document.documentElement).css("fontSize"), 10);
		},

		/**
		 * Gets the dimensions of an overlay
		 * @param {String} sOverlayId the overlay
		 * @return {object} the dimensions of the overlay
		 */
		_getOverlayDimensions: function (sOverlayId) {

			var oOverlayDimensions = jQuery("#" + sOverlayId).rect();

			oOverlayDimensions.right = oOverlayDimensions.left + oOverlayDimensions.width;
			oOverlayDimensions.bottom = oOverlayDimensions.top + oOverlayDimensions.height;
			oOverlayDimensions.isOverlappedAtTop = this._isOverlayOverlapped(sOverlayId, oOverlayDimensions, "top");
			oOverlayDimensions.isOverlappedAtBottom = this._isOverlayOverlapped(sOverlayId, oOverlayDimensions, "bottom");

			return oOverlayDimensions;
		},

		_isOverlayOverlapped: function(sSelectedOverlayId, oOverlayDimensions, sTop) {
			var oElement;

			if (sTop === "top") {
				oElement = document.elementFromPoint(oOverlayDimensions.left + (oOverlayDimensions.width / 2), (oOverlayDimensions.top + 5));
			}
			if (sTop === "bottom") {
				oElement = document.elementFromPoint(oOverlayDimensions.left + (oOverlayDimensions.width / 2), (oOverlayDimensions.bottom - 5));
			}
			if (!oElement) {
				return true;
			} else if (oElement.id === sSelectedOverlayId) {
				return false;
			}
			return !jQuery("#" + sSelectedOverlayId)[0].contains(oElement);
		},

		/**
		 * Gets the dimensions of the viewport
		 * @return {object} the dimensions of the viewport
		 */
		_getViewportDimensions: function () {
			var oViewport = {};

			oViewport.width = window.innerWidth;
			oViewport.height = window.innerHeight;
			oViewport.top = parseInt(jQuery(".type_standalone").css("height"), 10) || 0;
			oViewport.bottom = oViewport.top + oViewport.height;

			return oViewport;
		},

		_getIcon: function(sIcon) {
			if (sIcon === undefined || sIcon === null || typeof sIcon !== "string") {
				return "sap-icon://incident";
			}
			if (sIcon === "blank") {
				return " ";
			}
			return sIcon;
		},

		/**
		 * Adds a overflowButton to the ContextMenu.
		 * @return {sap.m.ContextMenu} Reference to this in order to allow method chaining
		 * @public
		 */
		addOverflowButton: function() {
			var sOverflowButtonId = "OVERFLOW_BUTTON",
				oButtonOptions = {
					icon: "sap-icon://overflow",
					type: "Transparent",
					enabled: true,
					press: this._onOverflowPress.bind(this),
					layoutData: new FlexItemData({})
				};
			return this._addButton(sOverflowButtonId, oButtonOptions);
		},

		/**
		 * Adds a menu action button to the contextMenu
		 * @param {Object} oButtonItem the button configuration item
		 * @param {function} fnContextMenuHandler the handler function for button press event
		 * @param {object} oOverlay the target overlay
		 * @return {sap.m.ContextMenu} Reference to this in order to allow method chaining
		 * @public
		 */
		addMenuButton: function(oButtonItem, fnContextMenuHandler, oOverlay) {
			var fnHandler = function(oEvent) {
				this.bOpen = false;
				this.bOpenNew = false;
				fnContextMenuHandler(this);
			};

			var sText = typeof oButtonItem.text === "function" ? oButtonItem.text(oOverlay) : oButtonItem.text;
			var bEnabled = typeof oButtonItem.enabled === "function" ? oButtonItem.enabled(oOverlay) : oButtonItem.enabled;
			var oButtonOptions = {
				icon: this._getIcon(oButtonItem.icon),
				text: sText,
				type: "Transparent",
				enabled: bEnabled,
				press: fnHandler,
				layoutData: new FlexItemData({})
			};
			return this._addButton(oButtonItem.id, oButtonOptions);
		},

		_addButton: function (sButtonItemId, oButtonOptions) {
			this.setProperty("buttons", this.getProperty("buttons").concat(oButtonOptions));

			var oButtonCustomData = { id: sButtonItemId, key: sButtonItemId };
			var oExpandedMenuButton = new Button(oButtonOptions);
			oExpandedMenuButton.data(oButtonCustomData);

			oButtonOptions.tooltip = oButtonOptions.text;
			delete oButtonOptions.text;
			var oCompactMenuButton = new Button(oButtonOptions);
			oCompactMenuButton.data(oButtonCustomData);

			this.getFlexbox(true).addItem(oExpandedMenuButton);
			this.getFlexbox(false).addItem(oCompactMenuButton);

			return this;
		},

		/**
		 * Closes the ContextMenu.
		 * @param {boolean} bExplicitClose true if the popover has to be closed explicitly from the contextMenu. Otherwhise the closing is handled by the popover itself
		 * @return {sap.m.ContextMenu} Reference to this in order to allow method chaining
		 * @public
		 */
		close: function (bExplicitClose) {
			if (this.getPopover()) {

				if (bExplicitClose) {
					this.getPopover(true).close();
					this.getPopover(false).close();
				}

				// deletes the overflow button if there is one
				if (this.getProperty("buttons").length > this.getProperty("maxButtonsDisplayed")) {
					this.setProperty("buttons", this.getProperty("buttons").splice(0, this.getProperty("buttons").length - 1));

					this.getFlexbox().removeItem(this.getButtons().length - 1);
				}
			}

			return this;
		},

		/**
		 * Removes a button from the ContextMenu.
		 * @param {int} iIndex the button to remove or its index or id
		 * @return {sap.m.OverflowToolbarButton} The removed button or null
		 * @public
		 */
		removeButton: function (iIndex) {
			this.setProperty("buttons", this.getProperty("buttons").splice(iIndex, 1));

			this.getFlexbox(true).removeItem(iIndex);
			return this.getFlexbox(false).removeItem(iIndex);
		},

		/**
		 * Removes all buttons from the ContextMenu.
		 * @return {sap.m.OverflowToolbarButton} An array of the removed buttons (might be empty)
		 * @public
		 */
		removeAllButtons: function () {
			this.setProperty("buttons", []);
			this.getFlexbox(true).removeAllItems();
			return this.getFlexbox(false).removeAllItems();
		},

		/**
		 * Gets all buttons of the ContextMenu.
		 * @return {sap.m.OverflowToolbarButton[]} returns buttons
		 * @public
		 */
		getButtons: function () {
			return this.getFlexbox().getItems();
		},

		/**
		 * Inserts a button to the ContextMenu.
		 * @param {sap.m.OverflowToolbarButton} oButton the to insert
		 * @param {int} iIndex - the 0-based index the button should be inserted at
		 * @return {sap.m.ContextMenu} Reference to this in order to allow method chaining
		 * @public
		 */
		insertButton: function (oButton, iIndex) {
			this.getFlexbox().insertItem(oButton, iIndex);
			return this;
		},

		/**
		 * Sets the Buttons of the ContextMenu
		 * @param {Array} _aButtons the Buttons to insert
		 * @param {function} fnContextMenuHandler - the source
		 * @param {object} oOverlay - the target overlay
		 * @public
		 */
		setButtons: function (_aButtons, fnContextMenuHandler, oOverlay) {
			this.removeAllButtons();

			_aButtons.forEach(function (oButton) {
				this.addMenuButton(oButton, fnContextMenuHandler, oOverlay);
			}.bind(this));
		},

		/**
		 * Sets the maximum amount of Buttons
		 * @param {int} iMBD the maximum amount of buttons to be displayed in the non-expanded version of the Context-Menu
		 * @public
		 */
		setMaxButtonsDisplayed: function (iMBD) {
			if (iMBD < 2) {
				throw Error("maxButtonsDisplayed can't be less than two!");
			}
			this.setProperty("maxButtonsDisplayed", iMBD);
		},

		/**
		 * Returns one of the Popovers
		 * @param {boolean} bExpanded if undefined return the currently used Popover if true return expanded Popover if false return non-expanded Popover
		 * @return {sap.m.Popover} one of the Popovers
		 * @public
		 */
		getPopover: function (bExpanded) {

			if (bExpanded === undefined) {
				if (this._bUseExpPop) {
					return this.getDependents()[1];
				} else {
					return this.getDependents()[0];
				}
			} else if (bExpanded) {
				return this.getDependents()[1];
			} else {
				return this.getDependents()[0];
			}
		},

		/**
		 * Returns one of the Flexboxes
		 * @param {boolean} bExpanded if undefined return the currently used FlexBox if true return expanded FlexBox if false return non-expanded FlexBox
		 * @return {sap.m.Flexbox} the FlexBox
		 * @public
		 */
		getFlexbox: function (bExpanded) {
			return this.getPopover(bExpanded).getContent()[0];
		},

		/**
		 * Sets the openNew variable (whether a new ContextMenu is opened after closing the old one)
		 * @param {boolean} bValue The value for openNew
		 */
		setOpenNew: function (bValue) {
			this.bOpenNew = bValue;
		},

		/**
		 * Expands the ContextMenu
		 * @param {jQuery.Event} oEvt the press event
		 * @private
		 */
		_onOverflowPress: function (oEvt) {

			this.fireOverflowButtonPressed();

			var aButtons = this.getButtons();

			this.getPopover().close();

			this._bUseExpPop = true;

			// makes the overflow Button invisible
			this.getButtons()[aButtons.length - 1].setVisible(false);

			// set the placement of the ContextMenu
			var oFakeDiv = this._placeContextMenu(this._oTarget, false, true);

			this.getPopover().openBy(oFakeDiv);
		},

		/**
		 * Triggered when ContextMenu is closed
		 * needed to prevent flickering when opening up a new ContextMenu
		 * (A new Menu would show before the direction was set)
		 */
		_popupClosed: function () {

			jQuery("#ContextMenuWrapper").remove();

			if (this.getPopover()) { // in case the Menu was destroyed

				this.fireClosed();

				if (this.bOpenNew) {
					this.bOpenNew = false;
					this.finalizeOpening();
					return;
				}

			}

			this.bOpen = false;
		},

		/**
		 * Sets the focus on a Button if possible
		 * @param {sap.m.Button} oButton the button on which focus should be set
		 * @returns {boolean} true if focus was set
		 */
		_setFocusOnButton: function (oButton) {
			if (oButton.getEnabled() && oButton.getVisible()) {
				oButton.focus();
				return true;
			}
		},

		/**
		 * Changes the focus inside the ContextMenu if an Arrowkey is pressed
		 * Allows Safari users to navigate through the ContextMenu using tab and tab+shift
		 * @param {jQuery.Event} oEvent the keyboard event
		 */
		_changeFocusOnKeyStroke: function (oEvent) {
			if (document.activeElement) {

				var sId = document.activeElement.id;

				switch (oEvent.key) {
					case "ArrowRight":
						this._changeFocusOnButtons(sId);
						break;

					case "ArrowLeft":
						this._changeFocusOnButtons(sId, true);
						break;

					case "ArrowUp":
						this._changeFocusOnButtons(sId, true);
						break;

					case "ArrowDown":
						this._changeFocusOnButtons(sId);
						break;

					default:
						break;

				}
			}
		},

		/**
		 * Changes the focus for the Buttons in ContextMenu
		 * @param {string} sId the ID of the currently focused buttons
		 * @param {boolean} bPrevious if true, the previous button is selected instead of the next
		 */
		_changeFocusOnButtons: function (sId, bPrevious) {
			this.getButtons().some(function (oButton, iIndex, aArray) {
				if (sId === oButton.getId()) {
					if (bPrevious) {
						this._setFocusOnPreviousButton(aArray, iIndex);
					} else {
						this._setFocusOnNextButton(aArray, iIndex);
					}
					return true;
				}
			}.bind(this));
		},

		/**
		 * Sets focus on next button
		 * @param {Array} aButtons the array of Buttons
		 * @param {integer} iIndex the index of the currently focused buttons
		 */
		_setFocusOnNextButton: function (aButtons, iIndex) {
			for (var i0 = iIndex + 1; i0 < aButtons.length; i0++) {
				if (this._setFocusOnButton(aButtons[i0])) {
					return;
				}
			}

			for (var i1 = 0; i1 < iIndex; i1++) {
				if (this._setFocusOnButton(aButtons[i1])) {
					return;
				}
			}
		},

		/**
		 * Sets focus on previous button
		 * @param {Array} aButtons the array of Buttons
		 * @param {integer} iIndex the index of the currently focused buttons
		 */
		_setFocusOnPreviousButton: function (aButtons, iIndex) {

			for (var i0 = iIndex - 1; i0 >= 0; i0--) {
				if (this._setFocusOnButton(aButtons[i0])) {
					return;
				}
			}

			for (var i1 = aButtons.length - 1; i1 >= iIndex; i1--) {
				if (this._setFocusOnButton(aButtons[i1])) {
					return;
				}
			}

		},

		/**
		 * Handle Context Menu
		 * @param {sap.ui.base.Event} oEvent event object
		 * @private
		 */
		_onContextMenu: function (oEvent) {
			if (oEvent.preventDefault) {
				oEvent.preventDefault();
			}
		},

		_handleAfterOpen: function () {
			this.getPopover().detachAfterOpen(this._handleAfterOpen, this);
			this.fireOpened();
		},

		renderer: function () {}
	});

	return ContextMenu;

}, /* bExport= */ true);