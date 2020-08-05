/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/LayoutData",
	"sap/ui/layout/library"
], function(LayoutData) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element.
	 *
	 * @class
	 * Holds layout data for an item inside a responsive column layout.
	 *
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 *
	 * @since 1.72
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveColumnItemLayoutData = LayoutData.extend("sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData", { metadata: {
		library: "sap.ui.layout",
		interfaces: [
			"sap.ui.layout.cssgrid.IGridItemLayoutData"
		],
		properties: {

			/**
			 * Specifies the number of columns, which the item should take.
			 */
			columns: {type: "int", group: "Misc", defaultValue: 1},
			/**
			 * Specifies the number of rows, which the item should take.
			 */
			rows: {type: "int", group: "Misc", defaultValue: 1}
		}
	}});
	/**
	 * Updates the display:grid styles of a single item
	 *
	 * @private
	 * @param {sap.ui.core.Control} oItem The item which styles have to be updated
	 */
	ResponsiveColumnItemLayoutData.prototype.setItemStyles = function (oItem) {
		oItem.style.setProperty('grid-row', 'span ' + this.getRows());
		oItem.style.setProperty('grid-column', 'span ' + this.getColumns());
	};

	return ResponsiveColumnItemLayoutData;
});