/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.list.ActionLayoutData.
sap.ui.define(["sap/m/OverflowToolbarLayoutData", "sap/ui/mdc/enums/ListActionPosition"],
	(OverflowToolbarLayoutData, ListActionPosition) => {
	"use strict";

	/**
	 * Constructor for a new <code>ActionLayoutData</code>.
	 *
	 * @param {string} [sId] ID for the new layout data, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new layout data
	 *
	 * @class
	 * Defines the layout data for the {@link sap.ui.mdc.List#getActions actions} of the {@link sap.ui.mdc.List List}.
	 *
	 * @extends sap.m.OverflowToolbarLayoutData
	 * @implements sap.ui.mdc.IActionLayoutData
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.154
	 * @alias sap.ui.mdc.list.ActionLayoutData
	 */
	const ActionLayoutData = OverflowToolbarLayoutData.extend("sap.ui.mdc.list.ActionLayoutData", {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.IActionLayoutData"
			],
			properties: {
				/**
				 * Defines the position of the action within the group of list actions.
				 */
				position: {type: "sap.ui.mdc.enums.ListActionPosition", group: "Misc", defaultValue: ListActionPosition.EndActions}
			}
		}
	});

	return ActionLayoutData;

});
