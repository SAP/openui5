/*!
 * ${copyright}
 */
sap.ui.define([
	"./GridContainerRenderer",
	"./GridContainerSettings",
	"./GridContainerUtils",
	"./GridNavigationMatrix",
	"./delegate/GridContainerItemNavigation",
	"./library",
	"./dnd/GridKeyboardDragAndDrop",
	"sap/base/strings/capitalize",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function (
	GridContainerRenderer,
	GridContainerSettings,
	GridContainerUtils,
	GridNavigationMatrix,
	GridContainerItemNavigation,
	library,
	GridKeyboardDragAndDrop,
	capitalize,
	ManagedObjectObserver,
	Control,
	Core,
	ResizeHandler,
	Device,
	KeyCodes,
	jQuery
) {
	"use strict";

	/**
	 * For these controls check if the grid item visual focus can be displayed from the control inside.
	 */
	var mOwnVisualFocusControls = {
		"sap.f.Card": function (oCard) {
			return oCard.getCardHeader() || oCard.getCardContent();
		},
		"sap.ui.integration.widgets.Card": function (oCard) {
			return oCard.getCardHeader() || oCard.getCardContent();
		},
		"sap.m.GenericTile": function () {
			return true;
		}
	};

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
	 * Drag and drop is enabled via keyboard using <code>Ctrl</code> + arrow keys (Windows) and <code>Control</code> + arrow keys (Mac OS).
	 *
	 * <h3>Keyboard Navigation:</h3>
	 * <code>GridContainer</code> provides support for two-dimensional keyboard navigation through its contained controls. Navigating up/down or left/right using the arrow keys follows the configurable two-dimensional grid mesh. This provides stable navigation paths in the cases when there are items of different sizes. When the user presses an arrow key in a direction outward of the <code>GridContainer</code>, a <code>borderReached</code> event will be fired. The implementation of the <code>borderReached</code> event allows the application developer to control where the focus goes, and depending on the surrounding layout pass the focus to a specific place in a neighboring <code>GridContainer</code> using the method {@link #focusItemByDirection}.
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
				 * Fired when the grid columns count is changed.
				 */
				columnsChange: {
					parameters: {

						/**
						 * The count of the gird columns.
						 */
						columns: { type: "int" }
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
						event: { type: "jQuery.Event" },
						/**
						 * The navigation direction that is used to reach the border.
						 * @since 1.85
						 */
						direction: {type: "sap.f.NavigationDirection"},

						/**
						 * The row index, from which the border is reached.
						 * @since 1.85
						 */
						row: {type: "int"},

						/**
						 * The column index, from which the border is reached.
						 * @since 1.85
						 */
						column: {type: "int"}
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

		if (oContainer._resizeListeners[this.getId()]) {
			ResizeHandler.deregister(oContainer._resizeListeners[this.getId()]);
			delete oContainer._resizeListeners[this.getId()];
		}

		oContainer._reflectItemVisibilityToWrapper(this);
	};

	/**
	 * Handler for onAfterRendering for each item.
	 * @private
	 */
	GridContainer.prototype._onAfterItemRendering = function () {
		var oContainer = this.getParent();

		oContainer._checkOwnVisualFocus(this);

		oContainer._resizeListeners[this.getId()] = ResizeHandler.register(this, oContainer._resizeItemHandler);

		oContainer._setItemNavigationItems();

		oContainer._applyItemAutoRows(this);

		if (this.getAriaRoleDescription) {
			var oListItemDomRef = this.getDomRef().parentElement,
				sAriaRoleDesc = this.getAriaRoleDescription();

			if (oListItemDomRef.classList.contains("sapFGridContainerItemWrapper")) {
				if (sAriaRoleDesc) {
					oListItemDomRef.setAttribute("aria-roledescription", sAriaRoleDesc);
				} else {
					oListItemDomRef.removeAttribute("aria-roledescription");
				}
			}
		}
	};

	/**
	 * Reflects "visible" behavior of the control to the wrapper element - sapFGridContainerItemWrapper.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oItem The control of which we will check "visible" property.
	 */
	GridContainer.prototype._reflectItemVisibilityToWrapper = function (oItem) {

		var oItemWrapper = GridContainerUtils.getItemWrapper(oItem),
			$oItemWrapper;

		if (!oItemWrapper) {
			return;
		}

		$oItemWrapper = jQuery(oItemWrapper);

		if (oItem.getVisible() && $oItemWrapper.hasClass("sapFGridContainerInvisiblePlaceholder")) {
			$oItemWrapper.removeClass("sapFGridContainerInvisiblePlaceholder");
		} else if (!oItem.getVisible() && !$oItemWrapper.hasClass("sapFGridContainerInvisiblePlaceholder")) {
			$oItemWrapper.addClass("sapFGridContainerInvisiblePlaceholder");
		}
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
			that._oItemNavigation = new GridContainerItemNavigation()
				.setCycling(false)
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
	 * Detects if there is change in columns count and fires column change event if needed.
	 * @private
	 */
	GridContainer.prototype._detectColumnsChange = function () {
		var oSettings = this.getActiveLayoutSettings(),
			iWidth = this.$().innerWidth(),
			iColumns;

		if (!oSettings) {
			return;
		}

		iColumns = oSettings.getComputedColumnsCount(iWidth);

		if (this._iColumns !== iColumns) {
			this.fireColumnsChange({
				columns: iColumns
			});

			this._iColumns = iColumns;
		}
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
	};

	/**
	 * Inserts an item into the aggregation named <code>items</code>.
	 *
	 * @param {sap.ui.core.Item} oItem The item to be inserted; if empty, nothing is inserted.
	 * @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for
	 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
	 *             greater than the current size of the aggregation, the item is inserted at the last position.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	GridContainer.prototype.insertItem = function (oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex, true);

		if (!this.getDomRef() || !oItem.getVisible()) {
			// if not rendered, or an invisible item - we need to invalidate
			this.invalidate();
			return this;
		}

		var oRm = Core.createRenderManager(),
			oWrapper = this._createItemWrapper(oItem),
			oNextItem = this._getItemAt(iIndex + 1),
			oGridRef = this.getDomRef();

		if (oNextItem) {
			oGridRef.insertBefore(oWrapper, GridContainerUtils.getItemWrapper(oNextItem));
		} else {
			oGridRef.insertBefore(oWrapper, oGridRef.lastChild);
		}

		oRm.render(oItem, oWrapper);
		oRm.destroy();

		return this;
	};

	/**
	 * Removes an item from the aggregation named <code>items</code>.
	 *
	 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or ID.
	 * @returns {sap.ui.core.Control|null} The removed item or <code>null</code>.
	 * @public
	 */
	GridContainer.prototype.removeItem = function (vItem) {
		var oRemovedItem = this.removeAggregation("items", vItem, true),
			oGridRef = this.getDomRef(),
			oItemRef = oRemovedItem.getDomRef();

		if (!oGridRef || !oItemRef) {
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
		this._lastGridWidth = null;
		this._lastViewportWidth = null;
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

		//force the focus when one item is available in grid via dnd(keyboard or mouse)
		if (this.getItems().length === 1 && this._forceFocus) {
			this.focusItem(0);
			this._forceFocus = false;
		}
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

		this._forceFocus = null;

		if (this._checkColumnsTimeout) {
			clearTimeout(this._checkColumnsTimeout);
			this._checkColumnsTimeout = null;
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

		if (bSettingsAreChanged) {
			this.$().css(this._getActiveGridStyles());
			this.getItems().forEach(this._applyItemAutoRows.bind(this));
		}

		this._checkColumns();
	};

	/**
	 * Applies operations related to columns count with a delay.
	 * @private
	 */
	GridContainer.prototype._checkColumns = function () {
		if (this._checkColumnsTimeout) {
			clearTimeout(this._checkColumnsTimeout);
			this._checkColumnsTimeout = null;
		}

		this._checkColumnsTimeout = setTimeout(function () {
			this._detectColumnsChange();
			this._enforceMaxColumns();
		}.bind(this), 0);
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
				fHeight = oItem.getDomRef() ? oItem.getDomRef().getBoundingClientRect().height : 0,
				iRows = oSettings.calculateRowsForItem(Math.round(fHeight));

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
			iMaxColumns;

		if (!oSettings) {
			return;
		}

		iMaxColumns = oSettings.getComputedColumnsCount(this.$().innerWidth());

		if (!iMaxColumns) {
			// if the max columns can not be calculated correctly, don't do anything
			return;
		}

		this.getItems().forEach(function (oItem) {
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
	 * Fires when border of the <code>sap.f.GridContainer</code> is reached.
	 * @param {object} mParameters a set of parameters
	 * @private
	 * @ui5-restricted
	 */
	GridContainer.prototype.onItemNavigationBorderReached = function (mParameters) {
		this.fireEvent("borderReached", mParameters);
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
	 * Checks if the control will display the grid item visual focus.
	 * @param {sap.ui.core.Control} oControl The control
	 * @private
	 */
	GridContainer.prototype._checkOwnVisualFocus = function (oControl) {
		var sName = oControl.getMetadata().getName(),
			oFocusDomRef;

		if (mOwnVisualFocusControls[sName] && mOwnVisualFocusControls[sName](oControl)) {
			oFocusDomRef = oControl.getFocusDomRef();
			// remove the focus DOM ref from the tab chain
			oFocusDomRef.setAttribute("tabindex", -1);
			oFocusDomRef.tabIndex = -1;
			GridContainerUtils.getItemWrapper(oControl).classList.add("sapFGridContainerItemWrapperNoVisualFocus");
		}
	};

	/**
	 * Handles moving of the items using the arrow keys. Calculates new position for the moved item.
	 * If moving is possible, calls <code>GridKeyboardDragAndDrop</code> to fire same events, which would be fired when performing drag and drop with mouse.
	 * @param {jQuery.Event} oEvent The event.
	 */
	GridContainer.prototype._moveItem = function (oEvent) {
		if (!oEvent.ctrlKey) {
			return;
		}

		if (!this._isItemWrapper(oEvent.target)) {
			return;
		}

		var oItem = jQuery(oEvent.target.firstElementChild).control(0),
			iLength = this.getItems().length,
			iItemIndex = this.indexOfItem(oItem),
			iInsertAt = -1,
			oCfg,
			aDropConfigs = [];

		switch (oEvent.keyCode) {
			case KeyCodes.ARROW_RIGHT:
				iInsertAt = Core.getConfiguration().getRTL() ? iItemIndex - 1 : iItemIndex + 1;

				if (iInsertAt >= 0 && iInsertAt < iLength) {
					oCfg = GridContainerUtils.createConfig(this, this.getItems()[iInsertAt]);
					oCfg.dropPosition = "After";
					aDropConfigs = [oCfg];
				}
				break;
			case KeyCodes.ARROW_LEFT:
				iInsertAt = Core.getConfiguration().getRTL() ? iItemIndex + 1 : iItemIndex - 1;

				if (iInsertAt >= 0 && iInsertAt < iLength) {
					oCfg = GridContainerUtils.createConfig(this, this.getItems()[iInsertAt]);
					oCfg.dropPosition = "Before";
					aDropConfigs = [oCfg];
				}
				break;
			case KeyCodes.ARROW_UP:
				aDropConfigs = GridContainerUtils.findDropTargetsAbove(this, oItem);
				aDropConfigs.forEach(function (oCfg) {
					oCfg.dropPosition = "Before";
				});
				break;
			case KeyCodes.ARROW_DOWN:
				aDropConfigs = GridContainerUtils.findDropTargetsBelow(this, oItem);
				aDropConfigs.forEach(function (oCfg) {
					oCfg.dropPosition = (this.indexOfItem(oCfg.item) !== -1) ? "After" : "Before";
				}.bind(this));
				break;
			default: break;
		}

		// sap.m.ScrollEnablement scrolls every time Ctrl + arrow are pressed, so stop propagation here.
		oEvent.stopPropagation();

		GridKeyboardDragAndDrop.fireDnD(oItem, aDropConfigs, oEvent);
		this._setItemNavigationItems();
	};

	/**
	 * Moves item for drag-and-drop keyboard handling
	 * Ctrl + Right Arrow || Modifier + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	GridContainer.prototype.onsapincreasemodifiers = GridContainer.prototype._moveItem;

	/**
	 * Moves item for drag-and-drop keyboard handling
	 * Ctrl + Left Arrow || Modifier + Arrow Down
	 * @param {jQuery.Event} oEvent
	 */
	GridContainer.prototype.onsapdecreasemodifiers = GridContainer.prototype._moveItem;

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

		this._forceFocus = true;

		this._setItemNavigationItems();

		aItemDomRefs = oItemNavigation.getItemDomRefs();

		if (aItemDomRefs[iIndex]) {
			oItemNavigation.setFocusedIndex(iIndex);

			aItemDomRefs[iIndex].focus();
		}
	};

	/**
	 * Focuses an item in the given direction - up, down, left or right,
	 * from the starting position specified by row and column.
	 *
	 * If the direction is up or down, the method focuses
	 * the nearest item in the same column, located in the specified direction.
	 *
	 * If the direction is left or right, the method focuses
	 * the nearest item at the same row, in the specified direction.
	 *
	 * <b>Note:</b>Should be called after the rendering of <code>GridContainer</code> is ready.
	 *
	 * @public
	 * @experimental Since 1.85. Behavior might change.
	 * @param {sap.f.NavigationDirection} sDirection The navigation direction.
	 * @param {int} iRow The row index of the starting position.
	 * @param {int} iColumn The column index of the starting position.
	 */
	GridContainer.prototype.focusItemByDirection = function (sDirection, iRow, iColumn) {
		this._oItemNavigation.focusItemByDirection(this, sDirection, iRow, iColumn);
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	GridContainer.prototype.getNavigationMatrix = function () {
		if (!Core.isThemeApplied()) {
			return null;
		}

		var mGridStyles = window.getComputedStyle(this.getDomRef()),
			aCssRows = mGridStyles.gridTemplateRows.split(/\s+/),
			aCssColumns = mGridStyles.gridTemplateColumns.split(/\s+/),
			oLayoutSettings = this.getActiveLayoutSettings();

		var aItemsDomRefs = this.getItems().reduce(function (aAcc, oItem) {
			if (oItem.getVisible()) {
				aAcc.push(GridContainerUtils.getItemWrapper(oItem));
			}
			return aAcc;
		}, []);

		return GridNavigationMatrix.create(this.getDomRef(), aItemsDomRefs, {
					gap: oLayoutSettings.getGapInPx(),
					rows: aCssRows,
					columns: aCssColumns
				});
	};

	GridContainer.prototype._isItemWrapper = function (oElement) {
		return oElement.classList.contains("sapFGridContainerItemWrapper");
	};

	return GridContainer;
});
