/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nSortItem.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Item'
], function(jQuery, library, Item) {
	"use strict";

	/**
	 * Constructor for a new P13nSortItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>sortItems</code> aggregation in P13nSortPanel control.
	 * @extends sap.ui.core.Item
	 * @version ${version}
	 * @constructor
	 * @public
	 * @alias sap.m.P13nSortItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nSortItem = Item.extend("sap.m.P13nSortItem", /** @lends sap.m.P13nSortItem.prototype */
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
				 * key of the column
				 * @since 1.26.0
				 */
				columnKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	return P13nSortItem;

}, /* bExport= */true);
