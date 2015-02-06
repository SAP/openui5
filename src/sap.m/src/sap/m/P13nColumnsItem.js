/*!
 * ${copyright}
 */

// Provides control sap.m.P13nColumnsItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Item'],
	function(jQuery, library, Item) {
	"use strict";


	
	/**
	 * Constructor for a new P13nColumnsItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The ColumnsItem can be used to fill columnsItem aggregation in P13nColumnsPanel
	 * @extends sap.ui.core.Item
	 * @version ${version}
	 * @constructor
	 * @author SAP SE 
	 * @public
	 * @since 1.26.0 
	 * @alias sap.m.P13nColumnsItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nColumnsItem = Item.extend("sap.m.P13nColumnsItem", /** @lends sap.m.P13nColumnsItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {

			/**
			 *  This property contains the unique table column key
			 *  @since 1.26.0
			 */
			columnKey : {type : "string", group : "Misc"}, //don't set a default value
			
			/**
			 * This property contains the index of a table column
			 * @since 1.26.0
			 */
			index : {type : "int", group : "Appearance"}, //don't set a default value
			
			/**
			 * This property decides whether a P13nColumnsItem is visible
			 * @since 1.26.0
			 */
			visible : {type : "boolean", group : "Appearance"},  //don't set a default value

			/**
			 *  This property contains the with of a table column.
			 *  @since 1.26.0
			 */
			width : {type : "string", group : "Misc"} //don't set a default value

		}
	}});
	
	return P13nColumnsItem;

}, /* bExport= */ true);
