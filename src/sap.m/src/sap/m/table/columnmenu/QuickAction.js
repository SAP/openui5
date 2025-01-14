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
				category: {type: "sap.m.table.columnmenu.Category", defaultValue: library.table.columnmenu.Category.Generic},
				/**
				 * Determines how much space is allocated for the content.
				 */
				contentSize: {type : "sap.m.table.columnmenu.QuickActionContentSize", defaultValue : "L"}
			},
			defaultAggregation : "content",
			aggregations: {
				/**
				 * Defines the content that is shown for the quick action.
				 *
				 * <b>Note:</b>Adding content to the quick action, altering its layout or visibility will only take effect once the popover has been closed and reopened again.
				 *
				 * The expected content are single controls that implement the <code>sap.ui.core.IFormContent</code> interface. The use case with more complex content and layouts
				 * that use the <code>sap.ui.layout.GridData</code> is deprecated as of version 1.132.
				 */
				content: {type: "sap.ui.core.Control", multiple: true}
			}
		}
	});

	return QuickAction;
});