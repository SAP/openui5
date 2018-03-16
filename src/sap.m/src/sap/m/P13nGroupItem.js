/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nGroupItem.
sap.ui.define([
	'./library', 'sap/ui/core/Item'
], function(library, Item) {
	"use strict";

	/**
	 * Constructor for a new P13nGroupItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>groupItems</code> aggregation in P13nGroupPanel control.
	 * @extends sap.ui.core.Item
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.m.P13nGroupItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nGroupItem = Item.extend("sap.m.P13nGroupItem", /** @lends sap.m.P13nGroupItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * sap.m.P13nConditionOperation
				 */
				operation: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * key of the column
				 */
				columnKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * make the grouped column as normalcolumn visible
				 */
				showIfGrouped: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			}
		}
	});

	P13nGroupItem.prototype.setColumnKey = function(v) {
		return this.setProperty("columnKey", v, true);
	};

	P13nGroupItem.prototype.setOperation = function(v) {
		return this.setProperty("operation", v, true);
	};

	P13nGroupItem.prototype.setShowIfGrouped = function(v) {
		return this.setProperty("showIfGrouped", v, true);
	};

	return P13nGroupItem;

});
