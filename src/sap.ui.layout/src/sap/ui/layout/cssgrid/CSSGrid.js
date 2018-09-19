/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/layout/cssgrid/GridBasicLayout",
	"sap/ui/layout/cssgrid/GridLayoutDelegate",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/layout/library",
	"./CSSGridRenderer"
], function (Control, GridBasicLayout, GridLayoutDelegate, ManagedObjectObserver) {
	"use strict";

	var mGridItemProperties = {
		gridColumnStart: "grid-column-start",
		gridColumnEnd: "grid-column-end",
		gridRowStart: "grid-row-start",
		gridRowEnd: "grid-row-end",
		gridColumn: "grid-column",
		gridRow: "grid-row"
	};

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
		CSSGrid._setItemStyles(this);
	};

	/**
	 * Handler for layout data change events.
	 * Update the styles of the item which layoutData changed
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event from a layoutDataChange
	 */
	CSSGrid.prototype.onLayoutDataChange = function (oEvent) {
		CSSGrid._setItemStyles(oEvent.srcControl);
	};

	/**
	 * =================== START of static helper functions ===================
	 */

	/**
	 * Updates the display:grid styles of a single item
	 *
	 * @private
	 * @static
	 * @param {sap.ui.core.Control} oItem The item which styles have to be updated
	 */
	CSSGrid._setItemStyles = function (oItem) {

		if (!oItem) {
			return;
		}

		var oLayoutData = CSSGrid._getLayoutDataForControl(oItem),
			oItemDom = oItem.getDomRef(),
			oProperties,
			sProp,
			sPropValue;

		if (!oLayoutData) {
			CSSGrid._removeItemStyles(oItemDom);
			return;
		}

		oProperties = oLayoutData.getMetadata().getProperties();

		for (sProp in mGridItemProperties) {
			if (oProperties[sProp]) {
				sPropValue = oLayoutData.getProperty(sProp);

				if (typeof sPropValue !== "undefined") {
					CSSGrid._setItemStyle(oItemDom, mGridItemProperties[sProp], sPropValue);
				}
			}
		}
	};

	/**
	 * Remove all grid properties from the item
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} oItemDom The Item DOM reference
	 */
	CSSGrid._removeItemStyles = function (oItemDom) {
		for (var sProp in mGridItemProperties) {
			oItemDom.style.removeProperty(mGridItemProperties[sProp]);
		}
	};

	/**
	 * Sets a property on the DOM element
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} oItemDom The item DOM reference
	 * @param {string} sProperty The name of the property to set
	 * @param {string} sValue The value of the property to set
	 */
	CSSGrid._setItemStyle = function (oItemDom, sProperty, sValue) {
		if (sValue !== "0" && !sValue) {
			oItemDom.style.removeProperty(sProperty);
		} else {
			oItemDom.style.setProperty(sProperty, sValue);
		}
	};

	/**
	 * @private
	 * @static
	 * @param {sap.ui.layout.cssgrid.CSSGrid} oControl The CSSGrid control
	 * @returns {sap.ui.layout.cssgrid.GridItemLayoutData|undefined} The layoutData used by the grid item
	 */
	CSSGrid._getLayoutDataForControl = function (oControl) {
		var oLayoutData,
			aLayoutData,
			oInnerLayoutData;

		if (!oControl) {
			return undefined;
		}

		oLayoutData = oControl.getLayoutData();

		if (!oLayoutData) {
			return undefined;
		}

		if (oLayoutData.isA("sap.ui.layout.cssgrid.GridItemLayoutData")) {
			return oLayoutData;
		}

		if (oLayoutData.isA("sap.ui.core.VariantLayoutData")) {
			aLayoutData = oLayoutData.getMultipleLayoutData();
			for (var i = 0; i < aLayoutData.length; i++) {
				oInnerLayoutData = aLayoutData[i];
				if (oInnerLayoutData.isA("sap.ui.layout.cssgrid.GridItemLayoutData")) {
					return oInnerLayoutData;
				}
			}
		}
	};

	return CSSGrid;
});