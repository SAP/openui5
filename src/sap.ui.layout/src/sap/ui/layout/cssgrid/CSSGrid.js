/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/layout/cssgrid/GridItemLayoutData",
	"sap/ui/layout/cssgrid/GridBasicLayout",
	"sap/ui/layout/cssgrid/GridLayoutDelegate",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/layout/library",
	"./CSSGridRenderer"
], function (Control, GridItemLayoutData, GridBasicLayout, GridLayoutDelegate, ManagedObjectObserver) {
	"use strict";

	/**
	 * Constructor for a new CSSGrid.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.Control
	 * @implements {sap.ui.layout.cssgrid.IGridConfigurable}
	 *
	 * @since 1.60
	 * @constructor
	 * @private
	 * @alias sap.ui.layout.cssgrid.CSSGrid
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
			 * Sets the value for the CSS display:grid property grid-template-columns
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns}
			 */
			gridTemplateColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-template-rows
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows}
			 */
			gridTemplateRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-row-gap
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-gap}
			 */
			gridRowGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-column-gap
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-gap}
			 */
			gridColumnGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-gap
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-gap}
			 */
			gridGap: { type: "sap.ui.layout.cssgrid.CSSGridGapShortHand", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-auto-rows
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows}
			 */
			gridAutoRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-auto-columns
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns}
			 */
			gridAutoColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid property grid-auto-flow
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow}
			 */
			gridAutoFlow: { type: "sap.ui.layout.cssgrid.CSSGridAutoFlow", defaultValue: "Row" }
		},
		aggregations: {

			/**
			 * Defines a custom Grid layout for the control. If provided it will override all of the grid properties.
			 */
			customLayout: { type: "sap.ui.layout.cssgrid.GridLayoutBase", multiple: false },

			/**
			 * The items contained by the control
			 */
			items: { type: "sap.ui.core.Control", multiple: true, singularName: "item" }
		}
	}});

	/**
	 * =================== START of IGridConfigurable interface implementation ===================
	 */

	/**
	 * Implements IGridConfigurable interface
	 *
	 * @protected
	 * @returns {HTMLElement[]} An array with the DOM elements
	 */
	CSSGrid.prototype.getGridDomRefs = function () {
		return [this.getDomRef()];
	};

	/**
	 * Implements IGridConfigurable interface
	 *
	 * @protected
	 * @returns {sap.ui.layout.cssgrid.GridLayoutBase} The grid layout
	 */
	CSSGrid.prototype.getGridLayoutConfiguration = function () {
		if (this.getCustomLayout()) {
			return this.getCustomLayout();
		} else {
			return this._getDefaultGridLayout();
		}
	};

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

		this._initGridLayoutDelegate();
	};

	CSSGrid.prototype.exit = function () {
		this._destroyGridLayoutDelegate();

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
	CSSGrid.prototype._initGridLayoutDelegate = function () {
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
	CSSGrid.prototype._destroyGridLayoutDelegate = function () {
		if (this.oGridLayoutDelegate) {
			this.removeDelegate(this.oGridLayoutDelegate);
			this.oGridLayoutDelegate.destroy();
			this.oGridLayoutDelegate = null;
		}
	};

	CSSGrid.prototype._onGridChange = function (oChanges) {
		if (oChanges.name !== "items" || !oChanges.child) { return; }

		if (oChanges.mutation === "insert") {
			oChanges.child.addEventDelegate(this._oItemDelegate, oChanges.child);
		} else if (oChanges.mutation === "remove") {
			oChanges.child.removeEventDelegate(this._oItemDelegate, oChanges.child);
		}
	};

	/**
	 * Item's onAfterRendering handler
	 *
	 * @private
	 */
	CSSGrid.prototype._onAfterItemRendering = function () {
		GridItemLayoutData._setItemStyles(this);
	};

	/**
	 * Handler for layout data change events.
	 * Update the styles of the item which layoutData changed
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event from a layoutDataChange
	 */
	CSSGrid.prototype.onLayoutDataChange = function (oEvent) {
		GridItemLayoutData._setItemStyles(oEvent.srcControl);
	};

	return CSSGrid;
});