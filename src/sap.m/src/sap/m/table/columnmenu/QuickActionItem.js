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
	 * Constructor for a new <code>>QuickActionItem</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickActionItem</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickActionItem</code>
	 *
	 * @class
	 * The <code>QuickActionItem</code> class is used for quick action items for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific quick action items.
	 *
	 * @extends sap.m.table.columnmenu.Entry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
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