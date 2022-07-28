/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/Entry"
], function(
	Entry
) {
	"use strict";

	/**
	 * Constructor for a new QuickActionItem.
	 *
	 * @param {string} [sId] ID for the new QuickActionItem, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickActionItem
	 *
	 * @class
	 * This element serves as a quick action item.
	 * It can be used to specify control- and application specific quick action items.
	 *
	 * @extends sap.m.table.columnmenu.Entry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.QuickActionItem
	 */
	var QuickActionItem = Entry.extend("sap.m.table.columnmenu.QuickActionItem", {
		metadata: {
			library: "sap.m", properties: {
				/**
				 * The property name
				 */
				key: {type: "string"},
				/**
				 * Defines the text for the label.
				 */
				label: {type: "string", defaultValue: ""}
			}
		}
	});

	return QuickActionItem;
});