/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabHeader.

sap.ui.define([
	'./library',
	'sap/ui/core/Core',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/IconPool',
	'sap/ui/core/delegate/ScrollEnablement',
	'./IconTabBarSelectList',
	'./Button',
	'./AccButton',
	'./ResponsivePopover',
	'./IconTabFilter',
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	'./IconTabBarDragAndDropUtil',
	'./IconTabHeaderRenderer',
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/events/KeyCodes"
],
function(
	library,
	Core,
	Control,
	EnabledPropagator,
	ItemNavigation,
	IconPool,
	ScrollEnablement,
	IconTabBarSelectList,
	Button,
	AccButton,
	ResponsivePopover,
	IconTabFilter,
	Device,
	ResizeHandler,
	IconTabBarDragAndDropUtil,
	IconTabHeaderRenderer,
	jQuery,
	Log,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.touch
	var touch = library.touch;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.IconTabHeaderMode
	var IconTabHeaderMode = library.IconTabHeaderMode;

	// shortcut for sap.m.IconTabDensityMode
	var IconTabDensityMode = library.IconTabDensityMode;

	/**
	 * Constructor for a new IconTabHeader.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays a number of IconTabFilters and IconTabSeparators. If the available horizontal
	 * space is exceeded, a horizontal scrolling appears.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabHeader = Control.extend("sap.m.IconTabHeader", /** @lends sap.m.IconTabHeader.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines whether the current selection is visualized.
			 * @deprecated As of 1.15.0.
			 * Regarding to changes of this control this property is not needed anymore.
			 */
			showSelection : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

			/**
			 * Key of the selected item.
			 *
			 * If the key has no corresponding aggregated item, no changes will apply.
			 * If duplicate keys exists the first item matching, the key is used.
			 * @since 1.15.0
			 */
			selectedKey : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Specifies whether the control is rendered.
			 * @since 1.15.0
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the header mode.
			 * <b>Note:</b> The Inline mode works only if no icons are set.
			 *
			 * @since 1.40
			 */
			mode : {type : "sap.m.IconTabHeaderMode", group : "Appearance", defaultValue : IconTabHeaderMode.Standard},

			/**
			 * Specifies if the overflow select list is displayed.
			 *
			 * The overflow select list represents a list, where all tab filters are displayed,
			 * so the user can select specific tab filter easier.
			 * @since 1.42
			 */
			showOverflowSelectList : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Specifies the background color of the header.
			 *
			 * Depending on the theme, you can change the state of
			 * the background color to "Solid", "Translucent", or "Transparent".
			 * Default is "Solid".
			 * @since 1.44
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid},

			/**
			 * Specifies whether tab reordering is enabled. Relevant only for desktop devices.
			 * The {@link sap.m.IconTabSeparator sap.m.IconTabSeparator} cannot be dragged  and dropped
			 * Items can be moved around {@link sap.m.IconTabSeparator sap.m.IconTabSeparator}
			 * @since 1.46
			 */
			enableTabReordering : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Specifies the visual density mode of the tabs.
			 *
			 * The values that can be applied are <code>Cozy</code>, <code>Compact</code> and <code>Inherit</code>.
			 * <code>Cozy</code> and <code>Compact</code> render the control in one of these modes independent of the global density settings.
			 * The <code>Inherit</code> value follows the global density settings which are applied.
			 * For compatibility reasons, the default value is <code>Cozy</code>.
			 * @since 1.56
			 */
			tabDensityMode :{type : "sap.m.IconTabDensityMode", group : "Appearance", defaultValue : IconTabDensityMode.Cozy}
		},
		aggregations : {

			/**
			 * The items displayed in the IconTabHeader.
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item", dnd : {draggable: true, droppable: true, layout: "Horizontal"} },

			/**
			 * Internal aggregation for managing the overflow button.
			 */
			_overflowButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

			/**
			 * Internal aggregation for managing the scroll back button.
			 */
			_leftArrowButton : {type: "sap.m.Button", multiple : false, visibility : "hidden"},

			/**
			 * Internal aggregation for managing the scroll forward button.
			 */
			_rightArrowButton : {type: "sap.m.Button", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fires when an item is selected.
			 */
			select : {
				parameters : {

					/**
					 * The selected item
					 * @since 1.15.0
					 */
					item : {type : "sap.m.IconTabFilter"},

					/**
					 * The key of the selected item
					 * @since 1.15.0
					 */
					key : {type : "string"}
				}
			}
		}
	}});

	/**
	 * Library internationalization resource bundle.
	 *
	 * @type {sap.base.i18n.ResourceBundle}
	 */
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	EnabledPropagator.apply(IconTabHeader.prototype, [true]);
	IconTabHeader.SCROLL_STEP = 264; // how many pixels to scroll with every overflow arrow click

	/**
	 * Enumeration for the two arrow buttons used to scroll through the tabs.
	 * @private
	 */
	IconTabHeader.prototype._ARROWS = {
		Left: "Left",
		Right: "Right"
	};

	IconTabHeader.prototype.init = function() {
		this._bPreviousScrollForward = false; // remember the item overflow state
		this._bPreviousScrollBack = false;
		this._iCurrentScrollLeft = 0;

		this.startScrollX = 0;
		this.startTouchX = 0;
		this._scrollable = null;

		this._aTabKeys = [];

		// Initialize the ItemNavigation
		this._oItemNavigation = new ItemNavigation().setCycling(false);
		this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusLeave, this._onItemNavigationFocusLeave, this);
		this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._onItemNavigationAfterFocus, this);
		this._oItemNavigation.setDisabledModifiers({
			sapnext : ["alt", "meta"],
			sapprevious : ["alt", "meta"]
		});

		this.addDelegate(this._oItemNavigation);

		this._oScroller = new ScrollEnablement(this, this.getId() + "-head", {
			horizontal: true,
			vertical: false,
			nonTouchScrolling: true
		});
	};

	/**
	 * Returns if the touch scrolling is disabled
	 * @private
	 */
	IconTabHeader.prototype.isTouchScrollingDisabled = function () {
		return this.getShowOverflowSelectList() &&
			this.getParent().getMetadata().getName() == 'sap.tnt.ToolHeader';
	};

	/**
	 * Returns overflow select list
	 * @private
	 */
	IconTabHeader.prototype._getSelectList = function () {

		var that = this;

		if (!this._oSelectList) {
			this._oSelectList = new IconTabBarSelectList({
				selectionChange: function (oEvent) {
					var oTarget = oEvent.getParameter('selectedItem');
					that.setSelectedItem(oTarget._tabFilter);
				}
			});

			this._oSelectList._iconTabHeader = this;
		}

		return this._oSelectList;
	};

	/**
	 * Returns overflow button
	 * @private
	 */
	IconTabHeader.prototype._getOverflowButton = function () {
		var oOverflowButton = this.getAggregation("_overflowButton");

		if (!oOverflowButton) {
			oOverflowButton = new Button({
				id: this.getId() + '-overflow',
				icon: "sap-icon://slim-arrow-down",
				type: ButtonType.Transparent,
				press: this._overflowButtonPress.bind(this)
			});
			oOverflowButton.addEventDelegate(this._onOverflowButtonEventDelegate);
			this.setAggregation("_overflowButton", oOverflowButton);
		}

		return oOverflowButton;
	};

	/**
	 * Handles overflow button "press" event
	 * @private
	 */
	IconTabHeader.prototype._overflowButtonPress = function (event) {
		if (!this._oPopover) {
			this._oPopover = new ResponsivePopover({
					showArrow: false,
					showHeader: false,
					placement: PlacementType.Vertical,
					offsetX: 0,
					offsetY: 0
				}
			).addStyleClass('sapMITBPopover');

			if (Device.system.phone) {
				this._oPopover._oControl.addButton(this._createPopoverCloseButton());
			}
			this.addDependent(this._oPopover);

			//This overrides the popover _adaptPositionParams function for placing the popover
			//over the right bottom corner of the button. This change is required by the visual spec.
			this._oPopover._oControl._adaptPositionParams =  function () {
				var bIsCompact = jQuery("body").hasClass("sapUiSizeCompact");

				this._arrowOffset = 0;

				if (bIsCompact) {
					this._offsets = ["0 0", "0 0", "0 2", "0 0"];
				} else {
					this._offsets = ["0 0", "0 0", "0 3", "0 0"];
				}
				this._myPositions = ["end bottom", "begin top", "end top", "end top"];
				this._atPositions = ["end top", "end top", "end bottom", "begin top"];
			};
		}

		var oSelectList = this._getSelectList();
		this._setSelectListItems();

		this._oPopover.removeAllContent();
		this._oPopover.addContent(oSelectList);

		this._oPopover.setInitialFocus(oSelectList.getSelectedItem());

		this._oPopover.openBy(this._getOverflowButton());
	};

	/**
	 * Creates popover close button
	 * @private
	 */
	IconTabHeader.prototype._createPopoverCloseButton = function() {
		var that = this;
		return new Button({
			text: oResourceBundle.getText("SELECT_CANCEL_BUTTON"),
			press: function() {
				that._closeOverflow();
			}
		});
	};

	/**
	 * Closes the overflow popover and focuses the correct tab filter
	 * @private
	 */
	IconTabHeader.prototype._closeOverflow = function () {

		if (!Device.system.desktop) {
			this._oPopover.close();
		}

		if (this.oSelectedItem) {
			this.oSelectedItem.$().focus();
		}
	};

	/**
	 * Sets overflow items
	 *
	 * @returns {sap.ui.core.Element}
	 * @private
	 */
	IconTabHeader.prototype._setSelectListItems = function () {

		if (!this.getShowOverflowSelectList()) {
			return;
		}

		var oSelectItem,
			oTabFilter,
			oSelectList = this._getSelectList(),
			aTabFilters = this.getTabFilters();

		oSelectList.destroyItems();

		for (var i = 0; i < aTabFilters.length; i++) {
			oTabFilter = aTabFilters[i];

			oSelectItem = oTabFilter.clone(undefined, undefined, { bCloneChildren: false, bCloneBindings: true });
			oSelectItem._tabFilter = oTabFilter;
			oSelectList.addItem(oSelectItem);

			if (oTabFilter == this.oSelectedItem) {
				oSelectList.setSelectedItem(oSelectItem);
			}
		}
	};

	/**
	 * Returns SelectList item, that corresponds ot specific TabFilter.
	 * @private
	 */
	IconTabHeader.prototype._findSelectItem = function (oTabFilter) {

		var oSelectList = this._getSelectList(),
			aSelectListItems = oSelectList.getItems(),
			oSelectItem;

		for (var i = 0; i < aSelectListItems.length; i++){

			oSelectItem = aSelectListItems[i];

			if (oSelectItem._tabFilter == oTabFilter) {
				return oSelectItem;
			}
		}
	};

	IconTabHeader.prototype._onItemNavigationFocusLeave = function() {

		// BCP: 1570034646
		if (!this.oSelectedItem) {
			return;
		}

		var aItems = this.getItems();
		var iIndex = -1;
		var oItem;

		for (var i = 0; i < aItems.length; i++) {
			oItem = aItems[i];

			if (oItem instanceof IconTabFilter == false) {
				continue;
			}

			iIndex++;

			if (this.oSelectedItem == oItem) {
				break;
			}
		}

		this._oItemNavigation.setFocusedIndex(iIndex);
	};

	/**
	 * Adjusts arrows when keyboard is used for navigation and the beginning/end of the toolbar is reached.
	 * @private
	 */
	IconTabHeader.prototype._onItemNavigationAfterFocus = function(oEvent) {
		var oHead = this.getDomRef("head"),
			oIndex = oEvent.getParameter("index"),
			$event = oEvent.getParameter('event');

		// handle only keyboard navigation here
		if ($event.keyCode === undefined) {
			return;
		}

		this._iCurrentScrollLeft = oHead.scrollLeft;

		this._checkOverflow();

		if (oIndex !== null && oIndex !== undefined) {
			this._scrollIntoView(this.getTabFilters()[oIndex], 0);
		}
	};

	/**
	 * Returns all tab filters, without the tab separators.
	 * @private
	 */
	IconTabHeader.prototype.getTabFilters = function() {

		var aItems = this.getItems();
		var aTabFilters = [];

		aItems.forEach(function(oItem) {
			if (oItem instanceof IconTabFilter) {
				aTabFilters.push(oItem);
			}
		});

		return aTabFilters;
	};

	IconTabHeader.prototype.exit = function() {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}

		if (this._oScroller) {
			this._oScroller.destroy();
			this._oScroller = null;
		}

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (this._aTabKeys) {
			this._aTabKeys = null;
		}

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	/**
	 * Handles onLongDragOver of overflow button.
	 * @private
	 */
	IconTabHeader.prototype._handleOnLongDragOver = function() {
		if (!this._oPopover || !this._oPopover.isOpen()) {
			this._overflowButtonPress();
		}
	};

	/**
	 * Handles onDragOver of the overflow button.
	 * @private
	 * @param {jQuery.Event} oEvent The jQuery drag over event
	 */
	IconTabHeader.prototype._handleOnDragOver = function(oEvent) {
		this._getOverflowButton().addStyleClass("sapMBtnDragOver");
		oEvent.preventDefault(); // allow drop, so that the cursor is correct
	};

	/**
	 * Handles onDrop of the overflow button.
	 * @private
	 */
	IconTabHeader.prototype._handleOnDrop = function() {
		this._getOverflowButton().removeStyleClass("sapMBtnDragOver");
	};

	/**
	 * Handles onDragLeave of the overflow button.
	 * @private
	 */
	IconTabHeader.prototype._handleOnDragLeave = function() {
		this._getOverflowButton().removeStyleClass("sapMBtnDragOver");
	};

	/**
	 * Sets or remove Drag and Drop configurations.
	 * @private
	 */
	IconTabHeader.prototype._setsDragAndDropConfigurations = function() {
		if (!this.getEnableTabReordering() && this.getDragDropConfig().length) {
			//Destroying Drag&Drop aggregation
			this.destroyDragDropConfig();
		} else if (this.getEnableTabReordering() && !this.getDragDropConfig().length) {
			//Adding Drag&Drop configuration to the dragDropConfig aggregation if needed
			IconTabBarDragAndDropUtil.setDragDropAggregations(this, "Horizontal");
		}
	};

	IconTabHeader.prototype.onBeforeRendering = function() {

		this._bRtl = Core.getConfiguration().getRTL();
		this._onOverflowButtonEventDelegate = {
			onlongdragover: this._handleOnLongDragOver.bind(this),
			ondragover: this._handleOnDragOver.bind(this),
			ondragleave: this._handleOnDragLeave.bind(this),
			ondrop: this._handleOnDrop.bind(this)
		};

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		this._updateSelection();
		this._isTouchScrollingDisabled = this.isTouchScrollingDisabled();
		this._oScroller.setHorizontal(!this._isTouchScrollingDisabled && (!this.getEnableTabReordering() || !Device.system.desktop));

		this._setsDragAndDropConfigurations();
	};

	/**
	 * Sets the selected item based on key.
	 * @overwrite
	 * @public
	 * @param {string} sKey The key of the item to be selected
	 * @return {sap.m.IconTabHeader} this pointer for chaining
	 */
	IconTabHeader.prototype.setSelectedKey = function (sKey) {
		var aItems = this.getTabFilters(),
			i = 0,
			bIsParentIconTabBar = this._isInsideIconTabBar(),
			bSelectedItemFound;

		if (aItems.length > 0) {
			sKey = sKey || aItems[0]._getNonEmptyKey();
		}

		// adjust UI and internal variables if already rendered (otherwise taken care by onBeforeRendering)
		if (this.$().length) {
			for (; i < aItems.length; i++) {
				if (aItems[i]._getNonEmptyKey() === sKey) {
					this.setSelectedItem(aItems[i], true);
					bSelectedItemFound = true;
					break;
				}
			}

			if (!bSelectedItemFound && !bIsParentIconTabBar && sKey) {
				this.setSelectedItem(null);
			}
		}

		// set internal property
		this.setProperty("selectedKey", sKey, true);
		return this;
	};

	/*
	 * Sets the selected item, updates the UI, and fires the select event.
	 * @private
	 * @param {sap.m.IconTabFilter} oItem The item to be selected
	 * @param {Boolean} bAPIChange whether this function is called through the API
	 * @return {sap.m.IconTabHeader} this pointer for chaining
	 */
	IconTabHeader.prototype.setSelectedItem = function(oItem, bAPIchange) {

		if (!oItem) {

			if (this.oSelectedItem) {
				this.oSelectedItem.$().removeClass("sapMITBSelected");
				this.oSelectedItem = null;
			}

			return this;
		}

		if (!oItem.getEnabled()) {
			return this;
		}

		if (this.getShowOverflowSelectList()) {
			var oSelectItem = this._findSelectItem(oItem);
			if (oSelectItem) {
				this._getSelectList().setSelectedItem(oSelectItem);
			}
		}

		var oParent = this.getParent();
		var bIsParentIconTabBar = this._isInsideIconTabBar();

		//if the old selected tab and the new selected tab both have no own content, which means they both use the same content from the icontabbar
		//there is no need to rerender the content
		//fix for xml views css: 0120061532 0001427250 2014
		var bIsContentTheSame = false;
		if (oItem.getContent().length === 0  && this.oSelectedItem && this.oSelectedItem.getContent().length === 0) {
			bIsContentTheSame = true;
		}

		if (this.oSelectedItem &&
			this.oSelectedItem.getVisible() &&
			(!bAPIchange && bIsParentIconTabBar && oParent.getExpandable() || this.oSelectedItem !== oItem)) {
			this.oSelectedItem.$()
					.removeClass("sapMITBSelected")
					.attr('aria-selected', false)
					.removeAttr('aria-expanded');
		}

		if (oItem.getVisible()) {
			//click on already selected item leads to expanding/collapsing of the content (if expandable enabled)
			if (this.oSelectedItem === oItem) {
				//if content is not expandable nothing should happen otherwise content will be expanded/collapsed
				if (!bAPIchange && bIsParentIconTabBar && oParent.getExpandable()) {
					oParent._toggleExpandCollapse();
				}
			//click on other item leads to showing the right content of this item
			} else {
				//change the content aria-labaled by the newly selected tab;
				if (bIsParentIconTabBar) {
					oParent.$("content").attr('aria-labelledby', oItem.sId);
				}

				// set new item
				this.oSelectedItem = oItem;
				this.setProperty("selectedKey", this.oSelectedItem._getNonEmptyKey(), true);

				if (!bIsParentIconTabBar) {
					this.oSelectedItem.$()
						.addClass("sapMITBSelected")
						.attr({ 'aria-selected': true });
				}

				//if the IconTabBar is not expandable and the content not expanded (which means content can never be expanded), we do not need
				//to visualize the selection and we do not need to render the content
				if (bIsParentIconTabBar && (oParent.getExpandable() || oParent.getExpanded())) {
					// add selected styles
					this.oSelectedItem.$()
							.addClass("sapMITBSelected")
							.attr({ 'aria-selected': true });

					//if item has own content, this content is shown
					var oSelectedItemContent = this.oSelectedItem.getContent();
					if (oSelectedItemContent.length > 0) {
						oParent._rerenderContent(oSelectedItemContent);
					//if item has not own content, general content of the icontabbar is shown
					} else {
						//if the general content was already shown there is no need to rerender
						if (!bIsContentTheSame) {
							oParent._rerenderContent(oParent.getContent());
						}
					}
					//if content is not expanded, content will be expanded (first click on item always leads to expanding the right content)
					if (!bAPIchange && oParent.getExpandable() && !oParent.getExpanded()) {
						oParent._toggleExpandCollapse(true);
					}
				}
			}

			// scroll to item if out of viewport
			if (this.oSelectedItem.$().length > 0) {
				this._scrollIntoView(oItem, 500);
			} else {
				this._scrollAfterRendering = true;
			}
		}

		this.oSelectedItem = oItem;
		var sSelectedKey = this.oSelectedItem._getNonEmptyKey();

		this.setProperty("selectedKey", sSelectedKey, true);
		if (bIsParentIconTabBar) {
			oParent.setProperty("selectedKey", sSelectedKey, true);
		}

		if (!bAPIchange) {
			// fire event on iconTabBar
			if (bIsParentIconTabBar) {
				oParent.fireSelect({
					selectedItem: this.oSelectedItem,
					selectedKey: sSelectedKey,
					item: this.oSelectedItem,
					key: sSelectedKey
				});
			} else {
				// fire event on header
				this.fireSelect({
					selectedItem: this.oSelectedItem,
					selectedKey: sSelectedKey,
					item: this.oSelectedItem,
					key: sSelectedKey
				});
			}
		}
		return this;
	};

	/**
	 * Returns all the visible tab filters.
	 *
	 * @private
	 */
	IconTabHeader.prototype.getVisibleTabFilters = function() {
		var aItems = this.getTabFilters(),
			aVisibleItems = [],
			oItem;

		for (var i = 0; i < aItems.length; i++) {
			oItem = aItems[i];

			if (oItem.getVisible()) {
				aVisibleItems.push(oItem);
			}
		}

		return aVisibleItems;
	};

	/**
	 * Returns the first visible item, which is needed for correct arrow calculation.
	 */
	IconTabHeader.prototype._getFirstVisibleItem = function(aItems) {
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getVisible()) {
				return aItems[i];
			}
		}

		return null;
	};

	IconTabHeader.prototype._initItemNavigation = function() {
		//use ItemNavigation for keyboardHandling
		var that = this,
			oHeadDomRef = this.getDomRef("head"),
			aItems = this.getItems(),
			aTabDomRefs = [],
			iSelectedDomIndex = -1;

		// find a collection of all tabs
		aItems.forEach(function(oItem) {
			if (oItem instanceof IconTabFilter) {
				var oItemDomRef = that.getFocusDomRef(oItem);
				jQuery(oItemDomRef).attr("tabindex", "-1");
				aTabDomRefs.push(oItemDomRef);
				if (oItem === that.oSelectedItem) {
					iSelectedDomIndex = aTabDomRefs.indexOf(oItemDomRef);
				}
			}
		});

		//Initialize the ItemNavigation
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusLeave, this._onItemNavigationFocusLeave, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._onItemNavigationAfterFocus, this);
			this.addDelegate(this._oItemNavigation);
		}

		//Reinitialize the ItemNavigation after rendering
		this._oItemNavigation.setRootDomRef(oHeadDomRef);
		this._oItemNavigation.setItemDomRefs(aTabDomRefs);
		this._oItemNavigation.setPageSize(aTabDomRefs.length); // set the page size equal to the tab number so when we press pageUp/pageDown to focus first/last tab
		this._oItemNavigation.setSelectedIndex(iSelectedDomIndex);
	};

	IconTabHeader.prototype.onThemeChanged = function() {
		this._applyTabDensityMode();
	};

	IconTabHeader.prototype._applyTabDensityMode = function() {
		var sTabDensityMode = this.getTabDensityMode();
		this.$().removeClass("sapUiSizeCompact");

		switch (sTabDensityMode) {
			case IconTabDensityMode.Compact:
				this.$().addClass("sapUiSizeCompact");
				break;
			case  IconTabDensityMode.Inherit:
				if (this.$().closest(".sapUiSizeCompact").length) {
					this.$().addClass("sapUiSizeCompact");
				}
				break;
		}
	};

	IconTabHeader.prototype.onAfterRendering = function() {
		this._applyTabDensityMode();
		// initialize scrolling
		if (this._oScroller) {
			this._oScroller.setIconTabBar(this, jQuery.proxy(this._afterIscroll, this), jQuery.proxy(this._scrollPreparation, this));
		}

		var oParent = this.getParent();
		var bIsParentIconTabBar = this._isInsideIconTabBar();

		if (this.oSelectedItem &&
			(!bIsParentIconTabBar || bIsParentIconTabBar && oParent.getExpanded())) {
			this.oSelectedItem.$()
					.addClass("sapMITBSelected")
					.attr({ 'aria-selected': true });
		}

		if (Core.isThemeApplied()) {
			setTimeout(this["_checkOverflow"].bind(this), 350);

			// scroll to selected item if it is out of screen and we render the control the first time
			if (this.oSelectedItem) {
				this._scrollIntoView(this.oSelectedItem, 500);
			}
		} else {
			Core.attachThemeChanged(this._handleThemeLoad, this);
		}

		this._initItemNavigation();

		// overflow button doesn't have tab stop
		if (this.getShowOverflowSelectList()) {
			this.$('overflow').attr('tabindex', -1);
		}

		//listen to resize
		this._sResizeListenerId = ResizeHandler.register(this.getDomRef(),  jQuery.proxy(this._fnResize, this));

		this._bCheckIfIntoView = true;
	};

	/**
	 * Fired when the theme is loaded
	 *
	 * @private
	 */
	IconTabHeader.prototype._handleThemeLoad = function() {

		setTimeout(this["_checkOverflow"].bind(this), 350);

		// scroll to selected item if it is out of screen and we render the control the first time
		if (this.oSelectedItem) {
			this._scrollIntoView(this.oSelectedItem, 500);
		}

		Core.detachThemeChanged(this._handleThemeLoad, this);
	};

	/*
	 * Destroys the item aggregation.
	 */
	IconTabHeader.prototype.destroyItems = function() {
		this.oSelectedItem = null;
		this._aTabKeys = [];
		this.destroyAggregation("items");
		return this;
	};

	IconTabHeader.prototype.addItem = function(oItem) {
		if (!(oItem instanceof sap.m.IconTabSeparator)) {
			var sKey = oItem.getKey();
			// check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				Log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.addAggregation("items", oItem);

		this._invalidateParentIconTabBar();
	};

	IconTabHeader.prototype.insertItem = function(oItem, iIndex) {
		if (!(oItem instanceof sap.m.IconTabSeparator)) {
			var sKey = oItem.getKey();
			//check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				Log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.insertAggregation("items", oItem, iIndex);

		this._invalidateParentIconTabBar();
	};

	IconTabHeader.prototype.removeAllItems = function() {
		var oResult = this.removeAllAggregation("items");

		this._aTabKeys = [];
		this.oSelectedItem = null;

		this._invalidateParentIconTabBar();

		return oResult;
	};

	IconTabHeader.prototype.removeItem = function(oItem) {
		// Make sure we have the actual Item and not just an ID
		oItem = this.removeAggregation("items", oItem);

		if (oItem && !(oItem instanceof sap.m.IconTabSeparator)) {
			var sKey = oItem.getKey();
			this._aTabKeys.splice(this._aTabKeys.indexOf(sKey) , 1);
		}

		if (this.oSelectedItem === oItem) {
			this.oSelectedItem = null;
		}

		this._invalidateParentIconTabBar();

		// Return the original value from removeAggregation
		return oItem;
	};

	IconTabHeader.prototype.updateAggregation = function() {
		this.oSelectedItem = null;
		Control.prototype.updateAggregation.apply(this, arguments);
		this.invalidate();
	};

	IconTabHeader.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {

		var aItems = this.getTabFilters();

		var oItem = Control.prototype.removeAggregation.apply(this, arguments);

		if (bSuppressInvalidate) {
			return oItem;
		}

		if (oItem && oItem == this.oSelectedItem && sAggregationName == 'items') {

			var iIndexOf = (aItems ? Array.prototype.indexOf.call(aItems, oItem) : -1);
			aItems = this.getTabFilters();

			iIndexOf = Math.max(0, Math.min(iIndexOf, aItems.length - 1));

			var oSelectedItem = aItems[iIndexOf];

			if (oSelectedItem) {
				this.setSelectedItem(oSelectedItem, true);
			} else {
				var oIconTabBar = this.getParent();
				if (this._isInsideIconTabBar() && oIconTabBar.getExpanded()) {
					oIconTabBar.$("content").children().remove();
				}
			}
		}

		return oItem;
	};

	IconTabHeader.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {

		if (sAggregationName == 'items') {
			var oIconTabBar = this.getParent();
			if (this._isInsideIconTabBar() && oIconTabBar.getExpanded()) {
				oIconTabBar.$("content").children().remove();
			}
		}

		return Control.prototype.removeAllAggregation.apply(this, arguments);
	};

	/**
	 * Returns the displayed text - text or text + (count)
	 * @private
	 */
	IconTabHeader.prototype._getDisplayText = function (oItem) {
		var sText = oItem.getText();

		if (this.isInlineMode()) {
			var sCount = oItem.getCount();
			if (sCount) {
				if (this._bRtl) {
					sText = '(' + sCount + ') ' + sText;
				} else {
					sText += ' (' + sCount + ')';
				}
			}
		}

		return sText;
	};

	/**
	 * Returns if the header is in inline mode.
	 * @private
	 */
	IconTabHeader.prototype.isInlineMode = function () {
		return this._bTextOnly && this.getMode() == IconTabHeaderMode.Inline;
	};


	/**
	 * Checks if all tabs are textOnly version.
	 * @private
	 * @returns True if all tabs are textOnly version, otherwise false
	 */
	IconTabHeader.prototype._checkTextOnly = function(aItems) {
		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {
				if (!(aItems[i] instanceof sap.m.IconTabSeparator)) {
					if (aItems[i].getIcon()) {
						this._bTextOnly = false;
						return false;
					}
				}
			}
		}
		this._bTextOnly = true;
		return true;
	};

	/**
	 * Checks if all tabs are noText version.
	 * @private
	 * @returns True if all tabs are noText version, otherwise false
	 */
	IconTabHeader.prototype._checkNoText = function(aItems) {
		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {
				if (!(aItems[i] instanceof sap.m.IconTabSeparator)) {
					if (aItems[i].getText().length > 0) {
						return false;
					}
				}
			}
		}
		return true;
	};

	/**
	 * Checks if all tabs are in line version.
	 * @private
	 * @returns True if all tabs are in line version, otherwise false
	 */
	IconTabHeader.prototype._checkInLine = function(aItems) {
		var oItem;

		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {

				oItem = aItems[i];

				if (!(oItem instanceof sap.m.IconTabSeparator)) {
					if (oItem.getIcon() || oItem.getCount()) {
						this._bInLine = false;
						return false;
					}
				}
			}
		}

		this._bInLine = true;
		return true;
	};

	/**
	 * Checks if scrolling is needed.
	 * @private
	 * @returns True if scrolling is needed, otherwise false
	 */
	IconTabHeader.prototype._checkScrolling = function(oHead) {

		var $bar = this.$();

		var bScrolling = false;
		var domScrollCont = this.getDomRef("scrollContainerInner");
		var domHead = this.getDomRef("head");

		if (domHead && domScrollCont) {
			if (domHead.offsetWidth > domScrollCont.offsetWidth) {
				bScrolling = true;
			}
		}

		if (this._scrollable !== bScrolling) {
			$bar.toggleClass("sapMITBScrollable", bScrolling);
			$bar.toggleClass("sapMITBNotScrollable", !bScrolling);
			this._scrollable = bScrolling;
		}

		this._setTabsVisibility();

		return bScrolling;
	};

	/**
	 * Returns the underlying button control of the requested scroll direction.
	 * @private
	 * @param {string} sDirection Scroll direction of the button aggregation. Either <code>Left</code> or <code>Right</code>.
	 * @returns {sap.m.Button} The button stored in the aggregation
	 */
	IconTabHeader.prototype._getScrollButton = function (sDirection) {
		var sAggregationName = "_" + sDirection.toLowerCase() + "ArrowButton";

		if (this.getAggregation(sAggregationName)) {
			return this.getAggregation(sAggregationName);
		}

		var sTranslationKey = sDirection === this._ARROWS.Left ? "TABSTRIP_SCROLL_BACK" : "TABSTRIP_SCROLL_FORWARD";
		var sTooltip = oResourceBundle.getText(sTranslationKey);
		var sIconSrc = IconPool.getIconURI("slim-arrow-" + sDirection.toLowerCase());

		var oButton = new AccButton(this.getId() + "-arrowScroll" + sDirection, {
			type: ButtonType.Transparent,
			icon: sIconSrc,
			tooltip: sTooltip,
			tabIndex: "-1",
			ariaHidden: "true",
			press: this._onScrollButtonPress.bind(this, sDirection)
		});
		this.setAggregation(sAggregationName, oButton);

		return this.getAggregation(sAggregationName);
	};

	IconTabHeader.prototype._onScrollButtonPress = function (sDirection) {
		var iScrollStep = sDirection === this._ARROWS.Left ? IconTabHeader.SCROLL_STEP : -IconTabHeader.SCROLL_STEP; // Scrolling backwards or forwards

		if (this._bRtl) {
			iScrollStep = -iScrollStep;
		}

		var iScrollNewPos = this._oScroller.getScrollLeft() - iScrollStep;

		if (sDirection === this._ARROWS.Left) {
			if (iScrollNewPos < 0) {
				iScrollNewPos  = 0;
			}
		} else {
			var iContainerWidth = this.$("scrollContainerInner").width();
			var iHeadWidth = this.$("head").width();
			if (iScrollNewPos > (iHeadWidth - iContainerWidth)) {
				iScrollNewPos = iHeadWidth - iContainerWidth;
			}
		}

		// execute manual scrolling with iScroll's scrollTo method (setTimeout 0 is needed for positioning glitch)
		this._scrollPreparation();
		setTimeout(this._oScroller["scrollTo"].bind(this._oScroller, iScrollNewPos, 0, 500), 0);
		setTimeout(this["_afterIscroll"].bind(this), 500);
	};

	/**
	 * Changes the state of the scroll arrows depending on whether they are required due to overflow.
	 * @private
	 */
	IconTabHeader.prototype._checkOverflow = function() {
		if (this.bIsDestroyed) {
			return;
		}

		var oBarHead = this.getDomRef("head");
		var $bar = this.$();

		if (this._checkScrolling(oBarHead) && oBarHead) {
			// check whether scrolling to the left is possible
			var bScrollBack = false;
			var bScrollForward = false;

			var domScrollCont = this.getDomRef("scrollContainerInner");
			var domHead = this.getDomRef("head");

			if (this._oScroller.getScrollLeft() > 0) {
				if (this._bRtl) {
					bScrollForward = true;
				} else {
					bScrollBack = true;
				}
			}

			if ((this._oScroller.getScrollLeft() + domScrollCont.offsetWidth) < domHead.offsetWidth) {
				if (this._bRtl) {
					bScrollBack = true;
				} else {
					bScrollForward = true;
				}
			}

			// only do DOM changes if the state changed to avoid periodic application of identical values
			if ((bScrollForward != this._bPreviousScrollForward) || (bScrollBack != this._bPreviousScrollBack)) {
				this._bPreviousScrollForward = bScrollForward;
				this._bPreviousScrollBack = bScrollBack;
				$bar.toggleClass("sapMITBScrollBack", bScrollBack);
				$bar.toggleClass("sapMITBNoScrollBack", !bScrollBack);
				$bar.toggleClass("sapMITBScrollForward", bScrollForward);
				$bar.toggleClass("sapMITBNoScrollForward", !bScrollForward);
			}
		} else {
			this._bPreviousScrollForward = false;
			this._bPreviousScrollBack = false;
		}
	};

	/**
	 * Handles the activation of the tabs and arrows.
	 * @private
	 */
	IconTabHeader.prototype._handleActivation = function(oEvent) {
		var sTargetId = oEvent.target.id,
			oControl = oEvent.srcControl,
			sControlId,
			$target = jQuery(oEvent.target);

		if (oControl instanceof Button) {
			return;
		}

		var $sTargetId = jQuery(document.getElementById(sTargetId));
		/*eslint-disable no-empty */
		// TODO check better implementation
		if ($sTargetId.parents() && Array.prototype.indexOf.call($sTargetId.parents(), this.$("content")[0]) > -1) {
		/*eslint-enable no-empty */
			//do nothing because element is inside content
		} else {
			if (sTargetId) {
				// For items: do not navigate away! Stay on the page and handle the click in-place. Right-click + "Open in new Tab" still works.
				// For scroll buttons: Prevent IE from firing beforeunload event -> see CSN 4378288 2012
				oEvent.preventDefault();

				// should be one of the items - select it
				if ($target.hasClass('sapMITBFilterIcon') || $target.hasClass('sapMITBCount') || $target.hasClass('sapMITBText') || $target.hasClass('sapMITBTab') || $target.hasClass('sapMITBContentArrow') || $target.hasClass('sapMITBSep') || $target.hasClass('sapMITBSepIcon')) {
					// click on icon: fetch filter instead
					sControlId = oEvent.srcControl.getId().replace(/-icon$/, "");
					oControl = Core.byId(sControlId);
					if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof sap.m.IconTabSeparator)) {
						this.setSelectedItem(oControl);
					}
				} else if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof sap.m.IconTabSeparator)) {
					// select item if it is an iconTab but not a separator

					this.setSelectedItem(oControl);
				}
			} else {
				//no target id, so we have to check if showAll is set or it's a text only item, because clicking on the number then also leads to selecting the item
				if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof sap.m.IconTabSeparator)) {
					this.setSelectedItem(oControl);
				}
			}
		}
	};

	/**
	 * Scrolls to the item passed as parameter if it is not (fully) visible.
	 * If the item is to the left of the viewport it will be put leftmost.
	 * If the item is to the right of the viewport it will be put rightmost.
	 * @param {sap.m.IconTabFilter} oItem The item to be scrolled into view
	 * @param {int} iDuration The duration of the animation effect
	 * @private
	 */
	IconTabHeader.prototype._scrollIntoView = function(oItem, iDuration) {
		if (this.bIsDestroyed || !oItem.$().length) {
			return;
		}

		var $item = oItem.$(),
			iScrollLeft = this._oScroller.getScrollLeft(),
			iContainerWidth = this.$("scrollContainerInner").width(),
			iItemWidth = $item.outerWidth(true),
			iItemPosLeft = $item.position().left,
			iLeftArrowWidth = this._bPreviousScrollBack ? this._getScrollButton(this._ARROWS.Left).$().width() : 0,
			iOverflowButtonWidth = this.getShowOverflowSelectList() ? this._getOverflowButton().$().width() : 0,
			iNewScrollLeft;

		// check if item is outside of viewport
		if (iItemPosLeft - iScrollLeft < 0 || iItemPosLeft - iScrollLeft > iContainerWidth - iItemWidth) {
			if (iItemPosLeft - iScrollLeft < 0) { // left side: make this the first item
				iNewScrollLeft = iItemPosLeft - iLeftArrowWidth;
			} else { // right side: make this the last item
				iNewScrollLeft = Math.min(iItemPosLeft, iItemPosLeft + iItemWidth - iContainerWidth + iOverflowButtonWidth);
				iNewScrollLeft = Math.round(iNewScrollLeft);
			}

			// execute manual scrolling with scrollTo method (delayedCall 0 is needed for positioning glitch)
			this._scrollPreparation();
			// store current scroll state to set it after re-rendering
			this._iCurrentScrollLeft = iNewScrollLeft;
			setTimeout(this._oScroller["scrollTo"].bind(this._oScroller, iNewScrollLeft, 0, iDuration), 0);
			setTimeout(this["_afterIscroll"].bind(this), iDuration);
		}
	};

	/*
	 * Scrolls the items if possible, using an animation.
	 *
	 * @param {int} iDelta How far to scroll
	 * @param {int} iDuration How long to scroll (ms)
	 * @private
	 */
	IconTabHeader.prototype._scroll = function(iDelta, iDuration) {
		this._scrollPreparation();

		var oDomRef = this.getDomRef("head");
		var iScrollLeft = oDomRef.scrollLeft;
		var bIsIE = Device.browser.msie || Device.browser.edge;
		if (!bIsIE && this._bRtl) {
			iDelta = -iDelta;
		} // RTL lives in the negative space
		var iScrollTarget = iScrollLeft + iDelta;
		jQuery(oDomRef).stop(true, true).animate({scrollLeft: iScrollTarget}, iDuration, jQuery.proxy(this._adjustAndShowArrow, this));
		this._iCurrentScrollLeft = iScrollTarget;
	};

	/**
	 * Adjusts the arrow position and displays the arrow.
	 * @private
	 */
	IconTabHeader.prototype._adjustAndShowArrow = function() {
		this._$bar && this._$bar.toggleClass("sapMITBScrolling", false);
		this._$bar = null;
		//update the arrows on desktop
		if (Device.system.desktop) {
			this._checkOverflow();
		}
	};

	/**
	 * Scroll preparation.
	 * @private
	 */
	IconTabHeader.prototype._scrollPreparation = function() {
		if (!this._$bar) {
			this._$bar = this.$().toggleClass("sapMITBScrolling", true);
		}
	};

	/**
	 * After iscroll.
	 * @private
	*/
	IconTabHeader.prototype._afterIscroll = function() {
		this._checkOverflow();
		this._adjustAndShowArrow();

		this._setTabsVisibility();
	};

	/**
	 * Resize  handling.
	 * @private
	*/
	IconTabHeader.prototype._fnResize = function() {
		this._checkOverflow();

		if (this.oSelectedItem && this._bCheckIfIntoView) {
			this._scrollIntoView(this.oSelectedItem, 0);

			if (!this._isTouchScrollingDisabled) {
				this._bCheckIfIntoView = false;
			}
		}

		this._setTabsVisibility();
	};

	/**
	 * Returns if the control is inside an IconTabBar.
	 * @private
	 */
	IconTabHeader.prototype._isInsideIconTabBar = function() {
		var oParent = this.getParent();

		return oParent instanceof Control && oParent.isA('sap.m.IconTabBar');
	};

	/**
	 * Invalidates the parent if it is an IconTabBar
	 * @private
	 */
	IconTabHeader.prototype._invalidateParentIconTabBar = function() {
		if (this._isInsideIconTabBar()) {
			this.getParent().invalidate();
		}
	};

	/**
	 * Sets tabs visibility when touch scrolling is disabled
	 * @private
	 */
	IconTabHeader.prototype._setTabsVisibility = function() {

		if (!this._isTouchScrollingDisabled) {
			return;
		}

		var aTabs = this.getItems(),
			oTab,
			$tab,
			bHasVisibleItem,
			i;

		for (i = 0; i < aTabs.length; i++) {
			oTab = aTabs[i];
			$tab = oTab.$();

			if (!$tab.hasClass('sapMITBSelected') && !this._isTabIntoView($tab)) {
				$tab.addClass('sapMITBFilterHidden');
			} else {
				bHasVisibleItem = true;
				$tab.removeClass('sapMITBFilterHidden');
			}
		}

		if (!bHasVisibleItem) {
			for (i = 0; i < aTabs.length; i++) {
				oTab = aTabs[i];
				$tab = oTab.$();

				if (this._isTabIntoView($tab, true)) {
					$tab.removeClass('sapMITBFilterHidden');
					break;
				}
			}
		}

		this._moveVisibleTabs();
	};

	/**
	 * Returns if the tab is into the view area
	 * @private
	 */
	IconTabHeader.prototype._isTabIntoView = function($tab, skipRightSide) {

		if (!$tab.length) {
			return false;
		}

		var iScrollLeft = this._oScroller.getScrollLeft(),
			iContainerWidth = this.$("scrollContainerInner").width(),
			$head = this.$('head'),
			iHeadPaddingWidth = $head.innerWidth() - $head.width(),
			leftMargin = $tab.css('padding-left'),
			iItemWidth = $tab.width() + parseFloat(leftMargin),
			iItemPosLeft = Math.ceil($tab.position().left - iHeadPaddingWidth / 2);

		if (iItemPosLeft - iScrollLeft < 0 ||
			(!skipRightSide && (iItemPosLeft + iItemWidth - iScrollLeft > iContainerWidth))) {
			return false;
		}

		return true;
	};

	/**
	 * Moves visible tabs
	 * @private
	 */
	IconTabHeader.prototype._moveVisibleTabs = function() {

		if (!this._oScroller) {
			return;
		}

		var iScrollLeft = this._oScroller.getScrollLeft(),
			$head = this.$('head'),
			iHeadPaddingWidth = $head.innerWidth() - $head.width(),
			$tab = this.$().find('.sapMITBFilter:not(.sapMITBFilterHidden)').first(),
			idx,
			iItemPosLeft;

		if (!$tab.length) {
			return;
		}

		iItemPosLeft = $tab.position().left - iHeadPaddingWidth / 2;

		if (!this._bRtl && iItemPosLeft - iScrollLeft > 2) {
			idx = iScrollLeft - iItemPosLeft;
			$head.css('transform', 'translate(' + idx + 'px)');
		} else {
			$head.css('transform', '');
		}

		return true;
	};

	/**
	 * @overwrite
	 */
	//overwritten method, returns for most cases the iconDomRef, if the given tab has no icon, the textDomRef is returned.
	IconTabHeader.prototype.getFocusDomRef = function (oFocusTab) {
		var oTab = oFocusTab || this.oSelectedItem;
		if (!oTab) {
			return null;
		}

		return oTab.getDomRef();
	};

	IconTabHeader.prototype.applyFocusInfo = function (oFocusInfo) {
		//sets the focus depending on the used IconTabFilter
		if (oFocusInfo.focusDomRef) {
			jQuery(oFocusInfo.focusDomRef).focus();
		}
	};

	/**
	 * Sets a selected item.
	 * If no key is provided, or if the item is not visible, the first visible item will be selected.
	 *
	 * @private
	 */
	IconTabHeader.prototype._updateSelection = function () {
		var aItems = this.getItems(),
			sSelectedKey = this.getSelectedKey(),
			i = 0,
			oParent = this.getParent(),
			bIsParentIconTabBar = this._isInsideIconTabBar(),
			bIsParentToolHeader = oParent && oParent.getMetadata().getName() == 'sap.tnt.ToolHeader';

		if (aItems.length > 0) {
			if (!this.oSelectedItem || sSelectedKey && sSelectedKey !== this.oSelectedItem._getNonEmptyKey()) {
				if (sSelectedKey) {
					// selected key was specified by API: set oSelectedItem to the item specified by key
					for (; i < aItems.length; i++) {
						if (!(aItems[i] instanceof sap.m.IconTabSeparator) && aItems[i]._getNonEmptyKey() === sSelectedKey) {
							this.oSelectedItem = aItems[i];
							break;
						}
					}
				}

				// no key and no item, we set the first visible item as selected
				if (!this.oSelectedItem && (bIsParentIconTabBar || !sSelectedKey)) {
					for (i = 0; i < aItems.length; i++) { // tab item
						if (!(aItems[i] instanceof sap.m.IconTabSeparator) && aItems[i].getVisible()) {
							this.oSelectedItem = aItems[i];
							break;
						}
					}
				}
			}

			//in case the selected tab is not visible anymore, the selected tab will change to the first visible tab
			if (!bIsParentToolHeader && this.oSelectedItem && !this.oSelectedItem.getVisible()) {
				for (i = 0; i < aItems.length; i++) { // tab item
					if (!(aItems[i] instanceof sap.m.IconTabSeparator) && aItems[i].getVisible()) {
						this.oSelectedItem = aItems[i];
						break;
					}
				}
			}

			if (this.oSelectedItem) {
				this.setProperty("selectedKey", this.oSelectedItem._getNonEmptyKey(), true);
			}
		}
	};

	/* =========================================================== */
	/*           begin: event handlers                             */
	/* =========================================================== */

	/**
	 * Initializes scrolling on the IconTabHeader.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ontouchstart = function(oEvent) {
		var oTargetTouch = oEvent.targetTouches[0];

		// store & init touch state
		this._iActiveTouch = oTargetTouch.identifier;
		this._iTouchStartPageX = oTargetTouch.pageX;
		this._iTouchStartPageY = oTargetTouch.pageY;
		this._iTouchDragX = 0;
		this._iTouchDragY = 0;

		var $target = jQuery(oEvent.target);

		// prevent text selecting when click on the scrolling arrows
		if ($target.hasClass('sapMITBArrowScroll')) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Sets an internal flag if horizontal drag was executed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ontouchmove = function(oEvent) {

		if (this._iActiveTouch === undefined) {
			return;
		}

		var oTouch = touch.find(oEvent.changedTouches, this._iActiveTouch);

		// check for valid changes
		if (!oTouch || oTouch.pageX === this._iTouchStartPageX) {
			return;
		}

		// sum up movement to determine in touchend event if selection should be executed
		this._iTouchDragX += Math.abs(this._iTouchStartPageX - oTouch.pageX);
		this._iTouchDragY += Math.abs(this._iTouchStartPageY - oTouch.pageY);
		this._iTouchStartPageX = oTouch.pageX;
		this._iTouchStartPageY = oTouch.pageY;
	};

	/**
	 * Handles touch end and events and triggers selection if bar was not dragged.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ontouchend = function(oEvent) {

		if (this._iActiveTouch === undefined) {
			return;
		}

		// suppress selection if there ware a drag (moved more than 5px on desktop or 20px on others)
		var iMaxMove = Device.system.desktop ? 5 : 15;


		if ((this._scrollable && this._iTouchDragX > iMaxMove) ||
			this._iTouchDragY > iMaxMove) {
			return;
		}

		var MOBILE_TAP = 0;
		var LEFT_MOUSE_CLICK = 1;
		var LUMIA_TOUCH; // undefined on Lumia phone

		if (oEvent.which === LUMIA_TOUCH || oEvent.which === MOBILE_TAP || oEvent.which === LEFT_MOUSE_CLICK) {
			this._handleActivation(oEvent);
		}

		this._iActiveTouch = undefined;
	};


	/**
	 * Handles the touch cancel event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	IconTabHeader.prototype.ontouchcancel = IconTabHeader.prototype.ontouchend;

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	IconTabHeader.prototype.onkeydown = function(oEvent) {
		switch (oEvent.which) {
			case KeyCodes.ENTER:
				this._handleActivation(oEvent);
				oEvent.preventDefault();
				break;
			case KeyCodes.SPACE:
				oEvent.preventDefault(); // prevent scrolling when focused on the tab
				break;
		}
	};

	/**
	 * Handle the key up event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent The fired event
	 */
	IconTabHeader.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			this._handleActivation(oEvent);
			oEvent.preventDefault();
		}
	};

	/* =========================================================== */
	/*           end: event handlers                               */
	/* =========================================================== */

	/* =========================================================== */
	/*           start: tab drag-drop                              */
	/* =========================================================== */

	/**
	 * Handles drop event for drag &  drop functionality in sap.m.IconTabHeader
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype._handleDragAndDrop = function (oEvent) {
		var sDropPosition = oEvent.getParameter("dropPosition"),
			oDraggedControl = oEvent.getParameter("draggedControl"),
			oDroppedControl = oEvent.getParameter("droppedControl"),
			isParentSelectList = oDraggedControl.getParent().getMetadata().getName() === "sap.m.IconTabBarSelectList";

		//drag and drop is between overflow list and header
		if (isParentSelectList) {
			this._handleDragAndDropBetweenHeaderAndList(sDropPosition, oDroppedControl, oDraggedControl);
		} else {
			IconTabBarDragAndDropUtil.handleDrop(this, sDropPosition, oDraggedControl, oDroppedControl, false);
		}

		this._initItemNavigation();
		oDraggedControl.$().focus();
	};

	/**
	 * Handles drop event for drag &  drop between sap.m.IconTabHeader and sap.m.IconTabBarSelectList.
	 * @param {string} sDropPosition position where the control will be dropped (e.g. Before/After)
	 * @param {object} oDraggedControl item that is dragged
	 * @param {object} oDroppedControl item that the dragged control will be dropped on
	 * @private
	 */
	IconTabHeader.prototype._handleDragAndDropBetweenHeaderAndList = function (sDropPosition, oDroppedControl, oDraggedControl) {
		var oSelectList = this._getSelectList(),
			oDraggedAndDroppedItemFromSelectList = IconTabBarDragAndDropUtil.getDraggedDroppedItemsFromList(oSelectList.getAggregation("items"), oDraggedControl, oDroppedControl);
			if (!oDraggedAndDroppedItemFromSelectList) {

				return;
			}
			IconTabBarDragAndDropUtil.handleDrop(this, sDropPosition, oDraggedControl._tabFilter, oDroppedControl, false);
			IconTabBarDragAndDropUtil.handleDrop(oSelectList, sDropPosition, oDraggedControl, oDraggedAndDroppedItemFromSelectList.oDroppedControlFromList, false);
			oSelectList._initItemNavigation();
	};
	/* =========================================================== */
	/*           end: tab drag-drop		                           */
	/* =========================================================== */

	/* =========================================================== */
	/*           start: tab keyboard handling - drag-drop          */
	/* =========================================================== */

	/**
	 * Moves a tab by a specific key code
	 *
	 * @param {object} oTab The event object
	 * @param {number} iKeyCode Key code
	 * @private
	 */
	IconTabHeader.prototype._moveTab = function (oTab, iKeyCode) {
		var bResult = IconTabBarDragAndDropUtil.moveItem.call(this, oTab, iKeyCode);
		this._initItemNavigation();

		if (bResult) {
			this._scrollIntoView(oTab, 0);
		}
	};

	/**
	 * Handle keyboard drag&drop
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ondragrearranging = function (oEvent) {
		if (!this.getEnableTabReordering()) {
			return;
		}

		var oTab = oEvent.srcControl;
		this._moveTab(oTab, oEvent.keyCode);
		oTab.$().focus();
	};

	/**
	 * Moves tab on first position
	 * Ctrl + Home
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsaphomemodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Move focused tab of IconTabHeader to last position
	 * Ctrl + End
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapendmodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Ctrl + Left Right || Ctrl + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapincreasemodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Ctrl + Left Arrow || Ctrl + Arrow Down
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapdecreasemodifiers = IconTabHeader.prototype.ondragrearranging;

	/* =========================================================== */
	/*           end: tab keyboard handling - drag-drop            */
	/* =========================================================== */

	return IconTabHeader;

});