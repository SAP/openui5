/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/base/util/deepEqual",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Button",
	"sap/m/FlexItemData",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DOMUtil",
	"sap/ui/Device",
	// jQuery Plugin "rect"
	"sap/ui/dom/jquery/rect"
], function(
	jQuery,
	ManagedObject,
	DeepEqual,
	mobileLibrary,
	Popover,
	VBox,
	HBox,
	Button,
	FlexItemData,
	OverlayRegistry,
	DOMUtil,
	Device
) {
	"use strict";

	var PlacementType = mobileLibrary.PlacementType;

	/**
	 * Constructor for a new sap.ui.dt.ContextMenu control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple ContextMenu.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @experimental
	 * @alias sap.ui.dt.ContextMenu
	 */
	var ContextMenu = ManagedObject.extend("sap.ui.dt.ContextMenuControl", {
		metadata: {
			properties: {
				/**
				 * Defines the maximum number of buttons displayed in the non-expanded version of the control.
				 * If more than n buttons are added an overflow button will be displayed instead of the nth button (n = maxButtonsDisplayed).
				 */
				maxButtonsDisplayed: {
					type: "int",
					defaultValue: 4
				},
				/**
				 * Defines the buttons on the ContextMenu
				 * The objects should have the following properties:
				 * text - for the button text in the expanded version and the tooltip in the non-expanded version
				 * icon - the url of the buttons icon
				 * handler - the function to call when the button is pressed
				 */
				buttons: {
					type: "object[]",
					defaultValue: []
				},
				/**
				 * The Style class which should be added to the ContextMenu
				 */
				styleClass: {
					type: "string",
					defaultValue: ""
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
		 * initializes the ContextMenu by creating the internal a sap.m.Popover (with a sap.m.Flexbox as a content aggregation) in internal _popovers aggregation of the ContextMenu
		 */
		init: function() {
			var sPopId = this.getId() + "-popover";
			var oPopover = new Popover(sPopId, {
				showHeader: false,
				verticalScrolling: false,
				placement: "Top",
				showArrow: true,
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

			oPopover.attachBrowserEvent("keydown", this._onKeyDown, this);
			this._oPopover = oPopover;
			oPopover.addStyleClass("sapUiDtContextMenu");

			var sPopExpId = this.getId() + "-popoverExp";
			var oPopoverExpanded = new Popover(sPopExpId, {
				showHeader: false,
				showArrow: false,
				verticalScrolling: true,
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

			oPopoverExpanded.attachBrowserEvent("keydown", this._onKeyDown, this);
			this._oExpandedPopover = oPopoverExpanded;
			oPopoverExpanded.addStyleClass("sapUiDtContextMenu");

			oPopover.attachBrowserEvent("contextmenu", this._onContextMenu, this);
			oPopoverExpanded.attachBrowserEvent("contextmenu", this._onContextMenu, this);
			this.bOnInit = true;
			this._oLastSourceOverlay = this._oLastSourceClientRects = this._oLastPosition = null;
		},

		exit: function() {
			[true, false].forEach(function(bContextMenu) {
				this.getPopover(bContextMenu).detachBrowserEvent("contextmenu", this._onContextMenu, this);
				this.getPopover(bContextMenu).destroy();
			}.bind(this));
		},

		/**
		 * Returns the value of the isOpen function of the popover
		 *
		 * @param {boolean} bContextMenu - true if the expanded context menu should be checked
		 * @returns {boolean} Returns true if the popup is currently open
		 */
		isPopupOpen: function(bContextMenu) {
			return this.getPopover(bContextMenu).isOpen();
		},

		/**
		 * Opens the ContextMenu and sets the ContextMenu position by the oSource parameter.
		 * Note: this gets called before the old Menu is closed because of asynchronus animations.
		 * @param {sap.ui.dt.ElementOverlay} oSource - The overlay by which the Popover will be placed.
		 * @param {boolean} bContextMenu - If the ContextMenu should appear as Context Menu
		 * @param {Object} oContextMenuPosition - The position of the ContextMenu
		 * @public
		 */
		show: function(oSource, bContextMenu, oContextMenuPosition) {
			bContextMenu = !!bContextMenu;
			this._bCompactMode = jQuery(oSource.getDomRef()).closest(".sapUiSizeCompact").length > 0;
			this._bOpenAsContextMenu = bContextMenu;
			this._oContextMenuPosition = oContextMenuPosition;
			this.getPopover(true).addStyleClass(this.getStyleClass());
			this.getPopover(false).addStyleClass(this.getStyleClass());

			// creates and shows buttons specified in objects in property buttons
			this._showButtons(bContextMenu);

			if (this.bOnInit || !this.isPopupOpen()) { // if there is no other ContextMenu open currently
				this._finalizeOpening(oSource);
				this.bOnInit = false;
			} else {
				this.getPopover().oPopup.attachEventOnce("closed", this._finalizeOpening.bind(this, oSource));
			}
		},

		/**
		 * Finalizes the Opening of the ContextMenu.
		 *
		 * @param {sap.ui.dt.ElementOverlay} oSource - The overlay by which the Popover will be placed.
		 */
		_finalizeOpening: function(oSource) {
			this._bUseExpPop = this._bOpenAsContextMenu;
			if (this._bOpenAsContextMenu && this._oContextMenuPosition.x === null && this._oContextMenuPosition.y === null) {
				this._bOpenAsContextMenu = false;
			}

			// fires the open event after popover is opened
			this.getPopover().attachAfterOpen(this._handleAfterOpen, this);

			this.getPopover().attachBeforeClose(this._handleBeforeClose, this);
			this.getPopover().attachAfterClose(this._handleAfterClose, this);

			//place the Popover and get the target DIV
			this._oTarget = this._placeContextMenu(oSource, this._bOpenAsContextMenu);

			// set the PopOver visible
			this.getPopover().setVisible(true);
		},

		_showButtons: function(bContextMenu) {
			var aButtons = this.getButtons(bContextMenu);
			if (!this._bOpenAsContextMenu) {
				this._setButtonsForCollapsedMenu(aButtons);
			} else {
				this._makeAllButtonsVisible(aButtons);
			}
		},

		/**
		 * Sets all parameters of the buttons in the non-expanded ContextMenu
		 * @param {array} aButtons some buttons
		 */
		_setButtonsForCollapsedMenu: function(aButtons) {
			var iButtonsEnabled = this._getNumberOfEnabledButtons(aButtons);
			if (iButtonsEnabled !== 0) {
				this._hideDisabledButtons(aButtons);
			}

			this._iButtonsVisible = this._hideButtonsInOverflow(aButtons);
			if (this._iButtonsVisible === this.getMaxButtonsDisplayed() && this._iButtonsVisible !== aButtons.length) {
				this._replaceLastVisibleButtonWithOverflowButton(aButtons);
			} else if (iButtonsEnabled < aButtons.length - 1 && iButtonsEnabled !== 0) {
				this.addOverflowButton();
			}

			iButtonsEnabled = null;
		},

		/**
		 * Makes all buttons and their text visible
		 * @param {array} aButtons some buttons
		 */
		_makeAllButtonsVisible: function(aButtons) {
			this._iFirstVisibleButtonIndex = 0;
			aButtons.forEach(function(oButton) {
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
		_getNumberOfEnabledButtons: function(aButtons) {
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
		_hideDisabledButtons: function(aButtons) {
			var iVisibleButtons = 0;
			aButtons.forEach(function(oButton) {
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
		_hideButtonsInOverflow: function(aButtons) {
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
		_replaceLastVisibleButtonWithOverflowButton: function(aButtons) {
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
		 * @param {sap.ui.dt.ElementOverlay} oSource - The overlay by which the Popover will be placed.
		 * @param {boolean} bContextMenu whether the ContextMenu should be opened as a context menu
		 * @return {div} the "fakeDiv"
		 * @private
		 */
		_placeContextMenu: function(oSource, bContextMenu) {
			var sOverlayId = (oSource.getId && oSource.getId()) || oSource.getAttribute("overlay");
			var sFakeDivId = "contextMenuFakeDiv";

			// get Dimensions of Overlay and Viewport
			var oOverlayDimensions = this._getOverlayDimensions(sOverlayId);
			var oViewportDimensions = this._getViewportDimensions();

			// if the Overlay is near the top position of the Viewport, the Popover makes wrong calculation for positioning it.
			// The MiniMenu has been placed above the Overlay even if there has not been enough place.
			// Therefore we have to calculate the top position and also consider the high of the Toolbar (46 Pixels).
			var iFakeDivTop = oOverlayDimensions.top - 50 > oViewportDimensions.top ? 0 : oViewportDimensions.top - (oOverlayDimensions.top - 50);

			// place a Target DIV (for the moment at wrong position)
			jQuery("#" + sFakeDivId).remove();
			jQuery("#" + sOverlayId).append("<div id=\"" + sFakeDivId + "\" overlay=\"" + sOverlayId + "\" style = \"position: absolute; top: " + iFakeDivTop + "px; left: 0px;\" />");
			sOverlayId = null;
			var oFakeDiv = document.getElementById(sFakeDivId);

			// place the Popover invisible
			this.getPopover().setContentWidth(undefined);
			this.getPopover().setContentHeight(undefined);
			this.getPopover().openBy(oFakeDiv);

			// get Dimensions of Popover
			var oPopoverDimensions = this._getPopoverDimensions(!bContextMenu);

			// check if vertical size is too big (not bigger than 2/3 of the viewport)
			if (oPopoverDimensions.height >= oViewportDimensions.height * 2 / 3) {
				oPopoverDimensions.height = (oViewportDimensions.height * 2 / 3).toFixed(0);
				this.getPopover().setContentHeight(oPopoverDimensions.height + "px");
			}

			// check if horizontal size is too big
			if (oPopoverDimensions.width > 400) {
				oPopoverDimensions.width = 400;
				this.getPopover().setContentWidth("400px");
			} else {
				this.getPopover().setContentWidth(undefined);
			}

			// If the Menu has been closed by ESC-key and reopened again on the same Overlay, the Position of Menu should not change
			var bIsSameOverlay = (this._oLastSourceOverlay ? this._oLastSourceOverlay === oSource : false);
			var bIsSameRect = (this._oLastSourceClientRects ? DeepEqual(JSON.parse(JSON.stringify(this._oLastSourceClientRects)), JSON.parse(JSON.stringify(oSource.getDomRef().getClientRects()))) : false);
			if (this._oContextMenuPosition.x === "not set" && this._oContextMenuPosition.y === "not set" && bIsSameOverlay && bIsSameRect) {
				// Get the last x/y Positions of the current Target
				this._oContextMenuPosition.x = this._oLastPosition.x;
				this._oContextMenuPosition.y = this._oLastPosition.y;
			} else {
				// get the given x/y Positions; if no Position is given, take the upper left corner of the Overlay + 20px (looks better)
				this._oContextMenuPosition.x = this._oContextMenuPosition.x || parseInt(oOverlayDimensions.left + 20);
				this._oContextMenuPosition.y = this._oContextMenuPosition.y || parseInt(oOverlayDimensions.top + 20);
			}

			var oPosition = {};

			if (bContextMenu) {
				oPosition = this._placeAsExpandedContextMenu(this._oContextMenuPosition, oPopoverDimensions, oViewportDimensions);
			} else {
				oPosition = this._placeAsCompactContextMenu(this._oContextMenuPosition, oPopoverDimensions, oViewportDimensions);
			}

			oPosition.top -= oOverlayDimensions.top;
			oPosition.left -= oOverlayDimensions.left;
			oPosition.top = (oPosition.top < 0) ? 0 : oPosition.top;
			oPosition.left = (oPosition.left < 0) ? 0 : oPosition.left;

			// set the correct position to the target DIV
			oFakeDiv.style.top = oPosition.top.toFixed(0) + "px";
			oFakeDiv.style.left = oPosition.left.toFixed(0) + "px";

			return oFakeDiv;
		},

		/**
		 * Works out how the ContextMenu shall be placed
		 * @param {object} oContPos the context menu position
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeAsExpandedContextMenu: function(oContPos, oPopover, oViewport) {
			this.getPopover().setShowArrow(false);
			var oPos = {};

			if (oViewport.height - 10 - oContPos.y >= oPopover.height) {
				oPos.top = oContPos.y;
				this.getPopover().setPlacement("Bottom");
			} else if (oContPos.y >= oPopover.height) {
				oPos.top = oContPos.y;
				this.getPopover().setPlacement("Top");
			} else {
				oPos.top = oViewport.height - oPopover.height;
				this.getPopover().setPlacement("Bottom");
			}

			if (oViewport.width - oContPos.x >= oPopover.width) {
				oPos.left = oContPos.x;
			} else if (oContPos.x >= oPopover.width) {
				oPos.left = oContPos.x - oPopover.width / 2;
			} else {
				oPos.left = oViewport.width - oPopover.width;
			}

			return oPos;
		},

		/**
		 * Works out how the ContextMenu shall be placed
		 * @param {object} oContPos the context menu position
		 * @param {object} oPopover the dimensions of the popover
		 * @param {object} oViewport the dimensions of the viewport
		 * @return {object} the position of the "fakeDiv"
		 */
		_placeAsCompactContextMenu: function(oContPos, oPopover, oViewport) {
			this.getPopover().setShowArrow(true);
			var oPos = {};

			//Popover should appear at the top (if place available)
			this.getPopover().setPlacement(PlacementType.PreferredTopOrFlip);

			var iBtnWidth = oPopover.width / this._iButtonsVisible;

			// calculate the horizontal position according to RTL /LTR setting (add/substract)
			var iFactor = sap.ui.getCore().getConfiguration().getRTL() ? -1 : 1;
			oPos.left = oContPos.x + (iFactor * ((this._iButtonsVisible - 1) * iBtnWidth) / 2 + (this._getBaseFontSize() * 1 / 2));
			oPos.top = oContPos.y - (this._getBaseFontSize() * 1 / 2);

			// adjust positioning if necessary
			oPos.left = (oPos.left < 32) ? 32 : oPos.left;
			oPos.top = (oPos.top - oViewport.top < 0) ? oViewport.top : oPos.top;

			// check right border positioning
			if (oViewport.width - oPos.left < 32) {
				oPos.left = oViewport.width - 32;
				this.getPopover().addStyleClass("sapUiDtContextMenuRightArrow");
			} else {
				this.getPopover().removeStyleClass("sapUiDtContextMenuRightArrow");
			}

			// in Cozy mode the context menu is bigger, therefore we need a higher threshold for the top parameter
			var iCozyFactor = this._bCompactMode ? 0 : 15;
			if (oPos.top < (100 + iCozyFactor)) {
				this.getPopover().setPlacement(PlacementType.Bottom);
				oPos.top += 16;
			}

			return oPos;
		},

		/**
		 * Gets the dimensions of the ContextMenu's popover
		 * @param {boolean} bWithArrow whether the arrow width should be added
		 * @return {object} the dimensions of the ContextMenu's popover
		 */
		_getPopoverDimensions: function(bWithArrow) {
			var oPopover = {};
			var bCompact = this._bCompactMode;
			var fArrowHeight = this._getArrowHeight(bCompact);
			var iBaseFontsize = this._getBaseFontSize();
			this._iFirstVisibleButtonIndex = null;

			oPopover.height = parseInt(jQuery("#" + this.getPopover().getId()).css("height")) || 40;
			oPopover.width = parseInt(jQuery("#" + this.getPopover().getId()).css("width")) || 80;

			if (bWithArrow) {
				var iArr = iBaseFontsize * fArrowHeight;
				if (iArr) {
					oPopover.height += iArr;
					oPopover.width += iArr;
				}
			}

			return oPopover;
		},

		/**
		 * Returns the height of a popover arrow
		 * @param {boolean} bCompact wheter ContextMenu is compact
		 * @return {float} the height of a popover arrow
		 */
		_getArrowHeight: function(bCompact) {
			if (Device.browser.msie || Device.browser.edge) {
				return bCompact ? 0.5 : 0.5;
			}
			return bCompact ? 0.5625 : 0.5625;
		},

		/**
		 * Returns the base font size in px
		 * @return {int} the base font size in px
		 */
		_getBaseFontSize: function() {
			return parseInt(jQuery(document.documentElement).css("fontSize"));
		},

		/**
		 * Gets the dimensions of an overlay
		 * @param {String} sOverlayId the overlay
		 * @return {object} the dimensions of the overlay
		 */
		_getOverlayDimensions: function(sOverlayId) {
			// jQuery Plugin "rect"
			var oOverlayDimensions = jQuery("#" + sOverlayId).rect();
			oOverlayDimensions.right = oOverlayDimensions.left + oOverlayDimensions.width;
			oOverlayDimensions.bottom = oOverlayDimensions.top + oOverlayDimensions.height;

			return oOverlayDimensions;
		},

		/**
		 * Gets the dimensions of the viewport
		 * @return {object} the dimensions of the viewport
		 */
		_getViewportDimensions: function() {
			var oViewport = {};
			oViewport.width = window.innerWidth;
			oViewport.height = window.innerHeight;
			oViewport.top = parseInt(jQuery(".type_standalone").css("height")) || 0;
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
			var sOverflowButtonId = "OVERFLOW_BUTTON";
			var oButtonOptions = {
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
		 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
		 * @return {sap.m.ContextMenu} Reference to this in order to allow method chaining
		 * @public
		 */
		addMenuButton: function(oButtonItem, fnContextMenuHandler, aElementOverlays) {
			function handler() {
				fnContextMenuHandler(this);
			}
			if (oButtonItem.responsible) {
				aElementOverlays = oButtonItem.responsible;
			}
			var sText = typeof oButtonItem.text === "function" ? oButtonItem.text(aElementOverlays[0]) : oButtonItem.text;
			var bEnabled = typeof oButtonItem.enabled === "function" ? oButtonItem.enabled(aElementOverlays) : oButtonItem.enabled;
			var oButtonOptions = {
				icon: this._getIcon(oButtonItem.icon),
				text: sText,
				tooltip: sText,
				type: "Transparent",
				enabled: bEnabled,
				press: handler,
				layoutData: new FlexItemData({})
			};
			return this._addButton(oButtonItem.id, oButtonOptions);
		},

		_addButton: function(sButtonItemId, oButtonOptions) {
			this.setProperty("buttons", this.getProperty("buttons").concat(oButtonOptions));

			var oButtonCustomData = { id: sButtonItemId, key: sButtonItemId };
			var oExpandedMenuButton = new Button(oButtonOptions);
			oExpandedMenuButton.data(oButtonCustomData);

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
		close: function(bExplicitClose) {
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
		removeButton: function(iIndex) {
			this.setProperty("buttons", this.getProperty("buttons").splice(iIndex, 1));
			this.getFlexbox(true).removeItem(iIndex);
			return this.getFlexbox(false).removeItem(iIndex);
		},

		/**
		 * Removes all buttons from the ContextMenu.
		 * @return {sap.m.OverflowToolbarButton} An array of the removed buttons (might be empty)
		 * @public
		 */
		removeAllButtons: function() {
			this.setProperty("buttons", []);
			this.getFlexbox(true).removeAllItems();
			return this.getFlexbox(false).removeAllItems();
		},

		/**
		 * Gets all buttons of the ContextMenu.
		 * @return {sap.m.OverflowToolbarButton[]} returns buttons
		 * @public
		 */
		getButtons: function(bContextMenu) {
			return this.getFlexbox(bContextMenu).getItems();
		},

		/**
		 * Inserts a button to the ContextMenu.
		 * @param {sap.m.OverflowToolbarButton} oButton the to insert
		 * @param {int} iIndex - the 0-based index the button should be inserted at
		 * @return {sap.m.ContextMenu} Reference to this in order to allow method chaining
		 * @public
		 */
		insertButton: function(oButton, iIndex) {
			this.getFlexbox().insertItem(oButton, iIndex);
			return this;
		},

		/**
		 * Sets the Buttons of the ContextMenu
		 * @param {Array} _aButtons the Buttons to insert
		 * @param {function} fnContextMenuHandler - the source
		 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
		 * @public
		 */
		setButtons: function(_aButtons, fnContextMenuHandler, aElementOverlays) {
			this.removeAllButtons();

			_aButtons.forEach(function(oButton) {
				this.addMenuButton(oButton, fnContextMenuHandler, aElementOverlays);
			}.bind(this));
		},

		/**
		 * Sets the maximum amount of Buttons
		 * @param {int} iMBD the maximum amount of buttons to be displayed in the non-expanded version of the Context-Menu
		 * @public
		 */
		setMaxButtonsDisplayed: function(iMBD) {
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
		getPopover: function(bExpanded) {
			if (bExpanded === undefined) {
				if (this._bUseExpPop) {
					return this._oExpandedPopover;
				}
				return this._oPopover;
			} else if (bExpanded) {
				return this._oExpandedPopover;
			}
			return this._oPopover;
		},

		/**
		 * Returns one of the Flexboxes
		 * @param {boolean} bExpanded if undefined return the currently used FlexBox if true return expanded FlexBox if false return non-expanded FlexBox
		 * @return {sap.m.Flexbox} the FlexBox
		 * @public
		 */
		getFlexbox: function(bExpanded) {
			return this.getPopover(bExpanded).getContent()[0];
		},

		/**
		 * Expands the ContextMenu
		 * @param {jQuery.Event} oEvent the press event
		 * @private
		 */
		_onOverflowPress: function(oEvent) {
			this.fireOverflowButtonPressed({oButton : oEvent.oSource});
		},

		/**
		 * Sets the focus on a Button if possible
		 * @param {sap.m.Button} oButton the button on which focus should be set
		 * @returns {boolean} true if focus was set
		 */
		_setFocusOnButton: function(oButton) {
			if (oButton.getEnabled() && oButton.getVisible()) {
				oButton.focus();
				return true;
			}
		},

		/**
		 * Handler for KeyDown Event
		 * Changes the focus inside the ContextMenu if an Arrowkey is pressed
		 * Allows Safari users to navigate through the ContextMenu using tab and tab+shift
		 * Closes the MiniMenu when Escape is pressed
		 * @param {jQuery.Event} oEvent the keyboard event
		 */
		_onKeyDown: function(oEvent) {
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
					case "Escape":
						this._rememberPosition();
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
		_changeFocusOnButtons: function(sId, bPrevious) {
			this.getButtons().some(function(oButton, iIndex, aArray) {
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
		 * Stores the current Position of the Contextmenu for opening again at same position
		 * @private
		 */
		_rememberPosition: function() {
			var oNode = document.getElementById(this._oTarget.getAttribute("overlay"));
			if (oNode) {
				DOMUtil.focusWithoutScrolling(oNode);
				this._oLastSourceOverlay = OverlayRegistry.getOverlay(oNode.id);
				this._oLastSourceClientRects = this._oLastSourceOverlay.getDomRef().getClientRects();
			} else {
				this._oLastSourceClientRects = null;
			}
			this._oLastPosition = {
				x: this._oContextMenuPosition.x,
				y: this._oContextMenuPosition.y
			};
		},

		/**
		 * Sets focus on next button
		 * @param {Array} aButtons the array of Buttons
		 * @param {int} iIndex the index of the currently focused buttons
		 */
		_setFocusOnNextButton: function(aButtons, iIndex) {
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
		 * @param {int} iIndex the index of the currently focused buttons
		 */
		_setFocusOnPreviousButton: function(aButtons, iIndex) {
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
		_onContextMenu: function(oEvent) {
			if (oEvent.preventDefault) {
				oEvent.preventDefault();
			}
		},

		/**
		 * Handle After Open
		 * Sets the Popover visible and fires Event "opened"
		 * @private
		 */
		_handleAfterOpen: function() {
			this.getPopover().detachAfterOpen(this._handleAfterOpen, this);
			this.getPopover().addStyleClass("sapUiDtContextMenuVisible");
			this.fireOpened();
		},

		/**
		 * Handle Before Close
		 * Sets the Popover invisible (to avoid flickering)
		 * @private
		 */
		_handleBeforeClose: function() {
			this.getPopover().detachBeforeClose(this._handleBeforeClose, this);
			this.getPopover().removeStyleClass("sapUiDtContextMenuVisible");
		},

		/**
		 * Handle After Close
		 * Fires the closed event
		 * @private
		 */
		_handleAfterClose: function() {
			this.getPopover().detachAfterClose(this._handleAfterClose, this);
			this.fireClosed();
		},

		setStyleClass: function(sStyleClass) {
			this.setProperty("styleClass", sStyleClass);
		}
	});

	return ContextMenu;
});