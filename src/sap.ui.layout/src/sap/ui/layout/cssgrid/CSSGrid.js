/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridBasicLayout",
	"sap/ui/layout/cssgrid/GridLayoutDelegate",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/layout/library",
	"./CSSGridRenderer"
], function (Control, GridLayoutBase, GridBasicLayout, GridLayoutDelegate, ManagedObjectObserver) {
	"use strict";

	/**
	 * Constructor for a new CSSGrid.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A layout control, used to create full page layouts or user interface elements.
	 *
	 * <h3>Overview</h3>
	 *
	 * A two-dimensional layout control based on the native-browser CSS display grid which can handle both columns and rows.
	 * The control can be used along with {@link sap.m.FlexBox} which is the one-dimensional alternative for layouting.
	 *
	 * With properties it is possible to define:
	 * <ul>
	 * <li>columns, rows and their sizes in the grid</li>
	 * <li>vertical and horizontal gaps between the grid items</li>
	 * <li>the flow algorithm when new items are added in the grid</li>
	 * </ul>
	 *
	 * The dimensions of the grid items are defined on a <code>CSSGrid</code> level. Every item can override its size by
	 * specifying how many columns and/or rows it will take in the <code>CSSGrid</code>. Every item can override its position
	 * by specifying from which column and/or row it will start. The configuration of a single item is done
	 * with {@link sap.ui.layout.cssgrid.GridItemLayoutData GridItemLayoutData}.
	 *
	 * <h3>Terminology</h3>
	 * <ul>
	 * <li>Grid - The container which has all grid settings</li>
	 * <li>Gutters - The gap between the rows and columns</li>
	 * <li>Grid areas - Items that take more than one row and/or column</li>
	 * <li>Grid cells - The items of the Grid</li>
	 * <li>Grid lines - The lines around and between the rows and columns</li>
	 * <li>Grid tracks - The space between any two lines in the grid</li>
	 * <li>"fr" Unit - A special grid unit (short from "fraction") which represents a fraction of the available space in the grid</li>
	 * <li>Implicit and Explicit grid - Explicit grid consists of rows and columns defined with <code>gridTemplateColumns</code> and <code>gridTemplateRows</code>. The grid
	 * also creates rows and columns on its own when needed. Their dimensions are defined with <code>gridAutoColumns</code> and <code>gridAutoRows</code>.</li>
	 * </ul>
	 *
	 * <h3>Structure</h3>
	 * The <code>CSSGrid</code> has the following elements:
	 * <ul>
	 * <li><code>items</code> - The items of the <code>CSSGrid</code></li>
	 * <li><code>customLayout</code> - An aggregation used to pass the <code>CSSGrid</code> configuration. Used for templating.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * For general cases, use the <code>CSSGrid</code> properties to configure how the layout should look.
	 * For Box case (equal sized items), use <code>customLayout</code> aggregation with {@link sap.ui.layout.cssgrid.GridBoxLayout GridBoxLayout}
	 * For Grids which need different configurations based on available width, use <code>customLayout</code> aggregation with {@link sap.ui.layout.cssgrid.GridResponsiveLayout GridResponsiveLayout}
	 * To set a specific position to an item or define its dimensions in the grid, pass <code>layoutData</code> of type {@link sap.ui.layout.cssgrid.GridItemLayoutData GridItemLayoutData}
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>If a two-dimensional layout configuration is needed (both columns and rows are defined)</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>If the layout needs to be defined only by one dimension (either column or row, not both). Use {@link sap.m.FlexBox FlexBox} instead.</li>
	 * </ul>
	 *
	 * <h3>Responsive behavior</h3>
	 * <ul>
	 * <li>Fully configurable by the developer. It is possible to create a "breathing" columns layout which means columns width will grow/shrink depending on grid size.</li>
	 * <li>It is possible to pass a {@link sap.ui.layout.cssgrid.GridResponsiveLayout GridResponsiveLayout} to the <code>customLayout</code> aggregation of
	 * the <code>CSSGrid</code> and configure how it will look in different breakpoints (S, M, L, XL).</li>
	 * </ul>
	 *
	 * <h3>Current Limitations</h3>
	 * <ul>
	 * <li>No support for IE11.</li>
	 * <li>No support for Edge version 15.</li>
	 * <li>No alignment and ordering</li>
	 * <li>No Named grid areas and lines</li>
	 * </ul>
	 *
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout MDN web docs: CSS Grid Layout}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.layout.cssgrid.IGridConfigurable
	 *
	 * @since 1.60
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.CSSGrid
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var CSSGrid = Control.extend("sap.ui.layout.cssgrid.CSSGrid", { metadata: {
		library: "sap.ui.layout",
		defaultAggregation: "items",
		interfaces: ["sap.ui.layout.cssgrid.IGridConfigurable"],
		properties: {

			/**
			 * The width of the control
			 */
			width: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns MDN web docs: grid-template-columns}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridTemplateColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows MDN web docs: grid-template-rows}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridTemplateRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-gap MDN web docs: grid-row-gap}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridRowGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-gap MDN web docs: grid-column-gap}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridColumnGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-gap MDN web docs: grid-gap}
			 * It is a shorthand for gridRowGap and gridColumnGap. If some of them is set, the gridGap value will have less priority and will be overwritten.
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridGap: { type: "sap.ui.layout.cssgrid.CSSGridGapShortHand", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows MDN web docs: grid-auto-rows}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridAutoRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns MDN web docs: grid-auto-columns}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridAutoColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow MDN web docs: grid-auto-flow}
			 *
			 * <b>Note:</b> Not supported in IE11, Edge 15.
			 */
			gridAutoFlow: { type: "sap.ui.layout.cssgrid.CSSGridAutoFlow", defaultValue: "Row" }
		},
		aggregations: {

			/**
			 * Defines a custom Grid layout for the control. If provided, it will override all of the grid properties.
			 */
			customLayout: { type: "sap.ui.layout.cssgrid.GridLayoutBase", multiple: false },

			/**
			 * The items contained by the control.
			 */
			items: { type: "sap.ui.core.Control", multiple: true, singularName: "item", dnd: true }
		},
		dnd: { draggable: false, droppable: true }
	}});

	/**
	 * Sets the width of the grid.
	 * @param {sap.ui.core.CSSSize} sWidth The width of the Grid as CSS size.
	 * @returns {sap.ui.layout.cssgrid.CSSGrid} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	CSSGrid.prototype.setWidth = function (sWidth) {
		this.setProperty("width", sWidth, true);

		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.style.width = sWidth;
		}

		return this;
	};

	/**
	 * =================== START of IGridConfigurable interface implementation ===================
	 */

	/**
	 * Implements IGridConfigurable interface
	 *
	 * @returns {HTMLElement[]} An array with the DOM elements
	 */
	CSSGrid.prototype.getGridDomRefs = function () {
		return [this.getDomRef()];
	};

	/**
	 * Returns the layout configuration of the <code>CSSGrid</code>.
	 *
	 * @returns {sap.ui.layout.cssgrid.GridBasicLayout} The grid layout
	 */
	CSSGrid.prototype.getGridLayoutConfiguration = function () {
		if (this.getCustomLayout()) {
			return this.getCustomLayout();
		} else {
			return this._getDefaultGridLayout();
		}
	};

	/**
	 * Provides default configuration for the <code>CSSGrid</code> if not set.
	 *
	 * @private
	 * @returns {sap.ui.layout.cssgrid.GridBasicLayout} [oDefaultGridLayout] The grid default layout
	 */
	CSSGrid.prototype._getDefaultGridLayout = function () {
		var oDefaultGridLayout = new GridBasicLayout({
			gridTemplateColumns: this.getGridTemplateColumns(),
			gridTemplateRows: this.getGridTemplateRows(),
			gridRowGap: this.getGridRowGap(),
			gridColumnGap: this.getGridColumnGap(),
			gridGap: this.getGridGap(),
			gridAutoRows: this.getGridAutoRows(),
			gridAutoColumns: this.getGridAutoColumns(),
			gridAutoFlow: this.getGridAutoFlow()
		});
		return oDefaultGridLayout;
	};

	/**
	 * =================== START of lifecycle methods & delegate handling ===================
	 */

	CSSGrid.prototype.init = function() {
		this._oItemDelegate = {
			onAfterRendering: this._onAfterItemRendering
		};

		this._oGridObserver = new ManagedObjectObserver(CSSGrid.prototype._onGridChange.bind(this));
		this._oGridObserver.observe(this, { aggregations: ["items"] });

		this._addGridLayoutDelegate();
	};

	CSSGrid.prototype.exit = function () {
		this._removeGridLayoutDelegate();

		if (this._oGridObserver) {
			this._oGridObserver.disconnect();
			this._oGridObserver = null;
		}
	};

	/**
	 * Adds the GridLayoutDelegate
	 *
	 * @private
	 */
	CSSGrid.prototype._addGridLayoutDelegate = function () {
		if (!this.oGridLayoutDelegate) {
			this.oGridLayoutDelegate = new GridLayoutDelegate();
			this.addDelegate(this.oGridLayoutDelegate, false, this, false);
		}
	};

	/**
	 * Destroys the GridLayoutDelegate
	 *
	 * @private
	 */
	CSSGrid.prototype._removeGridLayoutDelegate = function () {
		if (this.oGridLayoutDelegate) {
			this.removeDelegate(this.oGridLayoutDelegate);
			this.oGridLayoutDelegate.destroy();
			this.oGridLayoutDelegate = null;
		}
	};

	/**
	 * Updates the <code>CSSGrid</code> depending on change mutations.
	 *
	 * @param {object} [oChanges] Changes that must be applied to CSSGrid
	 * @private
	 */
	CSSGrid.prototype._onGridChange = function (oChanges) {

		if (oChanges.name !== "items" || !oChanges.child) {
			return;
		}

		if (oChanges.mutation === "insert") {
			oChanges.child.addEventDelegate(this._oItemDelegate, oChanges.child);
		} else if (oChanges.mutation === "remove") {
			oChanges.child.removeEventDelegate(this._oItemDelegate, oChanges.child);
		}
	};

	/**
	 * Item's onAfterRendering handler.
	 *
	 * @private
	 */
	CSSGrid.prototype._onAfterItemRendering = function () {
		GridLayoutBase.setItemStyles(this);
	};

	/**
	 * Handler for layout data change events.
	 * Updates the styles of the item that were changed by the layoutData.
	 *
	 * @param {jQuery.Event} [oEvent] The event from a layoutDataChange
	 */
	CSSGrid.prototype.onLayoutDataChange = function (oEvent) {
		GridLayoutBase.setItemStyles(oEvent.srcControl);
	};

	/**
	 * =================== END of lifecycle methods & delegate handling ===================
	 */

	return CSSGrid;
});