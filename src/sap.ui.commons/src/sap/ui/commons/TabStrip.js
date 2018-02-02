/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.TabStrip.
sap.ui.define([
    'jquery.sap.global',
    './library',
    'sap/ui/core/Control',
    'sap/ui/core/delegate/ItemNavigation',
    'sap/ui/core/Icon',
    'sap/ui/core/delegate/ScrollEnablement',
    'sap/ui/Device',
    "./TabStripRenderer"
],
	function(
	    jQuery,
		library,
		Control,
		ItemNavigation,
		Icon,
		ScrollEnablement,
		Device,
		TabStripRenderer
	) {
	"use strict";



	/**
	 * Constructor for a new TabStrip.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * TabStrip represents a container for tab controls, which contain the content and generally other controls.
	 * The user switches between the tabs to display the content.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.TabContainer</code> control.
	 * @alias sap.ui.commons.TabStrip
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TabStrip = Control.extend("sap.ui.commons.TabStrip", /** @lends sap.ui.commons.TabStrip.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * Specifies the height of the tab bar and content area.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Specifies the width of the bar and content area.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Specifies the index of the currently selected tab.
			 */
			selectedIndex : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Specifies whether tab reordering is enabled.
			 */
			enableTabReordering : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		defaultAggregation : "tabs",
		aggregations : {

			/**
			 * The tabs contained in the TabStrip.
			 */
			tabs : {type : "sap.ui.commons.Tab", multiple : true, singularName : "tab"},
			/**
			 * The left arrow, used for tab scrolling.
			 */
			_leftArrowControl: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
			/**
			 * The right arrow, used for tab scrolling.
			 */
			_rightArrowControl: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
		},
		events : {

			/**
			 * Fires when the user selects a tab.
			 */
			select : {
				parameters : {

					/**
					 * The index of the selected tab.
					 */
					index : {type : "int"}
				}
			},

			/**
			 * Fires when the user closes a tab.
			 */
			close : {
				parameters : {

					/**
					 * The index of the closed tab.
					 */
					index : {type : "int"}
				}
			}
		}
	}});

	TabStrip.SCROLL_SIZE = 320;
	TabStrip.ANIMATION_DURATION = sap.ui.getCore().getConfiguration().getAnimation() ? 200 : 0;
	TabStrip.SCROLL_ANIMATION_DURATION = sap.ui.getCore().getConfiguration().getAnimation() ? 500 : 0;

	TabStrip.prototype.init = function() {

		this._bInitialized = true;

		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
		this._iCurrentScrollLeft = 0;
		this._iMaxOffsetLeft = null;
		this._scrollable = null;

		this._oScroller = new ScrollEnablement(this, this.getId() + "-tablist", {
			horizontal: !this.getEnableTabReordering(),
			vertical: false,
			nonTouchScrolling: true
		});

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	/**
	 * Sets whether tab reordering is enabled.
	 *
	 * @param {boolean} bValue The value.
	 * @returns {sap.ui.commons.TabStrip} Pointer to the control instance for chaining.
	 * @public
	 */
	TabStrip.prototype.setEnableTabReordering = function (bValue) {

		this.setProperty("enableTabReordering", bValue, true); // no re-rendering

		if (this._oScroller) {
			this._oScroller.setHorizontal(!bValue);
		}

		return this;
	};

	/**
	 * Called before the rendering of the control is started.
	 *
	 * @override
	 * @public
	 */
	TabStrip.prototype.onBeforeRendering = function () {
		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	};

	TabStrip.prototype.onAfterRendering = function() {

		if (this._oScroller) {
			this._oScroller.setIconTabBar(this, jQuery.proxy(this._updateScrollingAppearance, this), null);
		}

		this._initItemNavigation();

		this._updateScrollingAppearance();

		this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(),  jQuery.proxy(this._updateScrollingAppearance, this));

		var aTabs = this.getTabs();
		var iSelectedIndex = this.getSelectedIndex();
		var oTab = aTabs[iSelectedIndex];

		if (this._oScroller && oTab && oTab.$().length > 0) {

			if (!this._oScroller._$Container) {
				this._oScroller.onAfterRendering();
			}

			this._scrollIntoView(oTab.$(), TabStrip.SCROLL_ANIMATION_DURATION);
		}

		// Notify the tabs
		for (var i = 0;i < aTabs.length;i++) {
			aTabs[i].onAfterRendering();
		}
	};

	/**
	 * Creates a Tab and adds it to the TabStrip.
	 *
	 * @param {string} sText
	 *         Defines the title text of the newly created tab
	 * @param {sap.ui.core.Control} oContent
	 *         Defines the root control of the content area
	 * @returns {sap.ui.commons.Tab} oTab
	 *         The created tab control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TabStrip.prototype.createTab = function(sText,oContent) {
		var oTitle = new sap.ui.core.Title({text:sText}),
			oTab = new sap.ui.commons.Tab();

		oTab.setTitle(oTitle);
		oTab.addContent(oContent);
		this.addTab(oTab);
		return oTab;
	};

	/*
	 * Finds and fires the select event of a tab of a given Dom Reference
	 * if it is a Dom ref of a tab title.
	 * @private
	 */
	TabStrip.prototype.selectTabByDomRef = function(oDomRef) {
		var iIdx = this.getItemIndex(oDomRef);
		if (iIdx > -1) {
			//its an item, find the items index
			if ((iIdx != this.getSelectedIndex()) && (this.getTabs()[iIdx].getEnabled())) {
				var iOldIndex = this.getSelectedIndex();
				this.setProperty( 'selectedIndex', iIdx, true ); // no complete rerendering required

				this.rerenderPanel(iOldIndex, true);

				this.oItemNavigation.setSelectedIndex(this.oItemNavigation.getFocusedIndex());
			}
		}
	};

	/*
	 * Handles the SPACEBAR press
	 * @private
	 */
	TabStrip.prototype.onsapspace = function(oEvent) {
		var oSource = oEvent.target;
		this.selectTabByDomRef(oSource);
	};

	// ENTER and SPACE with modifiers is the same like SPACE
	TabStrip.prototype.onsapspacemodifiers = TabStrip.prototype.onsapspace;
	TabStrip.prototype.onsapenter = TabStrip.prototype.onsapspace;
	TabStrip.prototype.onsapentermodifiers = TabStrip.prototype.onsapspace;

	/*
	 * Handles the DELETE press
	 * @private
	 */
	TabStrip.prototype.onsapdelete = function(oEvent) {

		var oSource = oEvent.target;
		var iIdx = this.getItemIndex(oSource);
		if (iIdx > -1 && this.getTabs()[iIdx].getClosable()) {
			//item is closable
			this.fireClose({index:iIdx});
		}

	};

	/*
	 * Overrides getFocusDomRef of base element class.
	 * @public
	 */
	TabStrip.prototype.getFocusDomRef = function() {
		return this.getDomRef().firstChild;
	};

	/*
	 * Does all the cleanup when the TabStrip is to be destroyed.
	 * Called from Element's destroy() method.
	 * @private
	 */
	TabStrip.prototype.exit = function () {

		this._bInitialized = false;

		this._iCurrentScrollLeft = null;
		this._iMaxOffsetLeft = null;
		this._scrollable = null;

		if (this._oScroller) {
			this._oScroller.destroy();
			this._oScroller = null;
		}

		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		if (this.oItemNavigation) {
			this.removeDelegate(this.oItemNavigation);
			this.oItemNavigation.destroy();
			delete this.oItemNavigation;
		}

		// no super.exit() to call
	};

	TabStrip.prototype.getItemIndex = function(oDomRef) {

		var sId;
		if (!oDomRef.id || oDomRef.id.search("-close") != -1) {
			// icon or close button
			var oItemDomRef = jQuery(oDomRef).parentByAttribute("id");
			sId = oItemDomRef.id;
		} else {
			sId = oDomRef.id;
		}

		for (var idx = 0, aTabs = this.getTabs(); idx < aTabs.length; idx++) {
			if (sId == aTabs[idx].getId()) {
				return idx;
			}
		}
		return -1;
	};

	// Override aggregation methods if something needs to be taken care of

	/*
	 * Removes a tab from the aggregation named <code>tabs</code>.
	 *
	 * @param {int | string | sap.ui.commons.Tab} vTab The tab to remove or its index or ID
	 * @return {sap.ui.commons.Tab} The removed tab or null
	 * @public
	 */
	TabStrip.prototype.removeTab = function(vElement) {
		var iIndex = vElement;
		if (typeof (vElement) == "string") { // ID of the element is given
			vElement = sap.ui.getCore().byId(vElement);
		}
		if (typeof (vElement) == "object") { // the element itself is given or has just been retrieved
			iIndex = this.indexOfTab(vElement);
		}

		var oTab = this.getTabs()[iIndex];
		if (oTab.getVisible()) {
			// set tab invisible during hiding it for changing classes of tabs
			oTab.setProperty("visible",false,true); // no rerendering
			this.hideTab(iIndex);
			oTab.setProperty("visible",true,true); // no rerendering
		}

		if (this.getSelectedIndex() > iIndex) {
			this.setProperty( 'selectedIndex', this.getSelectedIndex() - 1, true ); // no complete rerendering required
		}
		return this.removeAggregation("tabs", iIndex, true); // no complete rerendering required
	};

	/*
	 * Overwites the defaultSetter for property <code>selectedIndex</code>.
	 *
	 * Default value is <code>0</code>
	 *
	 * @param {int} iSelectedIndex New value for property <code>selectedIndex</code>
	 * @return {sap.ui.commons.TabStrip} <code>this</code> to allow method chaining
	 * @public
	 */
	TabStrip.prototype.setSelectedIndex = function(iSelectedIndex) {

		var iOldIndex = this.getSelectedIndex();

		if (iSelectedIndex == iOldIndex) {
			return this;
		}

		var aTabs = this.getTabs();
		var oTab = aTabs[iSelectedIndex];

		if (this._oScroller && oTab && oTab.$().length > 0) {
			this._scrollIntoView(oTab.$(), TabStrip.SCROLL_ANIMATION_DURATION);
		}

		if (!oTab && !this.getDomRef()) {
			// tab don't exist but not rendered. In initial setup index might be set before tab is added
			// But if already rendered this is not allowed, tab must exist
			this.setProperty( 'selectedIndex', iSelectedIndex, false ); // rendering needed

		} else if (oTab && oTab.getEnabled() && oTab.getVisible()) {
			this.setProperty( 'selectedIndex', iSelectedIndex, true ); // no complete rerendering required
			if (this.getDomRef() && !this.invalidated) {
				// already rendered and no re-rendering outstanding
				this.rerenderPanel(iOldIndex);
				if (this.oItemNavigation) {
					// set selected index for ItemNavigation, ignore invisible tabs.
					var iVisibleIndex = 0;
					var iSelectedDomIndex = -1;
					for (var i = 0;i < aTabs.length;i++) {
						oTab = aTabs[i];
						if (oTab.getVisible() === false) {
							continue;
						}
						if (i == iSelectedIndex) {
							iSelectedDomIndex = iVisibleIndex;
							break;
						}
						iVisibleIndex++;
					}
					this.oItemNavigation.setSelectedIndex(iSelectedDomIndex);
				}
			}
		} else {
			this._warningInvalidSelectedIndex(iSelectedIndex, oTab);
		}

		return this;
	};

	/**
	 * Closes a tab (if the tab is selected, the next one will be selected;
	 * if it's the last tab, the previous one will be selected).
	 *
	 * This method should be called if the close event is fired.
	 * It can not be called automatically because the consumer might need to run some logic before the tab is closed.
	 *
	 * @param {int} iIndex
	 *         The index of the tab that should be closed
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TabStrip.prototype.closeTab = function(iIndex) {

		var oTab = this.getTabs()[iIndex];

		if (!oTab || !oTab.getClosable() || !oTab.getVisible()) {
			return;
		}

		// close tab -> set to invisible
		oTab.setProperty("visible",false,true); // no rerendering

		this.hideTab(iIndex);
	};

	/*
	 * Removes a tab from the output.
	 *
	 * @param {int} iIndex The tab to be closed
	 * @private
	 */
	TabStrip.prototype.hideTab = function(iIndex) {
		var oTab = this.getTabs()[iIndex];

		if (!this.getDomRef()) {
			return; //if not already rendered selected index should be provided by caller
		}

		// get focused index and visible index of tab
		var iFocusedIndex = this.oItemNavigation.getFocusedIndex();
		var iVisibleIndex = parseInt(oTab.$().attr("aria-posinset"), 10) - 1;
		var sFocusedControlId = sap.ui.getCore().getCurrentFocusedControlId();

		// delete only tab from DOM ->no rerendering of other tabs necessary
		oTab.$().remove();

		if (this.iVisibleTabs == 1) {
			// last visible tab is closed -> no new selected tab and no content
			this.setProperty( 'selectedIndex', -1, true ); // no complete rerendering required
			oTab.$("panel").remove();
		} else if (iIndex == this.getSelectedIndex()) {
			// selected tab should be closed -> select other one

			var iNewIndex = iIndex + 1;

			while (iNewIndex < this.getTabs().length && (!this.getTabs()[iNewIndex].getEnabled() || !this.getTabs()[iNewIndex].getVisible())) {
				//select next one
				iNewIndex++;
			}

			if (iNewIndex == this.getTabs().length) {
				// no next active tab - search for previous
				iNewIndex = iIndex - 1;
				while (iNewIndex >= 0 && (!this.getTabs()[iNewIndex].getEnabled() || !this.getTabs()[iNewIndex].getVisible())) {
					//select previous one
					iNewIndex--;
				}
			}
			// if no selectable tab exists the index is set to -1
			this.setProperty( 'selectedIndex', iNewIndex, true ); // no complete rerendering required

			this.rerenderPanel(iIndex);
		} else {
			// set classes new to set before and after classes right
			this.toggleTabClasses(this.getSelectedIndex(), this.getSelectedIndex());
		}

		// update ARIA information
		this.iVisibleTabs--;
		var iVisibleIndex = 0;
		var aTabDomRefs = [];
		var iSelectedDomIndex = -1;
		var bTabFocused = false;
		for (var i = 0;i < this.getTabs().length;i++) {
			var oTab = this.getTabs()[i];

			// check if a tab has the focus
			if (sFocusedControlId == oTab.getId()) {
				bTabFocused = true;
			}

			if (oTab.getVisible() === false) {
				continue;
			}
			if (i == this.getSelectedIndex()) {
				iSelectedDomIndex = iVisibleIndex;
			}
			iVisibleIndex++;
			oTab.$().attr("aria-posinset", iVisibleIndex).attr("aria-setsize", this.iVisibleTabs);
			aTabDomRefs.push(oTab.getDomRef());
		}

		// focused item should be the same
		if (iVisibleIndex <= iFocusedIndex) {
			// tab before or equal focused one is hidden
			iFocusedIndex--;
		}
		// update ItemNavigation
		this.oItemNavigation.setItemDomRefs(aTabDomRefs);
		this.oItemNavigation.setSelectedIndex(iSelectedDomIndex);
		this.oItemNavigation.setFocusedIndex(iFocusedIndex);

		// check if a tab has the focus
		// if yes focus again
		// if no set only focused index.
		if (bTabFocused) {
			this.oItemNavigation.focusItem(iFocusedIndex);
		}

		this._updateScrollingAppearance();
	};

	/*
	 * If the selected index is changed, only the panel must be re-rendered.
	 * For the tabs only some classes must be exchanged.
	 *
	 * @private
	 */
	TabStrip.prototype.rerenderPanel = function(iOldIndex, fireSelect) {

		var aTabs = this.getTabs();
		var iNewIndex = this.getSelectedIndex();
		var oTab = aTabs[iNewIndex];
		var oOldTab = aTabs[iOldIndex];

		// ensure that events from the controls in the panel are fired
		jQuery.sap.delayedCall(0, this, function () {

			if (!this._bInitialized) {
				return;
			}

			var $panel = this.$().find('.sapUiTabPanel');

			if (oTab) {
				if ($panel.length > 0) {
					var rm = sap.ui.getCore().createRenderManager();
					this.getRenderer().renderTabContents(rm, oTab);
					rm.flush($panel[0]);
					rm.destroy();
				}

				var sNewId = oTab.getId();

				// change the ID and Label of the panel to the current tab
				$panel.attr("id", sNewId + "-panel").attr("aria-labelledby", sNewId);
			} else {
				$panel.empty();
			}

			//store the scroll top and left possitions as a property value in order to be restored later
			oOldTab.setProperty("scrollTop", $panel.scrollTop(), true);
			oOldTab.setProperty("scrollLeft", $panel.scrollLeft(), true);

			// call after rendering method of tab to set scroll functions
			if (oTab) {
				oTab.onAfterRendering();
			}

			if (fireSelect) {
				this.fireSelect({index: iNewIndex});
			}
		});

		if (oTab) {
			this.toggleTabClasses(iOldIndex, iNewIndex);
		}
	};

	/*
	 * Sets the classes of the tabs to display the new selection.
	 *
	 * @private
	 */
	TabStrip.prototype.toggleTabClasses = function(iOldIndex, iNewIndex) {

		var aTabs = this.getTabs();

		// change visualization of selected tab and old tab
		var oTab = aTabs[iOldIndex];
		if (oTab) {
			oTab.$().toggleClass("sapUiTabSel sapUiTab").attr("aria-selected", false);
		}
		var iBeforeIndex = iOldIndex - 1;
		while (iBeforeIndex >= 0 && !aTabs[iBeforeIndex].getVisible()) {
			iBeforeIndex--;
		}
		if (iBeforeIndex >= 0) {
			aTabs[iBeforeIndex].$().removeClass("sapUiTabBeforeSel");
		}

		var iAfterIndex = iOldIndex + 1;
		while (iAfterIndex < aTabs.length && !aTabs[iAfterIndex].getVisible()) {
			iAfterIndex++;
		}
		if (iAfterIndex < aTabs.length) {
			aTabs[iAfterIndex].$().removeClass("sapUiTabAfterSel");
		}

		oTab = aTabs[iNewIndex];
		if (oTab) {
			oTab.$().toggleClass("sapUiTabSel sapUiTab").attr("aria-selected", true);
		}

		iBeforeIndex = iNewIndex - 1;
		while (iBeforeIndex >= 0 && !aTabs[iBeforeIndex].getVisible()) {
			iBeforeIndex--;
		}
		if (iBeforeIndex >= 0) {
			aTabs[iBeforeIndex].$().addClass("sapUiTabBeforeSel");
		}

		iAfterIndex = iNewIndex + 1;
		while (iAfterIndex < aTabs.length && !aTabs[iAfterIndex].getVisible()) {
			iAfterIndex++;
		}
		if (iAfterIndex < aTabs.length) {
			aTabs[iAfterIndex].$().addClass("sapUiTabAfterSel");
		}
	};

	/*
	 * Overwrites the Invalidate function to set the invalidate flag.
	 */
	TabStrip.prototype._originalInvalidate = TabStrip.prototype.invalidate;

	TabStrip.prototype.invalidate = function() {

		this.invalidated = true;
		TabStrip.prototype._originalInvalidate.apply(this,arguments);

	};

	TabStrip.prototype._warningInvalidSelectedIndex = function(iSelectedIndex, oTab){

		var sDetails = "";
		if (!oTab) {
			sDetails = "Tab not exists";
		} else if (!oTab.getEnabled()) {
			sDetails = "Tab disabled";
		} else if (!oTab.getVisible()) {
			sDetails = "Tab not visible";
		}
		jQuery.sap.log.warning("SelectedIndex " + iSelectedIndex + " can not be set", sDetails, "sap.ui.commons.TabStrip");

	};

	TabStrip.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ESCAPE) {
			this._stopMoving();
		}
	};

	TabStrip.prototype.onclick = function(oEvent) {
		var oSource = oEvent.target;
		var $target = jQuery(oSource);

		if (oSource.className == "sapUiTabClose") {
			// find the items index
			var iIdx = this.getItemIndex($target.parentByAttribute("id"));
			if (iIdx > -1) {
				this.fireClose({index:iIdx});
			}
		}
	};

	/**
	 * Listens to the mousedown events for selecting tab
	 * and starting tab drag & drop.
	 * @private
	 */
	TabStrip.prototype.onmousedown = function(oEvent) {

		var bLeftButton = !oEvent.button;
		var bIsTouchMode = this._isTouchMode(oEvent);

		if (!bIsTouchMode && !bLeftButton) {
			return;
		}

		var oSource = oEvent.target;
		var $target = jQuery(oSource);

		if (oSource.className == "sapUiTabClose") {
			oEvent.preventDefault();
			oEvent.stopPropagation();

			// clear the target so the the
			// ItemNavigation won't set the focus on this tab.
			oEvent.target = null;
			return;
		}

		this.selectTabByDomRef(oSource);

		if (!this.getEnableTabReordering()) {
			return;
		}

		// start drag and drop
		var $tab = $target.closest(".sapUiTab, .sapUiTabSel, .sapUiTabDsbl");
		if ($tab.length === 1) {
			this._onTabMoveStart($tab, oEvent, bIsTouchMode);
		}
	};

	TabStrip.prototype._onTabMoveStart = function($tab, oEvent, bIsTouchMode) {
		this._disableTextSelection();

		oEvent.preventDefault();

		$tab.zIndex(this.$().zIndex() + 10);

		var iIdx = this.getItemIndex(oEvent.target);
		var oTab = this.getTabs()[iIdx];

		var $children = this.$().find('.sapUiTabBarCnt').children();
		var iChildIndex = jQuery.inArray($tab[0], $children);
		var iWidth = $tab.outerWidth();

		this._dragContext = {
			index: iChildIndex,
			tabIndex : iIdx,
			isTouchMode : bIsTouchMode,
			startX: bIsTouchMode ? oEvent.originalEvent.targetTouches[0].pageX : oEvent.pageX,
			tab: oTab,
			tabWidth: iWidth,
			tabCenter: $tab.position().left + iWidth / 2
		};

		this._aMovedTabIndexes = [];

		var $document = jQuery(document);
		if (bIsTouchMode) {
			$document.bind("touchmove", jQuery.proxy(this._onTabMove, this));
			$document.bind("touchend", jQuery.proxy(this._onTabMoved, this));
		} else {
			$document.mousemove(jQuery.proxy(this._onTabMove, this));
			$document.mouseup(jQuery.proxy(this._onTabMoved, this));
		}
	};

	TabStrip.prototype._onTabMove = function(oEvent) {

		var oDragContext = this._dragContext;
		if (!oDragContext) {
			return;
		}

		var bIsTouchMode = this._isTouchMode(oEvent);

		if (bIsTouchMode) {
			oEvent.preventDefault();
		}

		var iPageX = bIsTouchMode ? oEvent.targetTouches[0].pageX : oEvent.pageX;
		var iDx = iPageX - oDragContext.startX;

		oDragContext.tab.$().css({left: iDx});

		var $child,
			iX,
			iOffset,
			bReorder,
			$children = this.$().find('.sapUiTabBarCnt').children(),
			aMovedTabIndexes = this._aMovedTabIndexes,
			bRTL = sap.ui.getCore().getConfiguration().getRTL();

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
				bReorder = iX + $child.outerWidth() > oDragContext.tabCenter + iDx;
				this._onAnimateTab($child, oDragContext.tabWidth, bReorder, aMovedTabIndexes, i);
			} else {
				bReorder = iX < oDragContext.tabCenter + iDx;
				this._onAnimateTab($child, -oDragContext.tabWidth, bReorder, aMovedTabIndexes, i);
			}
		}
	};

	TabStrip.prototype._onAnimateTab = function($child, iDragOffset, bReorder, aMovedTabIndexes, iIndex) {

		var iIndexInArray = jQuery.inArray(iIndex, aMovedTabIndexes);
		var bInArray = iIndexInArray != -1;

		if (bReorder && !bInArray) {

			$child.stop(true, true);
			$child.animate({left : iDragOffset}, TabStrip.ANIMATION_DURATION);
			aMovedTabIndexes.push(iIndex);

		} else if (!bReorder && bInArray) {

			$child.stop(true, true);
			$child.animate({left : 0}, TabStrip.ANIMATION_DURATION);
			aMovedTabIndexes.splice(iIndexInArray, 1);
		}
	};

	TabStrip.prototype._onTabMoved = function(oEvent) {

		var oDragContext = this._dragContext;
		if (!oDragContext) {
			return;
		}

		this._stopMoving();

		var aMovedTabIndexes = this._aMovedTabIndexes;
		if (aMovedTabIndexes.length == 0) {
			return;
		}

		var $tab = oDragContext.tab.$(),
			$child,
			$children = this.$().find('.sapUiTabBarCnt').children();

		var iNewIndex = aMovedTabIndexes[aMovedTabIndexes.length - 1],
			iSelectedIndex = iNewIndex,
		    iNewTabIndex = this.getItemIndex($children[iNewIndex]);

		this.removeAggregation('tabs', oDragContext.tab, true);
		this.insertAggregation('tabs', oDragContext.tab, iNewTabIndex, true);

		if (iNewIndex > oDragContext.index) {
			$tab.insertAfter(jQuery($children[iNewIndex]));
		}  else {
			$tab.insertBefore(jQuery($children[iNewIndex]));
		}

		$children = this.$().find('.sapUiTabBarCnt').children();

		if (!oDragContext.tab.getEnabled()) {

			for (var i = 0; i < $children.length; i++) {
				$child = jQuery($children[i]);

				if ($child.hasClass('sapUiTabSel')) {
					iSelectedIndex = i;
					iNewTabIndex = this.getItemIndex($child[0]);

					break;
				}
			}
		}

		this.setProperty('selectedIndex', iNewTabIndex, true);

		$children.removeClass('sapUiTabAfterSel');
		$children.removeClass('sapUiTabBeforeSel');

		for (var i = 0; i < $children.length; i++) {
			$child = jQuery($children[i]);
			$child.attr("aria-posinset", i + 1);

			if (i == iSelectedIndex - 1) {
				$child.addClass('sapUiTabBeforeSel');
			} else if (i == iSelectedIndex + 1) {
				$child.addClass('sapUiTabAfterSel');
			}
		}

		$tab.focus();

		this._initItemNavigation();

	};

	TabStrip.prototype._stopMoving = function() {
		var oDragContext = this._dragContext;
		if (!oDragContext) {
			return;
		}

		var $tab = oDragContext.tab.$();
		$tab.css('z-index', '');

		var $children = this.$().find('.sapUiTabBarCnt').children();

		$children.stop(true, true);
		$children.css('left', '');

		this._dragContext = null;

		var $document = jQuery(document);
		if (oDragContext.isTouchMode) {
			$document.unbind("touchmove", this._onTabMove);
			$document.unbind("touchend", this._onTabMoved);
		} else {
			$document.unbind("mousemove", this._onTabMove);
			$document.unbind("mouseup", this._onTabMoved);
		}

		this._enableTextSelection();
	};


	/**
	 * Checks whether the passed oEvent is a touch event.
	 * @private
	 * @param {jQuery.Event} oEvent The event to check
	 * @return {boolean} false
	 */
	TabStrip.prototype._isTouchMode = function(oEvent) {
		return !!oEvent.originalEvent["touches"];
	};

	TabStrip.prototype._initItemNavigation = function() {

		// find a collection of all tabs
		var oFocusRef = this.getDomRef('tablist'),
			aTabs = oFocusRef.childNodes,
			aTabDomRefs = [],
			iSelectedDomIndex = -1;

		for (var i = 0;i < aTabs.length;i++) {
			aTabDomRefs.push(aTabs[i]);
			if (jQuery(aTabs[i]).hasClass("sapUiTabSel")) {
				// get selected index out of visible tabs for ItemNavigation
				iSelectedDomIndex = i;
			}
		}

		//Initialize the ItemNavigation
		if (!this.oItemNavigation) {
			this.oItemNavigation = new ItemNavigation();
			this.oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._onItemNavigationAfterFocus, this);
			this.oItemNavigation.setCycling(false);
			this.addDelegate(this.oItemNavigation);
		}

		//Reinitialize the ItemNavigation after rendering
		this.oItemNavigation.setRootDomRef(oFocusRef);
		this.oItemNavigation.setItemDomRefs(aTabDomRefs);
		this.oItemNavigation.setSelectedIndex(iSelectedDomIndex);
	};

	/**
	 * Disables text selection on the document (disabled for Dnd).
	 * @private
	 */
	TabStrip.prototype._disableTextSelection = function (oElement) {
		// prevent text selection
		jQuery(oElement || document.body).
			attr("unselectable", "on").
			addClass('sapUiTabStripNoSelection').
			bind("selectstart", function(oEvent) {
				oEvent.preventDefault();
				return false;
			});
	};

	/**
	 * Enables text selection on the document (disabled for Dnd).
	 * @private
	 */
	TabStrip.prototype._enableTextSelection = function (oElement) {
		jQuery(oElement || document.body).
			attr("unselectable", "off").
			removeClass('sapUiTabStripNoSelection').
			unbind("selectstart");
	};

	TabStrip.prototype._getActualSelectedIndex = function() {

		// check if selected tab exists and is visible and enabled -> otherwise select first active one

		var iSelectedIndex = Math.max(0, this.getSelectedIndex());

		var aTabs = this.getTabs();
		var oSelectedTab = aTabs[iSelectedIndex];
		if (oSelectedTab && oSelectedTab.getVisible() && oSelectedTab.getEnabled()) {
			return iSelectedIndex;
		}

		for (var i = 0; i < aTabs.length; i++) {
			var oTab = aTabs[i];

			if (oTab.getVisible() && oTab.getEnabled()) {
				return i;
			}
		}

		return 0;
	};

	/**
	 * Returns the sap.ui.core.Icon control used to display left scrolling arrow.
	 * @returns {sap.ui.core.Icon}
	 * @private
	 */
	TabStrip.prototype._getLeftArrowControl = function () {
		var iconControl = this.getAggregation('_leftArrowControl');
		var that = this;

		if (!iconControl) {
			iconControl = new Icon({
				src: 'sap-icon://navigation-left-arrow',
				noTabStop: true,
				useIconTooltip: false,
				tooltip: '',
				press: function (oEvent) {
					that._scroll(-TabStrip.SCROLL_SIZE, TabStrip.SCROLL_ANIMATION_DURATION);
				}
			}).addStyleClass('sapUiTabStripScrollIcon sapUiTabStripLeftScrollIcon');

			this.setAggregation("_leftArrowControl", iconControl, true);
		}

		return iconControl;
	};

	/**
	 * Returns the sap.ui.core.Icon control used to display right scrolling arrow.
	 * @returns {sap.ui.core.Icon}
	 * @private
	 */
	TabStrip.prototype._getRightArrowControl = function () {
		var iconControl = this.getAggregation('_rightArrowControl');
		var that = this;

		if (!iconControl) {
			iconControl = new Icon({
				src: 'sap-icon://navigation-right-arrow',
				noTabStop: true,
				useIconTooltip: false,
				tooltip: '',
				press: function (oEvent) {
					that._scroll(TabStrip.SCROLL_SIZE, TabStrip.SCROLL_ANIMATION_DURATION);
				}
			}).addStyleClass('sapUiTabStripScrollIcon sapUiTabStripRightScrollIcon');

			this.setAggregation("_rightArrowControl", iconControl, true);
		}

		return iconControl;
	};

	TabStrip.prototype._scroll = function(iDelta, iDuration) {
		var iScrollLeft = this.getDomRef("scrollCont").scrollLeft,
			iScrollTarget;

		if (this._bRtl && Device.browser.firefox) {
			iScrollTarget = iScrollLeft - iDelta;

			// Avoid out ofRange situation
			if (iScrollTarget < -this._iMaxOffsetLeft) {
				iScrollTarget = -this._iMaxOffsetLeft;
			}
			if (iScrollTarget > 0) {
				iScrollTarget = 0;
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

		if (this._oScroller) {
			this._oScroller.scrollTo(iScrollTarget, 0, iDuration);
		}

		this._iCurrentScrollLeft = iScrollTarget;
	};

	/**
	 * Handles scrolling arrow press.
	 * @private
	 */
	TabStrip.prototype._scrollIntoView = function ($item, iDuration) {
		var $tablist = this.$("tablist"),
			iTabsPaddingWidth = $tablist.innerWidth() - $tablist.width(),
			iItemWidth = $item.outerWidth(true),
			iItemPosLeft = $item.position().left - iTabsPaddingWidth / 2,
			oScrollContainerDomRef = this.getDomRef("scrollCont"),
			iScrollLeft = oScrollContainerDomRef.scrollLeft,
			iContainerWidth = this.$("scrollCont").width(),
			iNewScrollLeft = iScrollLeft;

		// check if item is outside of viewport
		if (iItemPosLeft < 0 || iItemPosLeft > iContainerWidth - iItemWidth) {

			if (this._bRtl && Device.browser.firefox) {
				if (iItemPosLeft < 0) { // right side: make this the last item
					iNewScrollLeft += iItemPosLeft + iItemWidth - iContainerWidth;
				} else { // left side: make this the first item
					iNewScrollLeft += iItemPosLeft;
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

			if (this._oScroller) {
				this._oScroller.scrollTo(iNewScrollLeft, 0, iDuration);
			}
		}
	};

	/**
	 * Checks if scrolling is needed.
	 *
	 * @returns {boolean} Whether scrolling is needed
	 * @private
	 */
	TabStrip.prototype._hasScrolling = function() {
		var oTabListDomRef = this.getDomRef("tablist"),
			scrollCont = this.getDomRef("scrollCont"),
			bScrollNeeded = oTabListDomRef && (oTabListDomRef.scrollWidth > scrollCont.clientWidth);

		this.$().toggleClass("sapUiTabStripScrollable", bScrollNeeded);

		return bScrollNeeded;
	};

	/**
	 * Updates scrolling appearance.
	 *
	 * @private
	 */
	TabStrip.prototype._updateScrollingAppearance = function() {
		var oTabListDomRef = this.getDomRef("tablist"),
			oScrollContainerDomRef = this.getDomRef("scrollCont"),
			iScrollLeft,
			realWidth,
			availableWidth,
			bScrollBack = false,
			bScrollForward = false;

		if (this._hasScrolling() && oTabListDomRef && oScrollContainerDomRef) {
			if (this._bRtl && Device.browser.firefox) {
				iScrollLeft = -oScrollContainerDomRef.scrollLeft;
			} else {
				iScrollLeft = oScrollContainerDomRef.scrollLeft;
			}

			realWidth = oTabListDomRef.scrollWidth;
			availableWidth = oScrollContainerDomRef.clientWidth;

			if (Math.abs(realWidth - availableWidth) === 1) {
				realWidth = availableWidth;
			}

			if (iScrollLeft > 0) {
				bScrollBack = true;
			}

			if ((realWidth > availableWidth) && (iScrollLeft + availableWidth < realWidth)) {
				bScrollForward = true;
			}
		}

		this.$().toggleClass("sapUiTabStripScrollBack", bScrollBack)
			.toggleClass("sapUiTabStripScrollForward", bScrollForward);

		this._iMaxOffsetLeft = Math.abs(jQuery(oScrollContainerDomRef).width() - jQuery(oTabListDomRef).width());
	};

	/**
	 * Adjusts arrows when keyboard is used for navigation and the beginning/end of the toolbar is reached.
	 * @private
	 */
	TabStrip.prototype._onItemNavigationAfterFocus = function(oEvent) {
		var oIndex = oEvent.getParameter("index"),
			$event = oEvent.getParameter('event');

		if (!$event) {
			return;
		}

		var $target = jQuery($event.target);

		// handle only keyboard navigation here
		if (!$target || $event.keyCode === undefined) {
			return;
		}

		if (oIndex !== null && oIndex !== undefined) {

			var oNext = jQuery($target.parent().children()[oIndex]);

			if (oNext && oNext.length) {
				this._scrollIntoView(oNext, 0);
			}
		}
	};

	return TabStrip;

}, /* bExport= */ true);
