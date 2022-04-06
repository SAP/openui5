/*!
 * ${copyright}
 */

sap.ui.define([
	"./QuickActionItem"
], function (
	QuickActionItem
) {
	"use strict";

	/**
	 * Constructor for a new QuickTotalItem.
	 *
	 * @param {string} [sId] ID for the new QuickTotalItem, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickTotalItem
	 *
	 * @class
	 * This element serves as a quick total item.
	 * It can be used to specify control- and application specific quick total items.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.QuickTotalItem
	 */
	var QuickTotalItem = QuickActionItem.extend("sap.m.table.columnmenu.QuickTotalItem", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Specifies whether a total for the respective column is shown.
				 */
				totaled: { type: "boolean", defaultValue: false }
			}
		}
	});

	return QuickTotalItem;
});