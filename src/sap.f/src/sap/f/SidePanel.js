/*!
 * ${copyright}
 */

// Provides control sap.f.SidePanel.
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/Icon",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ScrollEnablement",
	'sap/ui/core/delegate/ItemNavigation',
	"sap/ui/dom/containsOrEquals",
	"sap/m/Title",
	"sap/m/Button",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/InvisibleMessage",
	"./SidePanelItem",
	"./SidePanelRenderer",
	"sap/ui/core/library",
	"sap/ui/events/F6Navigation",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(
	Device,
	Control,
	Core,
	Icon,
	ResizeHandler,
	ScrollEnablement,
	ItemNavigation,
	containsOrEquals,
	Title,
	Button,
	Menu,
	MenuItem,
	InvisibleMessage,
	SidePanelItem,
	SidePanelRenderer,
	coreLibrary,
	F6Navigation,
	jQuery,
	KeyCodes
) {
	"use strict";

	// Resource Bundle
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.f"),
		InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	/**
	 * Constructor for a new <code>SidePanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * <code>SidePanel</code> is a layout control that allows primary and additional content to be
	 * displayed by clicking/tapping the action items from its action bar.
	 *
	 * <h3>Usage</h3>
	 *
	 * Action bar with action items have two states - collapsed and expanded. In collapsed state
	 * only icons are displayed, and in expanded state both icons and titles are displayed.
	 *
	 * Each action item can have a content and click/tap on action item toggles the display of its content.
	 * The content can be added to the action item's <code>content</code> aggregation, or can be added or
	 * changed later.
	 *
	 * Each click/tap fires an event, and in the event handler specific content can be added/changed
	 * to the <code>content</code> aggregation of the clicked/tapped action item or data can be
	 * retreived from the same aggregation depending on the state of the action item.
	 *
	 * If the side content is displayed, there is automatically generated header of the side content which
	 * contains the icon and title of the selected action item and a close button that closes the area where
	 * side content is displayed.
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * <b>On desktop/tablet device</b>
	 *
	 * The side panel contains action bar that have action items placed vertically, and when expanded,
	 * the side content is displayed next to the action bar. If there is not enough space for all available
	 * action items, an overflow icon is displayed, and it toggles ON/OFF an overflow menu with the rest
	 * of the action items that are not visible at the moment.
	 *
	 * Screen width > 1440 px
	 *
	 * <ul><li>When expanded, the side content shrinks the main content.</li></ul>
	 *
	 * Screen width <= 1440 px
	 *
	 * <ul><li>When expanded, the side content is placed over the main content.</li></ul>
	 *
	 * <b>On mobile device</b>
	 *
	 * The side panel contains action bar that have action items placed horizontally at the bottom of the
	 * display, and when expanded, the side content is displayed above the action bar. If there is not enough
	 * room for all action items, the action bar can be swiped to access the rest of the action items.
	 *
	 * <h3>Keyboard shortcuts</h3>
	 *
	 * <ul>
	 * <li>[Shift] + [Command] + [p] (Mac) / [Shift] + [Control] + [p] (Windows) - Expand/Collapse side panel</li>
	 * <li>[Arrow Up], [Arrow Down] - Move to the next or previous action item</li>
	 * <li>[Enter], [Space] - Choose the selected action item</li>
	 * <li>[Command] + [Arrow Left] (Mac) / [Control] + [Arrow Left] (Windows) / [Tab]- Move from action items to the opened side content panel</li>
	 * <li>[Command] + [Arrow Right] (Mac) / [Control] + [Arrow Right] (Windows) / [Shift] + [Tab]- Move from opened side content panel to the action items</li>
	 * <li>[F6] / [Shift] + [F6] - Navigate back and forth between main content, side panel and side content groups
	 * <li>[Esc] - Close the opened side content panel and set focus back to main content</li>
	 * </ul>
	 *
 	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.107
	 * @alias sap.f.SidePanel
	 * @experimental Since 1.107. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SidePanel = Control.extend("sap.f.SidePanel", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * Determines whether the action bar is expanded or collapsed.
				 */
				actionBarExpanded: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Description for aria-label.
				 */
				ariaLabel: {type: "string", group: "Accessibility", defaultValue: "Side Panel" },

				/**
				 * Determines the side panel width (Side Content width + Action Bar width).
				 * <b>Note:</b> if the width is given in percent(%), it is calculated as given percent from the Side Panel parent container width,
				 * otherwise it's calculated in absolute units.
				 */
				sidePanelWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "20rem" },

				/**
				 * Determines the minimum side panel width (Side Content width + Action Bar width).
				 * <b>Note:</b> if the width is given in percent(%), it is calculated as given percent from the Side Panel parent container width,
				 * otherwise it's calculated in absolute units.
				 * @private
				 */
				sidePanelMinWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "10%", visibility: "hidden" },

				/**
				 * Determines the maximum side panel width (Side Content width + Action Bar width).
				 * <b>Note:</b> if the width is given in percent(%), it is calculated as given percent from the Side Panel parent container width,
				 * otherwise it's calculated in absolute units.
				 * @private
				 */
				sidePanelMaxWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "90%", visibility: "hidden" },

				/**
				 * Determines whether the side content is visible or hidden.
				 * @private
				 */
				sideContentExpanded: { type: "boolean", group: "Appearance", defaultValue: false, visibility: "hidden" }
			},
			aggregations: {
				/**
				 * The list of controls for the main content.
				 */
				mainContent: { type: "sap.ui.core.Control", multiple: true },

				/**
				 * The list of action items.
				 * Each action items can have different side content added to its <code>content</code> aggregation.
				 */
				items: { type: "sap.f.SidePanelItem", multiple: true, singularName: "item" },

				/**
				 * Side panel expand/collapse button.
				 */
				_arrowButton: { type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 * Side content close button.
				 */
				_closeButton: { type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 * Overflow item. It opens/closes the overflow menu when there are action items
				 * that don't fit in the available height of the side panel.
				 */
				_overflowItem: { type: "sap.f.SidePanelItem", multiple: false, visibility: "hidden"},

				/**
				 * Overflow menu. It displays action items that don't fit in the available height of the side panel.
				 */
				_overflowMenu: { type: "sap.m.Menu", multiple: false, visibility: "hidden"}
			},
			associations: {
				/**
				 * The action item that is currently selected.
				 */
				selectedItem: { type: "sap.f.SidePanelItem", multiple: false }
			},
			events: {
				/**
				 * Fires on expand and collapse of the side content.
				 *
				 * <ul><li>If the event fired as a result of action item selection (<code>expanded</code> parameter contains <code>true</code>) is prevented,
				 * the display of the side content will be blocked.</li>
				 * <li>If the event fired as a result of action item deselection, selection of different action item, pressing the <code>Close</code> button,
				 * or pressing the <code>Escape</code> key (<code>expanded</code> parameter contains <code>false</code>) is prevented, this will block closing
				 * of the currently displayed side content, and if the event is fired by selection of a different action item, the selection will be cancelled,
				 * and the next event (for expansion of a new action item) will not be fired and the new side content will not be displayed.</li></ul>
				 */
				toggle: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The action item that triggers the event.
						 */
						item: { type: "sap.f.SidePanelItem" },

						/**
						 * State of the action item.
						 */
						expanded: { type: "boolean" }
					}
				}
			}
		}
	});

	SidePanel.prototype.init = function() {
		this.setAggregation("_arrowButton", new Button(this.getId() + "-expandCollapseButton", {
			type: "Transparent",
			press: this._toggleActionBarExpanded.bind(this)
		}).addStyleClass("sapFSPExpandCollapse"));

		this.setAggregation("_overflowItem", new SidePanelItem({
			icon: "sap-icon://overflow",
			text: oResourceBundle.getText("SIDEPANEL_MORE_ACTIONS_TEXT")
		}));

		if (!Device.system.phone) {
			var oMenu = new Menu({
				itemSelected: function(oEvent) {
					var oMenuItem = oEvent.getParameter("item");
					if (this._mOverflowItemsMap[oMenuItem.getId()]) {
						this._toggleItemSelection(this._mOverflowItemsMap[oMenuItem.getId()]);
					}
				}.bind(this),
				closed: function() {
					setTimeout(function() {
						this._setOverflowItemSelection(false);
					}.bind(this), 100);

				}.bind(this)
			}).addStyleClass("sapFSPOverflowMenu");

			this.setAggregation("_overflowMenu", oMenu);
		}

		this._onResizeRef = this._onResize.bind(this);
		this._onMainScroll = this._handleScroll.bind(this);

		this._iLastScrollPosition = 0;

		this._iVisibleItems = 0; // how many action items can fit in the available height of the action bar
		this._bOverflowMenuOpened = false; // whether the overflow menu is opened or not
		this._mOverflowItemsMap = {}; // map of the items placed in overflow menu in format {menu item Id: SidePanelItem}

		this._oItemNavigation = null;
	};

	SidePanel.prototype.exit = function() {
		this._detachResizeHandlers();
		this._detachScrollHandler();
		this._detachMainFocusOutHandler();
	};

	/**
	 * Override <code>selectedItem</code> property setter.
	 *
	 * Sets selected action item and expands its side content.
	 * <b>Note:</b> it will be good to have dedicated Ids of the action items that will be selected programatically,
	 * otherwise the Ids of the action items wouldn't be stable.
	 *
	 * @param {sap.f.SidePanelItem|string} vItem an action item or Id of the action item to select
	 * @returns {this} this for method chaining
	 */
	SidePanel.prototype.setSelectedItem = function(vItem) {
		var sSelectedItem = this.getSelectedItem(),
			sId,
			oItem;

		if (typeof vItem === "string") {
			sId = vItem;
			oItem = Core.byId(vItem);
		} else if (vItem && vItem.isA("sap.f.SidePanelItem")) {
			sId = vItem.getId();
			oItem = vItem;
		}

		if (!sId) {
			// remove selected action item (if any) and collapse its side content
			sSelectedItem && this._toggleItemSelection(Core.byId(sSelectedItem));
		} else if (oItem && sId !== sSelectedItem && sId !== this.getAggregation("_overflowItem").getId()) {
			// select an action item and expand its side content
			this._toggleItemSelection(oItem);
			this.setAssociation("selectedItem", oItem, true);
		}

		return this;
	};

	SidePanel.prototype.onBeforeRendering = function() {
		var oExpandCollapseButton = this.getAggregation("_arrowButton"),
			bActionBarExpanded = this.getActionBarExpanded(),
			sTooltip = bActionBarExpanded ? oResourceBundle.getText("SIDEPANEL_COLLAPSE_BUTTON_TEXT") : oResourceBundle.getText("SIDEPANEL_EXPAND_BUTTON_TEXT"),
			sNextArrow = bActionBarExpanded ? "right" : "left";

		oExpandCollapseButton.setIcon("sap-icon://navigation-" + sNextArrow + "-arrow");
		oExpandCollapseButton.setTooltip(sTooltip);

		this._detachResizeHandlers();
		this._attachResizeHandlers();

		this._detachScrollHandler();
		this._detachMainFocusOutHandler();

		this._oInvisibleMessage = InvisibleMessage.getInstance();
	};

	SidePanel.prototype.onAfterRendering = function() {
		var oArrowButton = this._isSingleItem() && this.getActionBarExpanded()
			? this.getAggregation("_closeButton")
			: this.getAggregation("_arrowButton"),
			oDomRef;

		if (!Device.system.phone) {
			oDomRef = oArrowButton.getDomRef();
			oDomRef && oDomRef.setAttribute("aria-expanded", this.getActionBarExpanded() ? "true" : "false");
		}

		!this._getSideContentExpanded() && this._attachScrollHandler();

		this._attachMainFocusOutHandler();

		if (!Device.system.phone) {
			if (!this._isSingleItem() && this._iVisibleItems > 0) {
				this._initItemNavigation();
			}
			if (this.getActionBarExpanded() || this._getSideContentExpanded()) {
				this.getItems().length && this._fixSidePanelWidth();
			}
		} else {
			if (this.getDomRef().querySelector(".sapFSPMain").scrollTop === 0) {
				this.setActionBarExpanded(true);
			}
		}

	};

	SidePanel.prototype.onkeydown = function(oEvent) {
		var oTarget = oEvent.target,
			oActionBarDom = this.$().find(".sapFSPActionBar")[0],
			bSideContentExpanded = this._getSideContentExpanded(),
			bSideExpanded = this.getActionBarExpanded() || bSideContentExpanded,
			bCtrlOrCmd = oEvent.ctrlKey || oEvent.metaKey;

		if (bCtrlOrCmd && oEvent.which === KeyCodes.ARROW_LEFT) {
			oEvent.preventDefault();
			if (bSideContentExpanded) {
				this._focusSideContent();
			}
		} else if (bCtrlOrCmd && oEvent.which === KeyCodes.ARROW_RIGHT && bSideContentExpanded) {
			if (bSideContentExpanded) {
				this._contentControlToFocus = Core.getCurrentFocusedControlId();
			}
			this._oItemNavigation.getFocusedDomRef().focus();
		} else if (bCtrlOrCmd && oEvent.shiftKey && oEvent.which === KeyCodes.P) {
			// metaKey for MAC [Command] key
			oEvent.preventDefault();
			this._toggleActionBarExpanded();
			if (!bSideExpanded) {
				this._oItemNavigation.getFocusedDomRef().focus();
			} else {
				bSideContentExpanded && this.setActionBarExpanded(false);
				this._closeSideContent();
				this._focusMain();
			}
		} else if (oEvent.which === KeyCodes.ESCAPE) {
			oEvent.preventDefault();
			this.setActionBarExpanded(false);
			this._closeSideContent();
			this._focusMain();
		}

		if (!containsOrEquals(oActionBarDom, oTarget) || oTarget === oActionBarDom) {
			return;
		}

		// action items shortcuts
		switch (oEvent.which) {
			case KeyCodes.ENTER:
				oEvent.preventDefault();
				this._toggleItemSelection(oEvent.srcControl);
				break;
			case KeyCodes.SPACE:
				oEvent.preventDefault(); // prevent scrolling when focused on the tab
				break;
		}
	};

	SidePanel.prototype.onkeyup = function(oEvent) {
		var oTarget = oEvent.target,
			oActionBarDom = this.$().find(".sapFSPActionBar")[0];

		if (!containsOrEquals(oActionBarDom, oTarget) || oTarget === oActionBarDom) {
			return;
		}

		if (oEvent.which === KeyCodes.SPACE) {
			this._toggleItemSelection(oEvent.srcControl);
		}
	};

	SidePanel.prototype.ontap = function(oEvent) {
		var oItemDom,
			oTarget = oEvent.target,
			oActionBarDom = this.$().find(".sapFSPActionBar")[0];

		if (!containsOrEquals(oActionBarDom, oTarget) || oTarget === oActionBarDom) {
			return;
		}

		oItemDom = oTarget;

		while (oItemDom.tagName !== "LI") {
			oItemDom = oItemDom.parentElement;
		}

		if (!oItemDom) {
			return;
		}

		this._toggleItemSelection(Core.byId(oItemDom.id));
	};

	/**
	 * Handler for F6
	 *
	 * @param {Object} oEvent - The event object
	 */
	 SidePanel.prototype.onsapskipforward = function(oEvent) {
		oEvent.preventDefault();
		this._handleGroupNavigation(oEvent, false);
	};

	/**
	 * Handler for Shift + F6
	 *
	 * @param {Object} oEvent - The event object
	 */
	SidePanel.prototype.onsapskipback = function(oEvent) {
		this._handleGroupNavigation(oEvent, true);
	};

	// Private methods

	SidePanel.prototype._getSideContentExpanded = function() {
		return this.getProperty("sideContentExpanded");
	};

	SidePanel.prototype._setSideContentExpanded = function(bState) {
		return this.setProperty("sideContentExpanded", bState);
	};

	SidePanel.prototype._getFocusDomRef = function (oItem) {
		return oItem.getDomRef();
	};

	SidePanel.prototype._focusMain = function() {
		this._oPreviousFocusedMainElement && this._oPreviousFocusedMainElement.focus();
	};

	SidePanel.prototype._focusSideContent = function() {
		// set focus to the last focused side content element, or to the Close Button
		var oFocusControl = this._contentControlToFocus ? Core.byId(this._contentControlToFocus) : this.getAggregation("_closeButton");

		oFocusControl && oFocusControl.focus();
	};

	SidePanel.prototype._closeSideContent = function() {
		var oSelectedItem = Core.byId(this.getSelectedItem()),
			bSkipPrevent = true;

		// fire 'toggle' event for collapse if there is expanded action item
		if (oSelectedItem) {
			bSkipPrevent = this._fireToggle({
				item: oSelectedItem,
				expanded: false
			});
		}

		if (bSkipPrevent) {
			this._setSideContentExpanded(false);
			this.setAssociation("selectedItem", null);
			if (this._isSingleItem()) {
				setTimeout(function() {
					var oArrowButton = this.getAggregation("_arrowButton");
					oArrowButton && oArrowButton.focus();
				}.bind(this), 0);
			}
		}
	};

	SidePanel.prototype._toggleActionBarExpanded = function() {
		var oSelectedItem;

		if (this._isSingleItem()) {
			oSelectedItem = !this.getActionBarExpanded() ? this.getItems()[0] : null;

			if (oSelectedItem) {
				var bSkipPrevent = this._fireToggle({
					item: oSelectedItem,
					expanded: !!oSelectedItem
				});

				if (!bSkipPrevent) {
					return;
				}
			}

			this.setAssociation("selectedItem", oSelectedItem);
			this._setSideContentExpanded(!!oSelectedItem);
			setTimeout(function() {
				var oCloseButton = this.getAggregation("_closeButton");

				oCloseButton && oCloseButton.focus();
			}.bind(this), 0);

		} else {
			this.setActionBarExpanded(!this.getActionBarExpanded());
		}
	};

	SidePanel.prototype._fireToggle = function(oParameters) {
		this._contentControlToFocus = undefined;

		return this.fireToggle(oParameters);
	};

	SidePanel.prototype._initItemNavigation = function() {
		var aItems = this.getItems(),
			aItemsDomRef = [],
			bShowOverflowItem = aItems.length > this._iVisibleItems,
			iMaxItems = bShowOverflowItem ? this._iVisibleItems - 1 : aItems.length,
			oOverflowItem = this.getAggregation("_overflowItem"),
			oOverflowMenu = this.getAggregation("_overflowMenu"),
			oItemDomRef,
			oRootDomRef,
			oMenuItem;

		if (!aItems.length || !this._iVisibleItems) {
			return;
		} else {
			oRootDomRef = aItems[0].getDomRef().parentElement;
			oOverflowMenu.destroyItems();
			this._mOverflowItemsMap = {};
		}

		// find a collection of all action items
		aItems.forEach(function(oItem, iIndex) {
			if (iIndex < iMaxItems) {
				oItemDomRef = this._getFocusDomRef(oItem);
				oItemDomRef.setAttribute("tabindex", "-1");
				aItemsDomRef.push(oItemDomRef);
				oItem.$().css("display", "flex");
			} else {
				oItem.$().css("display", "none");
				oMenuItem = new MenuItem({
					text: oItem.getText(),
					icon: oItem.getIcon()
				});
				oOverflowMenu.addItem(oMenuItem);
				this._mOverflowItemsMap[oMenuItem.getId()] = oItem;
			}
		}.bind(this));

		if (bShowOverflowItem) {
			oOverflowItem.$().css("visibility", "visible");
			oItemDomRef = this._getFocusDomRef(oOverflowItem);
			oItemDomRef.setAttribute("tabindex", "-1");
			aItemsDomRef.push(oItemDomRef);
		} else {
			oOverflowItem.$().css("visibility", "hidden");
		}

		// create the ItemNavigation
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation()
				.setCycling(false)
				.attachEvent(ItemNavigation.Events.AfterFocus, this._onItemNavigationAfterFocus, this)
				.setDisabledModifiers({
					sapnext : ["alt", "meta", "ctrl"],
					sapprevious : ["alt", "meta", "ctrl"]
				});

			this.addDelegate(this._oItemNavigation);
			this._bAnnounceSelected = true;
		}

		// reinitialize the ItemNavigation after rendering
		this._oItemNavigation.setRootDomRef(oRootDomRef)
			.setItemDomRefs(aItemsDomRef)
			.setPageSize(iMaxItems); // set the page size equal to the tab number so when we press pageUp/pageDown to focus first/last tab

		if (this._oItemNavigation.getFocusedIndex() === -1) {
			this._oItemNavigation.setFocusedIndex(0);
		}

	};

	SidePanel.prototype._onItemNavigationAfterFocus = function(oEvent) {
		var oSelectedItem = this.getSelectedItem();

		// announce "selected" for selected item here
		if (oSelectedItem === this._oItemNavigation.getFocusedDomRef().id && this._bAnnounceSelected) {
			this._oInvisibleMessage.announce(oResourceBundle.getText("SIDEPANEL_NAV_ITEM_SELECTED"), InvisibleMessageMode.Polite);
		}
		this._bAnnounceSelected = true;
	};

	SidePanel.prototype._attachResizeHandlers = function () {
		this._iResizeHandlerId = ResizeHandler.register(this, this._onResizeRef);
	};

	SidePanel.prototype._detachResizeHandlers = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}
	};

	SidePanel.prototype._onResize = function(oEvent) {
		if (!this.getItems().length) {
			return;
		}

		var iCurrentWidth = oEvent.size.width,
			bSingleItem = this._isSingleItem(),
			oStyle = window.getComputedStyle(this.$().find(".sapFSPActionBar")[0]),
			iItemsGap = parseInt(oStyle.gap),
			iMarginBottom = parseInt(oStyle.marginBottom),
			iMarginTop = parseInt(oStyle.marginTop),
			oFirstItem = this.$().find(".sapFSPOverflowItem")[0],
			iItemsHeight = oFirstItem && oFirstItem.clientHeight,
			iActionBarHeight,
			iCurrentWidth;

		if (iCurrentWidth < 1440 && (this._iPreviousWidth === undefined || this._iPreviousWidth >= 1440)) {
			this.addStyleClass("sapFSPSizeMedium");
		} else if (iCurrentWidth >= 1440 && (this._iPreviousWidth === undefined || this._iPreviousWidth < 1440)) {
			this.removeStyleClass("sapFSPSizeMedium");
		}

		this._iPreviousWidth = iCurrentWidth;

		if (!Device.system.phone) {
			if (!bSingleItem) {
				iActionBarHeight = this.$().find(".sapFSPSideInner")[0].clientHeight - iMarginBottom - iMarginTop;
				this._iVisibleItems = parseInt((iActionBarHeight + iItemsGap) / (iItemsHeight + iItemsGap));
				this._initItemNavigation();
			}
			if (this.getActionBarExpanded() || this._getSideContentExpanded()) {
				this._fixSidePanelWidth();
			}
		}
	};

	SidePanel.prototype._fixSidePanelWidth = function() {
		var oSide =  this.getDomRef().querySelector(".sapFSPSide"),
			oSideInner = this.getDomRef().querySelector(".sapFSPSideInner"),
			iControlWidth = this._getControlWidth(),
			iSidePanelWidth = parseInt(window.getComputedStyle(oSideInner).width),
			bResizeSidePanel = iControlWidth < iSidePanelWidth; // doesn't work stable

		if (!this.hasStyleClass("sapFSPSizeMedium")) {
			oSide.style.width = bResizeSidePanel ? iControlWidth + "px" : this._getSidePanelWidth();
			oSide.style.minWidth = bResizeSidePanel ? iControlWidth + "px" : this._getSidePanelMinWidth();
			oSide.style.maxWidth = this._getSidePanelMaxWidth();
		} else {
			oSide.style.width = "";
			oSide.style.minWidth = "";
			oSide.style.maxWidth = "";
		}

		oSideInner.style.width = bResizeSidePanel ? iControlWidth + "px" : this._getSidePanelWidth();
		oSideInner.style.minWidth = bResizeSidePanel ? iControlWidth + "px" : this._getSidePanelMinWidth();
		oSideInner.style.maxWidth = this._getSidePanelMaxWidth();
	};

	SidePanel.prototype._setOverflowItemSelection = function(bState) {
		var oOverflowItem = this.getAggregation("_overflowItem"),
			sOverflowItemText;

		if (!oOverflowItem || !oOverflowItem.getDomRef()) {
			return;
		}

		this._bOverflowMenuOpened = bState;
		sOverflowItemText = this._getOverflowItemText();

		// set the text of the overflow item separately via framework without invalidation
		// and then directly in the DOM element in order to achieve correct screen reader announcement
		oOverflowItem.setText(sOverflowItemText, false);
		oOverflowItem.$().find(".sapFSPItemText").text(sOverflowItemText);
	};

	SidePanel.prototype._getAriaLabelText = function() {
		var sAriaLabel = this.getAriaLabel();

		return sAriaLabel ? sAriaLabel : oResourceBundle.getText("SIDEPANEL_DEFAULT_ARIA_LABEL");
	};

	SidePanel.prototype._getOverflowItemText = function () {
		return this._bOverflowMenuOpened ? oResourceBundle.getText("SIDEPANEL_SHOW_LESS_TEXT") : oResourceBundle.getText("SIDEPANEL_MORE_ACTIONS_TEXT");
	};

	SidePanel.prototype._getSideContentAriaLabel = function () {
		return oResourceBundle.getText("SIDEPANEL_CONTENT_ARIA_LABEL");
	};

	SidePanel.prototype._toggleItemSelection = function(oItem) {
		var oNewSelectedItem,
			oSelectedItem = this.getSelectedItem(),
			oItemDomRef = oItem.getDomRef(),
			bToggleDifferent = oItem.getId() !== oSelectedItem,
			bExpanded,
			bSkipPrevent = true;

		if (oItemDomRef && oItemDomRef.classList.contains("sapFSPOverflowItem")) {
			this._toggleOverflowMenu(oItemDomRef);
			return;
		}

		// fire 'toggle' event for collapsed action item
		if (oSelectedItem && (!bExpanded || bToggleDifferent)) {
			bSkipPrevent = this._fireToggle({
				item: bToggleDifferent ? Core.byId(oSelectedItem) : oItem,
				expanded: false
			});
		}

		// do not continue if collapse is prevented
		if (!bSkipPrevent) {
			return;
		}

		// toggle item select
		oNewSelectedItem = bToggleDifferent ? oItem : null;
		bExpanded = !!oNewSelectedItem;
		this.setAssociation("selectedItem", oNewSelectedItem);

		// fire 'toggle' event for expanded action item
		if (oNewSelectedItem) {
			this._bAnnounceSelected = false;

			bSkipPrevent = this._fireToggle({
				item: oNewSelectedItem,
				expanded: true
			});
			if (!bSkipPrevent) {
				// if expand is prevented, just collapse side content
				this._setSideContentExpanded(false);
				return;
			}
		}

		// collapse action bar
		!Device.system.phone && this.getActionBarExpanded() && this.setActionBarExpanded(false);

		// expand side content
		this._setSideContentExpanded(bExpanded);
	};

	SidePanel.prototype._toggleOverflowMenu = function(oDomRef) {
		var oOverflowMenu = this.getAggregation("_overflowMenu"),
			oDelegate = {
				onkeydown: this._overflowMenuOnkeydown.bind(this)
			};

		if (!oDomRef) {
			if (this._bOverflowMenuOpened) {
				this._bOverflowMenuOpened = false;
			}
			return;
		}

		if (this._bOverflowMenuOpened) {
			this._setOverflowItemSelection(false);
			oOverflowMenu.close();
		} else {
			this._setOverflowItemSelection(true);
			setTimeout(function() {
				var bNoMenu = !oOverflowMenu.getAggregation("_menu");
				oOverflowMenu.openBy(oDomRef, false, sap.ui.core.Popup.Dock.BeginBottom, sap.ui.core.Popup.Dock.EndBottom, "3 0");
				oOverflowMenu._getMenu().getPopup().setExtraContent([this.getAggregation("_overflowItem")]);
				bNoMenu && oOverflowMenu.getAggregation("_menu").addEventDelegate(oDelegate);
			}.bind(this), 0);
		}
	};

	// handler for overflow menu keyboard interactions
	SidePanel.prototype._overflowMenuOnkeydown = function(oEvent) {
		var oOverflowItem = this.getAggregation("_overflowItem");
		oEvent.preventDefault();
		if (oEvent.which === KeyCodes.ARROW_RIGHT) {
			this._closeOverflowMenu();
			oOverflowItem && oOverflowItem.focus();
		} else if (oEvent.which === KeyCodes.ARROW_LEFT && !(oEvent.ctrlKey || oEvent.metaKey)) {
			this._closeOverflowMenu();
			this.setActionBarExpanded(false);
			this._focusMain();
		}
	};

	SidePanel.prototype._isSideContentExpanded = function() {
		return (Device.system.phone || (!this.getActionBarExpanded() || this._isSingleItem())) && this._getSideContentExpanded();
	};

	SidePanel.prototype._getSelectedItem = function() {
		return Core.byId(this.getSelectedItem());
	};

	SidePanel.prototype._getSideContentHeaderTitle = function() {
		var oSelectedItem = this._getSelectedItem();

		if (!this._contentHeaderTitle) {
			this._contentHeaderTitle = new Title();
		}

		oSelectedItem && this._contentHeaderTitle.setText(oSelectedItem.getText()) && this._contentHeaderTitle.setTooltip(oSelectedItem.getText());

		return this._contentHeaderTitle;
	};

	SidePanel.prototype._getSideContentHeaderIcon = function() {
		var oSelectedItem = this._getSelectedItem();

		if (!this._contentHeaderIcon) {
			this._contentHeaderIcon = new Icon();
		}

		oSelectedItem && this._contentHeaderIcon.setSrc(oSelectedItem.getIcon());

		return this._contentHeaderIcon;
	};

	SidePanel.prototype._getSideContentHeaderCloseBtn = function() {
		var sIcon,
			oContentHeaderCloseIcon = this.getAggregation("_closeButton");

		if (!oContentHeaderCloseIcon) {
			if (this._isSingleItem()) {
				sIcon = Device.system.phone
					? "sap-icon://navigation-down-arrow"
					: "sap-icon://navigation-right-arrow";
			} else {
				sIcon = "sap-icon://decline";
			}

			oContentHeaderCloseIcon = new Button(this.getId() + "-closeButton", {
				type: "Transparent",
				tooltip: oResourceBundle.getText("SIDEPANEL_CLOSE_BUTTON_TEXT"),
				icon: sIcon,
				press: function() {
					var oSelectedItem = this._getSelectedItem(),
						oOverflowItem = this.getAggregation("_overflowItem");

					this._bAnnounceSelected = false;
					// set proper focus
					if (this.$().find("#" + oSelectedItem.getId()).css("display") === "none") {
						oOverflowItem && oOverflowItem.focus();
					} else {
						oSelectedItem && oSelectedItem.focus();
					}
					this._closeSideContent();
				}.bind(this)
			});

			this.setAggregation("_closeButton", oContentHeaderCloseIcon);
		}

		return oContentHeaderCloseIcon;
	};

	SidePanel.prototype._attachScrollHandler = function() {
		if (!Device.system.phone || !this.getDomRef()) {
			return;
		}

		this.$().find(".sapFSPMain")[0].addEventListener('scroll', this._onMainScroll);
	};

	SidePanel.prototype._detachScrollHandler = function() {
		if (!Device.system.phone || !this.getDomRef()) {
			return;
		}

		this.$().find(".sapFSPMain")[0].removeEventListener('scroll', this._onMainScroll);
	};

	SidePanel.prototype._closeOverflowMenu = function() {
		if (this._bOverflowMenuOpened) {
			this._setOverflowItemSelection(false);
			this.getAggregation("_overflowMenu").close();
		}
	};

	SidePanel.prototype._attachMainFocusOutHandler = function() {
		if (!Device.system.phone) {
			var oDomRef = this.getDomRef();
			oDomRef && oDomRef.querySelector(".sapFSPMain").addEventListener("focusout", this._onMainFocusOut.bind(this), false);
		}
	};

	SidePanel.prototype._detachMainFocusOutHandler = function() {
		if (!Device.system.phone) {
			var oDomRef = this.getDomRef();
			oDomRef && oDomRef.querySelector(".sapFSPMain").removeEventListener("focusout", this._onMainFocusOut.bind(this), false);
		}
	};

	SidePanel.prototype._onMainFocusOut = function(oEvent) {
		this._oPreviousFocusedMainElement = oEvent.target;
	};

	SidePanel.prototype._handleScroll = function(e) {
		var iTop,
			bForward,
			bBackward;

		if (!this.bScrolling) {
			this.bScrolling = true;

			iTop = parseInt(e.target.scrollTop);

			setTimeout(function() {
				bForward = iTop > this._iLastScrollPosition;
				bBackward = iTop < this._iLastScrollPosition;
				this.setActionBarExpanded(!bForward || bBackward);
				this._iLastScrollPosition = iTop;
				this.bScrolling = false;
			}.bind(this), 100);

		}
	};

	/**
	 * Handler for F6 and Shift + F6 group navigation
	 *
	 * @param {Object} oEvent - The event object
	 * @param {boolean} bShiftKey serving as a reference if shift is used
	 * @private
	 */
	SidePanel.prototype._handleGroupNavigation = function(oEvent, bShiftKey) {
		var oEventF6 = jQuery.Event("keydown");

		this.$().trigger("focus");

		oEventF6.target = oEvent.target;
		oEventF6.key = 'F6';
		oEventF6.shiftKey = bShiftKey;

		F6Navigation.handleF6GroupNavigation(oEventF6);
	};

	SidePanel.prototype._isSingleItem = function() {
		return this.getItems().length === 1;
	};

	SidePanel.prototype._calculatePixelWidth = function(sWidth) {
		sWidth = sWidth.replace(/\s/g, '');
		if (sWidth.slice(-1) === "%") {
			sWidth = parseInt(this._getControlWidth() * parseFloat(sWidth) / 100) + "px";
		}

		return sWidth;
	};

	SidePanel.prototype._getControlWidth = function() {
		return parseInt(this.$().css("width"));
	};

	SidePanel.prototype._getSidePanelWidth = function() {
		return this._calculatePixelWidth(this.getSidePanelWidth());
	};

	SidePanel.prototype._getSidePanelMinWidth = function() {
		return this._calculatePixelWidth(this.getProperty("sidePanelMinWidth"));
	};

	SidePanel.prototype._getSidePanelMaxWidth = function() {
		return this._calculatePixelWidth(this.getProperty("sidePanelMaxWidth"));
	};

	return SidePanel;
});