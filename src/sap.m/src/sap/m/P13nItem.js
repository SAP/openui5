/*!
 * ${copyright}
 */

// Provides control sap.m.P13nItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'], function(jQuery, library, Element) {
	"use strict";

	/**
	 * Constructor for a new P13nItem.
	 * 
	 * @param {string}
	 *          [sId] id for the new control, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new control
	 * 
	 * @class tbd (should enable panels of personalization to have a constistent view of the 'columns' of the table)
	 * @extends sap.ui.core.Item
	 * @version ${version}
	 * 
	 * @constructor
	 * @public
	 * @alias sap.m.P13nItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nItem = Element.extend("sap.m.P13nItem", /** @lends sap.m.P13nItem.prototype */
	{
		metadata : {

			library : "sap.m",
			properties : {
				/**
				 * Can be used as input for subsequent actions.
				 */
				columnKey : {
					type : "string",
					group : "Data",
					defaultValue : null
				},
				/**
				 * The text to be displayed for the item.
				 */
				text : {
					type : "string",
					group : "Misc",
					defaultValue : ""
				},

				/**
				 * tbd
				 */
				visible : {
					type : "boolean",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * data type of the column (text, numeric or date is supported)
				 */
				type : {
					type : "string",
					group : "Misc",
					defaultValue : "text"
				},

				/**
				 * if type==numeric the precision will be used to format the entered value (maxIntegerDigits  of the used Formatter)
				 */
				precision : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * if type==numeric the scale will be used to format the entered value (maxFractionDigits of the used Formatter)
				 */
				scale : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * specifies the number of characters which can be entered in the value fields of the condition panel  
				 */
				maxLength : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},
				
				/**
				 * tbd
				 */
				width : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},
				
				/**
				 * the column with isDefault==true will be used as the selected column item on the conditionPanel 
				 */
				isDefault : {
					type : "boolean",
					group : "Misc",
					defaultValue : false					
				}
			}
		}
	});


	return P13nItem;

}, /* bExport= */true);
