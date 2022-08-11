/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/Device",
	"sap/ui/layout/library"
], function (
	GridLayoutBase,
	Device
) {
	"use strict";

	var RCL_RANGE_SET = "RCLRangeSet";

	Device.media.initRangeSet(RCL_RANGE_SET, [600, 1024, 1280, 1440, 1680, 1920], "px", ["S", "M", "ML", "L", "XL", "XXL", "XXXL"], true);

	/**
	 * Constructor for a new <code>ResponsiveColumnLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * Represents a layout which displays variable number of columns, depending on available screen size.
	 * With that it achieves flexible layouts and line breaks for large, medium,
	 * and small-sized screens, such as desktop, tablet, and mobile.
	 *
	 * Grid row's height is dynamically determined by the height of the highest grid element on this row.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.layout.cssgrid.GridLayoutBase
	 *
	 * @since 1.72
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.ResponsiveColumnLayout
	 */
	var ResponsiveColumnLayout = GridLayoutBase.extend("sap.ui.layout.cssgrid.ResponsiveColumnLayout", {
		metadata: {
			library: "sap.ui.layout",
			properties: {
			},
			events: {

				/**
				 * Fired when the currently active layout changes
				 */
				layoutChange: {
					parameters: {

						/**
						 * The name of the newly active layout - "S", "M", "ML", "L", "XL", "XXL" or "XXXL".
						 */
						layout: { type: "string" }
					}
				}
			}
		}
	});

	/**
	 * CSS class for the current layout.
	 * @string
	 * @private
	 */
	ResponsiveColumnLayout.prototype._sCurrentLayoutClassName = "";

	/**
	 * Returns if the Grid Layout is responsive.
	 * @public
	 * @returns {boolean} If the Grid Layout is responsive.
	 */
	ResponsiveColumnLayout.prototype.isResponsive = function () {
		return true;
	};

	/**
	 * Handler for IGridConfigurable onAfterRendering
	 *
	 * @override
	 * @protected
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	ResponsiveColumnLayout.prototype.onGridAfterRendering = function (oGrid) {
		this._applyLayout(oGrid);
	};


	/**
	 * Provides active settings for the <code>CSSGrid</code>.
	 *
	 * @returns {sap.ui.layout.cssgrid.GridSettings} ResponsiveColumnLayout The active GridSettings
	 * @override
	 */
	ResponsiveColumnLayout.prototype.getActiveGridSettings = function () {
		return null;
	};

	/**
	 * Resize handler for the ResponsiveColumnLayout.
	 *
	 * @param {object} oEvent - The event from a resize
	 * @override
	 * @protected
	 */
	ResponsiveColumnLayout.prototype.onGridResize = function (oEvent) {
		if (!oEvent || oEvent.size.width === 0) {
			return;
		}

		this._applyLayout(oEvent.control);
	};

	/**
	 * @override
	 */
	ResponsiveColumnLayout.prototype.addGridStyles = function (oRM) {
		GridLayoutBase.prototype.addGridStyles.apply(this, arguments);

		oRM.class("sapUiLayoutCSSGridRCL");

	};

	/**
	 * Changes the active layout if it's different than the currently active one.
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid which layout is going to be updated
	 * @private
	 */
	ResponsiveColumnLayout.prototype._applyLayout = function (oGrid) {
		var oParent = oGrid.getParent(),
			iWidth = oParent ? oParent.getDomRef().offsetWidth : oGrid.getDomRef().parentElement.offsetWidth,
			oRange = Device.media.getCurrentRange(RCL_RANGE_SET, iWidth),
			sClassName = "sapUiLayoutCSSGridRCL-Layout" + oRange.name;

		if (this._sCurrentLayoutClassName === sClassName) {
			return;
		}

		oGrid.removeStyleClass(this._sCurrentLayoutClassName);
		oGrid.addStyleClass(sClassName);

		this._sCurrentLayoutClassName = sClassName;
		this.fireLayoutChange({
			layout: oRange.name
		});
	};

	return ResponsiveColumnLayout;
});