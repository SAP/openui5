/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
	"use strict";

	var mGridProperties = {
		gridTemplateColumns: "grid-template-columns",
		gridTemplateRows: "grid-template-rows",
		gridGap: "grid-gap",
		gridColumnGap: "grid-column-gap",
		gridRowGap: "grid-row-gap",
		gridAutoRows: "grid-auto-rows",
		gridAutoColumns: "grid-auto-columns",
		gridAutoFlow: "grid-auto-flow"
	};

	var mGridAutoFlow = {
		Row: "row",
		Column: "column",
		RowDense: "row dense",
		ColumnDense: "column dense"
	};

	/**
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a sap.ui.layout.cssgrid.GridSettings to a provided DOM element or Control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @since 1.60
	 * @abstract
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.GridLayoutBase
	 */
	var GridLayoutBase = ManagedObject.extend("sap.ui.layout.cssgrid.GridLayoutBase", {
		metadata: {
			library: "sap.ui.layout",
			"abstract": true
		}
	});

	/**
	 * Apply display:grid styles to the provided array of HTML elements or controls based on the currently active GridSettings
	 *
	 * @public
	 * @param {sap.ui.core.Control[]|HTMLElement[]} aElements The elements or controls on which to apply the display:grid styles
	 */
	GridLayoutBase.prototype.applyGridLayout = function (aElements) {
		if (!aElements) { return; }
		aElements.forEach(this._applySingleGridLayout, this);
	};

	/**
	 * Apply display:grid styles to the provided HTML element or control based on the currently active GridSettings
	 *
	 * @protected
	 * @param {sap.ui.core.Control|HTMLElement} oElement The element or control on which to apply the display:grid styles
	 */
	GridLayoutBase.prototype._applySingleGridLayout = function (oElement) {
		if (!oElement) { return; }
		oElement = oElement instanceof window.HTMLElement ? oElement : oElement.getDomRef();

		oElement.style.setProperty("display", "grid");

		var oGridSettings = this.getActiveGridSettings();

		if (oGridSettings) {
			this._setGridLayout(oElement, oGridSettings);
		} else {
			this._removeGridLayout(oElement);
		}
	};

	GridLayoutBase.prototype._setGridLayout = function (oElement, oGridSettings) {

		var oProperties = oGridSettings.getMetadata().getProperties(),
			sProp,
			sPropValue;

		for (sProp in mGridProperties) {
			if (oProperties[sProp]) {
				sPropValue = oGridSettings.getProperty(sProp);
				if (sProp === "gridAutoFlow") {
					sPropValue = mGridAutoFlow[sPropValue];
				}
				oElement.style.setProperty(mGridProperties[sProp], sPropValue);
			}
		}
	};

	/**
	 * Removes all display:grid styles from the provided HTML element or control
	 *
	 * @protected
	 * @param {sap.ui.core.Control|HTMLElement} oElement The element or control from which to remove the grid styles
	 */
	GridLayoutBase.prototype._removeGridLayout = function (oElement) {

		if (!oElement) { return; }
		oElement = oElement instanceof window.HTMLElement ? oElement : oElement.getDomRef();

		for (var sProp in mGridProperties) {
			oElement.style.removeProperty(mGridProperties[sProp]);
		}
	};

	/**
	 * Should return sap.ui.layout.cssgrid.GridSettings - The active GridSettings
	 * Must be implemented by child classes
	 * @abstract
	 * @public
	 */
	GridLayoutBase.prototype.getActiveGridSettings = function () {
		throw new Error("GridLayoutBase getActiveGridSettings not implemented in child class");
	};

	/**
	 * Hook function for the Grid's onAfterRendering
	 * @virtual
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	GridLayoutBase.prototype.onGridAfterRendering = function (oGrid) { };

	/**
	 * Hook function for the Grid's resize. Will be called if the grid layout is responsive.
	 * @virtual
	 * @param {jQuery.Event} oEvent The event passed by the resize handler
	 */
	GridLayoutBase.prototype.onGridResize = function (oEvent) { };

	/**
	 * @public
	 * @virtual
	 * @returns {boolean} If the Grid Layout is responsive.
	 */
	GridLayoutBase.prototype.isResponsive = function () {
		return false;
	};

	/**
	 * Render display:grid styles. Used for non-responsive grid layouts.
	 *
	 * @static
	 * @param {sap.ui.core.RenderManager} rm The render manager of the Control which wants to render display:grid styles
	 * @param {sap.ui.layout.cssgrid.GridLayoutBase} oGridLayout The grid layout to use to apply display:grid styles
	 */
	GridLayoutBase.renderSingleGridLayout = function (rm, oGridLayout) {

		var oGridSettings = oGridLayout && oGridLayout.getActiveGridSettings(),
			oProperties = {},
			sProp,
			sPropValue;

		rm.addStyle("display", "grid");

		// If the GridLayoutBase is responsive the grid styles will be applied onAfterRendering.
		if (!oGridSettings || oGridLayout.isResponsive()) {
			return;
		}

		oProperties = oGridSettings.getMetadata().getProperties();

		for (sProp in mGridProperties) {
			if (oProperties[sProp]) {
				sPropValue = oGridSettings.getProperty(sProp);
				if (sProp === "gridAutoFlow") {
					sPropValue = mGridAutoFlow[sPropValue];
				}
				rm.addStyle(mGridProperties[sProp], sPropValue);
			}
		}
	};

	return GridLayoutBase;
});