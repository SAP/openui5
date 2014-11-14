/*!
 * ${copyright}
 */

// Provides control sap.m.P13nDialogItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Item'],
	function(jQuery, library, Item) {
	"use strict";


	
	/**
	 * Constructor for a new P13nDialogItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The personalization dialog item class
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.P13nDialogItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nDialogItem = Item.extend("sap.m.P13nDialogItem", /** @lends sap.m.P13nDialogItem.prototype */ { metadata : {
	
		library : "sap.m",
		aggregations : {
	
			/**
			 * The content to show for this item
			 */
			panel : {type : "sap.m.P13nPanel", multiple : true, singularName : "panel"}
		}
	}});
	

	return P13nDialogItem;

}, /* bExport= */ true);
