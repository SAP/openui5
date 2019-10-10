/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridSettings",
	"sap/ui/Device",
	"sap/ui/layout/library"
], function (GridLayoutBase, GridSettings, Device) {
	"use strict";

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
	 * <b>Note:</b> This layout is not supported by Microsoft Internet Explorer.
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
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
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
						 * The name of the newly active layout - "Phone", "Tablet", "Desktop" or "LargeDesktop".
						 */
						layout: { type: "string" }
					}
				}
			}
		}
	});

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
	 * @private
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	ResponsiveColumnLayout.prototype.onGridAfterRendering = function (oGrid) {
		this._setActiveLayoutClassName(oGrid, false);
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
	 * @private
	 */
	ResponsiveColumnLayout.prototype.onGridResize = function (oEvent) {
		if (!oEvent || oEvent.size.width === 0) {
			return;
		}

		this._setActiveLayoutClassName(oEvent.control, true);
	};

	/**
	 * Changes the active layout if it's different than the currently active one
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid which layout is going to be updated
	 * @param {boolean} bTriggerLayoutChange If changing the active layout should trigger layoutChange event
	 */
	ResponsiveColumnLayout.prototype._setActiveLayoutClassName = function (oGrid, bTriggerLayoutChange) {
		var sCurrentLayoutClassName = this._sCurrentLayoutClassName,
			$grid = oGrid.$(),
			$parent = $grid.parent(),
			iWidth = $parent.outerWidth(),
			oRange = Device.media.getCurrentRange("StdExt", iWidth),
			sClassName = ResponsiveColumnLayout.mSizeClasses[oRange.name];

		if (sCurrentLayoutClassName === sClassName) {
			return;
		}

		this._sCurrentLayoutClassName = sClassName;

		$grid.removeClass(sCurrentLayoutClassName);
		$grid.addClass(sClassName);

		if (bTriggerLayoutChange) {
			this.fireLayoutChange({
				layout: oRange.name
			});
		}
	};

	/**
	 * A map from Std-ext size to CSS class
	 * @private
	 */
	ResponsiveColumnLayout.mSizeClasses = {
		"Phone": "sapUiLayoutCSSResponsiveColumnLayoutS",
		"Tablet": "sapUiLayoutCSSResponsiveColumnLayoutM",
		"Desktop": "sapUiLayoutCSSResponsiveColumnLayoutL",
		"LargeDesktop": "sapUiLayoutCSSResponsiveColumnLayoutXL"
	};

	return ResponsiveColumnLayout;
});