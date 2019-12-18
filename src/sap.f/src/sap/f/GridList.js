/*!
 * ${copyright}
 */
sap.ui.define([
	"./library",
	"sap/m/ListBase",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/layout/cssgrid/GridLayoutDelegate",
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"./GridListRenderer"
], function(
	library,
	ListBase,
	ManagedObjectObserver,
	GridLayoutDelegate,
	GridLayoutBase,
	GridListRenderer
) {
	"use strict";

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
	 * <h3>Current Limitations</h3>
	 * <ul>
	 * <li>For Microsoft Internet Explorer some layouts are not supported, due to browser specifics.</li>
	 * <li>For Microsoft Edge 15 and older versions some layouts are not supported, due to browser specifics.</li>
	 * </ul>
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
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
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
	 * Implements IGridConfigurable interface.
	 *
	 * @returns {sap.ui.layout.cssgrid.GridLayoutBase} The grid layout
	 * @protected
	 */
	GridList.prototype.getGridLayoutConfiguration = GridList.prototype.getCustomLayout;

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
		if (oChanges.name !== "items" || !oChanges.child) { return; }

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
	GridList.prototype._onAfterItemRendering = function () {
		GridLayoutBase.setItemStyles(this);
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

	return GridList;

});