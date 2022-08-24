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
	"sap/ui/core/InvisibleText",
	'sap/ui/core/ResizeHandler',
	'sap/ui/Device',
	'sap/m/Button',
	'sap/m/IconTabFilter',
	'sap/m/IconTabSeparator',
	'sap/m/IconTabBarDragAndDropUtil',
	'sap/ui/core/library',
	'sap/m/IconTabHeaderRenderer',
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/events/KeyCodes"
], function (
	library,
	Core,
	Control,
	EnabledPropagator,
	ItemNavigation,
	InvisibleText,
	ResizeHandler,
	Device,
	Button,
	IconTabFilter,
	IconTabSeparator,
	IconTabBarDragAndDropUtil,
	coreLibrary,
	IconTabHeaderRenderer,
	jQuery,
	Log,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.core.dnd.DropPosition
	var DropPosition = coreLibrary.dnd.DropPosition;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.IconTabHeaderMode
	var IconTabHeaderMode = library.IconTabHeaderMode;

	// shortcut for sap.m.IconTabDensityMode
	var IconTabDensityMode = library.IconTabDensityMode;

	// shortcut for sap.m.TabsOverflowMode
	var TabsOverflowMode = library.TabsOverflowMode;

	/**
	 * Constructor for a new IconTabHeader.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays a number of IconTabFilters and IconTabSeparators. If the available horizontal
	 * space is exceeded, an overflow tab appears.
	 *
	 * <h3>Usage</h3>
	 * Use <code>IconTabHeader</code> if you need it as a standalone header.
	 * If you need to manage content use {@link sap.m.IconTabBar} instead.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.15
	 * @alias sap.m.IconTabHeader
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
			 *
			 * @since 1.40
			 */
			mode : {type : "sap.m.IconTabHeaderMode", group : "Appearance", defaultValue : IconTabHeaderMode.Standard},

			/**
			 * Specifies if the overflow select list is displayed.
			 *
			 * The overflow select list represents a list, where all tab filters are displayed,
			 * so the user can select specific tab filter easier.
			 * @deprecated as of 1.75
			 */
			showOverflowSelectList : {type : "boolean", group : "Appearance", defaultValue : false, deprecated: true},

			/**
			 * Specifies the background color of the header.
			 *
			 * Depending on the theme, you can change the state of the background color to "Solid", "Translucent", or "Transparent".
			 * <b>Note:</b> In SAP Belize Deep (sap_belize_plus) theme this property should be set to "Solid".
			 * @since 1.44
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid},

			/**
			 * Specifies whether tab reordering is enabled. Relevant only for desktop devices.
			 * The {@link sap.m.IconTabSeparator sap.m.IconTabSeparator} cannot be dragged  and dropped
			 * Items can be moved around {@link sap.m.IconTabSeparator sap.m.IconTabSeparator}
			 * Reordering is enabled via keyboard using <code>Ctrl</code> + arrow keys (Windows) and <code>Control</code> + arrow keys (Mac OS)
			 * @since 1.46
			 */
			enableTabReordering : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Specifies the allowed level of tabs nesting within one another using drag and drop.
			 * Default value is 0 which means nesting via interaction is not allowed. Maximum value is 100.
			 * This property allows nesting via user interaction only, and does not restrict adding items
			 * to the <code>items</code> aggregation of {@link sap.m.IconTabFilter sap.m.IconTabFilter}.
			 * @since 1.79
			 */
			maxNestingLevel: { type: "int", group : "Behavior", defaultValue: 0},

			/**
			 * Specifies the visual density mode of the tabs.
			 *
			 * The values that can be applied are <code>Cozy</code>, <code>Compact</code> and <code>Inherit</code>.
			 * <code>Cozy</code> and <code>Compact</code> render the control in one of these modes independent of the global density settings.
			 * The <code>Inherit</code> value follows the global density settings which are applied.
			 * For compatibility reasons, the default value is <code>Cozy</code>.
			 * @since 1.56
			 */
			tabDensityMode :{type : "sap.m.IconTabDensityMode", group : "Appearance", defaultValue : IconTabDensityMode.Cozy},

			/**
			 * Specifies optional texts for the screen reader.
			 *
			 * The given object can contain the following keys:
			 * <code>headerLabel</code> - text to serve as a label for the header,
			 * <code>headerDescription</code> - text to serve as a description for the header.
			 * @since 1.80
			 */
			ariaTexts : {type : "object", group : "Accessibility", defaultValue : null},

			/**
			 * Specifies the overflow mode of the header.
			 *
			 * The default <code>End</code> mode shows as many tabs that can fit on the screen, then shows one overflow at the end
			 * containing the remaining items.
			 * The <code>StartAndEnd</code> is used to keep the order of tabs intact and offers overflow tabs on both ends of the bar.
			 * @since 1.90
			 */
			tabsOverflowMode: {type : "sap.m.TabsOverflowMode", group : "Behavior", defaultValue : TabsOverflowMode.End}
		},
		aggregations : {

			/**
			 * The items displayed in the IconTabHeader.
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item", dnd : {draggable: true, droppable: true, layout: "Horizontal"} },

			/**
			 * Internal aggregation for managing the overflow tab.
			 */
			_overflow : {type : "sap.m.IconTabFilter", multiple : false, visibility : "hidden"},

			/**
			 * Internal aggregation for managing the start overflow tab.
			 */
			_startOverflow : {type : "sap.m.IconTabFilter", multiple : false, visibility : "hidden"}
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
					key : {type : "string"},

					/**
					 * The key of the previous selected item
					 * @since 1.96
					 */
					previousKey : {type : "string"}
				}
			}
		}
	}});

	/**
	 * Library internationalization resource bundle.
	 *
	 * @type {module:sap/base/i18n/ResourceBundle}
	 */
	var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

	EnabledPropagator.apply(IconTabHeader.prototype, [true]);

	IconTabHeader.prototype.init = function () {
		// if it is "true", the "select" event will be fired
		// even when the "selectedKey" property is changed via API (without user interaction).
		this._bFireSelectEvent = false;
		this._aTabKeys = [];
		this._oAriaHeadText = null;
		this._bIsRendered = false;
	};

	IconTabHeader.prototype.exit = function () {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		if (this._aTabKeys) {
			this._aTabKeys = null;
		}

		if (this._oOverflow) {
			this._oOverflow.removeEventDelegate(this._oOverflowEventDelegate);
			this._oOverflowEventDelegate = null;
			this._oOverflow = null;
		}

		if (this._oStartOverflow) {
			this._oStartOverflow.removeEventDelegate(this._oStartOverflowEventDelegate);
			this._oStartOverflowEventDelegate = null;
			this._oStartOverflow = null;
		}

		if (this._oAriaHeadText) {
			this._oAriaHeadText.destroy();
			this._oAriaHeadText = null;
		}
		this._bRtl = null;
	};

	IconTabHeader.prototype.onBeforeRendering = function () {

		this._bIsRendered = false;

		this._bRtl = Core.getConfiguration().getRTL();

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		this._updateSelection();
		this.destroyDragDropConfig();
		this._setsDragAndDropConfigurations();
	};

	IconTabHeader.prototype.onAfterRendering = function () {
		this._applyTabDensityMode();

		if (this.oSelectedItem) {
			this._applySelectionToFilters();
			this.oSelectedItem._hideBadge();
		}

		if (Core.isThemeApplied()) {
			this._setItemsForStrip();
		} else {
			Core.attachThemeChanged(this._handleThemeLoad, this);
		}

		this._initItemNavigation();

		//listen to resize
		this._sResizeListenerId = ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._fnResize, this));

		// notify items that they are rendered
		this.getItems().forEach(function (oItem) {
			if (oItem._onAfterParentRendering) {
				oItem._onAfterParentRendering();
			}
		});

		this._bIsRendered = true;
	};

	/**
	 * Returns if the control is rendered
	 * @private
	 */
	IconTabHeader.prototype._isRendered = function () {
		return this._bIsRendered;
	};

	/**
	 * Returns overflow select list
	 * @private
	 */
	IconTabHeader.prototype._getSelectList = function () {
		return this._getOverflow()._getSelectList();
	};

	/**
	 * @private
	 * @returns {sap.m.IconTabFilter} The overflow tab instance
	 */
	IconTabHeader.prototype._getOverflow = function () {
		var oOverflow = this.getAggregation("_overflow");

		if (!oOverflow) {
			oOverflow = new IconTabFilter({
				id: this.getId() + '-overflow',
				text: oResourceBundle.getText("ICONTABHEADER_OVERFLOW_MORE")
			});
			oOverflow._bIsOverflow = true;
			this._oOverflowEventDelegate = {
				onsapnext: oOverflow.onsapdown
			};
			oOverflow.addEventDelegate(this._oOverflowEventDelegate, oOverflow);
			this.setAggregation("_overflow", oOverflow);
			this._oOverflow = oOverflow;
		}

		return oOverflow;
	};

	/**
	 * @private
	 * @returns {sap.m.IconTabFilter} The start overflow tab instance
	 */
	IconTabHeader.prototype._getStartOverflow = function () {
		var oStartOverflow = this.getAggregation("_startOverflow");

		if (!oStartOverflow) {
			oStartOverflow = new IconTabFilter({
				id: this.getId() + '-startOverflow',
				text: oResourceBundle.getText("ICONTABHEADER_OVERFLOW_MORE")
			});
			oStartOverflow._bIsStartOverflow = true;
			this._oStartOverflowEventDelegate = {
				onsapprevious: oStartOverflow.onsapdown
			};
			oStartOverflow.addEventDelegate(this._oStartOverflowEventDelegate, oStartOverflow);
			this.setAggregation("_startOverflow", oStartOverflow);
			this._oStartOverflow = oStartOverflow;
		}

		return oStartOverflow;
	};

	/**
	 * Returns invisible text, used for the head.
	 * @returns {sap.ui.core.InvisibleText} InvisibleText
	 * @private
	 */
	IconTabHeader.prototype._getInvisibleHeadText = function () {

		var mAriaTexts = this.getAriaTexts() || {};

		if (!this._oAriaHeadText) {
			this._oAriaHeadText = new InvisibleText({
				id: this.getId() + "-ariaHeadText"
			});
		}

		this._oAriaHeadText.setText(mAriaTexts.headerDescription);
		return this._oAriaHeadText;
	};

	IconTabHeader.prototype._onItemNavigationFocusLeave = function () {
		// BCP: 1570034646
		if (!this.oSelectedItem) {
			return;
		}

		var iIndex = this._oItemNavigation.getItemDomRefs().indexOf(this.oSelectedItem._getRootTab().getDomRef());
		this._oItemNavigation.setFocusedIndex(iIndex);
	};

	/**
	 * Returns all tab filters, without the tab separators.
	 * @private
	 */
	IconTabHeader.prototype.getTabFilters = function () {
		var aTabFilters = [];
		this.getItems().forEach(function(oItem) {
			if (oItem instanceof IconTabFilter) {
				aTabFilters.push(oItem);
			}
		});

		return aTabFilters;
	};

	/**
	 * Sets or remove Drag and Drop configurations.
	 * @private
	 */
	IconTabHeader.prototype._setsDragAndDropConfigurations = function () {
		// Adding Drag&Drop configuration to the dragDropConfig aggregation
		if (this.getEnableTabReordering() && !this.getDragDropConfig().length) {
			IconTabBarDragAndDropUtil.setDragDropAggregations(this, "Horizontal", this._getDropPosition());
		}
	};

	/**
	 * Returns the correct DropPosition configuration based on the maxNestingLevel.
	 * @private
	 */
	IconTabHeader.prototype._getDropPosition = function () {
		return this.getMaxNestingLevel() === 0 ? DropPosition.Between : DropPosition.OnOrBetween;
	};

	/**
	 * Sets the selected item based on key.
	 * @override
	 * @public
	 * @param {string} sKey The key of the item to be selected
	 * @return {this} this pointer for chaining
	 */
	IconTabHeader.prototype.setSelectedKey = function (sKey) {
		if (sKey === this.getSelectedKey()) {
			if (this._isInsideIconTabBar()) {
				this.getParent().setProperty("selectedKey", sKey, true);
			}

			return this;
		}

		var aItems = this.getTabFilters(),
			bIsParentIconTabBar = this._isInsideIconTabBar(),
			bApiChange = true,
			oSelectedItem;

		if (aItems.length > 0) {
			sKey = sKey || aItems[0]._getNonEmptyKey();
		}

		// adjust UI and internal variables if already rendered (otherwise taken care by onBeforeRendering)
		if (this.$().length) {
			oSelectedItem = this._findItemByKey(sKey);

			if (oSelectedItem) {
				this.setSelectedItem(oSelectedItem, bApiChange);
			} else if (!bIsParentIconTabBar && sKey) {
				this.setSelectedItem(null);
			}
		}

		// set internal property
		this.setProperty("selectedKey", sKey, true);
		return this;
	};

	/**
	 * Sets the selected item, updates the UI, and fires the select event.
	 * @private
	 * @param {sap.m.IconTabFilter} oItem The item to be selected
	 * @param {boolean} bAPIChange whether this function is called through the API
	 * @returns {this} this pointer for chaining
	 */
	IconTabHeader.prototype.setSelectedItem = function (oItem, bAPIChange) {
		if (!oItem) {
			if (this.oSelectedItem) {
				this._removeSelectionFromFilters();
				this.oSelectedItem = null;
			}

			return this;
		}

		if (this._isUnselectable(oItem)) {
			return this;
		}

		var oParent = this.getParent();
		var bIsParentIconTabBar = this._isInsideIconTabBar();
		var sPrevKey = this.getSelectedKey();

		//if the old selected tab and the new selected tab both have no own content, which means they both use the same content from the icontabbar
		//there is no need to rerender the content
		//fix for xml views css: 0120061532 0001427250 2014
		var bIsContentTheSame = false;
		if (oItem.getContent().length === 0  && this.oSelectedItem && this.oSelectedItem.getContent().length === 0) {
			bIsContentTheSame = true;
		}

		if (this.oSelectedItem &&
			this.oSelectedItem.getVisible() &&
			(!bAPIChange && bIsParentIconTabBar && oParent.getExpandable() || this.oSelectedItem !== oItem)) {
			this._removeSelectionFromFilters();
		}

		if (oItem.getVisible()) {
			//click on already selected item leads to expanding/collapsing of the content (if expandable enabled)
			if (this.oSelectedItem === oItem) {
				//if content is not expandable nothing should happen otherwise content will be expanded/collapsed
				if (!bAPIChange && bIsParentIconTabBar && oParent.getExpandable()) {
					oParent._toggleExpandCollapse();
				}
			//click on other item leads to showing the right content of this item
			} else {
				//change the content aria-labelled by the newly selected tab;
				if (bIsParentIconTabBar) {
					oParent.$("content").attr('aria-labelledby', oItem.sId);
				}

				// set new item
				this.oSelectedItem = oItem;
				this._applySelectionToFilters();
				this.setProperty("selectedKey", this.oSelectedItem._getNonEmptyKey(), true);

				//if the IconTabBar is not expandable and the content not expanded (which means content can never be expanded), we do not need
				//to visualize the selection and we do not need to render the content
				if (bIsParentIconTabBar && (oParent.getExpandable() || oParent.getExpanded())) {
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
					if (!bAPIChange && oParent.getExpandable() && !oParent.getExpanded()) {
						oParent._toggleExpandCollapse(true);
					}
				}
			}

		}

		this.oSelectedItem = oItem;
		var sSelectedKey = this.oSelectedItem._getNonEmptyKey();

		this.setProperty("selectedKey", sSelectedKey, true);
		if (bIsParentIconTabBar) {
			oParent.setProperty("selectedKey", sSelectedKey, true);
		}

		if (bIsParentIconTabBar) {
			bAPIChange = bAPIChange && !oParent._bFireSelectEvent;
		} else {
			bAPIChange = bAPIChange && !this._bFireSelectEvent;
		}

		if (!bAPIChange) {
			// fire event on iconTabBar
			if (bIsParentIconTabBar) {
				oParent.fireSelect({
					selectedItem: this.oSelectedItem,
					selectedKey: sSelectedKey,
					item: this.oSelectedItem,
					key: sSelectedKey,
					previousKey: sPrevKey
				});
			} else {
				// fire event on header
				this.fireSelect({
					selectedItem: this.oSelectedItem,
					selectedKey: sSelectedKey,
					item: this.oSelectedItem,
					key: sSelectedKey,
					previousKey: sPrevKey
				});
			}
		}

		this.oSelectedItem._startBadgeHiding();

		var oSelectedRootItemDomRef = this.oSelectedItem._getRootTab().getDomRef();

		if (!oSelectedRootItemDomRef ||
			oSelectedRootItemDomRef.classList.contains("sapMITBFilterHidden") ||
			this.getTabsOverflowMode() === TabsOverflowMode.End) {
			this._setItemsForStrip();
		}

		return this;
	};

	/**
	 * Returns all the visible tab filters.
	 * @private
	 * @returns {Array} Array of visible items.
	 */
	IconTabHeader.prototype.getVisibleTabFilters = function () {
		return this.getTabFilters().filter(function (oFilter) {
			return oFilter.getVisible();
		});
	};

	IconTabHeader.prototype._initItemNavigation = function () {
		var aTabDomRefs = [],
			iSelectedDomIndex = -1,
			oSelectedRootItem = this.oSelectedItem && this.oSelectedItem._getRootTab();

		if (this.$().hasClass("sapMITHStartOverflowList")) {
			var oStartOverflowDomRef = this._getStartOverflow().getFocusDomRef();
			oStartOverflowDomRef.setAttribute("tabindex", "-1");
			aTabDomRefs.push(oStartOverflowDomRef);
		}

		// find a collection of all tabs
		this.getTabFilters().forEach(function (oItem) {
			var oItemDomRef = this.getFocusDomRef(oItem);

			if (!oItemDomRef) {
				return;
			}
			oItemDomRef.setAttribute("tabindex", "-1");
			aTabDomRefs.push(oItemDomRef);
			if (oItem === oSelectedRootItem || oItem === this.oSelectedItem) {
				iSelectedDomIndex = aTabDomRefs.indexOf(oItemDomRef);
			}
		}.bind(this));

		if (this.$().hasClass("sapMITHEndOverflowList")) {
			var oOverflowDomRef = this._getOverflow().getFocusDomRef();
			oOverflowDomRef.setAttribute("tabindex", "-1");
			aTabDomRefs.push(oOverflowDomRef);
		}

		//Initialize the ItemNavigation
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation()
				.setCycling(false)
				.attachEvent(ItemNavigation.Events.FocusLeave, this._onItemNavigationFocusLeave, this)
				.setDisabledModifiers({
					sapnext : ["alt", "meta"],
					sapprevious : ["alt", "meta"]
				});

			this.addDelegate(this._oItemNavigation);
		}

		//Reinitialize the ItemNavigation after rendering
		this._oItemNavigation.setRootDomRef(this.getDomRef())
			.setItemDomRefs(aTabDomRefs)
			.setPageSize(aTabDomRefs.length) // set the page size equal to the tab number so when we press pageUp/pageDown to focus first/last tab
			.setSelectedIndex(iSelectedDomIndex);
	};

	IconTabHeader.prototype.onThemeChanged = function () {
		this._applyTabDensityMode();
	};

	IconTabHeader.prototype._applyTabDensityMode = function () {
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

	/**
	 * Fired when the theme is loaded
	 *
	 * @private
	 */
	IconTabHeader.prototype._handleThemeLoad = function () {
		setTimeout(this._setItemsForStrip.bind(this), 350);
		Core.detachThemeChanged(this._handleThemeLoad, this);
	};

	/*
	 * Destroys the item aggregation.
	 */
	IconTabHeader.prototype.destroyItems = function () {
		this.oSelectedItem = null;
		this._aTabKeys = [];
		this.destroyAggregation("items");
		return this;
	};

	IconTabHeader.prototype.addItem = function (oItem) {
		if (!(oItem instanceof IconTabSeparator)) {
			var sKey = oItem.getKey();
			// check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				Log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.addAggregation("items", oItem);

		this._invalidateParentIconTabBar();

		return this;
	};

	IconTabHeader.prototype.insertItem = function (oItem, iIndex) {
		if (!(oItem instanceof IconTabSeparator)) {
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

	IconTabHeader.prototype.removeAllItems = function () {
		var oResult = this.removeAllAggregation("items");

		this._aTabKeys = [];
		this.oSelectedItem = null;

		this._invalidateParentIconTabBar();

		return oResult;
	};

	IconTabHeader.prototype.removeItem = function (oItem) {
		// Make sure we have the actual Item and not just an ID
		oItem = this.removeAggregation("items", oItem);

		if (oItem && !(oItem instanceof IconTabSeparator)) {
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

	IconTabHeader.prototype.updateAggregation = function () {
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

		if (!this._getPreserveSelection() && oItem && oItem == this.oSelectedItem && sAggregationName == 'items') {

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
	 * Returns whether the currently selected item is preserved.
	 * @private
	 */
	IconTabHeader.prototype._getPreserveSelection = function () {
		return this._bPreserveSelection;
	};

	/**
	 * Sets whether the currently selected item is preserved.
	 * @param {boolean} bPreserveSelection The new value
	 * @private
	 */
	IconTabHeader.prototype._setPreserveSelection = function (bPreserveSelection) {
		this._bPreserveSelection = bPreserveSelection;
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
		return this.getMode() === IconTabHeaderMode.Inline;
	};

	/**
	 * Checks if all tabs are textOnly version.
	 * @private
	 * @returns {boolean} True if all tabs are textOnly version, otherwise false
	 */
	IconTabHeader.prototype._checkTextOnly = function () {
		this._bTextOnly = this.getItems().every(function (oItem) {
			return oItem instanceof IconTabSeparator || !oItem.getIcon();
		});

		return this._bTextOnly;
	};

	/**
	 * Checks if all tabs are noText version.
	 * @private
	 * @returns True if all tabs are noText version, otherwise false
	 */
	IconTabHeader.prototype._checkNoText = function (aItems) {
		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {
				if (!(aItems[i] instanceof IconTabSeparator)) {
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
	IconTabHeader.prototype._checkInLine = function (aItems) {
		var oItem;
		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {
				oItem = aItems[i];

				if (!(oItem instanceof IconTabSeparator)) {
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
	 * @private
	 */
	IconTabHeader.prototype._getItemsInStrip = function () {
		return this.getItems().filter(function (oItem) {
			var oItemDomRef = oItem.getDomRef();
			return oItemDomRef && !oItemDomRef.classList.contains("sapMITBFilterHidden");
		});
	};

	/**
	 * @private
	 */
	IconTabHeader.prototype._setItemsForStrip = function () {
		var aTabFilters = this.getVisibleTabFilters();

		if (!Core.isThemeApplied() || !aTabFilters.length) {
			return;
		}

		var oTabStrip = this.getDomRef("head");

		if (!oTabStrip) {
			// control has not been rendered, exit
			return;
		}

		var oStartOverflow = this._getStartOverflow(),
			oOverflow = this._getOverflow(),
			aItems = this.getItems()
				.filter(function (oItem) { return oItem.getDomRef(); })
				.map(function (oItem) { return oItem.getDomRef(); }),
			oSelectedItem = (this.oSelectedItem && this.oSelectedItem.getVisible()) ? this.oSelectedItem : aTabFilters[0],
			oSelectedItemDomRef = (oSelectedItem._getRootTab() || oSelectedItem).getDomRef();

		if (!aItems.length || !oSelectedItemDomRef) {
			return;
		}

		// hide overflow tabs
		oStartOverflow.$().removeClass("sapMITHOverflowVisible");
		oOverflow.$().removeClass("sapMITHOverflowVisible");

		this.$().removeClass("sapMITHStartOverflowList");
		this.$().removeClass("sapMITHEndOverflowList");

		// reset all display styles and their initial order to calculate items' width
		aItems.forEach(function (oItem) {
			oItem.classList.remove("sapMITBFilterHidden");
		});

		var iTotalWidthItems = aItems.reduce(function (iSum, oDomRef) {
				return iSum + jQuery(oDomRef).outerWidth(true);
			}, 0),
			bHasOverflow = iTotalWidthItems > oTabStrip.offsetWidth;

		if (!bHasOverflow) {
			return;
		}

		switch (this.getTabsOverflowMode()) {
			case TabsOverflowMode.StartAndEnd:
				this._updateStartAndEndOverflow(aItems, oSelectedItemDomRef);
				break;
			case TabsOverflowMode.End:
			default:
				this._updateEndOverflow(aItems, oSelectedItemDomRef);
				break;
		}
	};


	IconTabHeader.prototype._updateEndOverflow = function (aItems, oSelectedItemDomRef) {
		var oOverflow = this._getOverflow(),
			oTabStrip = this.getDomRef("head"),
			iTabStripWidth,
			iLastVisible,
			mSelectedItem,
			i;

		oOverflow.$().addClass("sapMITHOverflowVisible");
		this.$().addClass("sapMITHEndOverflowList");

		iTabStripWidth = oTabStrip.offsetWidth;
		mSelectedItem = this._getSelectedItemIndexAndSize(aItems, oSelectedItemDomRef);
		iLastVisible = this._findLastVisibleItem(aItems, iTabStripWidth, mSelectedItem.width);

		for (i = iLastVisible + 1; i < aItems.length; i++) {
			aItems[i].classList.add("sapMITBFilterHidden");
		}

		oOverflow._updateExpandButtonBadge();
	};


	IconTabHeader.prototype._updateStartAndEndOverflow = function (aItems, oSelectedItemDomRef) {
		var oStartOverflow = this._getStartOverflow(),
			oOverflow = this._getOverflow(),
			oTabStrip = this.getDomRef("head"),
			iTabStripWidth = oTabStrip.offsetWidth,
			mSelectedItem = this._getSelectedItemIndexAndSize(aItems, oSelectedItemDomRef),
			bHasStartOverflow = this._hasStartOverflow(iTabStripWidth, aItems, mSelectedItem),
			bHasEndOverflow = this._hasEndOverflow(iTabStripWidth, aItems, mSelectedItem),
			iFirstVisible,
			iLastVisible,
			i;

		// has "end", but no "start" overflow
		if (!bHasStartOverflow) {
			oOverflow.$().addClass("sapMITHOverflowVisible");
			this.$().addClass("sapMITHEndOverflowList");
			// width has changed after the overflow became visible
			iTabStripWidth = oTabStrip.offsetWidth;

			iLastVisible = this._findLastVisibleItem(aItems, iTabStripWidth, mSelectedItem.width);

			for (i = iLastVisible + 1; i < aItems.length; i++) {
				aItems[i].classList.add("sapMITBFilterHidden");
			}

			oOverflow._updateTabCountText();
			oOverflow._updateExpandButtonBadge();
			return;
		}

		// has "start", but no "end" overflow
		if (!bHasEndOverflow) {
			oStartOverflow.$().addClass("sapMITHOverflowVisible");
			this.$().addClass("sapMITHStartOverflowList");
			// width has changed after the overflow became visible
			iTabStripWidth = oTabStrip.offsetWidth;

			iFirstVisible = this._findFirstVisibleItem(aItems, iTabStripWidth, mSelectedItem.width);

			for (i = iFirstVisible - 1; i >= 0; i--) {
				aItems[i].classList.add("sapMITBFilterHidden");
			}

			oStartOverflow._updateTabCountText();
			oStartOverflow._updateExpandButtonBadge();
			return;
		}

		// has "start" and "end" overflows
		oStartOverflow.$().addClass("sapMITHOverflowVisible");
		this.$().addClass("sapMITHStartOverflowList");

		oOverflow.$().addClass("sapMITHOverflowVisible");
		this.$().addClass("sapMITHEndOverflowList");
		// width has changed after the overflow became visible
		iTabStripWidth = oTabStrip.offsetWidth;

		iFirstVisible = this._findFirstVisibleItem(aItems, iTabStripWidth, mSelectedItem.width, mSelectedItem.index - 1);
		iLastVisible = this._findLastVisibleItem(aItems, iTabStripWidth, mSelectedItem.width, iFirstVisible);

		for (i = iFirstVisible - 1; i >= 0; i--) {
			aItems[i].classList.add("sapMITBFilterHidden");
		}

		for (i = iLastVisible + 1; i < aItems.length; i++) {
			aItems[i].classList.add("sapMITBFilterHidden");
		}

		oStartOverflow._updateExpandButtonBadge();
		oStartOverflow._updateTabCountText();
		oOverflow._updateTabCountText();
		oOverflow._updateExpandButtonBadge();
	};

	IconTabHeader.prototype._hasStartOverflow = function (iTabStripWidth, aItems, mSelectedItem) {
		if (mSelectedItem.index === 0) {
			return false;
		}

		var i,
			iLeftItemsWidth = 0;

		for (i = mSelectedItem.index - 1; i >= 0; i--) {
			iLeftItemsWidth += this._getItemSize(aItems[i]);
		}

		var bHasStartOverflow = iTabStripWidth < iLeftItemsWidth + mSelectedItem.width;

		// if there is no "start" overflow, it has "end" overflow
		// check it again with the "end" overflow
		if (!bHasStartOverflow) {
			this._getOverflow().$().addClass("sapMITHOverflowVisible");
			this.$().addClass("sapMITHEndOverflowList");

			iTabStripWidth = this.getDomRef("head").offsetWidth;
			bHasStartOverflow = iTabStripWidth < iLeftItemsWidth + mSelectedItem.width;

			this._getOverflow().$().removeClass("sapMITHOverflowVisible");
			this.$().removeClass("sapMITHEndOverflowList");
		}

		return bHasStartOverflow;
	};

	IconTabHeader.prototype._hasEndOverflow = function (iTabStripWidth, aItems, mSelectedItem) {
		if (mSelectedItem.index >= aItems.length) {
			return false;
		}

		var i,
			iRightItemsWidth = 0;

		for (i = mSelectedItem.index; i < aItems.length; i++) {
			iRightItemsWidth += this._getItemSize(aItems[i]);
		}

		var bHasEndOverflow = iTabStripWidth < iRightItemsWidth + mSelectedItem.width;

		// if there is no "end" overflow, it has "start" overflow
		// check it again with the "start" overflow
		if (!bHasEndOverflow) {
			this._getStartOverflow().$().addClass("sapMITHOverflowVisible");
			this.$().addClass("sapMITHStartOverflowList");

			iTabStripWidth = this.getDomRef("head").offsetWidth;
			bHasEndOverflow = iTabStripWidth < iRightItemsWidth + mSelectedItem.width;

			this._getStartOverflow().$().removeClass("sapMITHOverflowVisible");
			this.$().removeClass("sapMITHStartOverflowList");
		}

		return bHasEndOverflow;
	};

	IconTabHeader.prototype._getSelectedItemIndexAndSize = function (aItems, oSelectedItemDomRef) {
		var iSelectedItemIndex = aItems.indexOf(oSelectedItemDomRef),
			iSelectedItemSize = this._getItemSize(oSelectedItemDomRef),
			oSelectedSeparator;

		if (aItems[iSelectedItemIndex - 1] && aItems[iSelectedItemIndex - 1].classList.contains("sapMITBSep")) {
			oSelectedSeparator = aItems[iSelectedItemIndex - 1];
			iSelectedItemSize += this._getItemSize(oSelectedSeparator);
		}

		aItems.splice(iSelectedItemIndex, 1);

		// if previous item is a separator - remove it
		if (oSelectedSeparator) {
			aItems.splice(iSelectedItemIndex - 1, 1);
			iSelectedItemIndex--;
		}

		return {
			index: iSelectedItemIndex,
			width: iSelectedItemSize
		};
	};

	IconTabHeader.prototype._findFirstVisibleItem = function (aItems, iTabStripWidth, iSelectedItemWidth, iStartIndex) {
		var iLastVisible,
			iIndex,
			iItemSize;

		if (iStartIndex === undefined) {
			iStartIndex = aItems.length - 1;
		}

		iLastVisible = iStartIndex + 1;

		for (iIndex = iStartIndex; iIndex >= 0; iIndex--) {
			iItemSize = this._getItemSize(aItems[iIndex]);

			if (iTabStripWidth < iSelectedItemWidth + iItemSize) {
				break;
			}

			iSelectedItemWidth += iItemSize;
			iLastVisible = iIndex;
		}

		return iLastVisible;
	};

	IconTabHeader.prototype._findLastVisibleItem = function (aItems, iTabStripWidth, iSelectedItemWidth, iStartIndex) {
		var iLastVisible,
			iIndex,
			iItemSize;

		iStartIndex = iStartIndex || 0;
		iLastVisible = iStartIndex - 1;

		for (iIndex = iStartIndex; iIndex < aItems.length; iIndex++) {
			iItemSize = this._getItemSize(aItems[iIndex]);

			if (iTabStripWidth < iSelectedItemWidth + iItemSize) {
				break;
			}

			iSelectedItemWidth += iItemSize;
			iLastVisible = iIndex;
		}

		// if prev item is separator - hide it
		var oPrevItem = aItems[iIndex - 1];
		if (oPrevItem && oPrevItem.classList.contains("sapMITBSep")) {
			iLastVisible -= 1;
		}

		return iLastVisible;
	};

	IconTabHeader.prototype._getItemSize = function (oItemDomRef) {
		var oStyle = window.getComputedStyle(oItemDomRef),
			iWidth = oItemDomRef.offsetWidth,
			iMargins = Number.parseInt(oStyle.marginLeft) + Number.parseInt(oStyle.marginRight);

		return iWidth + iMargins;
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
				oEvent.preventDefault();

				// should be one of the items - select it
				if ($target.hasClass('sapMITBFilterIcon') || $target.hasClass('sapMITBCount') || $target.hasClass('sapMITBText') || $target.hasClass('sapMITBTab') || $target.hasClass('sapMITBContentArrow') || $target.hasClass('sapMITBSep') || $target.hasClass('sapMITBSepIcon')) {
					// click on icon: fetch filter instead
					sControlId = oEvent.srcControl.getId().replace(/-icon$/, "");
					oControl = Core.byId(sControlId);
					if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof IconTabSeparator)) {

						if (this._isUnselectable(oControl)) {
							if (oControl.getItems().length || oControl._isOverflow()) {
								oControl._expandButtonPress();
							}
							return;
						}

						if ((oControl === this._getOverflow()) || (oControl === this._getStartOverflow())) {
							oControl._expandButtonPress();
							return;
						}

						this.setSelectedItem(oControl);
					}
				} else if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof IconTabSeparator)) {
					// select item if it is an iconTab but not a separator

					if (this._isUnselectable(oControl)) {
						if (oControl.getItems().length || oControl._isOverflow()) {
							oControl._expandButtonPress();
						}
						return;
					}

					if ((oControl === this._getOverflow()) || (oControl === this._getStartOverflow())) {
						oControl._expandButtonPress();
						return;
					}

					this.setSelectedItem(oControl);
				}
			} else {
				//no target id, so we have to check if showAll is set or it's a text only item, because clicking on the number then also leads to selecting the item
				if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof IconTabSeparator)) {

					if (this._isUnselectable(oControl)) {
						if (oControl.getItems().length || oControl._isOverflow()) {
							oControl._expandButtonPress();
						}
						return;
					}

					if ((oControl === this._getOverflow()) || (oControl === this._getStartOverflow())) {
						oControl._expandButtonPress();
						return;
					}

					this.setSelectedItem(oControl);
				}
			}
		}
	};

	/**
	 * Resize handling.
	 * @private
	*/
	IconTabHeader.prototype._fnResize = function() {
		if (this._getOverflow()._oPopover) {
			this._getOverflow()._oPopover.close();
		}
		if (this._getStartOverflow()._oPopover) {
			this._getStartOverflow()._oPopover.close();
		}
		this._setItemsForStrip();
		this._initItemNavigation();
	};

	/**
	 * Checks if a IconTabFilter is unable to be selected.
	 * This instance of the IconTabHeader must be within an IconTabBar and the IconTabBar must have no content aggregation set.
	 * The passed IconTabFilter instance must not be nested, has to have its items aggregation set and not have content aggregation set.
	 * @private
	 * @param {sap.m.IconTabFilter} oIconTabFilter The instance to check
	 * @returns {boolean}
	 */
	IconTabHeader.prototype._isUnselectable = function (oIconTabFilter) {
		var oFilter = oIconTabFilter._getRealTab();

		return !oFilter.getEnabled() || (this._isInsideIconTabBar() && !this.getParent().getContent().length &&
			oFilter._getNestedLevel() === 1 && oFilter.getItems().length && !oFilter.getContent().length) ||
			oFilter._isOverflow();
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
	 * Returns if the control is inside a sap.tnt.ToolHeader.
	 * @private
	 */
	IconTabHeader.prototype._isInsideToolHeader = function() {
		var oParent = this.getParent();
		return oParent instanceof Control && oParent.isA('sap.tnt.ToolHeader');
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
	 * @override
	 */
	//overwritten method, returns for most cases the iconDomRef. if the given tab has no icon, the textDomRef is returned.
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
			jQuery(oFocusInfo.focusDomRef).trigger("focus");
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
			bIsParentIconTabBar = this._isInsideIconTabBar(),
			bIsParentToolHeader = this._isInsideToolHeader();

		if (!aItems.length) {
			return;
		}

		if (!this.oSelectedItem || sSelectedKey && sSelectedKey !== this.oSelectedItem._getNonEmptyKey()) {
			// selected key is specified by API: set oSelectedItem to the item specified by key
			if (sSelectedKey) {
				this.oSelectedItem = this._findItemByKey(sSelectedKey);
			}

			// no key and no item, we set the first visible item as selected
			if (!this.oSelectedItem && (bIsParentIconTabBar || !sSelectedKey)) {
				for (i = 0; i < aItems.length; i++) { // tab item
					if (!(aItems[i] instanceof IconTabSeparator) && aItems[i].getVisible()) {
						this.oSelectedItem = aItems[i];
						break;
					}
				}
			}
		}

		//in case the selected tab is not visible anymore, the selected tab will change to the first visible tab
		if (!bIsParentToolHeader && this.oSelectedItem && !this.oSelectedItem.getVisible()) {
			for (i = 0; i < aItems.length; i++) { // tab item
				if (!(aItems[i] instanceof IconTabSeparator) && aItems[i].getVisible()) {
					this.oSelectedItem = aItems[i];
					break;
				}
			}
		}

		if (!this.oSelectedItem) {
			return;
		}

		// if candidate selected item is unselectable, instead select its first available child item that has content
		if (this._isUnselectable(this.oSelectedItem)) {
			this.setSelectedItem(this.oSelectedItem._getFirstAvailableSubFilter(), true);
			return;
		}

		this.setProperty("selectedKey", this.oSelectedItem._getNonEmptyKey(), true);
	};

	/**
	 * Returns the item or nested item with the given key.
	 * @private
	 * @param {string} sKey The key to search with.
	 * @returns {sap.m.IconTabFilter} The found item.
	 */
	IconTabHeader.prototype._findItemByKey = function (sKey) {
		var aTabFilters = this.getTabFilters(),
			aSubFilters;

		for (var i = 0; i < aTabFilters.length; i++) {
			if (aTabFilters[i]._getNonEmptyKey() === sKey) {
				return aTabFilters[i];
			}

			aSubFilters = aTabFilters[i]._getAllSubFilters();
			for (var j = 0; j < aSubFilters.length; j++) {
				if (aSubFilters[j]._getNonEmptyKey() === sKey) {
					return aSubFilters[j];
				}
			}
		}
	};

	/**
	 * Applies classes and attributes to the selected item.
	 * If the item is nested, it also applies them to the root of the item.
	 * @private
	 */
	IconTabHeader.prototype._applySelectionToFilters = function () {
		if (this._isInsideIconTabBar() && !this.getParent().getExpanded()) {
			return;
		}

		this.oSelectedItem.$()
				.addClass("sapMITBSelected")
				.attr({ 'aria-selected': true });

		if (this.oSelectedItem._getNestedLevel() !== 1) {
			var oSelectedRootItem = this.oSelectedItem._getRootTab();

			oSelectedRootItem.$()
				.addClass("sapMITBSelected")
				.attr({ "aria-selected": true });
		}
	};

	/**
	 * Removes classes and attributes added by "_applySelectionToFilters"
	 * @private
	 */
	IconTabHeader.prototype._removeSelectionFromFilters = function () {
		this.oSelectedItem.$()
				.removeClass("sapMITBSelected")
				.attr({ 'aria-selected': false });

		if (this.oSelectedItem._getNestedLevel() !== 1) {
			var oSelectedRootItem = this.oSelectedItem._getRootTab();

			oSelectedRootItem.$()
				.removeClass("sapMITBSelected")
				.attr({ "aria-selected": false });
		}
	};

	IconTabHeader.prototype._getItemsForOverflow = function (bIsStartOverflow, bTopLevelTabs) {

		var aItemsInStrip = this._getItemsInStrip(),
			bIsStartAndEndMode = this.getTabsOverflowMode() === TabsOverflowMode.StartAndEnd,
			iIndex,
			aItems = this.getItems(),
			aItemsForList = [];

		if (bIsStartAndEndMode) {
			iIndex = aItems.indexOf(aItemsInStrip[0]);
			aItems = bIsStartOverflow ? aItems.slice(0, iIndex) : aItems.slice(iIndex, aItems.length);
		}

		aItems.forEach(function (oItem) {
			// If tab is an overflow tab and oItem is already in Tab Strip, do not add it to list
			// on a mobile device, this behavior doesn't occur, and all items are shown
			if (!Device.system.phone && aItemsInStrip.indexOf(oItem) > -1) {
				return;
			}

			aItemsForList.push(oItem);
			if (oItem.isA("sap.m.IconTabFilter") && !bTopLevelTabs) {
				oItem._getAllSubItems().forEach(function (oSubItem) {
					aItemsForList.push(oSubItem);
				});
			}
		});

		return aItemsForList;
	};

	/* =========================================================== */
	/*           begin: event handlers                             */
	/* =========================================================== */

	/**
	 * Initializes activating a tab on the IconTabHeader.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ontouchstart = function(oEvent) {
		var oTargetTouch = oEvent.targetTouches[0];
		// store touch state
		this._iActiveTouch = oTargetTouch.identifier;
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

	IconTabHeader.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			this._handleActivation(oEvent);
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
		var oEventDropPosition = oEvent.getParameter("dropPosition"),
			oDraggedControl = oEvent.getParameter("draggedControl"),
			oDroppedControl = oEvent.getParameter("droppedControl"),
			oContext = this,
			allowedNestingLevel = this.getMaxNestingLevel();

		if (oEventDropPosition === DropPosition.On) {
			oContext = oDroppedControl._getRealTab();
		}

		IconTabBarDragAndDropUtil.handleDrop(oContext, oEventDropPosition, oDraggedControl._getRealTab(), oDroppedControl, false, allowedNestingLevel);

		if (oDraggedControl._getNestedLevel() > 1) {
			oDraggedControl._getRootTab()._closePopover();
		}

		this._setItemsForStrip();
		this._initItemNavigation();
		this._getOverflow()._setSelectListItems();
		this._getStartOverflow()._setSelectListItems();
		this._getSelectList()._initItemNavigation();

		oDraggedControl._getRealTab().$().trigger("focus");

		if (oEventDropPosition === DropPosition.On) {
			oDroppedControl._getRealTab().$().trigger("focus");
		}
	};

	/* =========================================================== */
	/*           end: tab drag-drop                                */
	/* =========================================================== */

	/* =========================================================== */
	/*           start: tab keyboard handling - drag-drop          */
	/* =========================================================== */

	/**
	 * Moves a tab by a specific key code
	 *
	 * @param {object} oTab The event object
	 * @param {int} iKeyCode Key code
	 * @param {int} iMaxIndex The end of the tab strip`
	 * @private
	 */
	IconTabHeader.prototype._moveTab = function (oTab, iKeyCode, iMaxIndex) {
		IconTabBarDragAndDropUtil.moveItem.call(this, oTab, iKeyCode, iMaxIndex);
		this._setItemsForStrip();
		this._initItemNavigation();
	};

	/**
	 * Handles keyboard drag&drop
	 * @param {jQuery.Event} oEvent The jQuery event object
	 * @private
	 */
	IconTabHeader.prototype.ondragrearranging = function (oEvent) {
		if (!this.getEnableTabReordering()) {
			return;
		}

		var oTab = oEvent.srcControl,
			iTabStripEnd = this.indexOfItem(this._getItemsInStrip().pop());

		this._moveTab(oTab, oEvent.keyCode, iTabStripEnd);
		oTab.$().trigger("focus");
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
	 * Modifier + Right Arrow || Modifier + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapincreasemodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Modifier + Left Arrow || Modifier + Arrow Down
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapdecreasemodifiers = IconTabHeader.prototype.ondragrearranging;

	/* =========================================================== */
	/*           end: tab keyboard handling - drag-drop            */
	/* =========================================================== */

	return IconTabHeader;
});
