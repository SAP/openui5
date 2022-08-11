/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/Device"
], function (GridLayoutBase, Device) {
	"use strict";

	/**
	 * Constructor for a new GridResponsiveLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a sap.ui.layout.cssgrid.GridSettings to a provided DOM element or Control.
	 * Have to possibility to hold multiple sap.ui.layout.cssgrid.GridSettings and apply the currently active GridSettings.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.layout.cssgrid.GridLayoutBase
	 *
	 * @since 1.60
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.GridResponsiveLayout
	 */
	var GridResponsiveLayout = GridLayoutBase.extend("sap.ui.layout.cssgrid.GridResponsiveLayout", {
		metadata: {
			library: "sap.ui.layout",
			properties: {

				/**
				 * If set to <code>true</code>, the current range (large, medium or small) is defined by the size of the
				 * container surrounding the <code>CSSGrid</code> instead of the device screen size (media Query).
				 */
				containerQuery: { type: "boolean", group: "Behavior", defaultValue: false }
			},
			aggregations: {

				/**
				 * The sap.ui.layout.cssgrid.GridSettings applied if no settings are provided for a specific size
				 */
				layout: { type: "sap.ui.layout.cssgrid.GridSettings", multiple: false },

				/**
				 * The sap.ui.layout.cssgrid.GridSettings applied for size "S"
				 */
				layoutS: { type: "sap.ui.layout.cssgrid.GridSettings", multiple: false },

				/**
				 * The sap.ui.layout.cssgrid.GridSettings applied for size "M"
				 */
				layoutM: { type: "sap.ui.layout.cssgrid.GridSettings", multiple: false },

				/**
				 * The sap.ui.layout.cssgrid.GridSettings applied for size "L"
				 */
				layoutL: { type: "sap.ui.layout.cssgrid.GridSettings", multiple: false },

				/**
				 * The sap.ui.layout.cssgrid.GridSettings applied for size "XL"
				 */
				layoutXL: { type: "sap.ui.layout.cssgrid.GridSettings", multiple: false }
			},
			events: {

				/**
				 * Fired when the currently active GridSettings changes
				 */
				layoutChange: {
					parameters: {

						/**
						 * The name of the newly active layout aggregation
						 */
						layout: { type: "string" }
					}
				}
			}
		}
	});

	/**
	 * A map from Std-ext size to CSS class
	 * @private
	 */
	GridResponsiveLayout.mSizeClasses = {
		"Phone": "sapUiLayoutCSSGridS",
		"Tablet": "sapUiLayoutCSSGridM",
		"Desktop": "sapUiLayoutCSSGridL",
		"LargeDesktop": "sapUiLayoutCSSGridXL"
	};

	/**
	 * A map from Std-ext size to GridSettings aggregation name
	 * @private
	 */
	GridResponsiveLayout.mSizeLayouts = {
		"Phone": "layoutS",
		"Tablet": "layoutM",
		"Desktop": "layoutL",
		"LargeDesktop": "layoutXL"
	};

	GridResponsiveLayout.prototype.init = function () {
		this._sActiveLayout = "layout";
	};

	/**
	 * @public
	 * @override
	 * @returns {sap.ui.layout.cssgrid.GridSettings} The currently active layout aggregation
	 */
	GridResponsiveLayout.prototype.getActiveGridSettings = function () {
		return this.getAggregation(this._sActiveLayout);
	};

	/**
	 * @public
	 * @override
	 * @returns {boolean} If the Grid Layout is responsive.
	 */
	GridResponsiveLayout.prototype.isResponsive = function () {
		return true;
	};

	/**
	 * Handler for IGridConfigurable onAfterRendering
	 *
	 * @override
	 * @protected
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	GridResponsiveLayout.prototype.onGridAfterRendering = function (oGrid) {
		this.setActiveLayout(oGrid, false);
	};

	/**
	 * Handler for IGridConfigurable resize
	 *
	 * @override
	 * @protected
	 * @param {jQuery.Event} oEvent The event object from a grid resize
	 */
	GridResponsiveLayout.prototype.onGridResize = function (oEvent) {
		if (!oEvent || oEvent.size.width === 0) {
			return;
		}
		this.setActiveLayout(oEvent.control, true);
	};

	/**
	 * Applies a size class on the parent
	 *
	 * @private
	 * @param {jQuery} $Grid The grid on which to add the size class
	 * @param {string} sSizeClass The size class to add on the DOM element
	 */
	GridResponsiveLayout.prototype.applySizeClass = function ($Grid, sSizeClass) {
		if ($Grid.hasClass(sSizeClass)) {
			return;
		}

		var aClasses = Object.keys(GridResponsiveLayout.mSizeClasses).map(function (sSize) {
			return GridResponsiveLayout.mSizeClasses[sSize];
		});
		$Grid.removeClass(aClasses.join(" "));
		$Grid.addClass(sSizeClass);
	};

	/**
	 * Changes the active layout if it's different than the currently active one
	 *
	 * @private
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid which layout is going to be updated
	 * @param {boolean} bTriggerLayoutChange If changing the active layout should trigger layoutChange event
	 */
	GridResponsiveLayout.prototype.setActiveLayout = function (oGrid, bTriggerLayoutChange) {
		var iWidth = this.getContainerQuery() ? oGrid.$().outerWidth() : window.innerWidth;
		var oRange = Device.media.getCurrentRange("StdExt", iWidth),
			sLayout = GridResponsiveLayout.mSizeLayouts[oRange.name],
			sLayoutToApply = this._getLayoutToApply(sLayout);

		this.applySizeClass(oGrid.$(), GridResponsiveLayout.mSizeClasses[oRange.name]);

		if (this._sActiveLayout === sLayoutToApply) {
			return;
		}

		this._sActiveLayout = sLayoutToApply;

		if (bTriggerLayoutChange) {
			this.fireLayoutChange({
				layout: sLayoutToApply
			});
		}
	};

	/**
	 * Returns the layout aggregation if there is no setting for the passed layoutS/layoutM/layoutL/layoutXL
	 *
	 * @private
	 * @param {string} sLayout The layout to check
	 * @returns {string} The layout to set as active
	 */
	GridResponsiveLayout.prototype._getLayoutToApply = function (sLayout) {
		if (this.getAggregation(sLayout)) {
			return sLayout;
		}
		return "layout";
	};

	return GridResponsiveLayout;
});