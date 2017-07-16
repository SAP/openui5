/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabHeader.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator',
		'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/IconPool', 'sap/ui/core/delegate/ScrollEnablement',
		'./IconTabBarSelectList', './Button', './ResponsivePopover', './IconTabFilter'],
	function(jQuery, library, Control, EnabledPropagator,
				ItemNavigation, IconPool, ScrollEnablement,
				IconTabBarSelectList, Button, ResponsivePopover, IconTabFilter) {
	"use strict";

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
			mode : {type : "sap.m.IconTabHeaderMode", group : "Appearance", defaultValue : sap.m.IconTabHeaderMode.Standard},

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
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : sap.m.BackgroundDesign.Solid},

			/**
			 * Specifies whether tab reordering is enabled. Relevant only for desktop devices.
			 * @since 1.46
			 */
			enableTabReordering : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		aggregations : {

			/**
			 * The items displayed in the IconTabHeader.
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item"}
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

	EnabledPropagator.apply(IconTabHeader.prototype, [true]);

	IconTabHeader.ANIMATION_DURATION = sap.ui.getCore().getConfiguration().getAnimation() ? 200 : 0;
	IconTabHeader.SCROLL_STEP = 264; // how many pixels to scroll with every overflow arrow click

	IconTabHeader.prototype.init = function() {
		this._bPreviousScrollForward = false; // remember the item overflow state
		this._bPreviousScrollBack = false;
		this._iCurrentScrollLeft = 0;
		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();

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
			!sap.ui.Device.system.desktop &&
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
		if (!this._oOverflowButton) {
			this._oOverflowButton = new Button({
				id: this.getId() + '-overflow',
				icon: "sap-icon://overflow",
				type: sap.m.ButtonType.Transparent,
				press: this._overflowButtonPress.bind(this)
			});
		}

		return this._oOverflowButton;
	};

	/**
	 * Handles overrflow button "press" event
	 * @private
	 */
	IconTabHeader.prototype._overflowButtonPress = function (event) {

		if (!this._oPopover) {
			this._oPopover = new ResponsivePopover({
					showArrow: false,
					showHeader: false,
					placement: sap.m.PlacementType.Vertical,
					offsetX: 0,
					offsetY: 0
				}
			).addStyleClass('sapMITBPopover');

			if (sap.ui.Device.system.phone) {
				this._oPopover._oControl.addButton(this._createPopoverCloseButton());
			}
			this.addDependent(this._oPopover);
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
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
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

		if (!sap.ui.Device.system.desktop) {
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

		oSelectList.removeAllItems();

		for (var i = 0; i < aTabFilters.length; i++) {
			oTabFilter = aTabFilters[i];

			oSelectItem = oTabFilter.clone();
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

			if (oItem instanceof sap.m.IconTabFilter == false) {
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
			if (oItem instanceof sap.m.IconTabFilter) {
				aTabFilters.push(oItem);
			}
		});

		return aTabFilters;
	};

	IconTabHeader.prototype.exit = function() {
		if (this._oArrowLeft) {
			this._oArrowLeft.destroy();
		}
		if (this._oArrowRight) {
			this._oArrowRight.destroy();
		}

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
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (this._aTabKeys) {
			this._aTabKeys = null;
		}

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}

		if (this._oOverflowButton) {
			this._oOverflowButton.destroy();
			this._oOverflowButton = null;
		}
	};

	IconTabHeader.prototype.onBeforeRendering = function() {
		var aItems = this.getItems(),
			sSelectedKey = this.getSelectedKey(),
			i = 0,
			oParent = this.getParent(),
			bIsParentIconTabBar = oParent instanceof sap.m.IconTabBar;

		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

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
			if (this.oSelectedItem && !this.oSelectedItem.getVisible()) {
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

		this._isTouchScrollingDisabled = this.isTouchScrollingDisabled();
		this._oScroller.setHorizontal(!this._isTouchScrollingDisabled);

		// Deregister resize event before re-rendering
		if (this._sResizeListenerNoFlexboxSupportId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerNoFlexboxSupportId);
			this._sResizeListenerNoFlexboxSupportId = null;
		}
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
			oParent = this.getParent(),
			bIsParentIconTabBar = oParent instanceof sap.m.IconTabBar,
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

		if (!oItem || !oItem.getEnabled()) {

			if (this.oSelectedItem) {
				this.oSelectedItem.$().removeClass("sapMITBSelected");
				this.oSelectedItem = null;
			}

			return this;
		}

		if (this.getShowOverflowSelectList()) {
			var oSelectItem = this._findSelectItem(oItem);
			if (oSelectItem) {
				this._getSelectList().setSelectedItem(oSelectItem);
			}
		}

		var oParent = this.getParent();
		var bIsParentIconTabBar = oParent instanceof sap.m.IconTabBar;

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

		var sSelectedKey = this.oSelectedItem._getNonEmptyKey();
		this.oSelectedItem = oItem;
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
			if (oItem instanceof sap.m.IconTabFilter) {
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
		this._oItemNavigation.setSelectedIndex(iSelectedDomIndex);
	};

	IconTabHeader.prototype.onAfterRendering = function() {
		// initialize scrolling
		if (this._oScroller) {
			this._oScroller.setIconTabBar(this, jQuery.proxy(this._afterIscroll, this), jQuery.proxy(this._scrollPreparation, this));
		}

		var oParent = this.getParent();
		var bIsParentIconTabBar = oParent instanceof sap.m.IconTabBar;

		if (this.oSelectedItem &&
			(!bIsParentIconTabBar || bIsParentIconTabBar && oParent.getExpanded())) {
			this.oSelectedItem.$()
					.addClass("sapMITBSelected")
					.attr({ 'aria-selected': true });
		}

		jQuery.sap.delayedCall(350, this, "_checkOverflow");

		// scroll to selected item if it is out of screen and we render the control the first time
		if (this.oSelectedItem) {
			this._scrollIntoView(this.oSelectedItem, 500);
		}

		this._initItemNavigation();

		// overflow button doesn't have tab stop
		if (this.getShowOverflowSelectList()) {
			this.$('overflow').attr('tabindex', -1);
		}

		//listen to resize
		this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(),  jQuery.proxy(this._fnResize, this));

		// Change ITB content height on resize when ITB stretchContentHeight is set to true (IE9 fix)
		if (!jQuery.support.newFlexBoxLayout &&
			bIsParentIconTabBar &&
			oParent.getStretchContentHeight()) {
			this._sResizeListenerNoFlexboxSupportId = sap.ui.core.ResizeHandler.register(oParent.getDomRef(), jQuery.proxy(this._fnResizeNoFlexboxSupport, this));
			this._fnResizeNoFlexboxSupport();
		}

		this._bCheckIfIntoView = true;
	};

	/*
	 * Destroys the item aggregation.
	 */
	IconTabHeader.prototype.destroyItems = function() {
		this.oSelectedItem = null;
		this._aTabKeys = [];
		this.destroyAggregation("items");
	};

	IconTabHeader.prototype.addItem = function(oItem) {
		if (!(oItem instanceof sap.m.IconTabSeparator)) {
			var sKey = oItem.getKey();
			// check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				jQuery.sap.log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.addAggregation("items", oItem);
	};

	IconTabHeader.prototype.insertItem = function(oItem, iIndex) {
		if (!(oItem instanceof sap.m.IconTabSeparator)) {
			var sKey = oItem.getKey();
			//check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				jQuery.sap.log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.insertAggregation("items", oItem, iIndex);
	};

	IconTabHeader.prototype.removeAllItems = function() {
		this._aTabKeys = [];
		this.removeAllAggregation("items");
	};

	IconTabHeader.prototype.removeItem = function(oItem) {
		// Make sure we have the actual Item and not just an ID
		oItem = this.removeAggregation("items", oItem);

		if (oItem && !(oItem instanceof sap.m.IconTabSeparator)) {
			var sKey = oItem.getKey();
			this._aTabKeys.splice(this._aTabKeys.indexOf(sKey) , 1);
		}

		// Return the original value from removeAggregation
		return oItem;
	};

	IconTabHeader.prototype.updateAggregation = function() {
		this.oSelectedItem = null;

		return Control.prototype.updateAggregation.apply(this, arguments);
	};

	IconTabHeader.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {

		var aItems = this.getTabFilters();

		var oItem = Control.prototype.removeAggregation.apply(this, arguments);

		// don't change selected item while drag-drop
		if (this._oDragContext) {
			return oItem;
		}

		if (oItem && oItem == this.oSelectedItem && sAggregationName == 'items') {

			var iIndexOf = jQuery.inArray(oItem, aItems);
			aItems = this.getTabFilters();

			iIndexOf = Math.max(0, Math.min(iIndexOf, aItems.length - 1));

			var oSelectedItem = aItems[iIndexOf];

			if (oSelectedItem) {
				this.setSelectedItem(oSelectedItem, true);
			} else {
				var oIconTabBar = this.getParent();
				if (oIconTabBar instanceof sap.m.IconTabBar && oIconTabBar.getExpanded()) {
					oIconTabBar.$("content").children().remove();
				}
			}
		}

		return oItem;
	};

	IconTabHeader.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {

		if (sAggregationName == 'items') {
			var oIconTabBar = this.getParent();
			if (oIconTabBar instanceof sap.m.IconTabBar && oIconTabBar.getExpanded()) {
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
		return this._bTextOnly && this.getMode() == sap.m.IconTabHeaderMode.Inline;
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
		var domScrollCont = this.getDomRef("scrollContainer");
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
	 * Gets the icon of the requested arrow (left/right).
	 * @private
	 * @param sName Left or right
	 * @returns Icon of the requested arrow
	 */
	IconTabHeader.prototype._getScrollingArrow = function(sName) {
		var src = IconPool.getIconURI("slim-arrow-" + sName);

		var mProperties = {
			src : src,
			useIconTooltip : false
		};

		var sSuffix = this._bTextOnly ? "TextOnly" : "";
		var sLeftArrowClass = "sapMITBArrowScrollLeft" + sSuffix;
		var sRightArrowClass = "sapMITBArrowScrollRight" + sSuffix;

		var aCssClassesToAddLeft = ["sapMITBArrowScroll", sLeftArrowClass];
		var aCssClassesToAddRight = ["sapMITBArrowScroll", sRightArrowClass];

		if (this._bInLine) {
			aCssClassesToAddLeft.push('sapMITBArrowScrollLeftInLine');
			aCssClassesToAddRight.push('sapMITBArrowScrollRightInLine');
		}

		if (sName === "left") {
			if (!this._oArrowLeft) {
				this._oArrowLeft = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollLeft", this._oArrowLeft, this, mProperties, aCssClassesToAddLeft);
			}
			return this._oArrowLeft;
		}
		if (sName === "right") {
			if (!this._oArrowRight) {
				this._oArrowRight = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollRight", this._oArrowRight, this, mProperties, aCssClassesToAddRight);
			}
			return this._oArrowRight;
		}
	};

	/**
	 * Changes the state of the scroll arrows depending on whether they are required due to overflow.
	 * @private
	 */
	IconTabHeader.prototype._checkOverflow = function() {

		var oBarHead = this.getDomRef("head");
		var $bar = this.$();

		if (this._checkScrolling(oBarHead) && oBarHead) {
			// check whether scrolling to the left is possible
			var bScrollBack = false;
			var bScrollForward = false;

			var domScrollCont = this.getDomRef("scrollContainer");
			var domHead = this.getDomRef("head");
			if (this._oScroller.getScrollLeft() > 0) {
				bScrollBack = true;
			}
			if ((this._oScroller.getScrollLeft() + domScrollCont.offsetWidth) < domHead.offsetWidth) {
				bScrollForward = true;
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
			sControlId;

		if (this._oDragContext && this._oDragContext.movedTabIndexes.length) {
			return;
		}

		if (oControl instanceof  Button) {
			return;
		}

		var $sTargetId = jQuery.sap.byId(sTargetId);
		/*eslint-disable no-empty */
		// TODO check better implementation
		if (jQuery.inArray(this.$("content")[0], $sTargetId.parents()) > -1) {
		/*eslint-enable no-empty */
			//do nothing because element is inside content
		} else {
			if (sTargetId) {
				var sId = this.getId();

				// For items: do not navigate away! Stay on the page and handle the click in-place. Right-click + "Open in new Tab" still works.
				// For scroll buttons: Prevent IE from firing beforeunload event -> see CSN 4378288 2012
				oEvent.preventDefault();

				//on mobile devices click on arrows has no effect
				if (sTargetId == sId + "-arrowScrollLeft" && sap.ui.Device.system.desktop) {
					var iScrollLeft = this._oScroller.getScrollLeft() - IconTabHeader.SCROLL_STEP;
					if (iScrollLeft < 0) {
						iScrollLeft = 0;
					}
					// execute manual scrolling with iScroll's scrollTo method (delayedCall 0 is needed for positioning glitch)
					this._scrollPreparation();
					jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [iScrollLeft, 0, 500]);
					jQuery.sap.delayedCall(500, this, "_afterIscroll");

				} else if (sTargetId == sId + "-arrowScrollRight" && sap.ui.Device.system.desktop) {
					var iScrollLeft = this._oScroller.getScrollLeft() + IconTabHeader.SCROLL_STEP;
					var iContainerWidth = this.$("scrollContainer").width();
					var iHeadWidth = this.$("head").width();
					if (iScrollLeft > (iHeadWidth - iContainerWidth)) {
						iScrollLeft = iHeadWidth - iContainerWidth;
					}
					// execute manual scrolling with iScroll's scrollTo method (delayedCall 0 is needed for positioning glitch)
					this._scrollPreparation();
					jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [iScrollLeft, 0, 500]);
					jQuery.sap.delayedCall(500, this, "_afterIscroll");
				} else {

					// should be one of the items - select it
					if (oControl instanceof sap.ui.core.Icon || oControl instanceof sap.m.Image) {
						// click on icon: fetch filter instead
						sControlId = oEvent.srcControl.getId().replace(/-icon$/, "");
						oControl = sap.ui.getCore().byId(sControlId);
						if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof sap.m.IconTabSeparator)) {
							this.setSelectedItem(oControl);
						}
					} else if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof sap.m.IconTabSeparator)) {
						// select item if it is an iconTab but not a separator

						this.setSelectedItem(oControl);
					}
				}
			} else {
				//no target id, so we have to check if showAll is set or it's a text only item, because clicking on the number then also leads to selecting the item
				if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof sap.m.IconTabSeparator)) {
					this.setSelectedItem(oControl);
				}
			}
		}
	};

	/*
	 * Scrolls to the item passed as parameter if it is not (fully) visible.
	 * If the item is to the left of the viewport it will be put leftmost.
	 * If the item is to the right of the viewport it will be put rightmost.
	 * @param {sap.m.IconTabFilter} oItem The item to be scrolled into view
	 * @param {int} iDuration The duration of the animation effect
	 * @private
	 * @return {sap.m.IconTabHeader} this pointer for chaining
	 */
	IconTabHeader.prototype._scrollIntoView = function(oItem, iDuration) {

		var $item = oItem.$(),
			iScrollLeft,
			iNewScrollLeft,
			iContainerWidth;

		if ($item.length > 0) {
			var $head = this.$('head');
			var iHeadPaddingWidth = $head.innerWidth() - $head.width();
			var iItemWidth = $item.outerWidth(true);
			var iItemPosLeft = $item.position().left - iHeadPaddingWidth / 2;

			iScrollLeft = this._oScroller.getScrollLeft();
			iContainerWidth = this.$("scrollContainer").width();
			iNewScrollLeft = 0;

			// check if item is outside of viewport
			if (iItemPosLeft - iScrollLeft < 0 || iItemPosLeft - iScrollLeft > iContainerWidth - iItemWidth) {
				if (iItemPosLeft - iScrollLeft < 0) { // left side: make this the first item
					iNewScrollLeft += iItemPosLeft;
				} else { // right side: make this the last item
					iNewScrollLeft += Math.min(iItemPosLeft, iItemPosLeft + iItemWidth - iContainerWidth);
				}

				// execute manual scrolling with scrollTo method (delayedCall 0 is needed for positioning glitch)
				this._scrollPreparation();
				// store current scroll state to set it after rerendering
				this._iCurrentScrollLeft = iNewScrollLeft;
				jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [iNewScrollLeft, 0, iDuration]);
				jQuery.sap.delayedCall(iDuration, this, "_afterIscroll");
			}
		}

		return this;
	};

	/*
	 * Scrolls the items if possible, using an animation.
	 *
	 * @param iDelta How far to scroll
	 * @param iDuration How long to scroll (ms)
	 * @private
	 */
	IconTabHeader.prototype._scroll = function(iDelta, iDuration) {
		this._scrollPreparation();

		var oDomRef = this.getDomRef("head");
		var iScrollLeft = oDomRef.scrollLeft;
		var bIsIE = sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.edge;
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
		if (sap.ui.Device.system.desktop) {
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
			this._bCheckIfIntoView = false;
		}
	};

	/**
	 * Resize handler for ITB content inside FixFlex layout (IE9 fix)
	 * Calculate height on the content
	 * @private
	 */
	IconTabHeader.prototype._fnResizeNoFlexboxSupport = function() {
		var $content = this.getParent().$("containerContent"),
			iDiffOuterInnerHeight = $content.outerHeight(true) - $content.height();

		// calculate and set content div height
		$content.height(this.getParent().$().height() - $content.position().top - iDiffOuterInnerHeight);
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
			iContainerWidth = this.$("scrollContainer").width(),
			$head = this.$('head'),
			iHeadPaddingWidth = $head.innerWidth() - $head.width(),
			iItemWidth = $tab.outerWidth(),
			iItemPosLeft = $tab.position().left - iHeadPaddingWidth / 2;

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

	IconTabHeader.prototype.onExit = function() {
		// Deregister resize event before re-rendering
		if (this._sResizeListenerNoFlexboxSupportId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerNoFlexboxSupportId);
			this._sResizeListenerNoFlexboxSupportId = null;
		}
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
		this._iTouchDragX = 0;

		var $target = jQuery(oEvent.target);

		// prevent text selecting when click on the scrolling arrows
		if ($target.hasClass('sapMITBArrowScroll')) {
			oEvent.preventDefault();
		}

		//if the browser is IE prevent click events on dom elements in the tab, because the IE will focus them, not the tab itself.
		if (sap.ui.Device.browser.internet_explorer) {
			if ($target.hasClass('sapMITBFilterIcon') || $target.hasClass('sapMITBCount') || $target.hasClass('sapMITBText') || $target.hasClass('sapMITBTab') || $target.hasClass('sapMITBContentArrow') || $target.hasClass('sapMITBSep') || $target.hasClass('sapMITBSepIcon')) {
				oEvent.preventDefault();
			}
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

		var oTouch = sap.m.touch.find(oEvent.changedTouches, this._iActiveTouch);

		// check for valid changes
		if (!oTouch || oTouch.pageX === this._iTouchStartPageX) {
			return;
		}

		// sum up movement to determine in touchend event if selection should be executed
		this._iTouchDragX += Math.abs(this._iTouchStartPageX - oTouch.pageX);
		this._iTouchStartPageX = oTouch.pageX;
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
		if (this._scrollable && this._iTouchDragX > (sap.ui.Device.system.desktop ? 5 : 15)) {
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
	 * Fires keyboard navigation event when the user presses Enter or Space.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.onsapselect = function(oEvent) {
		this._handleActivation(oEvent);
	};

	/* =========================================================== */
	/*           end: event handlers                               */
	/* =========================================================== */

	/* =========================================================== */
	/*           start: tab drag-drop                              */
	/* =========================================================== */

	/**
	 * Listens to the mousedown events for starting tab drag & drop.
	 * @private
	 */
	IconTabHeader.prototype.onmousedown = function(oEvent) {
		if (!this.getEnableTabReordering()) {
			return;
		}

		var bIsTouchMode = !!oEvent.originalEvent["touches"];
		if (bIsTouchMode) {
			return;
		}

		var $target = jQuery(oEvent.target);

		// start drag and drop
		var $tab = $target.closest(".sapMITBFilter, .sapMITBAll");
		if ($tab.length === 1) {
			this._onTabMoveStart($tab, oEvent);
		}
	};

	IconTabHeader.prototype._onTabMoveStart = function($tab, oEvent) {
		var iIndex = this._getItemIndex($tab),
			$children = this.$().find('.sapMITBHead').children(),
			iWidth = $tab.outerWidth(true),
			$document = jQuery(document);

		oEvent.preventDefault();
		$tab.zIndex(this.$().zIndex() + 10);

		this._oDragContext = {
			index: jQuery.inArray($tab[0], $children),
			tabIndex : iIndex,
			startX: oEvent.pageX,
			$tab: $tab,
			tab: this.getItems()[iIndex],
			tabWidth: iWidth,
			tabCenter: $tab.position().left + iWidth / 2,
			movedTabIndexes: []
		};

		this._oScroller.setHorizontal(false);

		$document.mousemove(jQuery.proxy(this._onTabMove, this));
		$document.mouseup(jQuery.proxy(this._onTabMoved, this));
	};

	IconTabHeader.prototype._onTabMove = function(oEvent) {
		var oDragContext = this._oDragContext;
		if (!oDragContext) {
			return;
		}

		var iPageX = oEvent.pageX,
			iDx = iPageX - oDragContext.startX,
			$child,
			iX,
			iOffset,
			bReorder,
			$children = this.$().find('.sapMITBHead').children(),
			aMovedTabIndexes = oDragContext.movedTabIndexes,
			bRTL = sap.ui.getCore().getConfiguration().getRTL();

		oDragContext.$tab.css({left: iDx});

		for (var i = 0; i < $children.length; i++) {

			if (i == oDragContext.index) {
				continue;
			}

			$child = jQuery($children[i]);
			iX = $child.position().left;
			iOffset = parseFloat($child.css('left'));

			if (!isNaN(iOffset)) {
				iX -= iOffset;
			}

			if (i < oDragContext.index != bRTL) {
				bReorder = iX + $child.outerWidth(true) > oDragContext.tabCenter + iDx;
				this._onAnimateTab($child, oDragContext.tabWidth, bReorder, aMovedTabIndexes, i);
			} else {
				bReorder = iX < oDragContext.tabCenter + iDx;
				this._onAnimateTab($child, -oDragContext.tabWidth, bReorder, aMovedTabIndexes, i);
			}
		}
	};

	IconTabHeader.prototype._onAnimateTab = function($child, iDragOffset, bReorder, aMovedTabIndexes, iIndex) {
		var iIndexInArray = jQuery.inArray(iIndex, aMovedTabIndexes),
			bInArray = iIndexInArray != -1;

		if (bReorder && !bInArray) {
			$child.stop(true, true);
			$child.animate({left : iDragOffset}, IconTabHeader.ANIMATION_DURATION);
			aMovedTabIndexes.push(iIndex);
		} else if (!bReorder && bInArray) {
			$child.stop(true, true);
			$child.animate({left : 0}, IconTabHeader.ANIMATION_DURATION);
			aMovedTabIndexes.splice(iIndexInArray, 1);
		}
	};

	IconTabHeader.prototype._onTabMoved = function(oEvent) {
		var oDragContext = this._oDragContext;
		if (!oDragContext) {
			return;
		}

		var aMovedTabIndexes = oDragContext.movedTabIndexes;
		if (aMovedTabIndexes.length > 0) {
			var $tab = oDragContext.$tab,
				$children = this.$().find('.sapMITBHead').children(),
				iNewIndex = aMovedTabIndexes[aMovedTabIndexes.length - 1],
				iNewTabIndex = this._getItemIndex(jQuery($children[iNewIndex]));

			this.removeAggregation('items', oDragContext.tab, true);
			this.insertAggregation('items', oDragContext.tab, iNewTabIndex, true);

			if (iNewIndex > oDragContext.index) {
				$tab.insertAfter(jQuery($children[iNewIndex]));
			} else {
				$tab.insertBefore(jQuery($children[iNewIndex]));
			}

			this._initItemNavigation();
			jQuery.sap.delayedCall(100, this, function () {
				$tab.focus();
			});
		}

		this._stopMoving();
	};

	IconTabHeader.prototype._stopMoving = function() {
		var oDragContext = this._oDragContext,
			$tab = oDragContext.$tab,
			$children = this.$().find('.sapMITBHead').children();

		$tab.css('z-index', '');
		$children.stop(true, true);
		$children.css('left', '');

		this._oDragContext = null;

		var $document = jQuery(document);

		$document.off("mousemove", this._onTabMove);
		$document.off("mouseup", this._onTabMoved);

		this._oScroller.setHorizontal(true);
		this._enableTextSelection();
	};

	IconTabHeader.prototype._getItemIndex = function($tab) {

		var sId = $tab.attr('id'),
			aTabs = this.getItems();

		for (var i = 0; i < aTabs.length; i++) {
			if (aTabs[i].getId() == sId) {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Disables text selection on the document (disabled for Dnd).
	 * @private
	 */
	IconTabHeader.prototype._disableTextSelection = function (oElement) {
		// prevent text selection
		jQuery(oElement || document.body).
			attr("unselectable", "on").
			addClass('sapMITBNoSelection').
			bind("selectstart", function(oEvent) {
				oEvent.preventDefault();
				return false;
			});
	};

	/**
	 * Enables text selection on the document (disabled for Dnd).
	 * @private
	 */
	IconTabHeader.prototype._enableTextSelection = function (oElement) {
		jQuery(oElement || document.body).
			attr("unselectable", "off").
			removeClass('sapMITBNoSelection').
			unbind("selectstart");
	};

	/* =========================================================== */
	/*           end: tab drag-drop  ..                            */
	/* =========================================================== */

	return IconTabHeader;

}, /* bExport= */ true);
