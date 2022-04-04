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
				 * Defines the content that is shown for the quick action.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>Adding additional content to the quick action or altering its layout will
				 * only take effect once the popover has been closed and reopened again.</li>
				 * <li>The layout of the content of <code>QuickAction</code> can be altered by providing {@link sap.ui.layout.GridData} for each
				 * <code>layoutData</code> aggregation of each content control. In size S, content controls can take up to
				 * 12 columns, while in sizes M and bigger, content controls can take up to 8 columns of space.</li>
				 * <li>If there are more than 2 controls inside a quick action, they will be shown underneath each other if the <code>ColumnMenu</code> is in size S.</li>
				 * <li>By default, the content controls of <code>QuickAction</code> will take up the same amount of space and will have the same size.</li>
				 * </ul>
				 */
				content: { type: "sap.ui.core.Control", multiple: true }
			}
		}
	});

	return QuickAction;
});