/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase",
	"sap/m/library"
], function(
	QuickActionBase,
	library
) {
	"use strict";

	/**
	 * Constructor for a new <code>QuickAction</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickAction</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickAction</code>
	 *
	 * @class
	 * The <code>QuickAction</code> class is used for quick actions for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific quick actions.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
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
				label: {type: "string", defaultValue: ""},
				/**
				 * Defines the category. In the menu all <code>QuickActions</code> are implicitly ordered by their category.
				 */
				category: {type: "sap.m.table.columnmenu.Category", defaultValue: library.table.columnmenu.Category.Generic}
			},
			defaultAggregation : "content",
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
				 * <li>If there are more than 2 controls inside a quick action, they will be shown underneath each other if the
				 * <code>ColumnMenu</code> is in size S.</li>
				 * <li>By default, the content controls of <code>QuickAction</code> will take up the same amount of space and will have the same
				 * size.</li>
				 * </ul>
				 */
				content: {type: "sap.ui.core.Control", multiple: true}
			}
		}
	});

	return QuickAction;
});