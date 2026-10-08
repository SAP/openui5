/*!
 * ${copyright}
 */

sap.ui.define([
	"./ToolbarFactory",
	"sap/ui/mdc/enums/ListActionPosition",
	"../list/ActionLayoutData"
], (
	ToolbarFactory,
	ListActionPosition,
	ActionLayoutData
) => {
	"use strict";

	// Maps the action key of a toolbar button to its position within the list toolbar.
	const mActionPositions = {
		"export": ListActionPosition.ExportActionsExport,
		settings: ListActionPosition.PersonalizationActionsSettings
	};

	/**
	 * Toolbar button factory for <code>sap.ui.mdc.List</code>, extending the shared
	 * {@link sap.ui.mdc.util.ToolbarFactory} with list-specific action layout data.
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.154
	 * @alias sap.ui.mdc.util.ListToolbarFactory
	 */
	const ListToolbarFactory = {
		...ToolbarFactory,
		_getActionLayoutData: function(sActionKey) {
			return new ActionLayoutData({position: mActionPositions[sActionKey]});
		}
	};

	return ListToolbarFactory;
});
