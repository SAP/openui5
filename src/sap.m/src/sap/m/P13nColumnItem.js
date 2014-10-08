/*!
 * ${copyright}
 */

// Provides control sap.m.P13nColumnItem.
sap.ui.define(['jquery.sap.global', './ColumnListItem', './library'],
	function(jQuery, ColumnListItem, library) {
	"use strict";


	
	/**
	 * Constructor for a new P13nColumnItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * item for personalization
	 * @extends sap.m.ColumnListItem
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.P13nColumnItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nColumnItem = ColumnListItem.extend("sap.m.P13nColumnItem", /** @lends sap.m.P13nColumnItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Can be used as input for subsequent actions.
			 */
			key : {type : "string", group : "Data", defaultValue : null}
		}
	}});

	return P13nColumnItem;

}, /* bExport= */ true);
