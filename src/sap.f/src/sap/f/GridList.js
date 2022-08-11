/*!
 * ${copyright}
 */
sap.ui.define([
	"./delegate/GridItemNavigation",
	"./GridListRenderer",
	"./GridNavigationMatrix",
	"./library",
	"sap/m/ListBase",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Core",
	"sap/ui/Device",
	"sap/ui/layout/cssgrid/GridLayoutDelegate",
	"sap/ui/layout/cssgrid/GridLayoutBase"

], function(
	GridItemNavigation,
	GridListRenderer,
	GridNavigationMatrix,
	library,
	ListBase,
	ManagedObjectObserver,
	Core,
	Device,
	GridLayoutDelegate,
	GridLayoutBase
) {
	"use strict";

	var NavigationDirection = library.NavigationDirection;

	/**
	 * Constructor for a new GridList.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A list-based control with grid layout capabilities.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control is based on {@link sap.m.ListBase} and adds the flexibility to configure different grid layouts. The layout used is based
	 * on the CSS display grid and the control has a default configuration.
	 *
	 * With <code>customLayout</code> aggregation it is possible to use:
	 * <ul>
	 * <li>Predefined simple grid layouts such as {@link sap.ui.layout.cssgrid.GridBoxLayout GridBoxLayout}</li>
	 * <li>Flexible grid layouts, such as {@link sap.ui.layout.cssgrid.GridBasicLayout GridBasicLayout} or {@link sap.ui.layout.cssgrid.GridResponsiveLayout GridResponsiveLayout} which reveal the native-browser CSS display grid APIs. For more information, see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout MDN web docs: CSS Grid Layout}</li>
	 * </ul>
	 *
	 * Every item can override its size by specifying the number of columns and/or rows it will take in the grid.
	 * This is done using {@link sap.ui.layout.cssgrid.GridItemLayoutData GridItemLayoutData}.
	 *
	 * For best visualization, items of type {@link sap.f.GridListItem sap.f.GridListItem} should be used inside the <code>items</code> aggregation.
	 *
	 * <h3>Usage</h3>
	 *
	 * For general cases, use the default grid configuration of the <code>GridList</code>.
	 * For Box case (equal sized items), use <code>customLayout</code> aggregation with {@link sap.ui.layout.cssgrid.GridBoxLayout GridBoxLayout}
	 * For Grids which need different configurations based on available width, use <code>customLayout</code> aggregation with {@link sap.ui.layout.cssgrid.GridResponsiveLayout GridResponsiveLayout}
	 * To set a specific position to an item or define its dimensions in the grid, pass <code>layoutData</code> of type {@link sap.ui.layout.cssgrid.GridItemLayoutData GridItemLayoutData}
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>If {@link sap.m.ListBase} features are required and the items must be positioned in a grid layout</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>If a list layout is required, use {@link sap.m.List} instead.
	 * <li>If only the layout is required, use {@link sap.ui.layout.cssgrid.CSSGrid} instead.
	 * </ul>
	 *
	 * <h3>Drag and drop:</h3>
	 * Drag and drop is enabled for the <code>GridList</code> with enhanced visualization and interaction, better suited for grid items. This is configured by using the <code>{@link sap.f.dnd.GridDropInfo}</code>.
	 *
	 * Similar to the <code>{@link sap.ui.core.dnd.DropInfo}</code>, <code>{@link sap.f.dnd.GridDropInfo}</code> has to be added to the <code>dragDropConfig</code> aggregation, by using <code>{@link sap.ui.core.Element#addDragDropConfig}</code>.
	 *
	 * Both <code>{@link sap.ui.core.dnd.DropInfo}</code> and <code>{@link sap.f.dnd.GridDropInfo}</code> can be used to configure drag and drop.
	 * The difference is that the <code>{@link sap.f.dnd.GridDropInfo}</code> will provide a drop indicator, which mimics the size of the dragged item and shows the potential drop position inside the grid.
	 *
	 * <h3>Keyboard Navigation:</h3>
	 * <code>GridList</code> provides support for two-dimensional keyboard navigation through its contained controls.
	 * Navigating up/down or left/right using the arrow keys follows the configurable two-dimensional grid mesh.
	 * This provides stable navigation paths in the cases when there are items of different sizes.
	 * When the user presses an arrow key in a direction outward of the <code>GridList</code>, a <code>borderReached</code> event will be fired.
	 * The implementation of the <code>borderReached</code> event allows the application developer to control where the focus goes, and depending on the surrounding layout pass the focus to a specific place in a neighboring <code>GridList</code> using the method {@link #focusItemByDirection}.
	 *
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout MDN web docs: CSS Grid Layout}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.m.ListBase
	 * @implements sap.ui.layout.cssgrid.IGridConfigurable
	 *
	 * @since 1.60
	 * @constructor
	 * @public
	 * @alias sap.f.GridList
	 */
	var GridList = ListBase.extend("sap.f.GridList", { metadata : {
		library: "sap.f",
		interfaces: [
			"sap.ui.layout.cssgrid.IGridConfigurable",
			"sap.f.dnd.IGridDroppable"
		],
		aggregations: {

			/**
			 * Defines a custom grid layout
			 */
			customLayout: { type: "sap.ui.layout.cssgrid.GridLayoutBase", multiple: false }
		},
		events: {
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
					 */
					direction: {type: "sap.f.NavigationDirection"},

					/**
					 * The row index, from which the border is reached.
					 */
					row: {type: "int"},

					/**
					 * The the column index, from which the border is reached.
					 */
					column: {type: "int"}
				}
			}
		}
	}});

	/**
	 * =================== START of lifecycle methods & delegate handling ===================
	 */
	GridList.prototype.init = function () {
		ListBase.prototype.init.apply(this, arguments);

		this._oItemDelegate = {
			onAfterRendering: this._onAfterItemRendering
		};

		this._addGridLayoutDelegate();

		this._oGridObserver = new ManagedObjectObserver(GridList.prototype._onGridChange.bind(this));
		this._oGridObserver.observe(this, { aggregations: ["items"] });
	};

	GridList.prototype.exit = function () {
		this._removeGridLayoutDelegate();

		if (this._oGridObserver) {
			this._oGridObserver.disconnect();
			this._oGridObserver = null;
		}

		ListBase.prototype.exit.apply(this, arguments);
	};

	/**
	 * @override
	 */
	GridList.prototype.onAfterPageLoaded = function () {
		ListBase.prototype.onAfterPageLoaded.apply(this, arguments);

		if (this._oItemNavigation) {
			this._oItemNavigation.resetFocusPosition();
		}
	};

	/**
	 * Fires when border of the <code>sap.f.GridList</code> is reached.
	 * @param {object} mParameters a set of parameters
	 * @private
	 * @ui5-restricted
	 */
	GridList.prototype.onItemNavigationBorderReached = function (mParameters) {
		var oGrowingInfo = this.getGrowingInfo();

		// don't fire border reached if there is more button
		if (mParameters.direction === NavigationDirection.Down && oGrowingInfo && oGrowingInfo.actual !== oGrowingInfo.total) {
			return;
		}

		this.fireEvent("borderReached", mParameters);
	};

	/**
	 * =================== END of lifecycle methods & delegate handling ===================
	 */

	/**
	 * Implements IGridConfigurable interface.
	 *
	 * @returns {HTMLElement[]} An array with the DOM elements
	 * @protected
	 */
	GridList.prototype.getGridDomRefs = function () {
		return [this.getItemsContainerDomRef()];
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
	 * <b>Note:</b>Should be called after the rendering of <code>GridList</code> is ready.
	 *
	 * @public
	 * @experimental Since 1.87. Behavior might change.
	 * @param {sap.f.NavigationDirection} sDirection The navigation direction.
	 * @param {int} iRow The row index of the starting position.
	 * @param {int} iColumn The column index of the starting position.
	 */
	GridList.prototype.focusItemByDirection = function (sDirection, iRow, iColumn) {
		this._oItemNavigation.focusItemByDirection(this, sDirection, iRow, iColumn);
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	GridList.prototype.getNavigationMatrix = function () {
		if (!Core.isThemeApplied()) {
			return null;
		}

		var aItemsDomRefs = this.getItems().reduce(function (aAcc, oItem) {
			if (oItem.getVisible()) {
				aAcc.push(oItem.getDomRef());
			}

			return aAcc;
		}, []);

		return GridNavigationMatrix.create(this.getItemsContainerDomRef(), aItemsDomRefs, this._getActiveLayoutSizes());
	};

	/**
	 * Implements IGridConfigurable interface.
	 *
	 * @returns {sap.ui.layout.cssgrid.GridLayoutBase} The grid layout
	 * @protected
	 * @function
	 */
	GridList.prototype.getGridLayoutConfiguration = GridList.prototype.getCustomLayout;

	/**
	 * @override
	 */
	GridList.prototype._startItemNavigation = function (bIfNeeded) {
		if (!Device.system.desktop) {
			return;
		}

		if (!this._oItemNavigation) {

			this._oItemNavigation = new GridItemNavigation();

			this._oItemNavigation.setCycling(false)
				.setDisabledModifiers({
					sapnext : ["alt"],
					sapprevious : ["alt"]
				})
				.setFocusedIndex(0);

			this.addDelegate(this._oItemNavigation);

			// set the tab index of active items
			this._setItemNavigationTabIndex(0);
		}

		ListBase.prototype._startItemNavigation.apply(this, arguments);
	};

	/**
	 * Adds the GridLayoutDelegate.
	 *
	 * @private
	 */
	GridList.prototype._addGridLayoutDelegate = function () {
		if (!this.oGridLayoutDelegate) {
			this.oGridLayoutDelegate = new GridLayoutDelegate();
			this.addEventDelegate(this.oGridLayoutDelegate, this);
		}
	};

	/**
	 * Destroys the GridLayoutDelegate.
	 *
	 * @private
	 */
	GridList.prototype._removeGridLayoutDelegate = function () {
		if (this.oGridLayoutDelegate) {
			this.removeEventDelegate(this.oGridLayoutDelegate);
			this.oGridLayoutDelegate.destroy();
			this.oGridLayoutDelegate = null;
		}
	};

	/**
	 * Updates CSSGrid depending on change mutations.
	 *
	 * @param {object} [oChanges]
	 * @private
	 */
	GridList.prototype._onGridChange = function (oChanges) {
		var bCallBefore;

		if (oChanges.name !== "items" || !oChanges.child) {
			return;
		}

		if (oChanges.mutation === "insert") {
			// The sap.ui.core.HTML has a special behavior
			// and the delegate should be called after the real onAfterRendering  method
			bCallBefore = !oChanges.child.isA("sap.ui.core.HTML");
			oChanges.child.addDelegate(this._oItemDelegate, bCallBefore, oChanges.child);
		} else if (oChanges.mutation === "remove") {
			oChanges.child.removeEventDelegate(this._oItemDelegate, oChanges.child);
		}
	};

	/**
	 * Item's onAfterRendering handler.
	 *
	 * @private
	 */
	GridList.prototype._onAfterItemRendering = function () {
		GridLayoutBase.setItemStyles(this);
	};

	/**
	 * Called when binding is updated
	 *
	 * @private
	 */
	GridList.prototype.updateItems = function() {
		ListBase.prototype.updateItems.apply(this, arguments);

		this.invalidate();
	};

	/**
	 * Handler for layout data change events.
	 * Updates the styles of the item that were changed by the layoutData.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event from a layoutDataChange
	 */
	GridList.prototype.onLayoutDataChange = function (oEvent) {
		GridLayoutBase.setItemStyles(oEvent.srcControl);
	};

	GridList.prototype._getActiveLayoutSizes = function () {
		var oGridDomRef = this.getItemsContainerDomRef(),
			mGridStyles = window.getComputedStyle(oGridDomRef);
		return {
			gap: parseFloat(mGridStyles.rowGap),
			rows: mGridStyles.gridTemplateRows.split(/\s+/),
			columns: mGridStyles.gridTemplateColumns.split(/\s+/)
		};
	};

	return GridList;
});
