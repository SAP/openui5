/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/QuickActionBase"
], function (
	QuickActionBase
) {
	"use strict";

	/**
	 * Constructor for a new QuickAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control serves as a quick action for sap.m.table.ColumnMenu.
	 * It can be used to specify control- and application specific quick actions.
	 *
	 * @extends sap.m.table.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.QuickAction
	 */
	var QuickAction = QuickActionBase.extend("sap.m.table.QuickAction", {
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