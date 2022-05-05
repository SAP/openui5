/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./GridItemLayoutData"
], function (ManagedObject, GridItemLayoutData) {
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
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridLayoutBase = ManagedObject.extend("sap.ui.layout.cssgrid.GridLayoutBase", {
		metadata: {
			library: "sap.ui.layout",
			"abstract": true
		}
	});

	/**
	 * Updates the display:grid styles of a single item
	 *
	 * @private
	 * @static
	 * @param {sap.ui.core.Control} oItem The item which styles have to be updated
	 */
	GridLayoutBase.setItemStyles = function (oItem) {
		if (!oItem) {
			return;
		}

		var oLayoutData = GridLayoutBase._getLayoutDataForControl(oItem),
			oElement = oItem.getDomRef();

		if (!oElement) {
			return;
		}

		if (!oLayoutData) {
			GridItemLayoutData.removeItemStyles(oElement);
		} else  {
			oLayoutData.setItemStyles(oElement);
		}
	};


	/**
	 * @private
	 * @static
	 * @param {sap.ui.core.Control} oControl The control to get the layoutData from
	 * @returns {sap.ui.layout.cssgrid.IGridItemLayoutData|undefined} The layoutData used by the grid item
	 */
	GridLayoutBase._getLayoutDataForControl = function (oControl) {
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

		if (oLayoutData.isA("sap.ui.layout.cssgrid.IGridItemLayoutData")) {
			return oLayoutData;
		}

		if (oLayoutData.isA("sap.ui.core.VariantLayoutData")) {
			aLayoutData = oLayoutData.getMultipleLayoutData();
			for (var i = 0; i < aLayoutData.length; i++) {
				oInnerLayoutData = aLayoutData[i];
				if (oInnerLayoutData.isA("sap.ui.layout.cssgrid.IGridItemLayoutData")) {
					return oInnerLayoutData;
				}
			}
		}
	};

	/**
	 * Apply styles to the provided array of HTML elements or controls based on the currently active GridSettings
	 *
	 * @public
	 * @param {sap.ui.core.Control[]|HTMLElement[]} aElements The elements or controls on which to apply the display:grid styles
	 */
	GridLayoutBase.prototype.applyGridLayout = function (aElements) {
		if (!aElements) {
			return;
		}

		aElements.forEach(this._applySingleGridLayout, this);
	};

	/**
	 * Apply styles to the provided HTML element or control based on the currently active GridSettings
	 *
	 * @private
	 * @param {sap.ui.core.Control|HTMLElement} oElement The element or control on which to apply the display:grid styles
	 */
	GridLayoutBase.prototype._applySingleGridLayout = function (oElement) {
		if (!oElement) {
			return;
		}

		oElement = oElement instanceof window.HTMLElement ? oElement : oElement.getDomRef();

		var oGridSettings = this.getActiveGridSettings();

		// check if the style is not already added by RenderManager or something else
		if (oElement.style.getPropertyValue("display") !== "grid") {
			oElement.style.setProperty("display", "grid");
		}

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

				// If sPropValue is "" it will overwrite the corresponding gridGap value
				if (sPropValue === "" && (sProp === "gridRowGap" || sProp === "gridColumnGap")) {
					continue;
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
	 * Should return the active GridSettings.
	 * Must be implemented by child classes.
	 * @abstract
	 * @returns {sap.ui.layout.cssgrid.GridSettings}
	 * @public
	 */
	GridLayoutBase.prototype.getActiveGridSettings = function () {
		throw new Error("GridLayoutBase getActiveGridSettings not implemented in child class");
	};

	/**
	 * Hook function for the Grid's onAfterRendering
	 * @virtual
	 * @protected
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	GridLayoutBase.prototype.onGridAfterRendering = function (oGrid) { };

	/**
	 * Hook function for the Grid's resize. Will be called if the grid layout is responsive.
	 * @virtual
	 * @protected
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
	 * Add "display:grid" and configuration styles with RenderManager.
	 * If the layout is responsive, the configuration styles are not added, as they are added by "applyGridLayout" later.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The render manager of the Grid which wants to add the styles
	 * @private
	 * @ui5-restricted
	 */
	GridLayoutBase.prototype.addGridStyles = function (oRM) {
		var oGridSettings = this.getActiveGridSettings();

		oRM.style("display", "grid");

		// If the GridLayoutBase is responsive the grid styles will be applied onAfterRendering.
		if (!oGridSettings || this.isResponsive()) {
			return;
		}

		var oProperties = oGridSettings.getMetadata().getProperties();
		for (var sProp in mGridProperties) {
			if (oProperties[sProp]) {
				var sPropValue = oGridSettings.getProperty(sProp);

				if (sProp === "gridAutoFlow") {
					sPropValue = mGridAutoFlow[sPropValue];
				}

				oRM.style(mGridProperties[sProp], sPropValue);
			}
		}
	};

	return GridLayoutBase;
});