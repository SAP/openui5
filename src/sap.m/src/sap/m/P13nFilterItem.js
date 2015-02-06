/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nFilterItem.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Item'
], function(jQuery, library, Item) {
	"use strict";

	/**
	 * Constructor for a new P13nFilterItem.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class tbd
	 * @extends sap.ui.core.Item
	 * @version ${version}
	 * @constructor
	 * @public
	 * @alias sap.m.P13nFilterItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nFilterItem = Item.extend("sap.m.P13nFilterItem", /** @lends sap.m.P13nFilterItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * sap.m.P13nConditionOperation
				 * @since 1.26.0 
				 */
				operation: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * value of the filter  
				 * @since 1.26.0 
				 */
				value1: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * to value of the between filter
				 * @since 1.26.0 
				 */
				value2: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * key of the column
				 * @since 1.26.0 
				 */
				columnKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * defines if the filter is an include or exclude filter item
				 * @since 1.26.0 
				 */
				exclude: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			}
		}
	});

	return P13nFilterItem;

}, /* bExport= */true);
