/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/Device"
], function (ManagedObject, Device) {
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

	var EDGE_VERSION_WITH_GRID_SUPPORT = 16;

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
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
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

		var oGridSettings = this.getActiveGridSettings();

		oElement.style.setProperty("display", "grid");

		if (oGridSettings) {
			this._setGridLayout(oElement, oGridSettings);
		} else {
			this._removeGridLayout(oElement);
		}
	};

	/**
	 * Sets all display:grid styles to the provided HTML element
	 *
	 * @protected
	 * @param {HTMLElement} oElement The element to which to apply the grid styles
	 * @param {sap.ui.layout.cssgrid.GridSettings} oGridSettings The grid settings to apply
	 */
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
	 * Removes all display:grid styles from the provided HTML element
	 *
	 * @protected
	 * @param {HTMLElement} oElement The element from which to remove the grid styles
	 */
	GridLayoutBase.prototype._removeGridLayout = function (oElement) {
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
	GridLayoutBase.prototype.onGridAfterRendering = function (oGrid) {
		// Loops over each element's dom and adds the grid item class
		oGrid.getGridDomRefs().forEach(function (oDomRef) {
			if (oDomRef.children){
				for (var i = 0; i < oDomRef.children.length; i++) {
					if (!oDomRef.children[i].classList.contains("sapMGHLI")) {
						oDomRef.children[i].classList.add("sapUiLayoutCSSGridItem");
					}
				}
			}
		});
	};

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
	 * @public
	 * @returns {boolean} If native grid is supported by the browser
	 */
	GridLayoutBase.prototype.isGridSupportedByBrowser = function () {
		return !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);
	};

	/**
	 * Render display:grid styles. Used for non-responsive grid layouts.
	 *
	 * @param {sap.ui.core.RenderManager} rm The render manager of the Control which wants to render display:grid styles
	 * @param {sap.ui.layout.cssgrid.GridLayoutBase} oGridLayout The grid layout to use to apply display:grid styles
	 */
	GridLayoutBase.prototype.renderSingleGridLayout = function (rm) {
		var oGridSettings = this && this.getActiveGridSettings(),
			sProp,
			sPropValue;

		rm.addStyle("display", "grid");

		// If the GridLayoutBase is responsive the grid styles will be applied onAfterRendering.
		if (!oGridSettings || this.isResponsive()) {
			return;
		}

		var oProperties = oGridSettings.getMetadata().getProperties();

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