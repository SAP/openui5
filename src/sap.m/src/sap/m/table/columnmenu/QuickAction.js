/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase"
], function (
	QuickActionBase
) {
	"use strict";

	/**
	 * Constructor for a new QuickAction.
	 *
	 * @param {string} [sId] ID for the new QuickAction, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickAction
	 *
	 * @class
	 * The QuickAction serves as a quick action for sap.m.table.columnmenu.Menu.
	 * It can be used to specify control- and application specific quick actions.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.99
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.QuickAction
	 */
	var QuickAction = QuickActionBase.extend("sap.m.table.columnmenu.QuickAction", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the text for the label.
				 */
				label: { type: "string" }
			},
			aggregations: {
				/**
				 * Defines the content, which should be shown for the quick action.
				 */
				content: { type: "sap.ui.core.Control", multiple: false }
			}
		}
	});

	return QuickAction;
});