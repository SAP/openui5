/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridSettings"
], function (GridLayoutBase, GridSettings) {
    "use strict";

	/**
	 * Constructor for a new GridBoxLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a sap.ui.layout.cssgrid.GridSettings to a provided DOM element or Control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.GridLayoutBase
	 *
	 * @since 1.60
	 * @constructor
	 * @private
	 * @alias sap.ui.layout.cssgrid.GridBoxLayout
	 */
	var GridBoxLayout = GridLayoutBase.extend("sap.ui.layout.cssgrid.GridBoxLayout", {
		metadata: {
			library: "sap.ui.layout",
			properties: {

				/**
				 * Defines the minimum width of the Boxes
				 */
				boxMinWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },

				/**
				 * Defines the width of the Boxes
				 */
				boxWidth: { type: "sap.ui.core.CSSSize", defaultValue: "" }
			}
		}
	});

	/**
	 * @override
	 * @protected
	 * @returns {sap.ui.layout.cssgrid.GridSettings} The active GridSettings
	 */
	GridBoxLayout.prototype.getActiveGridSettings = function () {
		return new GridSettings({
			gridTemplateColumns: this._getTemplateColumns(),
			gridGap: "0.5rem 0.5rem",
			gridAutoRows: "1fr"
		});
	};

	/**
	 * Returns a gridTemplateColumns value based on boxWidth and boxMinWidth properties
	 *
	 * @protected
	 * @returns {string} A value for gridTemplateColumns property
	 */
	GridBoxLayout.prototype._getTemplateColumns = function () {
		var sTemplateColumns = "";

		if (this.getBoxWidth()) {
			sTemplateColumns = "repeat(auto-fit, " + this.getBoxWidth() + ")";
		} else if (this.getBoxMinWidth()) {
			sTemplateColumns = "repeat(auto-fit, minmax(" + this.getBoxMinWidth() + ", 1fr))";
		}

		return sTemplateColumns;
	};

	return GridBoxLayout;
});