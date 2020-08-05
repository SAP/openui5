/*!
 * ${copyright}
 */
sap.ui.define([
	"./GridContainerRenderer",
	"./GridContainerSettings",
	"./GridContainerUtils",
	"./library",
	"./dnd/GridKeyboardDragAndDrop",
	"sap/base/strings/capitalize",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/InvisibleRenderer",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/cssgrid/VirtualGrid",
	"sap/ui/thirdparty/jquery"
], function (
	GridContainerRenderer,
	GridContainerSettings,
	GridContainerUtils,
	library,
	GridKeyboardDragAndDrop,
	capitalize,
	ManagedObjectObserver,
	Control,
	Core,
	ResizeHandler,
	ItemNavigation,
	InvisibleRenderer,
	Device,
	KeyCodes,
	VirtualGrid,
	jQuery
) {
	"use strict";

	var isRtl = Core.getConfiguration().getRTL();

	/**
	 * Indicates the version of Microsoft Edge browser that has support for the display grid.
	 * @type {number}
	 */
	var EDGE_VERSION_WITH_GRID_SUPPORT = 16;

	/**
	 * For these controls the grid item visual focus should be displayed from the control inside.
	 */
	var aOwnVisualFocusControls = [
		"sap.f.Card",
		"sap.ui.integration.widgets.Card",
		"sap.m.GenericTile"
	];

	/**
	 * Indicates whether the grid is supported by the browser.
	 * @private
	 * @returns {boolean} If native grid is supported by the browser
	 */
	function isGridSupportedByBrowser() {
		return !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);
	}

	/**
	 * Gets the column-span property from the item's layout data.
	 * @private
	 * @param {sap.ui.core.Control} item The item
	 * @returns {number} The number of columns
	 */
	function getItemColumnCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getColumns() : 1;
	}

	/**
	 * Gets the rowspan attribute from the item's layout data.
	 * @private
	 * @param {sap.ui.core.Control} item The item
	 * @returns {number} The number of rows
	 */
	function getItemRowCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getActualRows() : 1;
	}

	/**
	 * Defines whether the rows span of the item should be calculated automatically, based on its layout data.
	 * @private
	 * @param {sap.ui.core.Control} item The item
	 * @returns {boolean} True if the item rows span should be auto calculated
	 */
	function hasItemAutoHeight(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.hasAutoHeight() : true;
	}

	/**
	 * When the GridContainer list item is focused, the control inside received a virtual focus.
	 * @private
	 * @param {sap.ui.core.Control} oControl The control
	 */
	function doVirtualFocusin(oControl) {
		if (oControl.onfocusin) {
			oControl.onfocusin();
		}
	}

	/**
	 * Constructor for a new <code>sap.f.GridContainer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A layout container control used for aligning items with various sizes in a simple grid.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control is used to align tiles, cards and other controls in configuration, such as a home page or a dashboard.
	 * It represents a grid layout with specific row and column sizes, in which the items can take any number of rows and columns.
	 *
	 * The number of columns and rows each item takes can be configured with the use of the <code>{@link sap.f.GridContainerItemLayoutData}</code>.
	 *
	 * All rows have the same height and all columns have the same width. Their sizes can be configured with the use of the <code>layout</code> aggregation and <code>{@link sap.f.GridContainerSettings}</code>.
	 *
	 * <h3>Usage</h3>
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>For aligning home page and dashboard items like Tiles and Cards in a simple grid system with equally sized rows and columns.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>If a more complex layout grid system, where columns and rows may vary in size, is needed.</li>
	 * </ul>
	 *
	 * <h3>Example:</h3>
	 * <pre>
	 * &lt;f:GridContainer&gt;
	 * 	&lt;f:layout&gt;
	 * 		&lt;f:GridContainerSettings rowSize=&quot;5rem&quot; columnSize=&quot;5rem&quot; gap=&quot;1rem&quot; /&gt;
	 * 	&lt;/f:layout&gt;
	 * 	&lt;f:layoutS&gt;
	 * 		&lt;f:GridContainerSettings rowSize=&quot;4rem&quot; columnSize=&quot;4rem&quot; gap=&quot;0.5rem&quot; /&gt;
	 * 	&lt;/f:layoutS&gt;
	 * 	&lt;f:items&gt;
	 * 		&lt;GenericTile header=&quot;Sales Fulfillment&quot;&gt;
	 * 			&lt;layoutData&gt;
	 * 				&lt;f:GridContainerItemLayoutData rows=&quot;2&quot; columns=&quot;2&quot; /&gt;
	 * 			&lt;/layoutData&gt;
	 * 		&lt;/GenericTile&gt;
	 * 		&lt;w:Card manifest=&quot;url-to-manifest&quot;&gt;
	 * 			&lt;w:layoutData&gt;
	 * 				&lt;f:GridContainerItemLayoutData rows=&quot;6&quot; columns=&quot;3&quot; /&gt;
	 * 			&lt;/w:layoutData&gt;
	 * 		&lt;/w:Card&gt;
	 * 		&lt;Panel&gt;
	 * 			&lt;layoutData&gt;
	 * 				&lt;f:GridContainerItemLayoutData columns=&quot;4&quot; /&gt;
	 * 			&lt;/layoutData&gt;
	 * 			&lt;Text text=&quot;Sales information&quot; /&gt;
	 * 		&lt;/Panel&gt;
	 * 	&lt;/f:items&gt;
	 * &lt;/f:GridContainer&gt;
	 * </pre>
	 *
	 * <h3>Drag and drop:</h3>
	 * Drag and drop is enabled for the <code>GridContainer</code> with enhanced visualization and interaction, better suited for grid items. This is configured by using the <code>{@link sap.f.dnd.GridDropInfo}</code>.
	 *
	 * Similar to the <code>{@link sap.ui.core.dnd.DropInfo}</code>, <code>{@link sap.f.dnd.GridDropInfo}</code> has to be added to the <code>dragDropConfig</code> aggregation, by using <code>{@link sap.ui.core.Element#addDragDropConfig}</code>.
	 *
	 * Both <code>{@link sap.ui.core.dnd.DropInfo}</code> and <code>{@link sap.f.dnd.GridDropInfo}</code> can be used to configure drag and drop.
	 * The difference is that the <code>{@link sap.f.dnd.GridDropInfo}</code> will provide a drop indicator, which mimics the size of the dragged item and shows the potential drop position inside the grid.
	 *
	 * @see {@link topic:cca5ee5d63ca44c89318f8496a58f9f2 Grid Container}
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 * @see {@link topic:5b46b03f024542ba802d99d67bc1a3f4 Cards}
	 * @see {@link sap.f.dnd.GridDropInfo}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @since 1.65
	 * @public
	 * @constructor
	 * @alias sap.f.GridContainer
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainer = Control.extend("sap.f.GridContainer", /** @lends sap.f.GridContainer.prototype */ {
		metadata: {
			library: "sap.f",
			interfaces: [
				"sap.f.dnd.IGridDroppable"
			],
			properties: {

				/**
				 * Defines the width of the control.
				 *
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""},

				/**
				 * Defines the minimum height of the grid.
				 *
				 * Allows an empty grid to be available as a drop target.
				 *
				 * @experimental As of version 1.81 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release.
				 */
				minHeight: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "2rem"},

				/**
				 * If set to <code>true</code> the current range (large, medium or small) is defined by the size of the
				 * container surrounding the <code>GridContainer</code>, instead of the device screen size (media Query).
				 */
				containerQuery: { type: "boolean", group: "Behavior", defaultValue: false },

				/**
				 * Should the items stretch to fill the rows that they occupy, or not.
				 *
				 * If set to <code>true</code> the items will stretch.
				 */
				snapToRow: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Increases the density when arranging the items. Smaller items will take up all of the available space, ignoring their order.
				 *
				 * <b>Note:</b> The order of the items is ignored. An item which is normally at the bottom, can appear on top.
				 *
				 * @experimental As of version 1.66 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				allowDenseFill: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Makes the grid items act like an inline-block elements. They will be arranged in rows with height equal to the highest item in the row.
				 *
				 * <b>Note:</b> If set to <code>true</code> the properties <code>rowSize</code> for grid layout, and <code>minRows</code> and <code>rows</code> per item will be ignored.
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 *
				 * @experimental As of version 1.66 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				inlineBlockLayout: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * The items contained by the control.
				 */
				items: {type: "sap.ui.core.Control", multiple: true, singularName: "item", dnd: true },

				/**
				 * The sap.f.GridContainerSettings applied if no settings are provided for a specific size.
				 *
				 * If no layout is given, a default layout will be used. See the default values for <code>sap.f.GridContainerSettings</code>.
				 *
				 * <b>Note:</b> It is not possible to reuse the same instance of <code>GridContainerSettings</code> for several layouts. New instance has to be created for each of them. This is caused by the fact that one object can exist in only a single aggregation.
				 */
				layout: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "XS". Range: up to 374px.
				 * @experimental As of version 1.71 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				layoutXS: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "S". Range: 375px - 599px.
				 */
				layoutS: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "M". Range: 600px - 1023px.
				 */
				layoutM: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "L". Range: 1023px - 1439px.
				 */
				layoutL: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "XL". Range: from 1440px.
				 */
				layoutXL: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * Default sap.f.GridContainerSettings
				 */
				_defaultLayout: { type: "sap.f.GridContainerSettings", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Fired when the currently active GridSettings change.
				 */
				layoutChange: {
					parameters: {

						/**
						 * The name of the newly active layout.
						 */
						layout: { type: "string" }
					}
				},
				/**
				 * Fires if the border of the visualizations is reached
				 * so that an application can react on this.
				 */
				borderReached: {
					parameters: {

						/**
						 * Event that leads to the focus change.
						 */
						event: { type: "jQuery.Event" }
					}
				}
			},
			dnd: { draggable: false, droppable: true }
		}
	});

	/**
	 * Allow detection of changes in items, in order to optimize (avoid re-rendering) when items are rearranged.
	 * @see {@link topic:7cdff73f308b4b10bdf7d83b7aba72e7 Extended Change Detection}
	 * @type {boolean}
	 * @private
	 */
	GridContainer.prototype.bUseExtendedChangeDetection = true;

	/**
	 * Gets the <code>GridContainerSettings</code> for the current layout breakpoint.
	 * @public
	 * @returns {sap.f.GridContainerSettings} The settings for the current layout
	 */
	GridContainer.prototype.getActiveLayoutSettings = function () {
		var oSettings = this.getAggregation(this._sActiveLayout);

		if (!oSettings && this._sActiveLayout === "layoutXS") {
			// if XS is not define, apply the S settings to stay backward compatible
			oSettings = this.getAggregation("layoutS");
		}

		if (!oSettings) {
			oSettings = this.getAggregation("layout")
				|| this.getAggregation("_defaultLayout");
		}

		return oSettings;
	};

	/**
	 * Handler for onBeforeRendering for each item.
	 * @private
	 */
	GridContainer.prototype._onBeforeItemRendering = function () {
		var oContainer = this.getParent();

		// The item just became invisible. In such cases there won't be _onAfterItemRendering,
		// so we have to to schedule the polyfill here.
		if (oContainer._reflectItemVisibilityToWrapper(this) && !isGridSupportedByBrowser()) {
			oContainer._scheduleIEPolyfill();
		}
	};

	/**
	 * Handler for onAfterRendering for each item.
	 * @private
	 */
	GridContainer.prototype._onAfterItemRendering = function () {

		var container = this.getParent(),
			oFocusDomRef;

		if (container._hasOwnVisualFocus(this)) {
			oFocusDomRef = this.getFocusDomRef();

			// remove the focus DOM ref from the tab chain
			oFocusDomRef.setAttribute("tabindex", -1);
			oFocusDomRef.tabIndex = -1;
		}

		// register resize listener for that item only once
		if (!container._resizeListeners[this.getId()]) {
			container._resizeListeners[this.getId()] = ResizeHandler.register(this, container._resizeItemHandler);
		}

		container._setItemNavigationItems();

		if (!isGridSupportedByBrowser()) {
			container._scheduleIEPolyfill();
			return;
		}

		container._applyItemAutoRows(this);
	};


	/**
	 * Reflects "visible" behavior of the control to the wrapper element - sapFGridContainerItemWrapper.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oItem The control of which we will check "visible" property.
	 * @returns {boolean} Whether the wrapper turned to invisible. Needed to judge whether to trigger IE polyfill.
	 */
	GridContainer.prototype._reflectItemVisibilityToWrapper = function (oItem) {

		var oItemWrapper = this._getItemWrapper(oItem),
			$oItemWrapper;

		if (!oItemWrapper) {
			return false;
		}

		$oItemWrapper = jQuery(oItemWrapper);

		// check if we actually change something. Needed to judge whether to trigger IE polyfill.
		if (oItem.getVisible() && $oItemWrapper.hasClass("sapFGridContainerInvisiblePlaceholder")) {
			$oItemWrapper.removeClass("sapFGridContainerInvisiblePlaceholder");
		} else if (!oItem.getVisible() && !$oItemWrapper.hasClass("sapFGridContainerInvisiblePlaceholder")) {
			$oItemWrapper.addClass("sapFGridContainerInvisiblePlaceholder");
			return true;
		}

		return false;
	};

	/**
	 * Handler for any change in the items aggregation.
	 * @private
	 * @param {object} changes What was changed
	 */
	GridContainer.prototype._onItemChange = function (changes) {
		if (changes.name !== "items" || !changes.child) {
			return;
		}

		if (changes.mutation === "insert") {
			changes.child.addEventDelegate(this._itemDelegate, changes.child);
		} else if (changes.mutation === "remove") {
			changes.child.removeEventDelegate(this._itemDelegate, changes.child);
		}
	};

	/**
	 * Removes any resize listeners. Both for the grid and for all items.
	 * @private
	 */
	GridContainer.prototype._deregisterResizeListeners = function () {
		var key,
			id;

		for (key in this._resizeListeners) {
			id = this._resizeListeners[key];
			ResizeHandler.deregister(id);
		}

		delete this._resizeListeners;
		Device.resize.detachHandler(this._resizeDeviceHandler);
	};

	/**
	 * Sets the DOM references for the items navigation.
	 * @private
	 */
	GridContainer.prototype._setItemNavigationItems = function () {
		if (!this._isRenderingFinished) {
			return;
		}
		var that = this,
			aWrapperItemsDomRef = [];

		//Initialize the ItemNavigation
		if (!that._oItemNavigation) {
			that._oItemNavigation = new ItemNavigation()
				.setCycling(false)
				.attachEvent(ItemNavigation.Events.FocusLeave, this._onItemNavigationFocusLeave, this)
				.attachEvent(ItemNavigation.Events.BorderReached, this._onItemNavigationBorderReached, this)
				.setDisabledModifiers({
					sapnext : ["alt", "meta", "ctrl"],
					sapprevious : ["alt", "meta", "ctrl"]
				})
				.setFocusedIndex(0);

			that.addDelegate(this._oItemNavigation);
		}

		that.$().children().map(function (iIndex, oWrapperItem) {
			if (oWrapperItem.getAttribute("class").indexOf("sapFGridContainerItemWrapper") > -1) {
				aWrapperItemsDomRef.push(oWrapperItem);
			}
		});

		that._oItemNavigation.setRootDomRef(that.getDomRef());
		that._oItemNavigation.setItemDomRefs(aWrapperItemsDomRef);
	};

	GridContainer.prototype._onItemNavigationFocusLeave = function (oEvent) {
		var currentFocused = this._oItemNavigation.getFocusedDomRef();
		this._oItemNavigation.getItemDomRefs().forEach(function (item, index) {
			if (currentFocused === item ) {
				var nextFocusableIndex = index++;
				this._oItemNavigation.setFocusedIndex(nextFocusableIndex);
			}
		}.bind(this));

		this._oItemNavigationFocusLeft = true;
	};

	/**
	 * Detects what is the current layout breakpoint.
	 * @private
	 * @returns {boolean} True if the layout settings were changed.
	 */
	GridContainer.prototype._detectActiveLayout = function () {
		var iWidth = (this.getContainerQuery() && this.getDomRef()) ? this._getComputedWidth() : Device.resize.width,
			oRange = Device.media.getCurrentRange("GridContainerRangeSet", iWidth),
			sLayout = "layout" + oRange.name,
			oOldSettings = this.getActiveLayoutSettings(),
			bSettingsAreChanged = false;

		if (!iWidth) {
			// width is 0 or unknown - can not detect the layout
			return false;
		}

		if (this._sActiveLayout !== sLayout) {
			this.addStyleClass("sapFGridContainer" + capitalize(sLayout));
			if (this._sActiveLayout) { // remove old layout class if any
				this.removeStyleClass("sapFGridContainer" + capitalize(this._sActiveLayout));
			}

			this._sActiveLayout = sLayout;
			bSettingsAreChanged = oOldSettings !== this.getActiveLayoutSettings();

			this.fireLayoutChange({
				layout: this._sActiveLayout
			});
		}

		return bSettingsAreChanged;
	};

	/**
	 * Gets a map of the CSS styles that should be applied to the grid, based on the current layout.
	 * @private
	 * @returns {object} The current CSS styles
	 */
	GridContainer.prototype._getActiveGridStyles = function () {
		var oSettings = this.getActiveLayoutSettings(),
			sColumns = oSettings.getColumns() || "auto-fill",
			sColumnSize = oSettings.getColumnSize(),
			sMinColumnSize = oSettings.getMinColumnSize(),
			sMaxColumnSize = oSettings.getMaxColumnSize(),
			mStyles = {
				"grid-gap": oSettings.getGap()
			};

		if (sMinColumnSize && sMaxColumnSize) {
			mStyles["grid-template-columns"] = "repeat(" + sColumns + ", minmax(" + sMinColumnSize + ", " + sMaxColumnSize + "))";
		} else {
			mStyles["grid-template-columns"] = "repeat(" + sColumns + ", " + sColumnSize + ")";
		}

		if (this.getInlineBlockLayout()) {
			mStyles["grid-auto-rows"] = "min-content";
		} else {
			mStyles["grid-auto-rows"] = oSettings.getRowSize();
		}

		return mStyles;
	};

	/**
	 * Initialization hook.
	 * @private
	 */
	GridContainer.prototype.init = function () {
		this._oRb  = Core.getLibraryResourceBundle("sap.f");
		this.setAggregation("_defaultLayout", new GridContainerSettings());

		this._initRangeSet();

		this._resizeListeners = {};
		this._oItemNavigation = null;
		this._itemDelegate = {
			onBeforeRendering: this._onBeforeItemRendering,
			onAfterRendering: this._onAfterItemRendering
		};

		this._itemsObserver = new ManagedObjectObserver(this._onItemChange.bind(this));
		this._itemsObserver.observe(this, {aggregations: ["items"]});

		this._resizeHandler = this._resize.bind(this);
		this._resizeDeviceHandler = this._resizeDevice.bind(this);

		Device.resize.attachHandler(this._resizeDeviceHandler);

		this._resizeItemHandler = this._resizeItem.bind(this);

		if (!isGridSupportedByBrowser()) {
			this._attachDndPolyfill();
		}
	};

	/**
	 * Inserts an item into the aggregation named <code>items</code>.
	 *
	 * @param {sap.ui.core.Item} oItem The item to be inserted; if empty, nothing is inserted.
	 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
	 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
	 *             greater than the current size of the aggregation, the item is inserted at the last position.
	 * @returns {sap.f.GridContainer} <code>this</code> to allow method chaining.
	 * @public
	 */
	GridContainer.prototype.insertItem = function (oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex, true);

		if (!this.getDomRef() || !isGridSupportedByBrowser() || !oItem.getVisible()) {
			// if not rendered, not supported or an invisible item - we need to invalidate
			this.invalidate();
			return this;
		}

		var oRm = Core.createRenderManager(),
			oWrapper = this._createItemWrapper(oItem),
			oNextItem = this._getItemAt(iIndex + 1),
			oGridRef = this.getDomRef();

		if (oNextItem) {
			oGridRef.insertBefore(oWrapper, this._getItemWrapper(oNextItem));
		} else {
			oGridRef.insertBefore(oWrapper, oGridRef.lastChild);
		}

		oItem.addStyleClass("sapFGridContainerItemInnerWrapper");
		oRm.render(oItem, oWrapper);
		oRm.destroy();

		return this;
	};

	/**
	 * Removes an item from the aggregation named <code>items</code>.
	 *
	 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or ID.
	 * @returns {sap.ui.core.Control} The removed item or null.
	 * @public
	 */
	GridContainer.prototype.removeItem = function (vItem) {
		var oRemovedItem = this.removeAggregation("items", vItem, true),
			oGridRef = this.getDomRef(),
			oItemRef = oRemovedItem.getDomRef();

		if (!oGridRef || !oItemRef || !isGridSupportedByBrowser()) {
			this.invalidate();
			return oRemovedItem;
		}

		// remove the item's wrapper from DOM
		oGridRef.removeChild(oItemRef.parentElement);

		return oRemovedItem;
	};

	/**
	 * Before rendering hook.
	 * @private
	 */
	GridContainer.prototype.onBeforeRendering = function () {
		this._detectActiveLayout();

		var resizeListenerId = this._resizeListeners[this.getId()];
		if (resizeListenerId) {
			ResizeHandler.deregister(resizeListenerId);
		}

		this._isRenderingFinished = false;
	};

	/**
	 * After rendering hook.
	 * @private
	 */
	GridContainer.prototype.onAfterRendering = function () {
		this._resizeListeners[this.getId()] = ResizeHandler.register(this.getDomRef(), this._resizeHandler);

		this._isRenderingFinished = true;

		this._setItemNavigationItems();
		this._applyLayout(true);
	};

	/**
	 * Destroy hook.
	 * @private
	 */
	GridContainer.prototype.exit = function () {
		this._deregisterResizeListeners();

		if (this._itemsObserver) {
			this._itemsObserver.disconnect();
			delete this._itemsObserver;
		}

		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
			this._oItemNavigation = null;
		}

		if (!isGridSupportedByBrowser()) {
			this._detachDndPolyfill();
		}
	};

	/**
	 * Initializes the specific Device.media range set for <code>GridContainer</code>.
	 */
	GridContainer.prototype._initRangeSet = function () {
		if (!Device.media.hasRangeSet("GridContainerRangeSet")) {
			Device.media.initRangeSet("GridContainerRangeSet", [375, 600, 1024, 1440], "px", ["XS", "S", "M", "L", "XL"]);
		}
	};

	/**
	 * Handler for resize of the grid
	 * @private
	 */
	GridContainer.prototype._resize = function () {
		if (!this._isWidthChanged()) {
			return;
		}

		var bSettingsAreChanged = this._detectActiveLayout();
		this._applyLayout(bSettingsAreChanged);
	};

	/**
	 * Handler for resize of the viewport
	 * @private
	 */
	GridContainer.prototype._resizeDevice = function () {
		if (!this.getContainerQuery()) {
			this._resize();
		}
	};

	/**
	 * Checks if the width of the grid or the viewport is different from the last time when it was checked.
	 * Use to avoid resize handling when not needed.
	 * @private
	 * @returns {boolean} True if the width of the grid or of the viewport is changed since last check.
	 */
	GridContainer.prototype._isWidthChanged = function () {
		var iGridWidth = this._getComputedWidth(),
			iViewportWidth = Device.resize.width;

		if (this._lastGridWidth === iGridWidth && this._lastViewportWidth === iViewportWidth) {
			return false;
		}

		this._lastGridWidth = iGridWidth;
		this._lastViewportWidth = iViewportWidth;
		return true;
	};

	/**
	 * Gets the current computed width of the grid.
	 * @private
	 * @returns {int|null} The width in px. Null if the grid is not yet rendered.
	 */
	GridContainer.prototype._getComputedWidth = function () {
		if (!this.getDomRef()) {
			return null;
		}

		return this.getDomRef().getBoundingClientRect().width;
	};

	/**
	 * Handler for resize of a grid's item.
	 * @private
	 * @param {Object} oEvent ResizeHandler resize event
	 */
	GridContainer.prototype._resizeItem = function (oEvent) {
		if (!isGridSupportedByBrowser()) {
			// don't re-arrange the items if currently dragging one of the items from this container in another container
			if (!this._bDraggingInAnotherContainer) {
				this._scheduleIEPolyfill();
			}

			this._bDraggingInAnotherContainer = false;
			return;
		}

		this._applyItemAutoRows(oEvent.control);
	};

	/**
	 * Applies the current layout to the grid DOM element.
	 * @private
	 * @param {boolean} bSettingsAreChanged Are the grid settings changed after passing a breakpoint.
	 */
	GridContainer.prototype._applyLayout = function (bSettingsAreChanged) {
		if (!this._isRenderingFinished) {
			return;
		}

		if (!isGridSupportedByBrowser()) {
			this._scheduleIEPolyfill(bSettingsAreChanged);
			return;
		}

		if (bSettingsAreChanged) {
			this.$().css(this._getActiveGridStyles());
			this.getItems().forEach(this._applyItemAutoRows.bind(this));
		}

		this._enforceMaxColumns();
	};

	/**
	 * Increase rows span for item if it needs more space, based on it's height.
	 * @private
	 * @param {sap.ui.core.Control} oItem The item for which to calculate
	 */
	GridContainer.prototype._applyItemAutoRows = function (oItem) {
		if (!this._isRenderingFinished) {
			return;
		}

		if (this.getInlineBlockLayout()) {
			return;
		}

		if (hasItemAutoHeight(oItem)) {
			var $item = oItem.$(),
				oSettings = this.getActiveLayoutSettings(),
				iRows = oSettings.calculateRowsForItem($item.outerHeight());

			if (!iRows) {
				// if the rows can not be calculated correctly, don't do anything
				return;
			}

			$item.parent().css({
				'grid-row': 'span ' + Math.max(iRows, getItemRowCount(oItem))
			});
		}
	};

	/**
	 * If one item has more columns than the total columns in the grid, it brakes the whole layout.
	 * Prevent this by reducing this item's column span.
	 * @private
	 */
	GridContainer.prototype._enforceMaxColumns = function () {
		var oSettings = this.getActiveLayoutSettings(),
			iMaxColumns = oSettings.getComputedColumnsCount(this.$().innerWidth());

		if (!iMaxColumns) {
			// if the max columns can not be calculated correctly, don't do anything
			return;
		}

		this.getItems().forEach(function(oItem) {
			// if item has more columns than total columns, it brakes the whole layout
			oItem.$().parent().css("grid-column", "span " + Math.min(getItemColumnCount(oItem), iMaxColumns));
		});
	};

	/**
	 * Gets the item at specified index.
	 * @param {int} iIndex Which item to get
	 * @return {sap.ui.core.Control|null} The item at the specified index. <code>null</code> if index is out of range.
	 */
	GridContainer.prototype._getItemAt = function (iIndex) {
		var aItems = this.getItems(),
			oTarget;

		if (iIndex < 0) {
			iIndex = 0;
		}

		if (aItems.length && aItems[iIndex]) {
			oTarget = aItems[iIndex];
		}

		return oTarget;
	};

	/**
	 * Creates a wrapper div for the given item.
	 * @param {sap.ui.core.Control} oItem The item
	 * @return {HTMLElement} The created wrapper
	 */
	GridContainer.prototype._createItemWrapper = function (oItem) {
		var mStylesInfo = GridContainerRenderer.getStylesForItemWrapper(oItem, this),
			mStyles = mStylesInfo.styles,
			aClasses = mStylesInfo.classes,
			oWrapper = document.createElement("div");
			oWrapper.setAttribute("tabindex", "0");

		mStyles.forEach(function (sValue, sKey) {
			oWrapper.style.setProperty(sKey, sValue);
		});

		aClasses.forEach(function (sValue) {
			oWrapper.classList.add(sValue);
		});

		return oWrapper;
	};

	/**
	 * ===================== IE11 Polyfill =====================
	 */

	/**
	 * Schedules the application of the IE polyfill for the next tick.
	 * @private
	 * @param {boolean} bImmediately If set to true - apply the polyfill immediately.
	 */
	GridContainer.prototype._scheduleIEPolyfill = function (bImmediately) {
		if (this._iPolyfillCallId) {
			clearTimeout(this._iPolyfillCallId);
		}

		if (bImmediately) {
			this._applyIEPolyfillLayout();
			return;
		}

		this._iPolyfillCallId = setTimeout(this._applyIEPolyfillLayout.bind(this), 0);
	};

	/**
	 * Calculates absolute positions for items, so it mimics a css grid.
	 * @private
	 */
	GridContainer.prototype._applyIEPolyfillLayout = function () {
		if (!this._isRenderingFinished) {
			return;
		}

		if (this.bIsDestroyed) {
			return;
		}

		var $that = this.$(),
			innerWidth = $that.innerWidth(),
			oSettings = this.getActiveLayoutSettings(),
			columnSize = oSettings.getMinColumnSizeInPx() || oSettings.getColumnSizeInPx(),
			rowSize = oSettings.getRowSizeInPx(),
			gapSize = oSettings.getGapInPx(),
			columnsCount = oSettings.getComputedColumnsCount(innerWidth),
			topOffset = parseInt($that.css("padding-top").replace("px", "")),
			leftOffset = parseInt($that.css("padding-left").replace("px", "")),
			items = this.getItems();

		if (!columnSize || !rowSize) {
			return;
		}

		if (!items.length) {
			return;
		}

		var virtualGrid = new VirtualGrid();
		virtualGrid.init({
			numberOfCols: Math.max(1, columnsCount),
			cellWidth: columnSize,
			cellHeight: rowSize,
			unitOfMeasure: "px",
			gapSize: gapSize,
			topOffset: topOffset ? topOffset : 0,
			leftOffset: leftOffset ? leftOffset : 0,
			allowDenseFill: this.getAllowDenseFill(),
			rtl: isRtl,
			width: innerWidth
		});

		var i,
			k,
			item,
			$item,
			columns,
			rows,
			aFittedElements = [];

		var fnInsertPolyfillDropIndicator = function (iKId) {
			virtualGrid.fitElement(
				iKId + '',
				this._polyfillDropIndicator.columns || oSettings.calculateColumnsForItem(Math.round(this._polyfillDropIndicator.width)),
				this._polyfillDropIndicator.rows || oSettings.calculateRowsForItem(Math.round(this._polyfillDropIndicator.height))

			);
			aFittedElements.push({
				id: iKId + '',
				domRef: this._polyfillDropIndicator.domRef
			});
		}.bind(this);

		for (i = 0, k = 0; i < items.length; i++) {

			if (this._polyfillDropIndicator && this._polyfillDropIndicator.insertAt === i) {
				fnInsertPolyfillDropIndicator(k);
				k++;
			}

			item = items[i];
			$item = item.$();

			if (!$item.is(":visible")) {
				continue;
			}

			columns = getItemColumnCount(item);

			if (hasItemAutoHeight(item)) {
				rows = this._calcAutoRowsForPolyfill(item, oSettings);
			} else {
				rows = getItemRowCount(item);
			}

			virtualGrid.fitElement(k + '', columns, rows);
			aFittedElements.push({
				id: k + '',
				domRef: $item.parent()
			});
			k++;
		}

		if (this._polyfillDropIndicator && this._polyfillDropIndicator.insertAt >= items.length) {
			fnInsertPolyfillDropIndicator(items.length);
		}

		virtualGrid.calculatePositions();

		aFittedElements.forEach(function (oFittedElement) {

			var virtualGridItem = virtualGrid.getItems()[oFittedElement.id];

			oFittedElement.domRef.css({
				position: 'absolute',
				top: virtualGridItem.top,
				left: virtualGridItem.left,
				width: virtualGridItem.width,
				height: virtualGridItem.height
			});
		});

		// width and height has to be set for the grid because the items inside are absolute positioned and the grid will not have dimensions
		$that.css("height", virtualGrid.getHeight() + "px");

		if (!this.getWidth() && oSettings.getColumns()) {
			// use virtual grid width only if grid width is not specified and we know the columns count
			if (!this.getContainerQuery()) {
				// centering GridContainer in IE11 when containerQuery is set to true doesn't work
				$that.css("width", virtualGrid.getWidth() + "px");
			}
		}
	};

	/**
	 * Calculates rows count for item depending on its height.
	 * @param {sap.ui.core.Control} oItem The item to calculate for
	 * @param {sap.f.GridContainerSettings} oGridSettings The current grid settings
	 * @returns {int} The number of rows which the item should have
	 * @private
	 */
	GridContainer.prototype._calcAutoRowsForPolyfill = function (oItem, oGridSettings) {
		var $item = oItem.$(),
			iItemHeight,
			iRows;

		// height is explicitly set to 100% for analytical card
		// so we need to use the scrollHeight for it
		if ($item.hasClass("sapFCardAnalytical")) {
			iItemHeight = $item[0].scrollHeight;
		} else {
			iItemHeight = $item.outerHeight();
		}

		iRows = Math.max(
			oGridSettings.calculateRowsForItem(iItemHeight),
			getItemRowCount(oItem)
		);

		return iRows;
	};

	/**
	 * Implements polyfill for IE after drag over.
	 * @param {Object} oEvent After drag over event
	 * @private
	 */
	GridContainer.prototype._polyfillAfterDragOver = function (oEvent) {
		var $indicator = oEvent.getParameter("indicator");

		this._polyfillDropIndicator = {
			rows: oEvent.getParameter("rows"),
			columns: oEvent.getParameter("columns"),
			width: oEvent.getParameter("width"),
			height: oEvent.getParameter("height"),
			domRef: $indicator,
			insertAt: oEvent.getParameter("indicatorIndex")
		};

		this._scheduleIEPolyfill();
	};

	/**
	 * Implements polyfill for IE after drag end.
	 * @param {Object} oEvent After drag end event
	 * @private
	 */
	GridContainer.prototype._polyfillAfterDragEnd = function (oEvent) {
		this._polyfillDropIndicator = null;
	};

	/**
	 * Implements polyfill for IE after the item is dragged to another container.
	 * @private
	 */
	GridContainer.prototype._polyfillDraggingInAnotherContainer = function () {
		this._bDraggingInAnotherContainer = true;
	};

	/**
	 * Attaches polyfill methods for drag and drop for IE.
	 * @private
	 */
	GridContainer.prototype._attachDndPolyfill = function () {
		this.attachEvent("_gridPolyfillAfterDragOver", this._polyfillAfterDragOver, this);
		this.attachEvent("_gridPolyfillAfterDragEnd", this._polyfillAfterDragEnd, this);
		this.attachEvent("_gridPolyfillDraggingInAnotherContainer", this._polyfillDraggingInAnotherContainer, this);
	};

	/**
	 * Detaches polyfill methods for drag and drop for IE.
	 * @private
	 */
	GridContainer.prototype._detachDndPolyfill = function () {
		this.detachEvent("_gridPolyfillAfterDragOver", this._polyfillAfterDragOver, this);
		this.detachEvent("_gridPolyfillAfterDragEnd", this._polyfillAfterDragEnd, this);
		this.detachEvent("_gridPolyfillDraggingInAnotherContainer", this._polyfillDraggingInAnotherContainer, this);
	};

	/**
	 * Forward tab before or after GridContainer
	 *
	 * @see sap.f.GridContainer#onsaptabnext
	 * @see sap.f.GridContainer#onsaptabprevious
	 * @since 1.78
	 * @protected
	 */
	GridContainer.prototype.forwardTab = function(bForward) {
		this.$(bForward ? "after" : "before").focus();
	};

	/**
	 * Forward tab to next focusable element inside GridContainer or out of it
	 * This function should be called before tab key is pressed
	 *
	 * @since 1.78
	 * @protected
	 */
	GridContainer.prototype.onsaptabnext = function(oEvent) {
		if (!this._oItemNavigation) {
			return;
		}

		// get the last focused element from the ItemNavigation
		var aNavigationDomRefs = this._oItemNavigation.getItemDomRefs(),
			iLastFocusedIndex = this._oItemNavigation.getFocusedIndex(),
			$LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]),
			Tabbables = [];

		// Tabbable elements in wrapper
		var $AllTabbables = $LastFocused.find(":sapTabbable");

		//leave only real tabbable elements in the tab chain, GridContainer and List types have dummy areas
		$AllTabbables.map(function (index, element) {
			if (element.className.indexOf("DummyArea") === -1) {
				Tabbables.push(element);
			}
		});

		var $Tabbables = jQuery(Tabbables),
			focusableIndex = $Tabbables.length === 1 ? 0 : $Tabbables.length  - 1;

		if (focusableIndex === -1 ||
			($Tabbables.control(focusableIndex) && $Tabbables.control(focusableIndex).getId() === oEvent.target.id)) {
			this._lastFocusedElement = oEvent.target;
			this.forwardTab(true);
		}
	};

	/**
	* Forward tab to the previous focusable element inside GridContainer or out of it
	* This function should be called before shift + tab key is pressed
	*
	* @since 1.78
	* @protected
	*/
	GridContainer.prototype.onsaptabprevious = function(oEvent) {
		if (!this._isItemWrapper(oEvent.target)) {
			this._lastFocusedElement = oEvent.target;
			return;
		}

		var sTargetId = oEvent.target.id;
		if (sTargetId === this.getId("nodata")) {
			this.forwardTab(false);
		} else if (sTargetId === this.getId("trigger")) {
			this.focusPrevious();
			oEvent.preventDefault();
		}

		// SHIFT + TAB out of the GridContainer should focused the last focused grid cell
		this._lastFocusedElement = null;
		this.forwardTab(false);
	};


	/**
	 * Handles the <code>onmousedown</code> event.
	 *
	 */
	GridContainer.prototype.onmousedown = function(oEvent) {
		this._bIsMouseDown = true;
	};

	/**
	 * Handles the <code>mouseup</code> event.
	 *
	 */
	GridContainer.prototype.onmouseup = function(oEvent) {

		var $listItem = jQuery(oEvent.target).closest('.sapFGridContainerItemWrapperNoVisualFocus'),
			oControl;

		if ($listItem.length) {
			oControl = $listItem.children().eq(0).control()[0];

			// if the list item visual focus is displayed by the currently focused control,
			// move the focus to the list item
			if (oControl && oControl.getFocusDomRef() === document.activeElement) {
				this._lastFocusedElement = null;
				$listItem.focus();
				doVirtualFocusin(oControl);
			}
		}

		this._bIsMouseDown = false;
	};

	/**
	 * Handles the <code>focusin</code> event.
	 *
	 * Handles when it is needed to return focus to correct place
	 */
	GridContainer.prototype.onfocusin = function(oEvent) {
		var $listItem = jQuery(oEvent.target).closest('.sapFGridContainerItemWrapperNoVisualFocus'),
			oControl,
			aNavigationDomRefs,
			lastFocusedIndex;

		if ($listItem.length) {
			oControl = $listItem.children().eq(0).control()[0];

			if (oControl) {
				doVirtualFocusin(oControl);

				// if the list item visual focus is displayed by the currently focused control,
				// move the focus to the list item
				if (!this._bIsMouseDown && oControl.getFocusDomRef() === oEvent.target) {
					this._lastFocusedElement = null;
					$listItem.focus();
					return;
				}
			}
		}

		if (oEvent.target.classList.contains("sapFGridContainerItemWrapper")) {
			this._lastFocusedElement = null;
		}

		if (this._oItemNavigationFocusLeft) {
			this._oItemNavigationFocusLeft = false;

			aNavigationDomRefs = this._oItemNavigation.getItemDomRefs();
			lastFocusedIndex = this._oItemNavigation.getFocusedIndex();

			if (this._lastFocusedElement) {
				this._lastFocusedElement.focus();
			} else {
				aNavigationDomRefs[lastFocusedIndex].focus();
			}
		}
	};

	/**
	 * Fires when border is reached of the <code>sap.f.GridContainer</code>.
	 * @param {sap.ui.base.Event|jQuery.Event} oEvent The event object
	 */
	GridContainer.prototype._onItemNavigationBorderReached = function (oEvent) {
		this.fireEvent("borderReached", {
			event: oEvent instanceof jQuery.Event ? oEvent : oEvent.getParameter("event")
		});
	};

	/**
	 * Handles the <code>onsapnext</code> event. Sets the focus to the next item in the current container.
	 * If the event is triggered by <code>ARROW_DOWN</code>, custom logic is applied to focus the item below and propagation to the ItemNavigation is stopped.
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridContainer.prototype.onsapnext = function (oEvent) {
		var aItemDomRefs = this._oItemNavigation.getItemDomRefs();

		if (aItemDomRefs.indexOf(oEvent.target) === -1) {
			oEvent.stopImmediatePropagation(true);
		}

		var oItem = jQuery(oEvent.target.firstElementChild).control(0);

		if (oEvent.keyCode === KeyCodes.ARROW_DOWN) {
			oEvent.stopImmediatePropagation(true);
			var oNextFocusItem = this._getClosestItemBelowInThisContainer(oItem);

			if (oNextFocusItem) {
				this._getItemWrapper(oNextFocusItem).focus();
			} else {
				this._onItemNavigationBorderReached(oEvent);
			}
		}
	};

	/**
	 * Handles the <code>onsapprevious</code> event. Sets the focus to the previous item in the current container.
	 * If the event is triggered by <code>ARROW_UP</code>, custom logic is applied to focus the item above and propagation to the ItemNavigation is stopped.
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridContainer.prototype.onsapprevious = function (oEvent) {
		var aItemDomRefs = this._oItemNavigation.getItemDomRefs();

		if (aItemDomRefs.indexOf(oEvent.target) === -1) {
			oEvent.stopImmediatePropagation(true);
		}

		var oItem = jQuery(oEvent.target.firstElementChild).control(0);

		if (oEvent.keyCode === KeyCodes.ARROW_UP) {
			oEvent.stopImmediatePropagation(true);
			var oNextFocusItem = this._getClosestItemAboveInThisContainer(oItem);

			if (oNextFocusItem) {
				this._getItemWrapper(oNextFocusItem).focus();
			} else {
				this._onItemNavigationBorderReached(oEvent);
			}
		}
	};

	/**
	 * Keyboard handling of [keydown], [keyup], [enter], [space] keys
	 * Stops propagation to avoid triggering the listeners for the same keys of the parent control (the AnchorBar)
	 */
	["onkeypress", "onkeyup", "onkeydown", "onsapenter", "onsapselect", "onsapspace"].forEach(function (sName) {
		GridContainer.prototype[sName] = function (oEvent) {
			if (!this._isItemWrapper(oEvent.target)) {
				return;
			}

			if (sName === "onsapspace") {
				// prevent page scrolling
				oEvent.preventDefault();
			}

			var oItem = jQuery(oEvent.target.firstChild).control()[0];

			if (oItem) {
				var oFocusDomRef = oItem.getFocusDomRef(),
				oFocusControl = jQuery(oFocusDomRef).control()[0];

				if (oFocusControl && oFocusControl[sName]) {
					oFocusControl[sName].call(oFocusControl, oEvent);
				}
			}
		};
	});

	/**
	 * Returns if the control should display the grid item visual focus.
	 * @private
	 * @return {boolean} If the control should display the grid item visual focus
	 */
	GridContainer.prototype._hasOwnVisualFocus = function (oControl) {
		return aOwnVisualFocusControls.indexOf(oControl.getMetadata().getName()) > -1;
	};

	/**
	 * Handles moving of the items using the arrow keys. Calculates new position for the moved item.
	 * If moving is possible, calls <code>GridKeyboardDragAndDrop</code> to fire same events, which would be fired when performing drag and drop with mouse.
	 * @param {jQuery.Event} oEvent The event.
	 */
	GridContainer.prototype._moveItem = function (oEvent) {
		if (!this._isItemWrapper(oEvent.target)) {
			return;
		}

		var oItem = jQuery(oEvent.target.firstElementChild).control(0),
			iLength = this.getItems().length,
			iItemIndex = this.indexOfItem(oItem),
			iInsertAt = -1,
			oInsertAround = null,
			sDropPosition = "After";

		switch (oEvent.keyCode) {
			case KeyCodes.ARROW_RIGHT:
				iInsertAt = Core.getConfiguration().getRTL() ? iItemIndex - 1 : iItemIndex + 1;

				if (iInsertAt >= 0 && iInsertAt < iLength) {
					oInsertAround = this.getItems()[iInsertAt];
				}
				break;
			case KeyCodes.ARROW_LEFT:
				iInsertAt = Core.getConfiguration().getRTL() ? iItemIndex + 1 : iItemIndex - 1;

				if (iInsertAt >= 0 && iInsertAt < iLength) {
					oInsertAround = this.getItems()[iInsertAt];
				}
				break;
			case KeyCodes.ARROW_UP:
				oInsertAround = this._getClosestItemAbove(oItem);
				var oDropContainer = oInsertAround.getParent();

				if (this !== oDropContainer) {
					sDropPosition = "Before";
				}
				break;
			case KeyCodes.ARROW_DOWN:
				oInsertAround = this._getClosestItemBelow(oItem);
				if (this !== oInsertAround.getParent()) {
					sDropPosition = "Before";
				}
				break;
			default: break;
		}

		iInsertAt = this.indexOfItem(oInsertAround);

		if (!oInsertAround) {
			return;
		}

		// sap.m.ScrollEnablement scrolls every time Ctrl + arrow are pressed, so stop propagation here.
		oEvent.stopPropagation();

		if (this === oInsertAround.getParent() &&  iInsertAt < iItemIndex) {
			sDropPosition = "Before";
		}

		GridKeyboardDragAndDrop.fireDnDByKeyboard(oItem, oInsertAround, sDropPosition, oEvent);
		this._setItemNavigationItems();
	};

	/**
	 * Moves item for drag-and-drop keyboard handling
	 * Modifier + Right Arrow || Modifier + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	GridContainer.prototype.onsapincreasemodifiers = GridContainer.prototype._moveItem;

	/**
	 * Moves item for drag-and-drop keyboard handling
	 * Modifier + Left Arrow || Modifier + Arrow Down
	 * @param {jQuery.Event} oEvent
	 */
	GridContainer.prototype.onsapdecreasemodifiers = GridContainer.prototype._moveItem;

	GridContainer.prototype._getClosestItemBelowInThisContainer = function (oItem) {
		var aItemsBelow = this.getItems()
							.map(this._getItemWrapper)
							.filter(function (oWrapper) {
								return GridContainerUtils.isBelow(oItem, oWrapper);
							});

		// find the item which is closest to this one (shortest distance between the top left corners)
		var oClosestItem = GridContainerUtils.findClosest(oItem, aItemsBelow);

		if (oClosestItem) {
			return jQuery(oClosestItem.firstElementChild).control(0);
		}

		return null;
	};

	/**
	 * Searches for the closest item below the given one.
	 * Tries to find it in the same container first, if there is no success, all other GridContainers below are being searched.
	 * @param {sap.ui.core.Control} oItem The item.
	 * @returns {sap.ui.core.Control} The found item or null.
	 */
	GridContainer.prototype._getClosestItemBelow = function (oItem) {
		var oClosestItem = this._getClosestItemBelowInThisContainer(oItem);

		if (oClosestItem) {
			return oClosestItem;
		}

		var aItemsBelow = Array.from(document.querySelectorAll(".sapFGridContainerItemWrapper")).filter(function (oItemWrapperElement) {
			return GridContainerUtils.isBelow(oItem, oItemWrapperElement);
		});

		oClosestItem = GridContainerUtils.findClosest(oItem, aItemsBelow);

		if (oClosestItem) {
			return jQuery(oClosestItem.firstElementChild).control(0);
		}

		return null;
	};

	GridContainer.prototype._getClosestItemAboveInThisContainer = function (oItem) {
		var aItemsAbove = this.getItems()
							.map(this._getItemWrapper)
							.filter(function (oWrapper) {
								return GridContainerUtils.isAbove(oItem, oWrapper);
							});

		// find the item which is closest to this one (shortest distance between the top left corners)
		var oClosestItem = GridContainerUtils.findClosest(oItem, aItemsAbove);

		if (oClosestItem) {
			return jQuery(oClosestItem.firstElementChild).control(0);
		}

		return null;
	};

	/**
	 * Searches for the closest item above the given one.
	 * Tries to find it in the same container first, if there is no success, all other GridContainers above are being searched.
	 * @param {sap.ui.core.Control} oItem The item.
	 * @returns {sap.ui.core.Control} The found item or null.
	 */
	GridContainer.prototype._getClosestItemAbove = function (oItem) {
		// find the item which is closest to this one (shortest distance between the top left corners)
		var oClosestItem = this._getClosestItemAboveInThisContainer(oItem);

		if (oClosestItem) {
			return oClosestItem;
		}

		var aItemsAbove = Array.from(document.querySelectorAll(".sapFGridContainerItemWrapper")).filter(function (oItemWrapperElement) {
			return GridContainerUtils.isAbove(oItem, oItemWrapperElement);
		});

		oClosestItem = GridContainerUtils.findClosest(oItem, aItemsAbove);

		if (oClosestItem) {
			return jQuery(oClosestItem.firstElementChild).control(0);
		}

		return null;
	};

	/**
	 * Focuses the item on the given index. Should be called after successful drop operation.
	 *
	 * <b>Note:</b>Should not be called before the <code>GridContainer</code> has been rendered.
	 *
	 * @public
	 * @experimental Since 1.81. Behavior might change.
	 * @param {int} iIndex The index of the item, which will be focused.
	 */
	GridContainer.prototype.focusItem = function (iIndex) {
		var aItemDomRefs,
			oItemNavigation = this._oItemNavigation;

		this._setItemNavigationItems();

		aItemDomRefs = oItemNavigation.getItemDomRefs();

		if (aItemDomRefs[iIndex]) {
			// @todo fix the focus when adding a new item into an empty grid
			aItemDomRefs[iIndex].focus();
		}
	};

	GridContainer.prototype._isItemWrapper = function (oElement) {
		return oElement.classList.contains("sapFGridContainerItemWrapper");
	};

	GridContainer.prototype._getItemWrapper = function (oItem) {
		var oItemDomRef = oItem.getDomRef(),
			oInvisibleSpan;

		if (oItemDomRef) {
			return oItemDomRef.parentElement;
		}

		oInvisibleSpan = document.getElementById(InvisibleRenderer.createInvisiblePlaceholderId(oItem));

		if (oInvisibleSpan) {
			return oInvisibleSpan.parentElement;
		}

		return null;
	};

	return GridContainer;
});
